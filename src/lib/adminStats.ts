// Admin access and the data the admin canvas reads. Pure: no PocketBase or
// React here, so it can run on the server and be checked on its own.
//
// Data comes from three admin-only PocketBase views (list/view rule:
// @request.auth.collectionName = "ft_users" && @request.auth.email = "ja@cyber-man.pl" && @request.auth.verified = true):
//
// ft_admin_trees:
//   SELECT t.id, t.name, t.created, t.updated,
//     COALESCE(u.email, '') AS creatorEmail,
//     COALESCE(u.username, '') AS creatorUsername
//   FROM ft_trees t LEFT JOIN ft_users u ON u.id = t.creator
//
// ft_admin_nodes:
//   SELECT id, tree, name, gender, birthDate, deathDate, picture, created, updated FROM ft_nodes
//
// ft_admin_relationships:
//   SELECT id, tree, sourceNode, targetNode, relationshipName, created FROM ft_relationships

export const ADMIN_EMAIL = "ja@cyber-man.pl";

/**
 * Shows the admin page and nav link. Only the UI gate: the data is protected by
 * the views' API rules, which also require a verified ft_users account.
 */
export const isAdmin = (record: { collectionName?: string; email?: string } | null | undefined) =>
	record?.collectionName === "ft_users" && record.email === ADMIN_EMAIL;

/** Same parent → child types the tree view uses (src/lib/relatives.ts). */
export const PARENT_NAMES = ["IS_MOTHER_OF", "IS_FATHER_OF"];

/** Drawn as the strong partner line, like on the tree page. */
export const PARTNER_NAMES = ["IS_MARRIED_TO", "IS_PARTNER_OF", "IS_ENGAGED_TO"];

export interface AdminTreeRow {
	id: string;
	name: string;
	created: string;
	updated: string;
	creatorEmail: string;
	creatorUsername: string;
}

export interface AdminNodeRow {
	id: string;
	tree: string;
	name: string;
	gender: "male" | "female";
	birthDate: string;
	deathDate: string;
	picture: string;
	created: string;
	updated: string;
}

export interface AdminRelationshipRow {
	id: string;
	tree: string;
	sourceNode: string;
	targetNode: string;
	relationshipName: string;
	created: string;
}

/**
 * Longest chain of people where each is a parent of the next. Parent links
 * that close a loop (bad data) are ignored instead of looping forever.
 */
export const countGenerations = (nodeIds: string[], parentLinks: [string, string][]): number => {
	if (nodeIds.length === 0) {
		return 0;
	}
	const known = new Set(nodeIds);
	const children = new Map<string, string[]>();
	for (const [parent, child] of parentLinks) {
		if (parent !== child && known.has(parent) && known.has(child)) {
			children.set(parent, [...(children.get(parent) ?? []), child]);
		}
	}
	const depth = new Map<string, number>();
	const onPath = new Set<string>();
	// Iterative DFS so a 10,000-person chain cannot overflow the stack.
	for (const start of nodeIds) {
		if (depth.has(start)) {
			continue;
		}
		const stack: { id: string; next: number }[] = [{ id: start, next: 0 }];
		onPath.add(start);
		while (stack.length > 0) {
			const frame = stack[stack.length - 1];
			const kids = children.get(frame.id) ?? [];
			if (frame.next < kids.length) {
				const kid = kids[frame.next++];
				if (!depth.has(kid) && !onPath.has(kid)) {
					onPath.add(kid);
					stack.push({ id: kid, next: 0 });
				}
				continue;
			}
			let best = 0;
			for (const kid of kids) {
				best = Math.max(best, depth.get(kid) ?? 0);
			}
			depth.set(frame.id, best + 1);
			onPath.delete(frame.id);
			stack.pop();
		}
	}
	return Math.max(...Array.from(depth.values()));
};
