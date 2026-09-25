import PocketBase from "pocketbase";

export const pb = new PocketBase(
	process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "https://pocketbase.cyber-man.pl"
);

// The server renders from the pb_auth cookie, so the browser client follows it
// too: a session that only survives in the cookie (cleared localStorage, a new
// tab after an SSR login) would otherwise look signed out to client requests.
if (typeof document !== "undefined") {
	const hasCookie = document.cookie.split("; ").some((c) => c.startsWith("pb_auth="));
	if (hasCookie) {
		pb.authStore.loadFromCookie(document.cookie);
	} else {
		pb.authStore.clear();
	}
}

export const getPocketbaseError = ({
	url,
	message,
	response,
}: {
	url?: string;
	message?: string;
	response: {
		code: number;
		message: string;
		data: Record<
			string,
			{
				code: string;
				message: string;
			}
		>;
	};
}) => {
	if (!url) {
		return message ?? "Unknown error";
	}
	let error = response.message + "\n";
	Object.keys(response.data).forEach((key) => {
		error += `\n${key}: ${response.data[key].message}`;
	});
	return error;
};
