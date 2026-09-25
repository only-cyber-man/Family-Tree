import { useMemo } from "react";
import { pictureUrl } from "../lib/api";
import { todayDate } from "../lib/dates";
import { applyFilters, type Visibility } from "../lib/filters";
import { buildGraph } from "../lib/graph";
import { resolveMe, type MeResolution } from "../lib/links";
import type { CalendarDate, Graph, Person } from "../lib/types";
import { useNetwork } from "../store/network";
import { useSession } from "../store/session";
import { useSettings } from "../store/settings";
import { useTree } from "../store/tree";

export function useToday(): CalendarDate {
	const key = new Date().toDateString();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo(() => todayDate(), [key]);
}

export function useGraph(): Graph | null {
	const full = useTree((s) => s.full);
	return useMemo(() => (full ? buildGraph(full) : null), [full]);
}

export function useVisibility(): { graph: Graph | null; visible: Visibility | null } {
	const graph = useGraph();
	const filters = useTree((s) => s.filters);
	const today = useToday();
	const visible = useMemo(() => (graph ? applyFilters(graph.persons, graph.edges, filters, today) : null), [graph, filters, today]);
	return { graph, visible };
}

export function useIsOwner(): boolean {
	const full = useTree((s) => s.full);
	const me = useSession((s) => s.user?.id);
	return !!full && !!me && full.tree.creator === me;
}

/** The "This is me" person for the active tree, if chosen on this device. */
export function useMe(): Person | null {
	return useMeInfo().person;
}

/**
 * "This is me": the person linked to my account on the server (ft_nodes.user)
 * wins; the on-device pick is only a fallback when nobody is linked.
 */
export function useMeInfo(): MeResolution {
	const graph = useGraph();
	const treeId = useTree((s) => s.treeId);
	const userId = useSession((s) => s.user?.id);
	const pickId = useSettings((s) => (treeId ? s.meByTree[treeId] : undefined));
	return useMemo(() => resolveMe(graph?.persons ?? [], userId, pickId), [graph, userId, pickId]);
}

/** Picture URLs by node id. */
export function usePictures(): Record<string, string> {
	const full = useTree((s) => s.full);
	return useMemo(() => {
		const out: Record<string, string> = {};
		for (const n of full?.nodes ?? []) {
			const url = pictureUrl(n);
			if (url) out[n.id] = url;
		}
		return out;
	}, [full]);
}

/** Writes need the server: false while offline (write controls are disabled). */
export function useCanWrite(): boolean {
	return useNetwork((s) => s.online);
}
