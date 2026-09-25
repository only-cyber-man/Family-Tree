import { en, type Dict } from "../i18n/en";
import { tokens } from "../theme/tokens";
import { firstName } from "./format";
import type { Edge, Gender, Graph, Person, RelationshipGroup, RelationshipNameRecord, RelationshipRecord } from "./types";

// ft_relationships_names is data, not an enum, so the meaning of a type is
// read from its name ("IS_MOTHER_OF", "IS_MARRIED_TO", ...). The web does the
// same for IS_MOTHER_OF / IS_FATHER_OF / IS_MARRIED_TO in SelectNodeModal.tsx.

export type EdgeKind = "parent" | "spouse" | "partner" | "sibling" | "other";

export interface EdgeMeaning {
	kind: EdgeKind;
	/** For "parent": true when the target is the parent of the source (e.g. IS_CHILD_OF). */
	reversed: boolean;
}

export function classifyName(name: string): EdgeMeaning {
	const n = name.toUpperCase();
	if (/(MOTHER|FATHER|PARENT)_OF$/.test(n) && !/(GOD|STEP|FOSTER)/.test(n)) return { kind: "parent", reversed: false };
	if (/(SON|DAUGHTER|CHILD)_OF$/.test(n) && !/(GOD|STEP|FOSTER)/.test(n)) return { kind: "parent", reversed: true };
	if (/MARRIED|SPOUSE|WIFE|HUSBAND/.test(n)) return { kind: "spouse", reversed: false };
	if (/PARTNER|ENGAGED|LIVES_WITH/.test(n)) return { kind: "partner", reversed: false };
	if (/SIBLING|BROTHER|SISTER/.test(n) && !/IN_LAW/.test(n)) return { kind: "sibling", reversed: false };
	return { kind: "other", reversed: false };
}

/** "IS_MOTHER_OF" -> "Mother of", "LIVES_WITH" -> "Lives with". */
export function humanizeName(name: string): string {
	const s = name.replace(/^IS_/, "").replace(/_/g, " ").trim().toLowerCase();
	return s.length ? s[0].toUpperCase() + s.slice(1) : name;
}

/** Localised label of a relationship type; unknown types fall back to the humanised name. */
export function typeLabel(name: string, L: Dict = en): string {
	return L.rel.types[name]?.label ?? humanizeName(name);
}

/** Verb for "<A> <verb> <B>" by A's gender; unknown types: the lower-cased humanised name. */
export function typeSentence(name: string, gender: Gender, L: Dict = en): string {
	return L.rel.types[name]?.sentence(gender) ?? humanizeName(name).toLowerCase();
}

/** Chip label with direction: "Mother of →", "Married to ↔". */
export function relationChipLabel(name: string, bidirectional: boolean, L: Dict = en): string {
	return `${typeLabel(name, L)} ${bidirectional ? "↔" : "→"}`;
}

export type Emphasis = "strong" | "normal" | "weak";

export function emphasisFor(name: string): Emphasis {
	if ((tokens.relationship.emphasis.strong.names as readonly string[]).includes(name)) return "strong";
	if ((tokens.relationship.emphasis.weak.names as readonly string[]).includes(name)) return "weak";
	return "normal";
}

export const GROUP_ORDER: RelationshipGroup[] = ["BIOLOGICAL", "IN-LAW", "CHURCH", "IRRELEVANT"];

export function groupLabel(group: RelationshipGroup, L: Dict = en): string {
	return L.rel.groups[group] ?? tokens.relationship[group].label;
}

export function groupGlyph(group: RelationshipGroup): string {
	return tokens.relationship[group].glyph;
}

/** Parent -> child pairs derived from an edge, if it is a parent edge. */
export function parentChild(e: Edge): { parent: string; child: string } | null {
	const m = classifyName(e.name);
	if (m.kind !== "parent") return null;
	return m.reversed ? { parent: e.target, child: e.source } : { parent: e.source, child: e.target };
}

export interface Relatives {
	parents: Person[];
	children: Person[];
	partners: Person[];
	siblings: Person[];
}

const uniq = (ps: (Person | undefined)[]) => {
	const seen = new Set<string>();
	const out: Person[] = [];
	for (const p of ps) if (p && !seen.has(p.id)) (seen.add(p.id), out.push(p));
	return out;
};

