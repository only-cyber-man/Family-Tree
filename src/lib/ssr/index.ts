import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import es from "eventsource";

export async function initPocketBase() {
	global.EventSource = es as any;
	const pbUrl =
		process.env.SSR_POCKETBASE_URL ?? "https://pocketbase.cyber-man.pl";
	const pb = new PocketBase(pbUrl);
	pb.autoCancellation(false);
	const pbAuth = cookies().get("pb_auth");
	if (!pbAuth) {
		return pb;
	}
	const cookie = `pb_auth=${encodeURIComponent(pbAuth.value)};`;
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
