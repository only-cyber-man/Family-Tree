"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getPocketbaseError, isValidEmail, pb } from "@/lib";
import { ConfirmDialog, Dialog } from "@/components/Dialog";
import { AlertIcon } from "@/components/Icons";
import { useToast } from "@/components/Toast";
import { UserAvatar } from "@/components/AppNav";
import { EmailAvatar, InvitedUser, TreeSummary } from "./shared";
import { useT } from "@/i18n/client";
import s from "./dashboard.module.css";

export const CreateTreeDialog = ({ onClose }: { onClose: () => void }) => {
	const t = useT();
	const d = t.treeDialogs;
	const router = useRouter();
	const toast = useToast();
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			setError(d.nameRequired);
			return;
		}
		setBusy(true);
		try {
			const record = await pb.collection("ft_trees").create({
				name: name.trim(),
				creator: pb.authStore.record?.id ?? "",
				invited: [],
			});
			toast(d.created);
			router.push(`/trees/${record.id}`);
		} catch (err: any) {
			setError(getPocketbaseError(err));
			setBusy(false);
		}
	};

	return (
		<Dialog title={d.newTitle} subtitle={d.newSubtitle} onClose={onClose}>
			<form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
				<label className="field">
					<span className="field-label">{d.treeName}</span>
					<input
						className={`input ${error ? "is-invalid" : ""}`}
						placeholder={d.namePlaceholder}
						value={name}
						onChange={(e) => {
							setName(e.target.value);
							setError(null);
						}}
						autoFocus
					/>
					{error ? (
						<span className="field-error">
							<AlertIcon size={14} />
							{error}
						</span>
					) : (
						<span className="field-hint">{d.nameHint}</span>
					)}
				</label>
				<div className="dialog-actions">
					<button type="button" className="btn btn-outline" onClick={onClose}>
						{t.common.cancel}
					</button>
					<button type="submit" className="btn btn-primary" disabled={busy}>
						{busy ? <span className="spinner" /> : null}
						{d.createAndOpen}
					</button>
				</div>
			</form>
		</Dialog>
	);
};

export const RenameTreeDialog = ({
	tree,
	onClose,
}: {
	tree: TreeSummary;
	onClose: () => void;
}) => {
	const t = useT();
	const d = t.treeDialogs;
	const router = useRouter();
	const toast = useToast();
	const [name, setName] = useState(tree.name);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			setError(d.nameEmpty);
			return;
		}
		setBusy(true);
		try {
			await pb.collection("ft_trees").update(tree.id, { name: name.trim() });
			toast(d.renamed);
			router.refresh();
			onClose();
		} catch (err: any) {
			setError(getPocketbaseError(err));
			setBusy(false);
		}
	};

	return (
		<Dialog title={d.renameTitle} onClose={onClose}>
			<form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
				<label className="field">
					<span className="field-label">{d.treeName}</span>
					<input
						className={`input ${error ? "is-invalid" : ""}`}
						value={name}
						onChange={(e) => {
							setName(e.target.value);
							setError(null);
						}}
						autoFocus
					/>
					{error ? (
						<span className="field-error">
							<AlertIcon size={14} />
							{error}
						</span>
					) : null}
				</label>
				<div className="dialog-actions">
					<button type="button" className="btn btn-outline" onClick={onClose}>
						{t.common.cancel}
					</button>
					<button type="submit" className="btn btn-primary" disabled={busy}>
						{busy ? <span className="spinner" /> : null}
						{t.common.save}
					</button>
				</div>
			</form>
		</Dialog>
	);
};

