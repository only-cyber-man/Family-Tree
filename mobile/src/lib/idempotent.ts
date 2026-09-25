// Idempotent creates. Record ids are generated on the phone when a form is
// opened (src/lib/ids.ts), and every retry of that submit sends the same id.
// If an earlier attempt was committed but its response was lost, the retry is
// rejected with "id already taken"; that counts as success and the existing
// record is fetched, so a retry can never create a duplicate. Because the user
// may have edited the form between attempts, the existing record is then
// reconciled: if any field differs from the current payload it is updated, so
// the saved record always matches what the user saw when they tapped Save.

export async function createOnce<T>(
	create: () => Promise<T>,
	fetchExisting: () => Promise<T>,
	isIdTaken: (e: unknown) => boolean,
	/** Brings an already-committed record in line with the current payload. */
	reconcile?: (existing: T) => Promise<T>,
): Promise<T> {
	try {
		return await create();
	} catch (e) {
		if (!isIdTaken(e)) throw e;
		const existing = await fetchExisting();
		return reconcile ? reconcile(existing) : existing;
	}
}

/** Names of the fields whose values differ (dates compared on their YYYY-MM-DD part). */
export function changedFields(existing: Record<string, unknown>, desired: Record<string, unknown>): string[] {
	const norm = (v: unknown) => {
		if (v == null || v === "") return "";
		if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
		return typeof v === "object" ? JSON.stringify(v) : String(v);
	};
	return Object.keys(desired).filter((k) => norm(existing[k]) !== norm(desired[k]));
}

/**
 * PocketBase answers a create whose id is taken with 400 and a validation
 * error on the "id" field. Duck-typed on ClientResponseError's shape so this
 * module stays free of the SDK (and testable).
 */
export function isIdTaken(error: unknown): boolean {
	if (!error || typeof error !== "object") return false;
	const e = error as { status?: unknown; response?: { data?: Record<string, unknown> } };
	return e.status === 400 && !!e.response?.data && !!e.response.data.id;
}
