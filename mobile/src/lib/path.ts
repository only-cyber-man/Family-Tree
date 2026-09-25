import { capitalize } from "./format";
import { classifyName, humanizeName, parentChild } from "./relations";
import type { Edge, Gender, Graph } from "./types";

// "How are we related": shortest path between two people, then the path put
// into words ("your cousin", "your mother's brother's daughter").

export type Move = "up" | "down" | "spouse" | "partner" | "sibling" | "other";

export interface Step {
	from: string;
	to: string;
	move: Move;
	edge: Edge;
}

interface Adj {
	to: string;
	move: Move;
	edge: Edge;
}

function adjacency(edges: Edge[], familyOnly: boolean): Map<string, Adj[]> {
	const adj = new Map<string, Adj[]>();
	const add = (a: string, x: Adj) => {
		const list = adj.get(a) ?? [];
		list.push(x);
		adj.set(a, list);
	};
	for (const e of edges) {
		const pc = parentChild(e);
		if (pc) {
			add(pc.parent, { to: pc.child, move: "down", edge: e });
			add(pc.child, { to: pc.parent, move: "up", edge: e });
			continue;
		}
		const kind = classifyName(e.name).kind;
		if (familyOnly && kind !== "spouse" && kind !== "sibling") continue;
		const move: Move = kind === "spouse" ? "spouse" : kind === "partner" ? "partner" : kind === "sibling" ? "sibling" : "other";
		add(e.source, { to: e.target, move, edge: e });
		add(e.target, { to: e.source, move, edge: e });
	}
	return adj;
}

/** Breadth-first shortest path; null when the two are not connected. */
export function findPath(edges: Edge[], fromId: string, toId: string, familyOnly: boolean): Step[] | null {
	if (fromId === toId) return [];
	const adj = adjacency(edges, familyOnly);
	const prev = new Map<string, { at: string; via: Adj }>();
	const seen = new Set([fromId]);
	const queue = [fromId];
	while (queue.length) {
		const at = queue.shift()!;
		for (const via of adj.get(at) ?? []) {
			if (seen.has(via.to)) continue;
			seen.add(via.to);
			prev.set(via.to, { at, via });
			if (via.to === toId) {
				const steps: Step[] = [];
				let cur = toId;
				while (cur !== fromId) {
					const p = prev.get(cur)!;
					steps.unshift({ from: p.at, to: cur, move: p.via.move, edge: p.via.edge });
					cur = p.at;
				}
				return steps;
			}
			queue.push(via.to);
		}
	}
	return null;
}

export interface RelationPath {
	steps: Step[];
	/** True when the path uses only biological and marriage links. */
	familyOnly: boolean;
}

export function relationshipPath(g: Graph, meId: string, targetId: string): RelationPath | null {
	const family = findPath(g.edges, meId, targetId, true);
	if (family) return { steps: family, familyOnly: true };
	const any = findPath(g.edges, meId, targetId, false);
	return any ? { steps: any, familyOnly: false } : null;
}

const gw = (g: Gender, male: string, female: string) => (g === "male" ? male : female);

const ORDINALS = ["", "", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];
const TIMES = ["", "once", "twice", "three times", "four times", "five times"];

function greats(n: number): string {
	return n > 0 ? "great-".repeat(n) : "";
}

/** Blood-relative term for u steps up then d steps down. */
export function bloodTerm(u: number, d: number, gender: Gender): string | null {
	if (u === 0 && d === 0) return null;
	if (d === 0) {
		if (u === 1) return gw(gender, "father", "mother");
		return greats(u - 2) + gw(gender, "grandfather", "grandmother");
	}
	if (u === 0) {
		if (d === 1) return gw(gender, "son", "daughter");
		return greats(d - 2) + gw(gender, "grandson", "granddaughter");
	}
	if (u === 1 && d === 1) return gw(gender, "brother", "sister");
	if (d === 1) return greats(u - 2) + gw(gender, "uncle", "aunt");
	if (u === 1) return (d === 2 ? "" : greats(d - 3) + "grand") + gw(gender, "nephew", "niece");
	const degree = Math.min(u, d) - 1;
	const removed = Math.abs(u - d);
	const base = degree === 1 ? "cousin" : `${ORDINALS[degree] ?? `${degree}th`} cousin`;
	return removed === 0 ? base : `${base} ${TIMES[removed] ?? `${removed} times`} removed`;
}

