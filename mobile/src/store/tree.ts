import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import * as api from "../lib/api";
import { errorMessage, isNetworkError, isNotFound } from "../lib/errors";
import { DEFAULT_FILTERS, type Filters } from "../lib/filters";
import type { FullTree, NodeRecord, RelationshipRecord, TreeRecord } from "../lib/types";
import { epochGuard } from "./epoch";
import { useSession } from "./session";
import { useTrees } from "./trees";

// The active tree, mirroring the web TreeProvider (useTree.tsx), plus a
// read-only on-device copy per tree so trees can be viewed offline.
//
// Writes are online only: a failed write throws, and the form that made it
// stays open with the user's input for "Try again" (the design's "save
// failed" state). Creates carry record ids generated when the form opened,
// so retrying the same submit after a lost response cannot duplicate.
//
// Every write names the tree it belongs to. Results are applied to that
// tree: in memory when it is the active one, otherwise to its on-device copy.

export interface AddNodeResult {
	node: NodeRecord;
	/** The person was saved but the link was not (retrying the form finishes it). */
	linkError?: string;
}

/** Ids fixed for the lifetime of one form, reused by every retry of its submit. */
export interface CreateIds {
	nodeId: string;
	linkId: string;
}

interface TreeState {
	treeId: string | null;
	full: FullTree | null;
	status: "idle" | "loading" | "ready" | "error";
	error: string | null;
	errorKind: "network" | "notFound" | "other" | null;
	/** Showing the on-device copy because the server could not be reached. */
	stale: boolean;
	filters: Filters;
	load: (treeId: string, opts?: { silent?: boolean; attempt?: number }) => Promise<void>;
	clear: () => void;
	addNode: (treeId: string, input: api.NodeInput, ids: CreateIds, link?: { relationshipName: string; target: string }) => Promise<AddNodeResult>;
	editNode: (id: string, input: api.NodeInput) => Promise<NodeRecord>;
	/** Deletes a person of `treeId`, then (best effort) their relationships. */
	removeNode: (id: string, treeId: string) => Promise<void>;
	addRelationship: (input: api.RelationshipInput & { id: string; tree: string }) => Promise<RelationshipRecord>;
	removeRelationship: (id: string, treeId: string) => Promise<void>;
	/** Atomic invite / revoke on `treeId` (PocketBase "invited+" / "invited-"). */
	addInvited: (treeId: string, userId: string) => Promise<TreeRecord>;
	removeInvited: (treeId: string, userId: string) => Promise<TreeRecord>;
	setFilters: (f: Filters) => void;
}

const cacheKey = (id: string) => `ft.tree.${id}`;
export const TREE_CACHE_PREFIX = "ft.tree.";

/**
 * Counts completed writes. A load whose request started before the latest
 * completed write may carry stale server data (a just-added person missing,
 * a just-deleted one back), so it is discarded and re-run instead of applied.
 */
let writeSeq = 0;
export const MAX_RELOADS_AFTER_WRITE = 3;

function persistTree(full: FullTree) {
	AsyncStorage.setItem(cacheKey(full.tree.id), JSON.stringify(full)).catch(() => undefined);
}

export function isOwner(full: FullTree | null): boolean {
	const me = useSession.getState().user?.id;
	return !!full && !!me && full.tree.creator === me;
}

