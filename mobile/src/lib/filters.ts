import { ageInfo } from "./dates";
import { en, type Dict } from "../i18n/en";
import { typeLabel } from "./relations";
import { fold } from "./search";
import type { CalendarDate, Edge, Gender, Person } from "./types";

// Same semantics as the web FiltersButton + useTree.filterOut: hide
// relationship types, keep an age range, one gender, exclude names containing
// any of the comma-separated fragments. Plus an include filter: show only
// names containing any of its fragments. Include applies first, then
// exclude; both match case- and diacritic-insensitively ("wisn" = "Wiśn").

export interface Filters {
	hiddenRelationshipNames: string[];
	minAge: number;
	/** AGE_MAX means "no upper limit". */
	maxAge: number;
	gender: Gender | "both";
	excludeNames: string;
	/** Comma-separated fragments; empty = everyone. */
	includeNames: string;
}

export const AGE_MAX = 100;

export const DEFAULT_FILTERS: Filters = {
	hiddenRelationshipNames: [],
	minAge: 0,
	maxAge: AGE_MAX,
	gender: "both",
	excludeNames: "",
	includeNames: "",
};

/** Comma-separated fragments, folded (lower-case, no diacritics). */
export function nameFragments(list: string): string[] {
	return list
		.split(",")
		.map((n) => fold(n.trim()))
		.filter((n) => n.length > 0);
}


export function isPersonVisible(p: Person, f: Filters, today: CalendarDate): boolean {
	const info = ageInfo(p.birth, p.death, today);
	const age = info?.age ?? 0;
	if (age < f.minAge) return false;
	if (f.maxAge < AGE_MAX && age > f.maxAge) return false;
	if (f.gender !== "both" && f.gender !== p.gender) return false;
	const name = fold(p.name);
	const include = nameFragments(f.includeNames ?? "");
	if (include.length && !include.some((frag) => name.includes(frag))) return false;
	const exclude = nameFragments(f.excludeNames);
	if (exclude.some((frag) => name.includes(frag))) return false;
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

export type ChipKey = `rel:${string}` | "age" | "gender" | "names" | "include";

export interface FilterChip {
	key: ChipKey;
	label: string;
}

export function filterChips(f: Filters, L: Dict = en): FilterChip[] {
	const F = L.filters;
	const chips: FilterChip[] = f.hiddenRelationshipNames.map((n) => ({ key: `rel:${n}` as ChipKey, label: F.chipHide(typeLabel(n, L)) }));
	if (f.minAge > 0 || f.maxAge < AGE_MAX) chips.push({ key: "age", label: F.chipAge(f.minAge, f.maxAge < AGE_MAX ? String(f.maxAge) : `${AGE_MAX}+`) });
	if (f.gender !== "both") chips.push({ key: "gender", label: f.gender === "male" ? F.chipMen : F.chipWomen });
	const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean).join(", ");
	if (nameFragments(f.includeNames ?? "").length) chips.push({ key: "include", label: F.chipOnly(list(f.includeNames)) });
	const frags = nameFragments(f.excludeNames);
	if (frags.length) chips.push({ key: "names", label: F.chipNot(f.excludeNames.split(",").map((s) => s.trim()).filter(Boolean).join(", ")) });
	return chips;
}

export function clearChip(f: Filters, key: ChipKey): Filters {
	if (key.startsWith("rel:")) {
		const name = key.slice(4);
		return { ...f, hiddenRelationshipNames: f.hiddenRelationshipNames.filter((n) => n !== name) };
	}
	if (key === "age") return { ...f, minAge: 0, maxAge: AGE_MAX };
	if (key === "gender") return { ...f, gender: "both" };
	if (key === "include") return { ...f, includeNames: "" };
	return { ...f, excludeNames: "" };
}

export function activeFilterCount(f: Filters): number {
	return filterChips(f).length;
}
