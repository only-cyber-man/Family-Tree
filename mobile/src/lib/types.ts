// Record shapes of the PocketBase collections shared with the web app
// (src/lib/interfaces/*.ts in the repo root). Only fields that exist there.

export type Gender = "male" | "female";
export type RelationshipGroup = "BIOLOGICAL" | "IRRELEVANT" | "IN-LAW" | "CHURCH";

export interface PbRecordBase {
	id: string;
	created: string;
	updated: string;
	collectionId?: string;
	collectionName?: string;
}

/** ft_users */
export interface UserRecord extends PbRecordBase {
	username: string;
	email: string;
	name: string;
	avatar?: string;
}

/** ft_trees */
export interface TreeRecord extends PbRecordBase {
	name: string;
	creator: string;
	invited: string[];
}

/** ft_nodes */
export interface NodeRecord extends PbRecordBase {
	name: string;
	birthDate: string;
	deathDate?: string;
	picture?: string;
	tree: string;
	gender: Gender;
}

/** ft_relationships_names (read-only on mobile) */
export interface RelationshipNameRecord extends PbRecordBase {
	name: string;
	group: RelationshipGroup;
	isBidirectional: boolean;
}

/** ft_relationships */
export interface RelationshipRecord extends PbRecordBase {
	sourceNode: string;
	targetNode: string;
	relationshipName: string;
	tree: string;
	expand?: { relationshipName?: RelationshipNameRecord };
}

export interface FullTree {
	tree: TreeRecord;
	nodes: NodeRecord[];
	relationships: RelationshipRecord[];
	relationshipNames: RelationshipNameRecord[];
	fetchedAt: number;
}

export interface CalendarDate {
	year: number;
	/** 1-12 */
	month: number;
	day: number;
}

/** A node with its dates parsed. */
export interface Person {
	id: string;
	name: string;
	gender: Gender;
	birth: CalendarDate | null;
	death: CalendarDate | null;
	/** Picture filename on the node record, if any. */
	picture?: string;
}

/** A relationship with its type resolved. */
export interface Edge {
	id: string;
	source: string;
	target: string;
	typeId: string;
	name: string;
	group: RelationshipGroup;
	bidirectional: boolean;
}

export interface Graph {
	persons: Person[];
	byId: Record<string, Person>;
	edges: Edge[];
}
