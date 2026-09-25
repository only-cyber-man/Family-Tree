import type { Person, TreeRecord } from "./types";

// ft_nodes.user links a person to an ft_users account ("this person is that
// account"). The server link is the source of truth for "This is me"; the
// on-device pick is only a fallback for trees where nobody is linked yet.

export interface MeResolution {
	person: Person | null;
	source: "server" | "device" | null;
}

/** The server-linked person for `userId` wins; otherwise the on-device pick. */
export function resolveMe(persons: Person[], userId: string | null | undefined, devicePickId: string | null | undefined): MeResolution {
	if (userId) {
		const linked = persons.find((p) => p.userId === userId);
		if (linked) return { person: linked, source: "server" };
	}
	const picked = devicePickId ? persons.find((p) => p.id === devicePickId) : undefined;
	return picked ? { person: picked, source: "device" } : { person: null, source: null };
}

/** Another person in the tree already linked to `userId` (to warn before linking twice). */
export function linkConflict(persons: Person[], userId: string | null | undefined, exceptPersonId?: string): Person | null {
	if (!userId) return null;
	return persons.find((p) => p.userId === userId && p.id !== exceptPersonId) ?? null;
}

/** Accounts with access to the tree: the creator, then invitees (no duplicates). */
export function accountsWithAccess(tree: Pick<TreeRecord, "creator" | "invited">): string[] {
	return [...new Set([tree.creator, ...(tree.invited ?? [])].filter(Boolean))];
}
