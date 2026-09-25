import { ClientResponseError } from "pocketbase";

// Port of the web getPocketbaseError: the server message plus one line per
// invalid field.

export function errorMessage(error: unknown): string {
	if (error instanceof ClientResponseError) {
		if (error.status === 0) return "No connection. Check your internet and try again.";
		const response = error.response as { message?: string; data?: Record<string, { message?: string }> };
		let msg = response?.message || error.message || "Something went wrong.";
		const data = response?.data ?? {};
		const fields = Object.keys(data);
		if (fields.length) msg += "\n" + fields.map((k) => `${k}: ${data[k]?.message ?? "invalid"}`).join("\n");
		return msg;
	}
	if (error instanceof Error) return error.message;
	return typeof error === "string" ? error : "Something went wrong.";
}

/** Status 0: request never reached the server (offline, DNS, aborted). */
export function isNetworkError(error: unknown): boolean {
	if (error instanceof ClientResponseError) return error.status === 0 && !error.isAbort;
	return error instanceof TypeError && /network/i.test(error.message);
}

export function isAuthError(error: unknown): boolean {
	return error instanceof ClientResponseError && error.status === 401;
}

export function isNotFound(error: unknown): boolean {
	return error instanceof ClientResponseError && error.status === 404;
}


export { isIdTaken } from "./idempotent";
