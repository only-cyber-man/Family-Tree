import { tokens } from "../theme/tokens";
import { parentChild, classifyName } from "./relations";
import type { Edge, Person } from "./types";

// Positions come from birth year (vertical) and column order (horizontal),
// like the web TreeGraph: y = years since the first band * levelPx, and each
// 20-year band is a row of columns columnPx apart. Mobile never edits layout.

export interface Point {
	x: number;
	y: number;
}

export interface Bounds {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

export interface Band {
	index: number;
	startYear: number;
	endYear: number;
	y0: number;
	y1: number;
	label: string;
	shaded: boolean;
}

export interface TreeLayout {
	positions: Record<string, Point>;
	bands: Band[];
	bounds: Bounds;
	firstYear: number;
}

export interface LayoutOptions {
	bandYears: number;
	levelPx: number;
	columnPx: number;
	/** Half-size of the largest card, used to pad the bounds. */
	cardHalf: Point;
	/**
	 * Minimum vertical distance (world units) between two cards in the same
	 * column. Cards have a fixed on-screen size, so this is the tallest card
	 * (56 pt compact) at the smallest scale that shows cards (0.45), plus air.
	 */
	rowGap: number;
}

export const DEFAULT_LAYOUT: LayoutOptions = {
	bandYears: tokens.canvas.bandYears,
	levelPx: tokens.canvas.levelPx,
	columnPx: tokens.canvas.columnPx,
	cardHalf: { x: 75, y: 35 },
	rowGap: 130,
};

function yearOf(p: Person, fallback: number): number {
	return p.birth ? p.birth.year + (p.birth.month - 1) / 12 + (p.birth.day - 1) / 365 : fallback;
}

export function layoutByBirthYear(persons: Person[], edges: Edge[], opts: LayoutOptions = DEFAULT_LAYOUT): TreeLayout {
	const positions: Record<string, Point> = {};
	if (persons.length === 0) {
		return { positions, bands: [], bounds: { minX: -100, minY: -100, maxX: 100, maxY: 100 }, firstYear: 0 };
	}
	const years = persons.filter((p) => p.birth).map((p) => p.birth!.year);
	const minYear = years.length ? Math.min(...years) : new Date().getFullYear();
	const maxYear = years.length ? Math.max(...years) : minYear;
	const firstYear = Math.floor(minYear / opts.bandYears) * opts.bandYears;
	const bandPx = opts.bandYears * opts.levelPx;

	const parentsOf = new Map<string, string[]>();
	const partnersOf = new Map<string, string[]>();
	for (const e of edges) {
		const pc = parentChild(e);
		if (pc) {
			parentsOf.set(pc.child, [...(parentsOf.get(pc.child) ?? []), pc.parent]);
			continue;
		}
		const k = classifyName(e.name).kind;
		if (k === "spouse" || k === "partner") {
			partnersOf.set(e.source, [...(partnersOf.get(e.source) ?? []), e.target]);
			partnersOf.set(e.target, [...(partnersOf.get(e.target) ?? []), e.source]);
		}
	}

	const yById: Record<string, number> = {};
	let lastBand = 0;
	for (const p of persons) {
		const y = yearOf(p, maxYear);
		yById[p.id] = (y - firstYear) * opts.levelPx;
		lastBand = Math.max(lastBand, Math.floor((y - firstYear) / opts.bandYears));
	}

	// Columns are shared by everyone, not per band: a column accepts a card
	// only if it is at least rowGap away from every card already in it, so
	// nobody overlaps (1978 and 1982 no longer collide across a band edge).
	const colOf: Record<string, number> = {};
	const occupied = new Map<number, number[]>();
	const isFree = (col: number, y: number) => (occupied.get(col) ?? []).every((oy) => Math.abs(oy - y) >= opts.rowGap);
	const place = (id: string, preferred: number, preferRight: boolean) => {
		const y = yById[id];
		for (let d = 0; ; d++) {
			const order = d === 0 ? [preferred] : preferRight ? [preferred + d, preferred - d] : [preferred - d, preferred + d];
			for (const col of order) {
				if (isFree(col, y)) {
					colOf[id] = col;
					occupied.set(col, [...(occupied.get(col) ?? []), y]);
					return;
				}
			}
		}
	};
	const meanCol = (ids: string[]) => {
		const cs = ids.filter((id) => colOf[id] !== undefined).map((id) => colOf[id]);
		return cs.length ? Math.round(cs.reduce((a, b) => a + b, 0) / cs.length) : null;
	};

	const ordered = [...persons].sort((a, b) => yById[a.id] - yById[b.id] || a.name.localeCompare(b.name));
	for (const p of ordered) {
		if (colOf[p.id] === undefined) {
			const fromParents = meanCol(parentsOf.get(p.id) ?? []);
			const partnerCol = meanCol(partnersOf.get(p.id) ?? []);
			if (fromParents !== null) place(p.id, fromParents, false);
			else if (partnerCol !== null) place(p.id, partnerCol + 1, true);
			else place(p.id, 0, true);
		}
		// Partners sit next to each other even when born years apart.
		for (const partner of partnersOf.get(p.id) ?? []) {
			if (colOf[partner] === undefined && yById[partner] !== undefined) place(partner, colOf[p.id] + 1, true);
		}
	}
	for (const p of persons) positions[p.id] = { x: colOf[p.id] * opts.columnPx, y: yById[p.id] };

	const bands: Band[] = [];
	for (let i = 0; i <= lastBand; i++) {
		const startYear = firstYear + i * opts.bandYears;
		bands.push({
			index: i,
			startYear,
			endYear: startYear + opts.bandYears - 1,
			y0: i * bandPx,
			y1: (i + 1) * bandPx,
			label: `${startYear}s`,
			shaded: i % 2 === 0,
		});
	}

	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;
	for (const pt of Object.values(positions)) {
		minX = Math.min(minX, pt.x - opts.cardHalf.x);
		maxX = Math.max(maxX, pt.x + opts.cardHalf.x);
		minY = Math.min(minY, pt.y - opts.cardHalf.y);
		maxY = Math.max(maxY, pt.y + opts.cardHalf.y);
	}
	return { positions, bands, bounds: { minX, minY, maxX, maxY }, firstYear };
}

export const FOCUS = { parentDy: -190, partnerDx: 170, childDy: 220, rowGap: 162 } as const;

export interface FocusLayout {
	positions: Record<string, Point>;
	/** 0 self, 1 partners, 2 parents, 3 children: used to stagger the transition. */
	ring: Record<string, number>;
}

function row(ids: string[], cx: number, y: number, gap: number, out: Record<string, Point>) {
	const n = ids.length;
	ids.forEach((id, i) => {
		out[id] = { x: cx + (i - (n - 1) / 2) * gap, y };
	});
}

/** Person centred, parents above, partners beside, children below. */
export function focusLayout(
	center: { id: string; at: Point },
	rel: { parents: string[]; partners: string[]; children: string[] },
): FocusLayout {
	const positions: Record<string, Point> = { [center.id]: { ...center.at } };
	const ring: Record<string, number> = { [center.id]: 0 };
	const { x, y } = center.at;
	rel.partners.forEach((id, i) => {
		if (positions[id]) return;
		positions[id] = { x: x + FOCUS.partnerDx * (i + 1), y };
		ring[id] = 1;
	});
	const parents = rel.parents.filter((id) => !positions[id]);
	row(parents, x, y + FOCUS.parentDy, FOCUS.rowGap, positions);
	parents.forEach((id) => (ring[id] = 2));
	const children = rel.children.filter((id) => !positions[id]);
	row(children, x, y + FOCUS.childDy, FOCUS.rowGap, positions);
	children.forEach((id) => (ring[id] = 3));
	return { positions, ring };
}

export function boundsOf(points: Point[], half: Point): Bounds {
	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;
	for (const pt of points) {
		minX = Math.min(minX, pt.x - half.x);
		maxX = Math.max(maxX, pt.x + half.x);
		minY = Math.min(minY, pt.y - half.y);
		maxY = Math.max(maxY, pt.y + half.y);
	}
	if (!points.length) return { minX: -100, minY: -100, maxX: 100, maxY: 100 };
	return { minX, minY, maxX, maxY };
}
