"use client";

import { pb } from "@/lib";

export const LogoutButton = () => {
	return (
		<button
			className="button is-danger"
			onClick={() => {
				pb.authStore.clear();
				document.cookie =
					"pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
				window.location.reload();
			}}>
			Logout
		</button>
	);
};
