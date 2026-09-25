import { en, type Dict, type KinTerm, type KinWord } from "../i18n/en";
import { capitalize } from "./format";
import { classifyName, parentChild, typeLabel, typeSentence } from "./relations";
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

/** Blood-relative term for u steps up then d steps down. */
export function bloodTerm(u: number, d: number, gender: Gender, L: Dict = en, siblingGender?: Gender): string | null {
	return L.kin.term({ kind: "blood", up: u, down: d, gender, siblingGender });
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

function stepWord(g: Graph, s: Step, L: Dict): KinWord {
	const gender = g.byId[s.to]?.gender ?? "female";
	switch (s.move) {
		case "up":
			return { rel: "parent", gender };
		case "down":
			return { rel: "child", gender };
		case "sibling":
			return { rel: "sibling", gender };
		case "spouse":
			return { rel: "spouse", gender };
		case "partner":
			return { rel: "partner", gender };
		default:
			return {
				rel: "other",
				gender,
				noun: L.kin.otherNoun(s.edge.name, s.to === s.edge.source, s.edge.bidirectional, gender, typeLabel(s.edge.name, en)),
			};
	}
}

/** Chain words; an up immediately followed by a down reads as a sibling. */
function chainWords(g: Graph, steps: Step[], L: Dict): KinWord[] {
	const words: KinWord[] = [];
	for (let i = 0; i < steps.length; i++) {
		const s = steps[i];
		const next = steps[i + 1];
		if (s.move === "up" && next?.move === "down") {
			words.push(stepWord(g, { ...next, move: "sibling" }, L));
			i++;
			continue;
		}
		words.push(stepWord(g, s, L));
	}
	return words;
}

/** "your mother's brother's daughter" / "córka brata twojej matki". */
export function possessiveChain(g: Graph, steps: Step[], L: Dict = en): string {
	return L.kin.chain(chainWords(g, steps, L));
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

export function describeKinship(g: Graph, steps: Step[], L: Dict = en): Kinship {
	if (steps.length === 0) return { term: null, chain: L.kin.you, phrase: L.kin.you, title: L.kin.youTitle };
	const target = g.byId[steps[steps.length - 1].to];
	const gender = target?.gender ?? "female";
	const chain = possessiveChain(g, steps, L);
	let spec: KinTerm | null = null;
	const moves = steps.map((s) => s.move);
	if (moves.length === 1 && moves[0] === "partner") spec = { kind: "affinal", which: "partner", gender };
	const sh = shape(moves);
	if (sh && !spec) {
		const { u, d, spouseStart, spouseEnd } = sh;
		if (!spouseStart && !spouseEnd) {
			// The sibling on the way down (for nephew/niece terms that depend on it).
			const siblingStep = u === 1 ? steps.find((s) => s.move === "sibling") ?? steps[1] : undefined;
			const siblingGender = siblingStep ? g.byId[siblingStep.to]?.gender : undefined;
			spec = { kind: "blood", up: u, down: d, gender, siblingGender };
		} else if (spouseStart && !spouseEnd) {
			if (u === 0 && d === 0) spec = { kind: "affinal", which: "spouse", gender };
			else if (u === 1 && d === 0) spec = { kind: "affinal", which: "parentInLaw", gender };
			else if (u === 1 && d === 1) spec = { kind: "affinal", which: "siblingInLaw", gender };
			else if (u === 0 && d === 1) spec = { kind: "affinal", which: "stepChild", gender };
		} else if (!spouseStart && spouseEnd) {
			if (u === 0 && d === 1) spec = { kind: "affinal", which: "childInLaw", gender };
			else if (u === 1 && d === 1) spec = { kind: "affinal", which: "siblingInLaw", gender };
			else if (u === 1 && d === 0) spec = { kind: "affinal", which: "stepParent", gender };
		}
	}
	const term = spec ? L.kin.term(spec) : null;
	const phrase = term ? L.kin.phrase(term, gender) : chain;
	return { term, chain, phrase, title: capitalize(phrase) };
}

/** How the person at `s.from` relates to the one at `s.to`: "child of", "mother of". */
export function stepLabel(g: Graph, s: Step, L: Dict = en): string {
	const gender = g.byId[s.from]?.gender ?? "female";
	if (s.move === "partner") return typeLabel(s.edge.name, L).toLowerCase();
	if (s.move === "other") {
		if (s.from === s.edge.source || s.edge.bidirectional) return typeSentence(s.edge.name, gender, L).replace(/^is /, "");
		const noun = L.kin.otherNoun(s.edge.name, false, false, gender, typeLabel(s.edge.name, en));
		return L.lang === "en" ? `${noun.nom} of` : noun.nom;
	}
	return L.kin.step(s.move, gender);
}
