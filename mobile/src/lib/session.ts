// Pure decisions about the stored session and reminder taps.

export type SessionAction = "none" | "ok" | "refresh" | "expired";

/**
 * What to do with a token whose JWT `exp` is `expSeconds` (unix seconds).
 * PocketBase 0.23+ answers requests made with an expired token as if they
 * came from a guest (no 401), so expiry must be decided on the client.
 */
export function sessionAction(expSeconds: number | null | undefined, nowSeconds: number, refreshWithinSeconds: number): SessionAction {
	if (expSeconds == null) return "none";
	if (expSeconds <= nowSeconds) return "expired";
	if (expSeconds - nowSeconds <= refreshWithinSeconds) return "refresh";
	return "ok";
}

export interface ReminderData {
	treeId?: string;
	personId?: string;
	userId?: string;
}

/**
 * A tapped reminder is only opened for the account that scheduled it and for
 * a tree that account can still see (`treeIds` null = list not loaded yet).
 */
export function shouldOpenReminder(data: ReminderData | undefined, currentUserId: string | null | undefined, treeIds: string[] | null): boolean {
	if (!data?.treeId || !data.personId || !currentUserId) return false;
	if (data.userId !== currentUserId) return false;
	if (treeIds && !treeIds.includes(data.treeId)) return false;
	return true;
}
