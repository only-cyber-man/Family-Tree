import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import * as api from "../lib/api";
import { errorMessage, isNetworkError } from "../lib/errors";
import { pb } from "../lib/pb";
import type { TreeRecord } from "../lib/types";
import { epochGuard } from "./epoch";
import { useSession } from "./session";

export interface TreeSummary {
	tree: TreeRecord;
	people: number | null;
	isOwner: boolean;
	/** For shared trees: the owner's email via ft_gettable_users_id_email. */
	ownerEmail?: string;
}

interface TreesState {
	status: "idle" | "loading" | "ready" | "error";
	error: string | null;
	offline: boolean;
	items: TreeSummary[];
	refresh: () => Promise<TreeSummary[]>;
	create: (name: string, id: string) => Promise<TreeRecord>;
	patchTree: (tree: TreeRecord) => void;
	reset: () => void;
}

const CACHE_KEY = "ft.trees";

export const useTrees = create<TreesState>()((set, get) => ({
	status: "idle",
	error: null,
	offline: false,
	items: [],
	refresh: async () => {
		const me = useSession.getState().user?.id;
		const valid = epochGuard();
		if (get().status === "idle") {
			set({ status: "loading" });
			try {
				const cached = await AsyncStorage.getItem(CACHE_KEY);
				if (cached && valid()) set({ items: JSON.parse(cached) as TreeSummary[], status: "ready" });
			} catch {
				// ignore unreadable cache
			}
		}
		// An expired token makes PocketBase answer as a guest (an empty list):
		// never fetch, and never cache, the list without a valid session.
		if (!pb.authStore.isValid) return get().items;
		try {
			const trees = await api.listTrees();
			const items = await Promise.all(
				trees.map(async (tree): Promise<TreeSummary> => {
					const isOwner = tree.creator === me;
					const [people, ownerEmail] = await Promise.all([
						api.countNodes(tree.id).catch(() => null),
						isOwner ? Promise.resolve(undefined) : api.getUserEmail(tree.creator).catch(() => undefined),
					]);
					return { tree, people, isOwner, ownerEmail };
				}),
			);
			if (!valid() || !pb.authStore.isValid) return get().items;
			set({ items, status: "ready", error: null, offline: false });
			AsyncStorage.setItem(CACHE_KEY, JSON.stringify(items)).catch(() => undefined);
			return items;
		} catch (e) {
			if (!valid()) return [];
			const offline = isNetworkError(e);
			set({ status: get().items.length ? "ready" : "error", error: errorMessage(e), offline });
			return get().items;
		}
	},
	create: async (name, id) => {
		const me = useSession.getState().user?.id ?? "";
		const valid = epochGuard();
		const tree = await api.createTree(name.trim(), me, id);
		if (!valid()) return tree;
		// Upsert by id: a retried create (same client id) must not add a second card.
		const existing = get().items.find((i) => i.tree.id === tree.id);
		set({
			items: existing
				? get().items.map((i) => (i.tree.id === tree.id ? { ...i, tree } : i))
				: [{ tree, people: 0, isOwner: true }, ...get().items],
		});
		return tree;
	},
	patchTree: (tree) => set({ items: get().items.map((i) => (i.tree.id === tree.id ? { ...i, tree } : i)) }),
	reset: () => {
		set({ status: "idle", items: [], error: null, offline: false });
		AsyncStorage.removeItem(CACHE_KEY).catch(() => undefined);
	},
}));
