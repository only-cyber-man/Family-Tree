"use client";

import { pb } from "@/lib";

export const LogoutButton = () => (
	<button
		className="btn btn-outline btn-sm"
		style={{ color: "var(--ink2)" }}
		onClick={() => {
			pb.authStore.clear();
			document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			window.location.href = "/";
		}}
	>
		Log out
	</button>
);
