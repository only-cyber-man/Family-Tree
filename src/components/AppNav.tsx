"use client";

import Link from "next/link";
import { Brand } from "./Logo";
import { LogoutButton } from "./LogoutButton";
import { PreferenceControls } from "./PreferenceControls";
import { initials } from "@/lib/people";
import { useT } from "@/i18n/client";

export const UserAvatar = ({ name, size = 34 }: { name: string; size?: number }) => (
	<div
		className="avatar"
		aria-hidden
		style={{
			width: size,
			height: size,
			background: "var(--primary)",
			color: "var(--on-primary)",
			fontSize: 13,
		}}
	>
		{initials(name).slice(0, 1) || "?"}
	</div>
);

export const AppNav = ({
	userName,
	isAdmin = false,
	current = "trees",
}: {
	userName: string;
	/** Shows the link to /admin (only ever true for ADMIN_EMAIL). */
	isAdmin?: boolean;
	current?: "trees" | "admin";
}) => {
	const t = useT();
	const link = (page: typeof current) => ({
		className: `${current === page ? "nav-link-active" : "nav-link"} hide-sm`,
		"aria-current": current === page ? ("page" as const) : undefined,
	});
	return (
		<nav className="app-nav" aria-label={t.common.mainNav}>
			<div style={{ display: "flex", alignItems: "center", gap: 32, minWidth: 0 }}>
				<Brand href="/trees" collapsible />
				<div style={{ display: "flex", alignItems: "center", gap: 24 }}>
					<Link href="/trees" {...link("trees")}>
						{t.nav.trees}
					</Link>
					{isAdmin ? (
						<Link href="/admin" {...link("admin")}>
							Admin
						</Link>
					) : null}
				</div>
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<PreferenceControls />
				<span className="hide-sm" style={{ fontSize: 14, color: "var(--ink2)" }}>
					{userName}
				</span>
				<Link href="/account" aria-label={t.nav.account} title={t.nav.account} style={{ display: "flex" }}>
					<UserAvatar name={userName} />
				</Link>
				<LogoutButton />
			</div>
		</nav>
	);
};
