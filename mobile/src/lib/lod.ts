import { tokens } from "../theme/tokens";

export type Lod = "dot" | "compact" | "full";

/** Above this many visible nodes, dots are forced regardless of zoom. */
export const MAX_DETAILED_NODES = 150;

export const NODE_SIZE = {
	dot: { r: 11, rSelected: 13, w: 22, h: 22 },
	compact: { w: 120, h: 56 },
	full: { w: 150, h: 70 },
} as const;

export function selectLod(scale: number, visibleCount: number, lod = tokens.mobile.zoomLOD): Lod {
	if (visibleCount > MAX_DETAILED_NODES) return "dot";
	if (scale < lod.dot.max) return "dot";
	if (scale < lod.compact.max) return "compact";
	return "full";
}

export function nodeBox(lod: Lod): { w: number; h: number } {
	const s = NODE_SIZE[lod];
	return { w: s.w, h: s.h };
}
