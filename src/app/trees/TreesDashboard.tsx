"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { timeAgo } from "@/lib";
import {
	ChevronRightIcon,
	MoreIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
	UserPlusIcon,
} from "@/components/Icons";
import {
	CreateTreeDialog,
	DeleteTreeDialog,
	ManageInvitedDialog,
	RenameTreeDialog,
} from "./TreeDialogs";
import { EmailAvatar, TreeSummary } from "./shared";
import s from "./dashboard.module.css";

export type { TreeSummary } from "./shared";

const TreeArt = () => (
	<svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice" aria-hidden>
		<g strokeWidth="2" fill="none" opacity="0.7" style={{ stroke: "var(--bio)" }}>
			<path d="M170 34 L130 78M230 34 L130 78M170 34 L270 78M230 34 L270 78" />
		</g>
		<path d="M192 24 L208 24" strokeWidth="3.5" strokeLinecap="round" style={{ stroke: "var(--inlaw)" }} />
		{[
			{ x: 140, y: 10, g: "male" },
			{ x: 208, y: 10, g: "female" },
			{ x: 104, y: 78, g: "female" },
			{ x: 244, y: 78, g: "male" },
		].map((n) => (
			<rect
				key={`${n.x}-${n.y}`}
				x={n.x}
				y={n.y}
				width="52"
				height="28"
				rx="6"
				strokeWidth="1.5"
				style={{
					fill: `var(--${n.g}-fill)`,
					stroke: `var(--${n.g}-border)`,
				}}
			/>
		))}
	</svg>
);

type DialogState =
	| { kind: "create" }
	| { kind: "rename"; tree: TreeSummary }
	| { kind: "invited"; tree: TreeSummary }
	| { kind: "delete"; tree: TreeSummary }
	| null;

const TreeCard = ({
	tree,
	menuOpen,
	onToggleMenu,
	onAction,
}: {
	tree: TreeSummary;
	menuOpen: boolean;
	onToggleMenu: () => void;
	onAction: (kind: "rename" | "invited" | "delete") => void;
}) => {
	const menuRef = useRef<HTMLDivElement>(null);
	const moreRef = useRef<HTMLButtonElement>(null);
	// The menu item disappears when a dialog opens, so hand focus back to the
	// "…" button first; the dialog then returns focus there when it closes.
	const act = (kind: "rename" | "invited" | "delete") => {
		moreRef.current?.focus();
		onAction(kind);
	};

	useEffect(() => {
		if (!menuOpen) {
			return;
		}
		const close = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onToggleMenu();
			}
		};
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && onToggleMenu();
		document.addEventListener("mousedown", close);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", close);
			document.removeEventListener("keydown", onKey);
		};
	}, [menuOpen, onToggleMenu]);

	const shareText = tree.isOwner
		? tree.invited.length === 0
			? "Only you"
			: `${tree.invited.length} viewer${tree.invited.length === 1 ? "" : "s"}`
		: tree.creatorEmail
		? `by ${tree.creatorEmail.split("@")[0]}`
		: "Shared with you";
	const people =
		tree.people === null ? "" : `${tree.people} ${tree.people === 1 ? "person" : "people"} · `;

	return (
		<article className={`card ${s.card} ${menuOpen ? s.cardOpen : ""}`}>
			<div className={s.art}>
				<TreeArt />
				<span className={`badge ${tree.isOwner ? "badge-owner" : "badge-shared"} ${s.badge}`}>
					{tree.isOwner ? "Owner" : "Shared with you"}
				</span>
			</div>
			<div className={s.body}>
				<div className={s.row}>
					<div style={{ minWidth: 0 }}>
						<h3 className={s.name}>
							<Link href={`/trees/${tree.id}`}>{tree.name}</Link>
						</h3>
						{/* Relative time can tick between server render and hydration. */}
						<div className={s.stats} suppressHydrationWarning>
							{people}updated {timeAgo(tree.updated)}
						</div>
					</div>
					{tree.isOwner ? (
						<div ref={menuRef}>
							<button
								ref={moreRef}
								className={`${s.more} ${menuOpen ? s.moreOpen : ""}`}
								aria-label={`More actions for ${tree.name}`}
								aria-haspopup="menu"
								aria-expanded={menuOpen}
								onClick={onToggleMenu}
							>
								<MoreIcon />
							</button>
							{menuOpen ? (
								<div className="menu" role="menu">
									<div className="menu-title">{tree.name}</div>
									<button className="menu-item" role="menuitem" onClick={() => act("invited")}>
										<UserPlusIcon />
										Manage invited
									</button>
									<button className="menu-item" role="menuitem" onClick={() => act("rename")}>
										<PencilIcon />
										Rename
									</button>
									<div className="menu-sep" />
									<button
										className="menu-item is-danger"
										role="menuitem"
										onClick={() => act("delete")}
									>
										<TrashIcon />
										Delete tree…
									</button>
								</div>
							) : null}
						</div>
					) : null}
				</div>
				<div className={s.foot}>
					<div className={s.share}>
						{tree.isOwner && tree.invited.length > 0 ? (
							<div className="avatar-stack">
								{tree.invited.slice(0, 3).map((user) => (
									<EmailAvatar key={user.id} email={user.email} />
								))}
							</div>
						) : null}
						<span className={s.shareText}>{shareText}</span>
					</div>
					<Link href={`/trees/${tree.id}`} className={`btn btn-primary ${s.open}`}>
						Open
						<ChevronRightIcon />
					</Link>
				</div>
			</div>
		</article>
	);
};

