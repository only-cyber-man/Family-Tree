import PocketBase from "pocketbase";

export async function initPocketBase(pbAuthValue: string) {
	const pbUrl =
		process.env.SSR_POCKETBASE_URL ?? "https://pocketbase.cyber-man.pl";
	const pb = new PocketBase(pbUrl);
	pb.autoCancellation(false);
	const cookie = `pb_auth=${encodeURIComponent(pbAuthValue)};`;
	pb.authStore.loadFromCookie(cookie);

	try {
		(pb.authStore.isValid &&
			!pb.authStore.isAdmin &&
			(await pb.collection("users").authRefresh())) ||
			(pb.authStore.isValid &&
				pb.authStore.isAdmin &&
				(await pb.admins.authRefresh()));
	} catch (_) {
		pb.authStore.clear();
	}

	return pb;
}

export const validateHeaders = async (headers: Headers) => {
	const auth = headers.get("Authorization");
	if (!auth) {
		throw new Error("No auth header");
	}
	const [_, pbAuth] = auth.split(" ");
	if (!pbAuth) {
		throw new Error("No auth token");
	}
	const pb = await initPocketBase(pbAuth);
	return pb.authStore.isValid;
};
