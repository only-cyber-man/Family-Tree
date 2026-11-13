// Layout for the admin canvas: every tree drawn as its own organic "stain"
// (people as dots, relationships as lines, force-directed), and the stains
// scattered at random over one big plane without overlapping. Pure and
// deterministic (seeded by ids), so it runs on the server and the picture is
// the same on every visit with the same data.

import {
	countGenerations,
	PARENT_NAMES,
	PARTNER_NAMES,
	type AdminNodeRow,
	type AdminRelationshipRow,
	type AdminTreeRow,
} from "./adminStats";

/** Ideal distance between two related people, in world units (≈ px at zoom 1). */
export const LINK = 60;

export interface StainPerson {
	id: string;
	name: string;
	/** Position relative to the stain's centre. */
	x: number;
	y: number;
	born: number | null;
	died: number | null;
	/** File name on the ft_nodes record ("" when none). */
	picture: string;
}

export interface StainLink {
	/** Indexes into Stain.people. */
	a: number;
	b: number;
	partner: boolean;
}

export interface Stain {
	id: string;
	name: string;
	creator: string;
	people: StainPerson[];
	links: StainLink[];
	generations: number;
	/** Centre on the plane. */
	x: number;
	y: number;
	/** Radius that holds every person, plus a margin. */
	r: number;
}

/** FNV-1a: stable 32-bit seed from a string. */
const hash = (text: string) => {
	let h = 2166136261;
	for (let i = 0; i < text.length; i++) {
		h ^= text.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
};

/** mulberry32: small seeded PRNG in [0, 1). */
export const seeded = (seed: number | string) => {
	let s = typeof seed === "string" ? hash(seed) : seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) | 0;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const yearOf = (day: string) => {
	const match = /^(\d{1,4})-/.exec(day);
	return match ? +match[1] : null;
};

/**
 * Fruchterman–Reingold with a little gravity, so loose people stay with their
 * family. Repulsion only acts between people within REPEL_RANGE: global
 * repulsion would fling unlinked people thousands of units away and stretch
 * big families thin. Partners pull twice as close as other links. O(n²) per
 * step, fine for family trees (a few hundred people).
 */
export const forceLayout = (
	count: number,
	links: { a: number; b: number; partner: boolean }[],
	random: () => number
): { x: number; y: number }[] => {
	if (count === 0) {
		return [];
	}
	if (count === 1) {
		return [{ x: 0, y: 0 }];
	}
	const spread = LINK * Math.sqrt(count) * 0.6;
	const xs = new Float64Array(count);
	const ys = new Float64Array(count);
	for (let i = 0; i < count; i++) {
		const angle = random() * Math.PI * 2;
		const distance = Math.sqrt(random()) * spread;
		xs[i] = Math.cos(angle) * distance;
		ys[i] = Math.sin(angle) * distance;
	}
	const dx = new Float64Array(count);
	const dy = new Float64Array(count);
	const steps = count > 800 ? 120 : 300;
	let temperature = spread * 0.5;
	const cooling = Math.pow(1 / temperature, 1 / steps);
	const k2 = LINK * LINK;
	const range2 = (LINK * 3) ** 2;
	for (let step = 0; step < steps; step++) {
		dx.fill(0);
		dy.fill(0);
		for (let i = 0; i < count; i++) {
			for (let j = i + 1; j < count; j++) {
				let ex = xs[i] - xs[j];
				let ey = ys[i] - ys[j];
				let d2 = ex * ex + ey * ey;
				if (d2 > range2) {
					continue;
				}
				if (d2 < 0.01) {
					ex = random() - 0.5;
					ey = random() - 0.5;
					d2 = 0.01;
				}
				const f = k2 / d2;
				dx[i] += ex * f;
				dy[i] += ey * f;
				dx[j] -= ex * f;
				dy[j] -= ey * f;
			}
		}
		for (const { a, b, partner } of links) {
			const ex = xs[a] - xs[b];
			const ey = ys[a] - ys[b];
			const d = Math.sqrt(ex * ex + ey * ey);
			const f = d / (partner ? LINK * 0.5 : LINK);
			dx[a] -= ex * f;
			dy[a] -= ey * f;
			dx[b] += ex * f;
			dy[b] += ey * f;
		}
		for (let i = 0; i < count; i++) {
			dx[i] -= xs[i] * 0.06;
			dy[i] -= ys[i] * 0.06;
			const length = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]);
			if (length > 0) {
				const move = Math.min(length, temperature);
				xs[i] += (dx[i] / length) * move;
				ys[i] += (dy[i] / length) * move;
			}
		}
		temperature *= cooling;
	}
	// Centre on the centroid.
	let cx = 0;
	let cy = 0;
	for (let i = 0; i < count; i++) {
		cx += xs[i];
		cy += ys[i];
	}
	cx /= count;
	cy /= count;
	return Array.from({ length: count }, (_, i) => ({ x: xs[i] - cx, y: ys[i] - cy }));
};

