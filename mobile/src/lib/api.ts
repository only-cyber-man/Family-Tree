import { toISODate } from "./dates";
import { changedFields, createOnce, isIdTaken } from "./idempotent";
import { pb } from "./pb";
import type {
	CalendarDate,
	FullTree,
	Gender,
	NodeRecord,
	RelationshipNameRecord,
	RelationshipRecord,
	TreeRecord,
	UserRecord,
} from "./types";

// Every call mirrors what the web client does (src/app/**, src/lib/hooks/useTree.tsx):
// same collections, same fields, same filters and expands.

// ---- auth (LoginForm.tsx, RegisterForm.tsx) ----

export async function signIn(login: string, password: string): Promise<UserRecord> {
	const res = await pb.collection("ft_users").authWithPassword<UserRecord>(login, password);
	return res.record;
}

export interface SignUpInput {
	username: string;
	name: string;
	email: string;
	password: string;
	passwordConfirm: string;
}

export async function signUp(input: SignUpInput): Promise<UserRecord> {
	const name = input.name.trim().length > 0 ? input.name.trim() : input.username;
	if (input.password !== input.passwordConfirm) throw new Error("Passwords do not match.");
	await pb.collection("ft_users").create({ ...input, name });
	try {
		await pb.collection("ft_users").requestVerification(input.email);
	} catch {
		// The account exists; verification can be requested again later (same as the web).
	}
	return signIn(input.username, input.password);
}

export async function requestPasswordReset(email: string): Promise<void> {
	await pb.collection("ft_users").requestPasswordReset(email);
}

export async function refreshAuth(): Promise<UserRecord> {
	const res = await pb.collection("ft_users").authRefresh<UserRecord>();
	return res.record;
}

export function currentUser(): UserRecord | null {
	return pb.authStore.isValid ? (pb.authStore.record as unknown as UserRecord | null) : null;
}

// ---- trees (trees/page.tsx, CreateTree.tsx, ManageInvitedButton.tsx) ----

export async function listTrees(): Promise<TreeRecord[]> {
	return pb.collection("ft_trees").getFullList<TreeRecord>({ sort: "-updated" });
}

/** "Number of people" is a count query over ft_nodes, not a stored field. */
export async function countNodes(treeId: string): Promise<number> {
	const res = await pb.collection("ft_nodes").getList(1, 1, { filter: pb.filter("tree.id = {:id}", { id: treeId }), fields: "id" });
	return res.totalItems;
}

/** Idempotent for a given client-generated `id` (same fields as the web's CreateTree). */
export async function createTree(name: string, creator: string, id: string): Promise<TreeRecord> {
	return createOnce(
		() => pb.collection("ft_trees").create<TreeRecord>({ id, name, creator, invited: [] }),
		() => pb.collection("ft_trees").getOne<TreeRecord>(id),
		isIdTaken,
		(existing) => (existing.name !== name ? pb.collection("ft_trees").update<TreeRecord>(id, { name }) : Promise.resolve(existing)),
	);
}

export async function getTree(treeId: string): Promise<TreeRecord> {
	return pb.collection("ft_trees").getOne<TreeRecord>(treeId);
}

/**
 * Atomic relation modifiers: "invited+" / "invited-" change one id on the
 * server, so overlapping invites / revokes (or an Undo) cannot overwrite each
 * other the way a read-modify-write of the whole list could.
 */
export async function addInvited(treeId: string, userId: string): Promise<TreeRecord> {
	return pb.collection("ft_trees").update<TreeRecord>(treeId, { "invited+": userId });
}

export async function removeInvited(treeId: string, userId: string): Promise<TreeRecord> {
	return pb.collection("ft_trees").update<TreeRecord>(treeId, { "invited-": userId });
}

/** ft_gettable_users_id_email: id -> email, used to list invitees. */
export async function getUserEmail(userId: string): Promise<string> {
	const rec = await pb.collection("ft_gettable_users_id_email").getOne<{ id: string; email: string }>(userId);
	return rec.email;
}

/** ft_gettable_users_email: email -> userId. Invitees must already have an account. */
export async function findUserIdByEmail(email: string): Promise<string> {
	const rec = await pb.collection("ft_gettable_users_email").getOne<{ userId: string }>(email);
	return rec.userId;
}

// ---- one tree (useTree.fetchTree) ----

export async function fetchFullTree(treeId: string): Promise<FullTree> {
	const filter = pb.filter("tree.id = {:id}", { id: treeId });
	const [tree, relationships, nodes, relationshipNames] = await Promise.all([
		pb.collection("ft_trees").getOne<TreeRecord>(treeId),
		pb.collection("ft_relationships").getFullList<RelationshipRecord>({ expand: "relationshipName", filter }),
		pb.collection("ft_nodes").getFullList<NodeRecord>({ filter }),
		pb.collection("ft_relationships_names").getFullList<RelationshipNameRecord>({ sort: "name" }),
	]);
	return { tree, relationships, nodes, relationshipNames, fetchedAt: Date.now() };
}