export const TreesDashboard = ({
	trees,
	userName,
}: {
	trees: TreeSummary[];
	userName: string;
}) => {
	const [dialog, setDialog] = useState<DialogState>(null);
	const [openMenu, setOpenMenu] = useState<string | null>(null);
	const closeDialog = () => setDialog(null);

	const owned = trees.filter((t) => t.isOwner).length;
	const shared = trees.length - owned;

	const dialogs = (
		<>
			{dialog?.kind === "create" ? <CreateTreeDialog onClose={closeDialog} /> : null}
			{dialog?.kind === "rename" ? (
				<RenameTreeDialog tree={dialog.tree} onClose={closeDialog} />
			) : null}
			{dialog?.kind === "invited" ? (
				<ManageInvitedDialog tree={dialog.tree} userName={userName} onClose={closeDialog} />
			) : null}
			{dialog?.kind === "delete" ? (
				<DeleteTreeDialog tree={dialog.tree} onClose={closeDialog} />
			) : null}
		</>
	);

	if (trees.length === 0) {
		return (
			<main className={s.empty}>
				<div className={s.emptyInner}>
					<svg width="240" height="150" viewBox="0 0 240 150" aria-hidden>
						<g strokeWidth="2" strokeDasharray="6 5" fill="none" style={{ stroke: "var(--border-strong)" }}>
							<path d="M120 44 L70 104M120 44 L170 104" />
						</g>
						<g strokeWidth="2" style={{ fill: "var(--surface)", stroke: "var(--border)" }}>
							<rect x="86" y="16" width="68" height="30" rx="7" />
							<rect x="36" y="104" width="68" height="30" rx="7" strokeDasharray="5 4" />
							<rect x="136" y="104" width="68" height="30" rx="7" strokeDasharray="5 4" />
						</g>
						<circle cx="104" cy="31" r="7" style={{ fill: "var(--accent)" }} />
						<rect x="116" y="26" width="30" height="4" rx="2" style={{ fill: "var(--border)" }} />
						<rect x="116" y="34" width="20" height="3" rx="1.5" style={{ fill: "var(--surface2)" }} />
					</svg>
					<div>
						<h1 className={s.emptyTitle}>No trees yet</h1>
						<p className={s.emptyBody}>
							Start with the people you know best: yourself, your parents, your
							grandparents. You can invite the rest of the family once there is
							something to look at.
						</p>
					</div>
					<button className="btn btn-primary btn-lg" onClick={() => setDialog({ kind: "create" })}>
						<PlusIcon />
						Create your first tree
					</button>
					<div className={s.emptyNote}>
						Waiting on an invitation? Trees shared with you appear here
						automatically.
					</div>
				</div>
				{dialogs}
			</main>
		);
	}

	return (
		<main className={s.main}>
			<div className={s.head}>
				<div>
					<h1 className={s.title}>Your trees</h1>
					<div className={s.meta}>
						{trees.length} {trees.length === 1 ? "tree" : "trees"}
						{shared > 0 ? ` · ${owned} yours, ${shared} shared with you` : ""}
					</div>
				</div>
				<button
					className={`btn btn-primary ${s.newButton}`}
					aria-label="New tree"
					onClick={() => setDialog({ kind: "create" })}
				>
					<PlusIcon />
					<span className={s.newLabel}>New tree</span>
				</button>
			</div>
			<div className={s.grid}>
				{trees.map((tree) => (
					<TreeCard
						key={tree.id}
						tree={tree}
						menuOpen={openMenu === tree.id}
						onToggleMenu={() => setOpenMenu((id) => (id === tree.id ? null : tree.id))}
						onAction={(kind) => {
							setOpenMenu(null);
							setDialog({ kind, tree });
						}}
					/>
				))}
			</div>
			{dialogs}
		</main>
	);
};
