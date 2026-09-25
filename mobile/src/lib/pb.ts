import PocketBase, { AsyncAuthStore, ClientResponseError, getTokenPayload } from "pocketbase";
import { sessionAction } from "./session";
import { deleteSecure, getSecure, setSecure } from "./secureStorage";

// Same backend as the web app (src/lib/data/index.ts).
export const PB_URL = "https://pocketbase.cyber-man.pl";
const AUTH_KEY = "ft.pb_auth";

/** Refresh the token when fewer than this many seconds remain (checked before every request). */
export const REFRESH_BEFORE_REQUEST_S = 10 * 60;
/** On app start / return to foreground, refresh when fewer than this remain. */
export const REFRESH_ON_FOREGROUND_S = 3 * 24 * 3600;

const store = new AsyncAuthStore({
	save: async (serialized) => setSecure(AUTH_KEY, serialized),
	clear: async () => deleteSecure(AUTH_KEY),
});

export const pb = new PocketBase(PB_URL, store);
// The web client disables auto-cancellation too: several screens fire
// parallel requests to the same collection.
pb.autoCancellation(false);

let expiredHandler: (() => void) | null = null;

/** Session state of the stored token: none / ok / refresh (close to expiry) / expired. */
function tokenAction(withinSeconds: number) {
	const token = pb.authStore.token;
	if (!token) return "none" as const;
	const exp = Number(getTokenPayload(token).exp);
	return sessionAction(Number.isFinite(exp) ? exp : 0, Date.now() / 1000, withinSeconds);
}

/** Called when the stored session is no longer usable (expired or rejected). */
export function onUnauthorized(fn: () => void) {
	expiredHandler = fn;
}

let refreshing: Promise<unknown> | null = null;

/** One auth refresh at a time; resolves true when the session is still good. */
export async function refreshSession(): Promise<boolean> {
	if (!pb.authStore.token) return false;
	refreshing ??= pb
		.collection("ft_users")
		.authRefresh()
		.finally(() => {
			refreshing = null;
		});
	try {
		await refreshing;
		return true;
	} catch (e) {
		// Offline: keep the (still valid) token; anything else ends the session.
		if (e instanceof ClientResponseError && e.status === 0) return pb.authStore.isValid;
		expiredHandler?.();
		return false;
	}
}

/**
 * Makes sure the token is usable: expired -> session-expired flow;
 * close to expiry (within `withinSeconds`) -> proactive refresh.
 */
export async function ensureSession(withinSeconds: number): Promise<boolean> {
	const action = tokenAction(withinSeconds);
	if (action === "none") return false;
	if (action === "expired") {
		expiredHandler?.();
		return false;
	}
	if (action === "refresh") return refreshSession();
	return true;
}

// PocketBase 0.23+ treats a request with an expired token as a guest request
// (empty lists / 404, no 401), so expiry is checked on the client before
// every request instead of relying on the server's answer.
pb.beforeSend = async (url, options) => {
	if (/\/auth-(refresh|with-password)|\/request-(verification|password-reset)/.test(url)) return { url, options };
	const action = tokenAction(REFRESH_BEFORE_REQUEST_S);
	if (action === "none" || action === "ok") return { url, options };
	if (action === "expired") {
		expiredHandler?.();
		throw new ClientResponseError({ url, status: 401, response: { code: 401, message: "Your session has expired. Please sign in again.", data: {} } });
	}
	// Close to expiry: refresh first (one refresh shared by concurrent requests).
	await refreshSession();
	if (!pb.authStore.isValid) {
		throw new ClientResponseError({ url, status: 401, response: { code: 401, message: "Your session has expired. Please sign in again.", data: {} } });
	}
	options.headers = { ...(options.headers ?? {}), Authorization: pb.authStore.token };
	return { url, options };
};

pb.afterSend = (response, data) => {
	if (response.status === 401 && pb.authStore.token) expiredHandler?.();
	return data;
};

/** Loads the persisted auth state into the store. */
export async function loadAuth(): Promise<void> {
	try {
		const raw = await getSecure(AUTH_KEY);
		if (!raw) return;
		const parsed = JSON.parse(raw) as { token?: string; record?: unknown; model?: unknown };
		if (parsed.token) pb.authStore.save(parsed.token, (parsed.record ?? parsed.model ?? null) as never);
	} catch {
		// Corrupt or unreadable: start signed out.
	}
}
