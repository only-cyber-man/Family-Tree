import { Node, Relationship } from "./interfaces";
import type { Dict } from "@/i18n";

interface Family {
	nodes: Node[];
	relationships: Relationship[];
}

const PARENT_NAMES = ["IS_MOTHER_OF", "IS_FATHER_OF"];

const byId = (family: Family, id?: string) =>
	family.nodes.find((node) => node.id === id);

const unique = (nodes: (Node | undefined)[]) => {
	const seen = new Set<string>();
	return nodes.filter((node): node is Node => {
		if (!node || seen.has(node.id)) {
			return false;
		}
		seen.add(node.id);
		return true;
	});
};

export const getParents = (family: Family, nodeId: string): Node[] =>
	unique(
		family.relationships
			.filter(
				(r) =>
					r.targetNodeId === nodeId &&
					PARENT_NAMES.includes(r.relationshipName?.name ?? "")
			)
			.map((r) => byId(family, r.sourceNodeId))
	);

export const getChildren = (family: Family, nodeId: string): Node[] =>
	unique(
		family.relationships
			.filter(
				(r) =>
					r.sourceNodeId === nodeId &&
					PARENT_NAMES.includes(r.relationshipName?.name ?? "")
			)
			.map((r) => byId(family, r.targetNodeId))
	);

export const getSiblings = (family: Family, nodeId: string): Node[] =>
	unique(
		getParents(family, nodeId).flatMap((parent) =>
			getChildren(family, parent.id).filter((child) => child.id !== nodeId)
		)
	);

export const getSpouse = (family: Family, nodeId: string): Node | null => {
	const marriage = family.relationships.find(
		(r) =>
			(r.sourceNodeId === nodeId || r.targetNodeId === nodeId) &&
			r.relationshipName?.name === "IS_MARRIED_TO"
	);
	if (!marriage) {
		return null;
	}
	const spouseId =
		marriage.sourceNodeId === nodeId ? marriage.targetNodeId : marriage.sourceNodeId;
	return byId(family, spouseId) ?? null;
};

export const getAuntsAndUncles = (family: Family, nodeId: string): Node[] =>
	unique(
		getParents(family, nodeId).flatMap((parent) =>
			getSiblings(family, parent.id).flatMap((sibling) => [
				sibling,
				getSpouse(family, sibling.id) ?? undefined,
			])
		)
	);

/** Generations above (up = true) or below, starting at grandparents/grandchildren. */
const generations = (family: Family, nodeId: string, up: boolean): Node[][] => {
	const step = up ? getParents : getChildren;
	const levels: Node[][] = [];
	const visited = new Set<string>([nodeId]);
	let current = step(family, nodeId);
	current.forEach((node) => visited.add(node.id));
	// Guard against cycles in hand-entered data.
	for (let depth = 0; depth < 20; depth++) {
		const next = unique(current.flatMap((node) => step(family, node.id))).filter(
			(node) => !visited.has(node.id)
		);
		if (next.length === 0) {
			break;
		}
		next.forEach((node) => visited.add(node.id));
		levels.push(next);
		current = next;
	}
	return levels;
};

export interface RelativeGroup {
	label: string;
	people: Node[];
}

/** Extended family of one person, derived from parent and marriage links. */
export const extendedFamily = (family: Family, nodeId: string, t: Dict): RelativeGroup[] => {
	const groups: RelativeGroup[] = [];
	const push = (label: string, people: Node[]) => {
		if (people.length > 0) {
			groups.push({ label, people });
		}
	};
	generations(family, nodeId, true)
		.map((people, i) => ({ label: t.family.ancestors(i), people }))
		.reverse()
		.forEach(({ label, people }) => push(label, people));
	push(t.family.parents, getParents(family, nodeId));
	push(t.family.auntsAndUncles, getAuntsAndUncles(family, nodeId));
	push(t.family.siblings, getSiblings(family, nodeId));
	push(t.family.children, getChildren(family, nodeId));
	generations(family, nodeId, false).forEach((people, i) =>
		push(t.family.descendants(i), people)
	);
	return groups;
};
