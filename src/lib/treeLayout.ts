import { Node, Relationship } from "./interfaces";

/** tokens.json → canvas / node */
export const NODE_W = 180;
export const NODE_H = 64;
export const LEVEL_PX = 8;
export const COLUMN_PX = 200;
export const BAND_YEARS = 20;
const TOP = 40;
const LEFT = 80;
const V_GAP = 12;

export interface Point {
	x: number;
	y: number;
}

export interface Band {
	label: string;
	/** First year of the band; the UI formats its label per language. */
	year: number;
	span: number;
	y: number;
	h: number;
	shaded: boolean;
}

export interface Layout {
	positions: Map<string, Point>;
	bands: Band[];
	width: number;
	height: number;
}

/**
 * People sit on a vertical axis by birth year (8px per year). Horizontally each
 * person takes a column whose previous occupant ends above them, so no two
 * cards overlap however close their birth years are; among the free columns it
 * picks the one nearest the relatives already placed, which keeps parents over
 * children and partners side by side.
 */
export const layoutTree = (nodes: Node[], relationships: Relationship[] = []): Layout => {
	const positions = new Map<string, Point>();
	if (nodes.length === 0) {
		return { positions, bands: [], width: 0, height: 0 };
	}
	const years = nodes.map((n) => n.birthDate.getFullYear());
	const baseYear = Math.min(...years);
	const lastYear = Math.max(...years);
	const sorted = [...nodes].sort(
		(a, b) =>
			a.birthDate.getTime() - b.birthDate.getTime() ||
			a.name.localeCompare(b.name)
	);
	const neighbours = new Map<string, string[]>();
	relationships.forEach((r) => {
		neighbours.set(r.sourceNodeId, [...(neighbours.get(r.sourceNodeId) ?? []), r.targetNodeId]);
		neighbours.set(r.targetNodeId, [...(neighbours.get(r.targetNodeId) ?? []), r.sourceNodeId]);
	});
	const columnOf = new Map<string, number>();
	const columnBottoms: number[] = [];
	sorted.forEach((node) => {
		const y = (node.birthDate.getFullYear() - baseYear) * LEVEL_PX + TOP;
		const free = columnBottoms
			.map((bottom, index) => (bottom + V_GAP <= y ? index : -1))
			.filter((index) => index >= 0);
		free.push(columnBottoms.length);
		const placed = (neighbours.get(node.id) ?? [])
			.map((id) => columnOf.get(id))
			.filter((c): c is number => c !== undefined);
		let column = free[0];
		if (placed.length > 0) {
			const target = placed.reduce((a, b) => a + b, 0) / placed.length;
			column = free.reduce((best, c) =>
				Math.abs(c - target) < Math.abs(best - target) ? c : best
			);
		}
		if (column === columnBottoms.length) {
			columnBottoms.push(0);
		}
		columnBottoms[column] = y + NODE_H;
		columnOf.set(node.id, column);
		positions.set(node.id, { x: LEFT + column * COLUMN_PX, y });
	});

	const bands: Band[] = [];
	const firstBand = Math.floor(baseYear / BAND_YEARS) * BAND_YEARS;
	for (let year = firstBand, i = 0; year <= lastYear; year += BAND_YEARS, i++) {
		bands.push({
			label: `${year}s`,
			year,
			span: BAND_YEARS,
			y: (year - baseYear) * LEVEL_PX + TOP - 12,
			h: BAND_YEARS * LEVEL_PX,
			shaded: i % 2 === 0,
		});
	}

	const width = LEFT + columnBottoms.length * COLUMN_PX + 40;
	const height = Math.max(...columnBottoms) + TOP;
	return { positions, bands, width, height };
};

export interface EdgeGeometry {
	d: string;
	mid: Point;
}

/** Straight side-to-side for people on one row, an S-curve between generations. */
export const edgePath = (
	relationship: Relationship,
	positions: Map<string, Point>
): EdgeGeometry | null => {
	const a = positions.get(relationship.sourceNodeId);
	const b = positions.get(relationship.targetNodeId);
	if (!a || !b) {
		return null;
	}
	if (Math.abs(a.y - b.y) < NODE_H * 1.5) {
		const aLeft = a.x <= b.x;
		const x1 = aLeft ? a.x + NODE_W : a.x;
		const x2 = aLeft ? b.x : b.x + NODE_W;
		const y1 = a.y + NODE_H / 2;
		const y2 = b.y + NODE_H / 2;
		return {
			d: `M${x1} ${y1} L${x2} ${y2}`,
			mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
		};
	}
	const aAbove = a.y < b.y;
	const x1 = a.x + NODE_W / 2;
	const y1 = aAbove ? a.y + NODE_H : a.y;
	const x2 = b.x + NODE_W / 2;
	const y2 = aAbove ? b.y : b.y + NODE_H;
	const c = (y1 + y2) / 2;
	return {
		d: `M${x1} ${y1} C${x1} ${c} ${x2} ${c} ${x2} ${y2}`,
		mid: { x: (x1 + x2) / 2, y: c },
	};
};
