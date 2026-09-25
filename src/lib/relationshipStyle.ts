import { Gender, Node, Relationship, RelationshipGroup, RelationshipName } from "./interfaces";
import type { Dict } from "@/i18n";

export interface GroupStyle {
	glyph: string;
	/** CSS variable holding the theme-aware colour. */
	color: string;
	width: number;
	dash: string;
}

/** tokens.json → relationship.* */
export const GROUPS: Record<RelationshipGroup, GroupStyle> = {
	BIOLOGICAL: {
		glyph: "●",
		color: "var(--bio)",
		width: 2.5,
		dash: "",
	},
	"IN-LAW": {
		glyph: "◆",
		color: "var(--inlaw)",
		width: 2,
		dash: "8 5",
	},
	CHURCH: {
		glyph: "✝",
		color: "var(--church)",
		width: 2,
		dash: "2 5",
	},
	IRRELEVANT: {
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

/** Translated group name: "Biological" / "Pokrewieństwo". */
export const groupLabel = (t: Dict, group: RelationshipGroup) =>
	t.rel.groups[group] ?? t.rel.groups.IRRELEVANT;

/** "IS_FATHER_OF" → "father of", "LIVES_WITH" → "lives with". */
export const humanize = (name?: RelationshipName | string) => {
	const raw = typeof name === "string" ? name : name?.name ?? "";
	return raw
		.replace(/^IS_/, "")
		.toLowerCase()
		.replace(/_/g, " ")
		.trim();
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Texts for a relationship type with a translation, or undefined (use the humanised name). */
const knownOf = (t: Dict, name?: RelationshipName) =>
	name ? t.rel.known[name.name] : undefined;

const isVerb = (name?: RelationshipName) => /^IS_/.test(name?.name ?? "");

/** Chip / picker label: "Father of" (English), "Ojciec" (Polish). */
export const typeLabel = (t: Dict, name: RelationshipName) =>
	knownOf(t, name)?.type ?? capitalize(humanize(name));

/** Short label drawn on the edge: "father", "married", "lives with". */
export const edgeLabel = (t: Dict, name?: RelationshipName, fromGender?: Gender) =>
	knownOf(t, name)?.edge(fromGender) ?? humanize(name).replace(/ (of|to)$/, "");

/** "Jan is father of Anna", "Tomasz lives with Ewa"; Polish: "Jan jest ojcem osoby Anna". */
export const sentence = (
	t: Dict,
	from: string,
	name: RelationshipName | undefined,
	to: string,
	fromGender?: Gender
) =>
	knownOf(t, name)?.sentence(from, to, fromGender) ??
	t.rel.fallbackSentence(from, humanize(name), isVerb(name), to);

const firstName = (name: string) => name.split(/\s+/)[0];

/** How the other person relates, phrased from the selected person's side. */
export const roleText = (t: Dict, relationship: Relationship, selected: Node, other: Node) => {
	const otherIsSource = relationship.sourceNodeId === other.id;
	const known = knownOf(t, relationship.relationshipName);
	if (known) {
		return known.role(otherIsSource, other.gender);
	}
	const phrase = humanize(relationship.relationshipName);
	if (relationship.isBidirectional) {
		return phrase;
	}
	return t.rel.fallbackRole(
		phrase,
		isVerb(relationship.relationshipName),
		firstName(selected.name),
		relationship.sourceNodeId === selected.id
	);
};

export const relationshipsOf = (relationships: Relationship[], nodeId: string) =>
	relationships.filter(
		(r) => r.sourceNodeId === nodeId || r.targetNodeId === nodeId
	);
