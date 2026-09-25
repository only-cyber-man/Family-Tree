import { ageInfo } from "./dates";
import { humanizeName } from "./relations";
import type { CalendarDate, Edge, Gender, Person } from "./types";

// Same semantics as the web FiltersButton + useTree.filterOut: hide
// relationship types, keep an age range, one gender, exclude names containing
// any of the comma-separated fragments.

export interface Filters {
	hiddenRelationshipNames: string[];
	minAge: number;
	/** AGE_MAX means "no upper limit". */
	maxAge: number;
	gender: Gender | "both";
	excludeNames: string;
}

export const AGE_MAX = 100;

export const DEFAULT_FILTERS: Filters = {
	hiddenRelationshipNames: [],
	minAge: 0,
	maxAge: AGE_MAX,
	gender: "both",
	excludeNames: "",
};

export function excludeFragments(excludeNames: string): string[] {
	return excludeNames
		.split(",")
		.map((n) => n.trim().toLowerCase())
		.filter((n) => n.length > 0);
}

export function isPersonVisible(p: Person, f: Filters, today: CalendarDate): boolean {
	const info = ageInfo(p.birth, p.death, today);
	const age = info?.age ?? 0;
	if (age < f.minAge) return false;
	if (f.maxAge < AGE_MAX && age > f.maxAge) return false;
	if (f.gender !== "both" && f.gender !== p.gender) return false;
	const fragments = excludeFragments(f.excludeNames);
	const name = p.name.toLowerCase();
	if (fragments.some((frag) => name.includes(frag))) return false;
	return true;
}

export interface Visibility {
	persons: Person[];
	edges: Edge[];
	personIds: Set<string>;
}

export function applyFilters(persons: Person[], edges: Edge[], f: Filters, today: CalendarDate): Visibility {
	const visible = persons.filter((p) => isPersonVisible(p, f, today));
	const personIds = new Set(visible.map((p) => p.id));
	const hidden = new Set(f.hiddenRelationshipNames);
	const visibleEdges = edges.filter((e) => !hidden.has(e.name) && personIds.has(e.source) && personIds.has(e.target));
	return { persons: visible, edges: visibleEdges, personIds };
}

export type ChipKey = `rel:${string}` | "age" | "gender" | "names";

export interface FilterChip {
	key: ChipKey;
	label: string;
}

export function filterChips(f: Filters): FilterChip[] {
	const chips: FilterChip[] = f.hiddenRelationshipNames.map((n) => ({ key: `rel:${n}` as ChipKey, label: `Hide: ${humanizeName(n)}` }));
	if (f.minAge > 0 || f.maxAge < AGE_MAX) chips.push({ key: "age", label: `Age ${f.minAge}–${f.maxAge < AGE_MAX ? f.maxAge : `${AGE_MAX}+`}` });
	if (f.gender !== "both") chips.push({ key: "gender", label: f.gender === "male" ? "Men only" : "Women only" });
	const frags = excludeFragments(f.excludeNames);
	if (frags.length) chips.push({ key: "names", label: `Not: ${f.excludeNames.split(",").map((s) => s.trim()).filter(Boolean).join(", ")}` });
	return chips;
}

export function clearChip(f: Filters, key: ChipKey): Filters {
	if (key.startsWith("rel:")) {
		const name = key.slice(4);
		return { ...f, hiddenRelationshipNames: f.hiddenRelationshipNames.filter((n) => n !== name) };
	}
	if (key === "age") return { ...f, minAge: 0, maxAge: AGE_MAX };
	if (key === "gender") return { ...f, gender: "both" };
	return { ...f, excludeNames: "" };
}

export function activeFilterCount(f: Filters): number {
	return filterChips(f).length;
}
