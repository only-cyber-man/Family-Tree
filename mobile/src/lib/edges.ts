import { tokens } from "../theme/tokens";
import type { Point } from "./layout";
import type { Lod } from "./lod";
import { emphasisFor } from "./relations";
import type { Edge } from "./types";

export type Scheme = "light" | "dark";

export interface EdgeStyle {
	color: string;
	width: number;
	dash?: number[];
	arrow: boolean;
}

export function edgeStyle(e: Pick<Edge, "group" | "name" | "bidirectional">, scheme: Scheme, lod: Lod, selected: boolean): EdgeStyle {
	const g = tokens.relationship[e.group];
	let width: number = g.width;
	let dash: number[] | undefined = g.dashes ? [...g.dashes] : undefined;
	const emphasis = emphasisFor(e.name);
	if (emphasis === "strong") {
		width = tokens.relationship.emphasis.strong.width;
		dash = undefined;
	} else if (emphasis === "weak") {
		width = tokens.relationship.emphasis.weak.width;
		dash = [...tokens.relationship.emphasis.weak.dashes];
	}
	let color: string = g[scheme];
	let arrow = !e.bidirectional && g.arrowsWhenDirectional;
	if (lod === "dot") {
		width *= 0.6;
		arrow = false;
	}
	if (selected) {
		color = tokens.color[scheme].accent;
		width += 1;
	}
	return { color, width, dash, arrow };
}

/** A node box, centred on (x, y). */
export interface Box {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface EdgeGeometry {
	d: string;
	end: Point;
	/** Direction at the end, radians. */
	angle: number;
	mid: Point;
}

const f = (n: number) => Math.round(n * 10) / 10;

/**
 * Directional: cubic from the source's bottom-centre to the target's
 * top-centre (or top to bottom when the target sits higher). Bidirectional:
 * straight between the nearest sides. Dots: centre to centre, trimmed.
 */
export function edgeGeometry(a: Box, b: Box, directional: boolean, dots: boolean): EdgeGeometry {
	if (dots) {
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const len = Math.hypot(dx, dy) || 1;
		const ux = dx / len;
		const uy = dy / len;
		const s = { x: a.x + ux * (a.w / 2), y: a.y + uy * (a.h / 2) };
		const e = { x: b.x - ux * (b.w / 2), y: b.y - uy * (b.h / 2) };
		return { d: `M${f(s.x)} ${f(s.y)}L${f(e.x)} ${f(e.y)}`, end: e, angle: Math.atan2(uy, ux), mid: { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 } };
	}
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const verticalGap = Math.abs(dy) - (a.h + b.h) / 2;
	if (!directional || verticalGap < 16) {
		let s: Point;
		let e: Point;
		if (Math.abs(dx) - (a.w + b.w) / 2 > verticalGap) {
			const dir = Math.sign(dx) || 1;
			s = { x: a.x + (dir * a.w) / 2, y: a.y };
			e = { x: b.x - (dir * b.w) / 2, y: b.y };
		} else {
			const dir = Math.sign(dy) || 1;
			s = { x: a.x, y: a.y + (dir * a.h) / 2 };
			e = { x: b.x, y: b.y - (dir * b.h) / 2 };
		}
		return {
			d: `M${f(s.x)} ${f(s.y)}L${f(e.x)} ${f(e.y)}`,
			end: e,
			angle: Math.atan2(e.y - s.y, e.x - s.x),
			mid: { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 },
		};
	}
	const down = dy >= 0;
	const s = { x: a.x, y: a.y + ((down ? 1 : -1) * a.h) / 2 };
	const e = { x: b.x, y: b.y - ((down ? 1 : -1) * b.h) / 2 };
	const my = (e.y - s.y) / 2;
	const d = `M${f(s.x)} ${f(s.y)}C${f(s.x)} ${f(s.y + my)} ${f(e.x)} ${f(e.y - my)} ${f(e.x)} ${f(e.y)}`;
	return { d, end: e, angle: down ? Math.PI / 2 : -Math.PI / 2, mid: { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 } };
}

/** Filled triangle with its tip at `tip`, pointing along `angle`. */
export function arrowPath(tip: Point, angle: number, size = 7): string {
	const bx = tip.x - Math.cos(angle) * size;
	const by = tip.y - Math.sin(angle) * size;
	const px = Math.cos(angle + Math.PI / 2) * (size / 2);
	const py = Math.sin(angle + Math.PI / 2) * (size / 2);
	return `M${f(tip.x)} ${f(tip.y)}L${f(bx + px)} ${f(by + py)}L${f(bx - px)} ${f(by - py)}Z`;
}

export interface Rect {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

/**
 * Whether an edge between two node centres can touch `view`. Uses the
 * bounding box of both ends grown by `pad` (half a card, covering the
 * curve's control points, which stay within the ends' vertical span), so an
 * edge crossing the viewport with both ends off-screen is still drawn.
 */
export function edgeMayBeVisible(a: Point, b: Point, pad: number, view: Rect): boolean {
	const minX = Math.min(a.x, b.x) - pad;
	const maxX = Math.max(a.x, b.x) + pad;
	const minY = Math.min(a.y, b.y) - pad;
	const maxY = Math.max(a.y, b.y) + pad;
	return maxX >= view.minX && minX <= view.maxX && maxY >= view.minY && minY <= view.maxY;
}
