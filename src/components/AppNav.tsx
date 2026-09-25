import Link from "next/link";
import { Brand } from "./Logo";
import { LogoutButton } from "./LogoutButton";
import { initials } from "@/lib/people";

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

export const AppNav = ({ userName }: { userName: string }) => (
	<nav className="app-nav" aria-label="Main">
		<div style={{ display: "flex", alignItems: "center", gap: 32 }}>
			<Brand href="/trees" />
			<Link href="/trees" className="nav-link-active hide-sm" aria-current="page">
				Trees
			</Link>
		</div>
		<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
			<span className="hide-sm" style={{ fontSize: 14, color: "var(--ink2)" }}>
				{userName}
			</span>
			<UserAvatar name={userName} />
			<LogoutButton />
		</div>
	</nav>
);