export function relativesOf(g: Graph, id: string, edges: Edge[] = g.edges): Relatives {
	const parents: (Person | undefined)[] = [];
	const children: (Person | undefined)[] = [];
	const partners: (Person | undefined)[] = [];
	const siblings: (Person | undefined)[] = [];
	for (const e of edges) {
		if (e.source !== id && e.target !== id) continue;
		const other = e.source === id ? e.target : e.source;
		const pc = parentChild(e);
		if (pc) {
			if (pc.child === id) parents.push(g.byId[pc.parent]);
			else children.push(g.byId[pc.child]);
			continue;
		}
		const kind = classifyName(e.name).kind;
		if (kind === "spouse" || kind === "partner") partners.push(g.byId[other]);
		else if (kind === "sibling") siblings.push(g.byId[other]);
	}
	// Siblings through a shared parent, like the web's relatives.getSiblings.
	const parentIds = new Set(uniq(parents).map((p) => p.id));
	for (const e of edges) {
		const pc = parentChild(e);
		if (pc && parentIds.has(pc.parent) && pc.child !== id) siblings.push(g.byId[pc.child]);
	}
	return { parents: uniq(parents), children: uniq(children), partners: uniq(partners), siblings: uniq(siblings) };
}

function genderWord(gender: Gender, male: string, female: string): string {
	return gender === "male" ? male : female;
}

/** How `other` relates to the viewed person, for a row in the person sheet. */
export function roleLabel(e: Edge, viewed: Person, other: Person, L: Dict = en): string {
	const R = L.rel.roles;
	const m = classifyName(e.name);
	if (m.kind === "parent") {
		const pc = parentChild(e)!;
		if (pc.parent === other.id) {
			if (/MOTHER/.test(e.name)) return R.mother;
			if (/FATHER/.test(e.name)) return R.father;
			return genderWord(other.gender, R.father, R.mother);
		}
		return R.child;
	}
	if (m.kind === "sibling") return R.sibling(other.gender);
	if (e.bidirectional || m.kind === "spouse" || m.kind === "partner") return typeLabel(e.name, L);
	const t = L.rel.types[e.name];
	if (e.source === other.id) return t?.role?.(other.gender) ?? humanizeName(e.name).replace(/ (of|to)$/, "");
	if (t?.inverseRole) return t.inverseRole(other.gender);
	return R.isSourceOf(firstName(viewed.name), typeLabel(e.name, L).toLowerCase());
}

export interface SheetRow {
	edge: Edge;
	person: Person;
	role: string;
}

export interface SheetGroup {
	group: RelationshipGroup;
	rows: SheetRow[];
}

/** Direct relationships of a person grouped as in the person sheet. */
export function sheetGroups(g: Graph, id: string, edges: Edge[] = g.edges, L: Dict = en): SheetGroup[] {
	const viewed = g.byId[id];
	if (!viewed) return [];
	const byGroup = new Map<RelationshipGroup, SheetRow[]>();
	for (const e of edges) {
		if (e.source !== id && e.target !== id) continue;
		const other = g.byId[e.source === id ? e.target : e.source];
		if (!other) continue;
		const rows = byGroup.get(e.group) ?? [];
		rows.push({ edge: e, person: other, role: roleLabel(e, viewed, other, L) });
		byGroup.set(e.group, rows);
	}
	return GROUP_ORDER.filter((grp) => byGroup.has(grp)).map((grp) => ({
		group: grp,
		rows: byGroup.get(grp)!.sort((a, b) => (a.person.birth?.year ?? 0) - (b.person.birth?.year ?? 0)),
	}));
}

/**
 * True when the relationship already exists. For bidirectional types the
 * reversed pair counts too (B married to A duplicates A married to B).
 */
export function isDuplicateRelationship(
	existing: Pick<RelationshipRecord, "sourceNode" | "targetNode" | "relationshipName">[],
	types: Pick<RelationshipNameRecord, "id" | "isBidirectional">[],
	candidate: { sourceNode: string; targetNode: string; relationshipName: string },
): boolean {
	const bidirectional = types.find((x) => x.id === candidate.relationshipName)?.isBidirectional ?? false;
	return existing.some(
		(r) =>
			r.relationshipName === candidate.relationshipName &&
			((r.sourceNode === candidate.sourceNode && r.targetNode === candidate.targetNode) ||
				(bidirectional && r.sourceNode === candidate.targetNode && r.targetNode === candidate.sourceNode)),
	);
}