/** Parses [spouse?] up* (sibling|up down)? down* [spouse?]. */
function shape(moves: Move[]): { u: number; d: number; spouseStart: boolean; spouseEnd: boolean } | null {
	let i = 0;
	let spouseStart = false;
	let spouseEnd = false;
	const ms = [...moves];
	if (ms.length > 1 && ms[ms.length - 1] === "spouse") {
		spouseEnd = true;
		ms.pop();
	}
	if (ms[0] === "spouse" && (ms.length > 1 || !spouseEnd)) {
		spouseStart = true;
		i = 1;
	}
	let u = 0;
	let d = 0;
	while (i < ms.length && ms[i] === "up") (u++, i++);
	if (i < ms.length && ms[i] === "sibling") (u++, d++, i++);
	while (i < ms.length && ms[i] === "down") (d++, i++);
	if (i !== ms.length) return null;
	return { u, d, spouseStart, spouseEnd };
}

function stepWord(g: Graph, s: Step): string {
	const to = g.byId[s.to];
	const gender = to?.gender ?? "female";
	switch (s.move) {
		case "up":
			return gw(gender, "father", "mother");
		case "down":
			return gw(gender, "son", "daughter");
		case "sibling":
			return gw(gender, "brother", "sister");
		case "spouse":
			return gw(gender, "husband", "wife");
		case "partner":
			return "partner";
		default:
			return otherWord(s.edge, s.to === s.edge.source);
	}
}

/** Word for the far end of an "other" edge, e.g. "godparent". */
function otherWord(e: Edge, farIsSource: boolean): string {
	const word = humanizeName(e.name).replace(/ (of|to|with)$/, "").toLowerCase();
	if (farIsSource || e.bidirectional) return word;
	if (/god(parent|mother|father)/.test(word)) return "godchild";
	if (/god(child|son|daughter)/.test(word)) return "godparent";
	return word;
}

/** "your mother's brother's daughter"; an up immediately followed by a down reads as a sibling. */
export function possessiveChain(g: Graph, steps: Step[]): string {
	const words: string[] = [];
	for (let i = 0; i < steps.length; i++) {
		const s = steps[i];
		const next = steps[i + 1];
		if (s.move === "up" && next?.move === "down") {
			words.push(stepWord(g, { ...next, move: "sibling" }));
			i++;
			continue;
		}
		words.push(stepWord(g, s));
	}
	return words.length ? "your " + words.join("'s ") : "you";
}

export interface Kinship {
	/** Short term when there is one: "cousin", "mother-in-law". */
	term: string | null;
	/** Always available: "your mother's brother's daughter". */
	chain: string;
	/** Lower-case phrase for lists: "your cousin" or the chain. */
	phrase: string;
	/** Heading: "Your cousin". */
	title: string;
}

export function describeKinship(g: Graph, steps: Step[]): Kinship {
	if (steps.length === 0) return { term: null, chain: "you", phrase: "you", title: "You" };
	const target = g.byId[steps[steps.length - 1].to];
	const gender = target?.gender ?? "female";
	const chain = possessiveChain(g, steps);
	let term: string | null = null;
	const moves = steps.map((s) => s.move);
	if (moves.length === 1 && moves[0] === "partner") term = "partner";
	const sh = shape(moves);
	if (sh && !term) {
		const { u, d, spouseStart, spouseEnd } = sh;
		if (!spouseStart && !spouseEnd) term = bloodTerm(u, d, gender);
		else if (spouseStart && !spouseEnd) {
			if (u === 0 && d === 0) term = gw(gender, "husband", "wife");
			else if (u === 1 && d === 0) term = gw(gender, "father-in-law", "mother-in-law");
			else if (u === 1 && d === 1) term = gw(gender, "brother-in-law", "sister-in-law");
			else if (u === 0 && d === 1) term = gw(gender, "stepson", "stepdaughter");
		} else if (!spouseStart && spouseEnd) {
			if (u === 0 && d === 1) term = gw(gender, "son-in-law", "daughter-in-law");
			else if (u === 1 && d === 1) term = gw(gender, "brother-in-law", "sister-in-law");
			else if (u === 1 && d === 0) term = gw(gender, "stepfather", "stepmother");
		}
	}
	const phrase = term ? `your ${term}` : chain;
	return { term, chain, phrase, title: capitalize(phrase) };
}

/** How the person at `s.from` relates to the one at `s.to`: "child of", "mother of". */
export function stepLabel(g: Graph, s: Step): string {
	const from = g.byId[s.from];
	const gender = from?.gender ?? "female";
	switch (s.move) {
		case "up":
			return "child of";
		case "down":
			return gw(gender, "father of", "mother of");
		case "sibling":
			return gw(gender, "brother of", "sister of");
		case "spouse":
			return gw(gender, "husband of", "wife of");
		case "partner":
			return humanizeName(s.edge.name).toLowerCase();
		default:
			return s.from === s.edge.source || s.edge.bidirectional
				? humanizeName(s.edge.name).toLowerCase()
				: `${otherWord(s.edge, false)} of`;
	}
}