export const ManageInvitedDialog = ({
	tree,
	userName,
	onClose,
	onChanged,
}: {
	tree: TreeSummary;
	userName: string;
	onClose: () => void;
	/** Called after every successful write, including an Undo after closing. */
	onChanged?: () => void;
}) => {
	const t = useT();
	const d = t.treeDialogs;
	const router = useRouter();
	const toast = useToast();
	const [invited, setInvited] = useState<InvitedUser[]>(tree.invited);
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [writing, setWriting] = useState(false);

	// Follow the parent's list when it reloads (e.g. an Undo from a toast of an
	// earlier visit to this dialog).
	const invitedKey = tree.invited.map((u) => u.id).join(",");
	useEffect(() => {
		setInvited(tree.invited);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [invitedKey]);

	/**
	 * Adds or removes one viewer with PocketBase's relation modifiers, which the
	 * server applies to its current list, so concurrent changes never overwrite
	 * each other.
	 */
	const change = async (op: "add" | "remove", userId: string) => {
		setWriting(true);
		try {
			await pb
				.collection("ft_trees")
				.update(tree.id, { [op === "add" ? "invited+" : "invited-"]: userId });
			router.refresh();
			onChanged?.();
		} finally {
			setWriting(false);
		}
	};

	const invite = async (e: FormEvent) => {
		e.preventDefault();
		const address = email.trim();
		if (!isValidEmail(address)) {
			setError(t.common.emailInvalid);
			return;
		}
		if (invited.some((u) => u.email.toLowerCase() === address.toLowerCase())) {
			setError(d.alreadyHasAccess);
			return;
		}
		setBusy(true);
		setError(null);
		let userId: string;
		try {
			const record = await pb.collection("ft_gettable_users_email").getOne(address);
			userId = record.userId;
		} catch (err: any) {
			setError(
				err?.status === 404
					? d.noAccount
					: getPocketbaseError(err)
			);
			setBusy(false);
			return;
		}
		if (userId === pb.authStore.record?.id) {
			setError(d.thatsYou);
			setBusy(false);
			return;
		}
		try {
			await change("add", userId);
			setInvited((list) =>
				list.some((u) => u.id === userId) ? list : [...list, { id: userId, email: address }]
			);
			setEmail("");
			toast(d.invited(address, tree.name));
		} catch (err: any) {
			setError(getPocketbaseError(err));
		} finally {
			setBusy(false);
		}
	};

	const revoke = async (user: InvitedUser) => {
		try {
			await change("remove", user.id);
			setInvited((list) => list.filter((u) => u.id !== user.id));
			toast(d.revoked, "success", {
				label: t.common.undo,
				fn: () => {
					change("add", user.id)
						.then(() =>
							setInvited((list) =>
								list.some((u) => u.id === user.id) ? list : [...list, user]
							)
						)
						.catch((err) => toast(getPocketbaseError(err), "error"));
				},
			});
		} catch (err: any) {
			toast(getPocketbaseError(err), "error");
		}
	};

	return (
		<Dialog
			title={d.whoCanSee(tree.name)}
			subtitle={d.whoCanSeeSubtitle}
			onClose={onClose}
			width={480}
		>
			<form className={s.inviteForm} onSubmit={invite} noValidate>
				<div className="field" style={{ flex: 1 }}>
					<input
						className={`input ${error ? "is-invalid" : ""}`}
						type="email"
						placeholder={d.emailPlaceholder}
						aria-label={d.emailToInvite}
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							setError(null);
						}}
						autoFocus
					/>
					{error ? (
						<span className="field-error">
							<AlertIcon size={14} />
							{error}
						</span>
					) : null}
				</div>
				<button type="submit" className="btn btn-primary" disabled={busy || writing}>
					{busy ? <span className="spinner" /> : null}
					{d.invite}
				</button>
			</form>
			<div className={s.people}>
				<div className={s.person}>
					<UserAvatar name={userName} size={36} />
					<div style={{ flex: 1, minWidth: 0 }}>
						<div className={s.personName}>{t.common.withYou(userName)}</div>
						<div className={s.personRole}>{t.common.creator}</div>
					</div>
					<span className="badge badge-owner">{t.common.owner}</span>
				</div>
				{invited.map((user) => (
					<div key={user.id} className={s.person}>
						<EmailAvatar email={user.email} size={36} />
						<div style={{ flex: 1, minWidth: 0 }}>
							<div className={s.personName}>{user.email}</div>
							<div className={s.personRole}>{t.common.viewerReadOnly}</div>
						</div>
						<button
							className="btn btn-danger-outline btn-sm"
							style={{ fontSize: 13 }}
							disabled={writing}
							onClick={() => revoke(user)}
						>
							{d.revoke}
						</button>
					</div>
				))}
			</div>
			<div className="dialog-actions">
				<button className="btn btn-outline" onClick={onClose}>
					{t.common.done}
				</button>
			</div>
		</Dialog>
	);
};

export const DeleteTreeDialog = ({
	tree,
	onClose,
}: {
	tree: TreeSummary;
	onClose: () => void;
}) => {
	const router = useRouter();
	const toast = useToast();
	const t = useT();
	const d = t.treeDialogs;
	const [typed, setTyped] = useState("");
	const [busy, setBusy] = useState(false);

	const remove = async () => {
		setBusy(true);
		try {
			await pb.collection("ft_trees").delete(tree.id);
			toast(d.deleted(tree.name));
			router.refresh();
			onClose();
		} catch (err: any) {
			toast(getPocketbaseError(err), "error");
			setBusy(false);
		}
	};

	return (
		<ConfirmDialog
			title={d.deleteTitle(tree.name)}
			body={d.deleteBody(tree.people, tree.invited.length)}
			confirmLabel={d.deleteConfirm}
			cancelLabel={d.keep}
			onConfirm={remove}
			onClose={onClose}
			busy={busy}
			disabled={typed.trim() !== tree.name.trim()}
		>
			<label className="field">
				<span className="field-label">{d.typeName}</span>
				<input
					className="input"
					placeholder={tree.name}
					value={typed}
					onChange={(e) => setTyped(e.target.value)}
					autoFocus
				/>
			</label>
		</ConfirmDialog>
	);
};
