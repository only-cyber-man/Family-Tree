import { Relationship, RelationshipGroup, RelationshipName } from "./interfaces";

export interface GroupStyle {
	label: string;
	glyph: string;
	/** CSS variable holding the theme-aware colour. */
	color: string;
	width: number;
	dash: string;
}

/** tokens.json → relationship.* */
export const GROUPS: Record<RelationshipGroup, GroupStyle> = {
	BIOLOGICAL: {
		label: "Biological",
		glyph: "●",
		color: "var(--bio)",
		width: 2.5,
		dash: "",
	},
	"IN-LAW": {
		label: "In-law",
		glyph: "◆",
		color: "var(--inlaw)",
		width: 2,
		dash: "8 5",
	},
	CHURCH: {
		label: "Church",
		glyph: "✝",
		color: "var(--church)",
		width: 2,
		dash: "2 5",
	},
	IRRELEVANT: {
		label: "Other",
		glyph: "○",
		color: "var(--other)",
		width: 1,
		dash: "3 7",
	},
};

export const GROUP_ORDER: RelationshipGroup[] = [
	"BIOLOGICAL",
	"IN-LAW",
	"CHURCH",
	"IRRELEVANT",
];

/**
 * Per-name emphasis on top of the group default. There is no emphasis field on
 * ft_relationships_names yet, so it is mapped by name (tokens.json → emphasis).
 */
const STRONG = ["IS_MARRIED_TO"];
const WEAK = ["LIVES_WITH", "IS_PARTNER_OF", "IS_ENGAGED_TO"];

export interface EdgeStyle {
	color: string;
	width: number;
	dash: string;
	labelWeight: number;
}

export const edgeStyle = (name?: RelationshipName): EdgeStyle => {
	const group = GROUPS[name?.group ?? "IRRELEVANT"] ?? GROUPS.IRRELEVANT;
	if (name && STRONG.includes(name.name)) {
		return { color: group.color, width: 4, dash: "", labelWeight: 700 };
	}
	if (name && WEAK.includes(name.name)) {
		return { color: group.color, width: 1.25, dash: "2 6", labelWeight: 500 };
	}
	return {
		color: group.color,
		width: group.width,
		dash: group.dash,
		labelWeight: 600,
	};
};

export const groupOf = (name?: RelationshipName) =>
	GROUPS[name?.group ?? "IRRELEVANT"] ?? GROUPS.IRRELEVANT;

/** "IS_FATHER_OF" → "father of", "LIVES_WITH" → "lives with". */
export const humanize = (name?: RelationshipName | string) => {
	const raw = typeof name === "string" ? name : name?.name ?? "";
	return raw
		.replace(/^IS_/, "")
		.toLowerCase()
		.replace(/_/g, " ")
		.trim();
};

/** Short label drawn on the edge: "father", "married", "lives with". */
export const edgeLabel = (name?: RelationshipName) =>
	humanize(name).replace(/ (of|to)$/, "");

/** "Jan is father of Anna", "Tomasz lives with Ewa". */
export const sentence = (
	from: string,
	name: RelationshipName | undefined,
	to: string
) => `${from} ${/^IS_/.test(name?.name ?? "") ? "is " : ""}${humanize(name)} ${to}`;

export const relationshipsOf = (relationships: Relationship[], nodeId: string) =>
	relationships.filter(
		(r) => r.sourceNodeId === nodeId || r.targetNodeId === nodeId
	);
