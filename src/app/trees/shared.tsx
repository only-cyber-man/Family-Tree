import { initials } from "@/lib/people";

export interface InvitedUser {
	id: string;
	email: string;
}

export interface TreeSummary {
	id: string;
	name: string;
	updated: string;
	isOwner: boolean;
	/** Count of ft_nodes in the tree; null when the count query failed. */
	people: number | null;
	invited: InvitedUser[];
	creatorEmail: string | null;
}

const AVATAR_COLORS = ["#3F6E7A", "#A5584C", "#6B4E9B", "#2F5D46", "#B5652B"];

export const avatarColor = (seed: string) => {
	let hash = 0;
	for (const char of seed) {
		hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	}
	return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const EmailAvatar = ({ email, size = 28 }: { email: string; size?: number }) => (
	<div
		className="avatar"
		aria-hidden
		style={{
			width: size,
			height: size,
			background: avatarColor(email),
			fontSize: size > 30 ? 13 : 11,
		}}
	>
		{initials(email.split("@")[0].replace(/[._-]+/g, " ")) || "?"}
	</div>
);