// ---- nodes (AddNodeButton.tsx, EditNodeButton.tsx, RemoveNodeButton.tsx) ----

export interface PhotoInput {
	uri: string;
	mimeType?: string | null;
	fileName?: string | null;
}

export interface NodeInput {
	name: string;
	gender: Gender;
	birthDate: CalendarDate;
	deathDate: CalendarDate | null;
	photo?: PhotoInput | null;
}

function nodeForm(input: NodeInput, extra: { tree?: string; clearDeath?: boolean; id?: string }): FormData {
	const data = new FormData();
	if (extra.id) data.append("id", extra.id);
	data.append("name", input.name.trim());
	data.append("birthDate", toISODate(input.birthDate));
	if (input.deathDate) data.append("deathDate", toISODate(input.deathDate));
	else if (extra.clearDeath) data.append("deathDate", "");
	data.append("gender", input.gender);
	if (input.photo) {
		const type = input.photo.mimeType ?? "image/jpeg";
		const ext = type.split("/")[1] ?? "jpg";
		// React Native's FormData takes { uri, name, type } for files.
		data.append("picture", { uri: input.photo.uri, name: input.photo.fileName ?? `photo.${ext}`, type } as unknown as Blob);
	}
	if (extra.tree) data.append("tree", extra.tree);
	return data;
}

/** The plain fields a node record should have for `input` (dates as YYYY-MM-DD). */
export function nodeFields(input: NodeInput, treeId: string) {
	return {
		name: input.name.trim(),
		gender: input.gender,
		birthDate: toISODate(input.birthDate),
		deathDate: input.deathDate ? toISODate(input.deathDate) : "",
		tree: treeId,
	};
}

/** Idempotent for a given client-generated `id`; a committed earlier attempt is updated to `input`. */
export async function createNode(treeId: string, input: NodeInput, id: string): Promise<NodeRecord> {
	return createOnce(
		() => pb.collection("ft_nodes").create<NodeRecord>(nodeForm(input, { tree: treeId, id })),
		() => pb.collection("ft_nodes").getOne<NodeRecord>(id),
		isIdTaken,
		(existing) =>
			// A photo cannot be compared, so a retry that carries one always re-sends it.
			changedFields(existing as unknown as Record<string, unknown>, nodeFields(input, treeId)).length || input.photo
				? updateNode(id, input)
				: Promise.resolve(existing),
	);
}

export async function updateNode(id: string, input: NodeInput): Promise<NodeRecord> {
	return pb.collection("ft_nodes").update<NodeRecord>(id, nodeForm(input, { clearDeath: true }));
}

export async function deleteNode(id: string): Promise<void> {
	await pb.collection("ft_nodes").delete(id);
}

export function pictureUrl(node: Pick<NodeRecord, "id" | "collectionId" | "collectionName" | "picture">): string | undefined {
	if (!node.picture) return undefined;
	return pb.files.getURL({ ...node, collectionId: node.collectionId ?? "", collectionName: node.collectionName ?? "ft_nodes" }, node.picture);
}

// ---- relationships (AddRelationshipButton.tsx, RemoveRelationshipButton.tsx) ----

export interface RelationshipInput {
	/** Client-generated record id; makes the create idempotent. */
	id?: string;
	sourceNode: string;
	targetNode: string;
	relationshipName: string;
	tree: string;
}

/**
 * The expanded type comes back in the create response itself, so there is no
 * second request whose failure could be mistaken for a failed create. (Views
 * also resolve the type from ft_relationships_names if the expand is missing.)
 */
export async function createRelationship(input: RelationshipInput): Promise<RelationshipRecord> {
	const opts = { expand: "relationshipName" };
	if (!input.id) return pb.collection("ft_relationships").create<RelationshipRecord>(input, opts);
	const id = input.id;
	const { id: _id, ...fields } = input;
	return createOnce(
		() => pb.collection("ft_relationships").create<RelationshipRecord>(input, opts),
		() => pb.collection("ft_relationships").getOne<RelationshipRecord>(id, opts),
		isIdTaken,
		(existing) =>
			changedFields(existing as unknown as Record<string, unknown>, fields).length
				? pb.collection("ft_relationships").update<RelationshipRecord>(id, fields, opts)
				: Promise.resolve(existing),
	);
}

/** A person's relationships as the server has them (independent of any local copy). */
export async function listNodeRelationships(treeId: string, nodeId: string): Promise<RelationshipRecord[]> {
	return pb.collection("ft_relationships").getFullList<RelationshipRecord>({
		filter: pb.filter("tree.id = {:tree} && (sourceNode = {:node} || targetNode = {:node})", { tree: treeId, node: nodeId }),
		fields: "id,sourceNode,targetNode,relationshipName,tree,created,updated",
	});
}

export async function deleteRelationship(id: string): Promise<void> {
	await pb.collection("ft_relationships").delete(id);
}