/** One tree as a stain centred on (0, 0); scatterStains places it. */
export const buildStain = (
	tree: AdminTreeRow,
	nodes: AdminNodeRow[],
	relationships: AdminRelationshipRow[],
	nameOf: (relationshipNameId: string) => string | undefined
): Stain => {
	const sorted = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
	const index = new Map(sorted.map((n, i) => [n.id, i]));
	const links: StainLink[] = [];
	const parentLinks: [string, string][] = [];
	for (const r of relationships) {
		const a = index.get(r.sourceNode);
		const b = index.get(r.targetNode);
		if (a === undefined || b === undefined || a === b) {
			continue;
		}
		const name = nameOf(r.relationshipName) ?? "";
		links.push({ a, b, partner: PARTNER_NAMES.includes(name) });
		if (PARENT_NAMES.includes(name)) {
			parentLinks.push([r.sourceNode, r.targetNode]);
		}
	}
	const positions = forceLayout(sorted.length, links, seeded(tree.id));
	const people = sorted.map((n, i) => ({
		id: n.id,
		name: n.name,
		x: positions[i].x,
		y: positions[i].y,
		born: yearOf(n.birthDate),
		died: n.deathDate ? yearOf(n.deathDate) : null,
		picture: n.picture,
	}));
	const reach = Math.max(0, ...people.map((p) => Math.hypot(p.x, p.y)));
	return {
		id: tree.id,
		name: tree.name,
		creator: tree.creatorEmail || tree.creatorUsername || "—",
		people,
		links,
		generations: countGenerations(
			sorted.map((n) => n.id),
			parentLinks
		),
		x: 0,
		y: 0,
		r: reach + LINK * 0.5,
	};
};

/**
 * Drops the stains at random spots inside a disc, biggest first, never
 * overlapping (with a gap). The disc grows when a stain does not fit.
 */
export const scatterStains = (stains: Stain[], random: () => number): Stain[] => {
	const gap = LINK * 0.8;
	const area = stains.reduce((sum, s) => sum + Math.PI * (s.r + gap) ** 2, 0);
	let radius = Math.sqrt(area / (Math.PI * 0.3));
	const placed: Stain[] = [];
	const order = [...stains].sort((a, b) => b.r - a.r || a.id.localeCompare(b.id));
	for (const stain of order) {
		for (;;) {
			let spot: { x: number; y: number } | null = null;
			for (let attempt = 0; attempt < 300 && !spot; attempt++) {
				const angle = random() * Math.PI * 2;
				const distance = Math.sqrt(random()) * Math.max(0, radius - stain.r);
				const x = Math.cos(angle) * distance;
				const y = Math.sin(angle) * distance;
				const clear = placed.every((p) => (p.x - x) ** 2 + (p.y - y) ** 2 >= (p.r + stain.r + gap) ** 2);
				if (clear) {
					spot = { x, y };
				}
			}
			if (spot) {
				placed.push({ ...stain, x: spot.x, y: spot.y });
				break;
			}
			radius *= 1.08;
		}
	}
	return placed;
};

/** Every tree with at least one person, as a stain on the shared plane. */
export const buildCanvas = (
	trees: AdminTreeRow[],
	nodes: AdminNodeRow[],
	relationships: AdminRelationshipRow[],
	relationshipNames: { id: string; name: string }[]
): { stains: Stain[]; emptyTrees: number } => {
	const names = new Map(relationshipNames.map((n) => [n.id, n.name]));
	const nodesByTree = new Map<string, AdminNodeRow[]>();
	for (const node of nodes) {
		nodesByTree.set(node.tree, [...(nodesByTree.get(node.tree) ?? []), node]);
	}
	const relsByTree = new Map<string, AdminRelationshipRow[]>();
	for (const r of relationships) {
		relsByTree.set(r.tree, [...(relsByTree.get(r.tree) ?? []), r]);
	}
	const filled = trees.filter((t) => (nodesByTree.get(t.id)?.length ?? 0) > 0);
	const stains = filled.map((t) =>
		buildStain(t, nodesByTree.get(t.id) ?? [], relsByTree.get(t.id) ?? [], (id) => names.get(id))
	);
	return { stains: scatterStains(stains, seeded("family-tree-admin")), emptyTrees: trees.length - filled.length };
};
