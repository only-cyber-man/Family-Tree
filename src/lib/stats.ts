// Site-wide totals for the landing page, read from the public PocketBase view
// `ft_stats` (one row of counts, list rule ""). Visitors are signed out, so
// they cannot count ft_trees & co. themselves; the view exposes numbers only.
//
// View query:
//   SELECT
//     (ROW_NUMBER() OVER()) AS id,
//     COUNT(*) AS trees,
//     (SELECT COUNT(*) FROM ft_nodes) AS people,
//     (SELECT COUNT(*) FROM ft_relationships) AS relationships,
//     (SELECT COUNT(*) FROM ft_users) AS users
//   FROM ft_trees

export interface SiteStats {
	trees: number;
	people: number;
	relationships: number;
	users: number;
}

const FRESH_MS = 10 * 60 * 1000;
/** After a failure, try again sooner. */
const RETRY_MS = 60 * 1000;
/** The landing page waits at most this long; without numbers it just hides them. */
const TIMEOUT_MS = 1500;

let cached: { stats: SiteStats | null; until: number } | null = null;
let pending: Promise<SiteStats | null> | null = null;

const count = (value: unknown) => {
	const n = Number(value);
	return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
};

/** Parses the view's list response; null unless every count is present. */
export const parseStats = (body: unknown): SiteStats | null => {
	const row = (body as { items?: Record<string, unknown>[] } | null)?.items?.[0];
	if (!row) {
		return null;
	}
	const trees = count(row.trees);
	const people = count(row.people);
	const relationships = count(row.relationships);
	const users = count(row.users);
	if (trees === null || people === null || relationships === null || users === null) {
		return null;
	}
	return { trees, people, relationships, users };
};

const load = async (): Promise<SiteStats | null> => {
	const base = process.env.SSR_POCKETBASE_URL ?? "https://pocketbase.cyber-man.pl";
	try {
		const res = await fetch(`${base}/api/collections/ft_stats/records?perPage=1&skipTotal=1`, {
			cache: "no-store",
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		return res.ok ? parseStats(await res.json()) : null;
	} catch {
		return null;
	}
};

/** Cached totals, or null when they are unavailable. Never throws. */
export const getSiteStats = async (): Promise<SiteStats | null> => {
	if (cached && Date.now() < cached.until) {
		return cached.stats;
	}
	pending ??= load().then((stats) => {
		cached = { stats, until: Date.now() + (stats ? FRESH_MS : RETRY_MS) };
		pending = null;
		return stats;
	});
	return pending;
};