export const useTree = create<TreeState>()((set, get) => {
	/** Applies `fn` to tree `treeId`: in memory if active, otherwise to its on-device copy. */
	const updateTree = (treeId: string, fn: (full: FullTree) => FullTree) => {
		const full = get().full;
		if (full && full.tree.id === treeId) {
			const next = fn(full);
			set({ full: next });
			persistTree(next);
			return;
		}
		const valid = epochGuard();
		AsyncStorage.getItem(cacheKey(treeId))
			.then((raw) => {
				if (raw && valid()) persistTree(fn(JSON.parse(raw) as FullTree));
			})
			.catch(() => undefined);
	};
	const upsertNode = (treeId: string, node: NodeRecord) =>
		updateTree(treeId, (f) => ({ ...f, nodes: [...f.nodes.filter((n) => n.id !== node.id), node] }));
	const upsertRelationship = (treeId: string, rel: RelationshipRecord) =>
		updateTree(treeId, (f) => ({ ...f, relationships: [...f.relationships.filter((r) => r.id !== rel.id), rel] }));

	return {
		treeId: null,
		full: null,
		status: "idle",
		error: null,
		errorKind: null,
		stale: false,
		filters: DEFAULT_FILTERS,

		load: async (treeId, opts) => {
			const valid = epochGuard();
			const switching = get().treeId !== treeId;
			if (switching) {
				set({ treeId, full: null, status: "loading", error: null, errorKind: null, stale: false, filters: DEFAULT_FILTERS });
				try {
					const cached = await AsyncStorage.getItem(cacheKey(treeId));
					if (cached && valid() && get().treeId === treeId) set({ full: JSON.parse(cached) as FullTree, status: "ready", stale: true });
				} catch {
					// ignore
				}
			} else if (!opts?.silent && !get().full) {
				set({ status: "loading" });
			}
			const seqAtStart = writeSeq;
			try {
				const full = await api.fetchFullTree(treeId);
				if (!valid() || get().treeId !== treeId) return;
				if (writeSeq !== seqAtStart) {
					const attempt = (opts?.attempt ?? 0) + 1;
					if (attempt <= MAX_RELOADS_AFTER_WRITE) return get().load(treeId, { silent: true, attempt });
					return; // keep the locally updated copy rather than stale data
				}
				set({ full, status: "ready", error: null, errorKind: null, stale: false });
				persistTree(full);
			} catch (e) {
				if (!valid() || get().treeId !== treeId) return;
				const errorKind = isNetworkError(e) ? "network" : isNotFound(e) ? "notFound" : "other";
				if (get().full && errorKind === "network") set({ stale: true, error: errorMessage(e), errorKind });
				else set({ status: "error", error: errorMessage(e), errorKind, full: errorKind === "notFound" ? null : get().full });
			}
		},

		clear: () => set({ treeId: null, full: null, status: "idle", error: null, errorKind: null, stale: false, filters: DEFAULT_FILTERS }),

		addNode: async (treeId, input, ids, link) => {
			const valid = epochGuard();
			// Idempotent for ids.nodeId: a retry after a lost response returns the saved person.
			const node = await api.createNode(treeId, input, ids.nodeId);
			writeSeq++;
			if (valid()) upsertNode(treeId, node);
			if (!link) return { node };
			try {
				const rel = await api.createRelationship({ id: ids.linkId, sourceNode: node.id, targetNode: link.target, relationshipName: link.relationshipName, tree: treeId });
				writeSeq++;
				if (valid()) upsertRelationship(treeId, rel);
				return { node };
			} catch (e) {
				return { node, linkError: errorMessage(e) };
			}
		},

		editNode: async (id, input) => {
			const valid = epochGuard();
			const node = await api.updateNode(id, input);
			writeSeq++;
			if (valid()) upsertNode(node.tree, node);
			return node;
		},

		removeNode: async (id, treeId) => {
			// Same order as the web client: the person first, then best-effort
			// cleanup of their relationships (failures leave harmless orphans).
			// The relationships come from the server for *that* tree, plus any in
			// the local copy, not from whichever tree happens to be active.
			const valid = epochGuard();
			const local = (get().full?.tree.id === treeId ? get().full!.relationships : [])
				.filter((r) => r.sourceNode === id || r.targetNode === id)
				.map((r) => r.id);
			const fromServer = await api
				.listNodeRelationships(treeId, id)
				.then((rs) => rs.map((r) => r.id))
				.catch(() => [] as string[]);
			const attached = [...new Set([...local, ...fromServer])];
			await api.deleteNode(id);
			writeSeq++;
			if (valid()) {
				updateTree(treeId, (f) => ({
					...f,
					nodes: f.nodes.filter((n) => n.id !== id),
					relationships: f.relationships.filter((r) => r.sourceNode !== id && r.targetNode !== id),
				}));
			}
			await Promise.allSettled(attached.map((rid) => api.deleteRelationship(rid)));
			writeSeq++;
		},

		addRelationship: async (input) => {
			const valid = epochGuard();
			const rel = await api.createRelationship(input);
			writeSeq++;
			if (valid()) upsertRelationship(input.tree, rel);
			return rel;
		},

		removeRelationship: async (id, treeId) => {
			const valid = epochGuard();
			await api.deleteRelationship(id);
			writeSeq++;
			if (valid()) updateTree(treeId, (f) => ({ ...f, relationships: f.relationships.filter((r) => r.id !== id) }));
		},

		addInvited: async (treeId, userId) => {
			const valid = epochGuard();
			const tree = await api.addInvited(treeId, userId);
			writeSeq++;
			if (valid()) {
				updateTree(treeId, (f) => ({ ...f, tree }));
				useTrees.getState().patchTree(tree);
			}
			return tree;
		},

		removeInvited: async (treeId, userId) => {
			const valid = epochGuard();
			const tree = await api.removeInvited(treeId, userId);
			writeSeq++;
			if (valid()) {
				updateTree(treeId, (f) => ({ ...f, tree }));
				useTrees.getState().patchTree(tree);
			}
			return tree;
		},

		setFilters: (filters) => set({ filters }),
	};
});
