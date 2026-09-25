import { useEffect, useState } from "react";
import { getUserEmail } from "../lib/api";
import { accountsWithAccess } from "../lib/links";
import type { TreeRecord } from "../lib/types";
import { useSession } from "../store/session";

export interface AccountOption {
	id: string;
	email: string | null;
	isMe: boolean;
}

const cache = new Map<string, string>();

/** Accounts that can see the tree (creator + invitees) with their emails. */
export function useTreeAccounts(tree: Pick<TreeRecord, "creator" | "invited"> | null | undefined): { accounts: AccountOption[]; loading: boolean } {
	const me = useSession((s) => s.user);
	const ids = tree ? accountsWithAccess(tree) : [];
	const key = ids.join(",");
	const [, bump] = useState(0);
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		let alive = true;
		const missing = ids.filter((id) => id !== me?.id && !cache.has(id));
		if (!missing.length) return;
		setLoading(true);
		Promise.all(missing.map(async (id) => cache.set(id, await getUserEmail(id).catch(() => "")))).finally(() => {
			if (!alive) return;
			setLoading(false);
			bump((n) => n + 1);
		});
		return () => {
			alive = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key, me?.id]);
	const accounts = ids.map((id) => ({ id, isMe: id === me?.id, email: id === me?.id ? (me?.email ?? null) : cache.get(id) || null }));
	// "Me" first.
	accounts.sort((a, b) => Number(b.isMe) - Number(a.isMe));
	return { accounts, loading };
}

/** Email of one account (for the "Linked to …" badge). */
export function useAccountEmail(userId: string | null | undefined): string | null {
	const me = useSession((s) => s.user);
	const [, bump] = useState(0);
	useEffect(() => {
		if (!userId || userId === me?.id || cache.has(userId)) return;
		let alive = true;
		getUserEmail(userId)
			.catch(() => "")
			.then((email) => {
				cache.set(userId, email);
				if (alive) bump((n) => n + 1);
			});
		return () => {
			alive = false;
		};
	}, [userId, me?.id]);
	if (!userId) return null;
	if (userId === me?.id) return me?.email ?? null;
	return cache.get(userId) || null;
}
