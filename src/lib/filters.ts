import { Gender, Node, Relationship } from "./interfaces";

export const AGE_MIN = 0;
export const AGE_MAX = 110;

export interface TreeFilters {
	/** ft_relationships_names ids hidden from the canvas and the export. */
	hiddenTypes: string[];
	minAge: number;
	maxAge: number;
	gender: Gender | "both";
	/** Comma-separated fragments; a person matching any of them is hidden. */
	nameFilter: string;
	/** Comma-separated fragments; when set, only people matching one of them stay. */
	includeFilter: string;
}

export const EMPTY_FILTERS: TreeFilters = {
	hiddenTypes: [],
	minAge: AGE_MIN,
	maxAge: AGE_MAX,
	gender: "both",
	nameFilter: "",
	includeFilter: "",
};

/**
 * Lower-case without diacritics, so "zolkiewski" finds "Żółkiewski".
 * ł/Ł have no combining form and are mapped by hand.
 */
export const normalizeText = (text: string) =>
	text
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/ł/g, "l")
		.replace(/Ł/g, "L")
		.toLowerCase();

export const nameFragments = (nameFilter: string) =>
	nameFilter
		.split(",")
		.map((name) => normalizeText(name.trim()))
		.filter((name) => name.length > 0);

export const isNodeVisible = (node: Node, filters: TreeFilters) => {
	const age = node.age;
	if (age < filters.minAge) {
		return false;
	}
	// The top of the slider means "and older".
	if (filters.maxAge < AGE_MAX && age > filters.maxAge) {
		return false;
	}
	if (filters.gender !== "both" && filters.gender !== node.gender) {
		return false;
	}
	const name = normalizeText(node.name);
	// Include first, then exclude.
	const include = nameFragments(filters.includeFilter);
	if (include.length > 0 && !include.some((fragment) => name.includes(fragment))) {
		return false;
	}
	const exclude = nameFragments(filters.nameFilter);
	return !exclude.some((fragment) => name.includes(fragment));
};

export const visibleGraph = (
	nodes: Node[],
	relationships: Relationship[],
	filters: TreeFilters
) => {
	const visibleNodes = nodes.filter((node) => isNodeVisible(node, filters));
	const ids = new Set(visibleNodes.map((node) => node.id));
	const visibleRelationships = relationships.filter(
		(r) =>
			ids.has(r.sourceNodeId) &&
			ids.has(r.targetNodeId) &&
			!filters.hiddenTypes.includes(r.relationshipId)
	);
	return { visibleNodes, visibleRelationships };
};

export const activeFilterCount = (filters: TreeFilters) =>
	filters.hiddenTypes.length +
	(filters.minAge > AGE_MIN || filters.maxAge < AGE_MAX ? 1 : 0) +
	(filters.gender !== "both" ? 1 : 0) +
	(filters.nameFilter.trim().length > 0 ? 1 : 0) +
	(filters.includeFilter.trim().length > 0 ? 1 : 0);
