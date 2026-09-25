import { buildGraph } from "../graph";
import type { FullTree, NodeRecord, RelationshipNameRecord, RelationshipRecord } from "../types";

const base = { created: "2024-01-01 10:00:00.000Z", updated: "2024-01-01 10:00:00.000Z" };

export const names: RelationshipNameRecord[] = [
	{ ...base, id: "rn_mother", name: "IS_MOTHER_OF", group: "BIOLOGICAL", isBidirectional: false },
	{ ...base, id: "rn_father", name: "IS_FATHER_OF", group: "BIOLOGICAL", isBidirectional: false },
	{ ...base, id: "rn_married", name: "IS_MARRIED_TO", group: "IN-LAW", isBidirectional: true },
	{ ...base, id: "rn_lives", name: "LIVES_WITH", group: "IN-LAW", isBidirectional: true },
	{ ...base, id: "rn_god", name: "IS_GODPARENT_OF", group: "CHURCH", isBidirectional: false },
	{ ...base, id: "rn_friend", name: "IS_FRIEND_OF", group: "IRRELEVANT", isBidirectional: true },
];

const node = (id: string, name: string, gender: "male" | "female", birthDate: string, deathDate?: string): NodeRecord => ({
	...base,
	id,
	name,
	gender,
	birthDate,
	deathDate,
	tree: "t1",
});

//            Stanisław = Helena          Józef = Bronisława
//                 |                            |
//               Jan  =====  Maria        Andrzej
//                   |                        |
//         Tomasz (me)   Ewa                Anna = Piotr
//                                           |
//                                         Zofia
export const nodes: NodeRecord[] = [
	node("stan", "Stanisław Kowalski", "male", "1921-03-12 00:00:00.000Z", "1998-10-15 00:00:00.000Z"),
	node("hel", "Helena Kowalska", "female", "1924-01-02 00:00:00.000Z", "2010-05-01 00:00:00.000Z"),
	node("jozef", "Józef Nowak", "male", "1919-06-01 00:00:00.000Z", "1985-02-02 00:00:00.000Z"),
	node("bron", "Bronisława Nowak", "female", "1923-11-11 00:00:00.000Z", "2001-11-11 00:00:00.000Z"),
	node("jan", "Jan Kowalski", "male", "1948-04-20 00:00:00.000Z"),
	node("maria", "Maria Kowalska", "female", "1951-10-03 00:00:00.000Z"),
	node("andrzej", "Andrzej Nowak", "male", "1954-07-07 00:00:00.000Z"),
	node("tomasz", "Tomasz Kowalski", "male", "1979-08-30 00:00:00.000Z"),
	node("ewa", "Ewa Lis", "female", "1981-11-30 00:00:00.000Z"),
	node("anna", "Anna Wiśniewska", "female", "1976-05-22 00:00:00.000Z"),
	node("piotr", "Piotr Wiśniewski", "male", "1974-01-15 00:00:00.000Z"),
	node("zofia", "Zofia Wiśniewska", "female", "2005-10-28 00:00:00.000Z"),
	node("roman", "Roman Lis", "male", "1960-02-29 00:00:00.000Z"),
];

let n = 0;
const rel = (source: string, rn: string, target: string): RelationshipRecord => ({
	...base,
	id: `r${++n}`,
	sourceNode: source,
	targetNode: target,
	relationshipName: rn,
	tree: "t1",
});

export const relationships: RelationshipRecord[] = [
	rel("stan", "rn_married", "hel"),
	rel("stan", "rn_father", "jan"),
	rel("hel", "rn_mother", "jan"),
	rel("jozef", "rn_married", "bron"),
	rel("bron", "rn_mother", "maria"),
	rel("jozef", "rn_father", "maria"),
	rel("bron", "rn_mother", "andrzej"),
	rel("jan", "rn_married", "maria"),
	rel("jan", "rn_father", "tomasz"),
	rel("maria", "rn_mother", "tomasz"),
	rel("maria", "rn_mother", "ewa"),
	rel("andrzej", "rn_father", "anna"),
	rel("anna", "rn_married", "piotr"),
	rel("anna", "rn_mother", "zofia"),
	rel("piotr", "rn_father", "zofia"),
	rel("andrzej", "rn_god", "zofia"),
	rel("stan", "rn_friend", "roman"),
];

export const full: FullTree = {
	tree: { ...base, id: "t1", name: "Kowalski family", creator: "u1", invited: [] },
	nodes,
	relationships,
	relationshipNames: names,
	fetchedAt: 0,
};

export const graph = buildGraph(full);
