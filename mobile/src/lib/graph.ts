import { parseDate } from "./dates";
import type { Edge, FullTree, Graph, Person, RelationshipNameRecord } from "./types";

export function toPerson(n: FullTree["nodes"][number]): Person {
	return {
		id: n.id,
		name: n.name,
		gender: n.gender,
		birth: parseDate(n.birthDate),
		death: parseDate(n.deathDate),
		picture: n.picture || undefined,
		note: n.note || undefined,
		userId: n.user || undefined,
	};
}

/** Resolves relationship types and drops edges whose endpoints are gone. */
export function buildGraph(full: Pick<FullTree, "nodes" | "relationships" | "relationshipNames">): Graph {
	const persons = full.nodes.map(toPerson);
	const byId: Record<string, Person> = {};
	for (const p of persons) byId[p.id] = p;
	const names: Record<string, RelationshipNameRecord> = {};
	for (const rn of full.relationshipNames) names[rn.id] = rn;
	const edges: Edge[] = [];
	for (const r of full.relationships) {
		const type = r.expand?.relationshipName ?? names[r.relationshipName];
		if (!type || !byId[r.sourceNode] || !byId[r.targetNode]) continue;
		edges.push({
			id: r.id,
			source: r.sourceNode,
			target: r.targetNode,
			typeId: type.id,
			name: type.name,
			group: type.group,
			bidirectional: type.isBidirectional,
		});
	}
	return { persons, byId, edges };
}
