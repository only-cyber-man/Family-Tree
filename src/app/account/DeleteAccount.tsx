"use client";

import { useState } from "react";
import { deleteOwnAccount, deletionRequestMailto } from "@/lib/account";
import { getPocketbaseError } from "@/lib";
import { ConfirmDialog } from "@/components/Dialog";
import { AlertIcon } from "@/components/Icons";

export const DeleteAccount = ({ email }: { email: string }) => {
	const [open, setOpen] = useState(false);
	const [typed, setTyped] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const remove = async () => {
		setBusy(true);
		setError(null);
		try {
			await deleteOwnAccount();
			window.location.href = "/?deleted=1";
		} catch (err: any) {
			setError(getPocketbaseError(err));
			setBusy(false);
			setOpen(false);
		}
	};

	return (
		<>
			{error ? (
				<div className="alert" role="alert">
					<AlertIcon />
					<span>
						Your account could not be deleted here ({error}).{" "}
						<a href={deletionRequestMailto(email)} style={{ color: "inherit", fontWeight: 700 }}>
							Email a deletion request
						</a>{" "}
						instead and it will be done within 30 days.
					</span>
				</div>
			) : null}
			<div>
				<button className="btn btn-danger" onClick={() => setOpen(true)}>
					Delete account…
				</button>
			</div>
			{open ? (
				<ConfirmDialog
					title="Delete your account?"
					body="This deletes your account and every tree you created, with all the people, photos and relationships in them. People you invited lose access. There is no undo."
					confirmLabel="Delete everything"
					cancelLabel="Keep my account"
					busy={busy}
					disabled={typed.trim().toLowerCase() !== "delete"}
					onConfirm={remove}
					onClose={() => {
						setOpen(false);
						setTyped("");
					}}
				>
					<label className="field">
						<span className="field-label">Type DELETE to confirm</span>
						<input
							className="input"
							value={typed}
							onChange={(e) => setTyped(e.target.value)}
							autoFocus
						/>
					</label>
				</ConfirmDialog>
			) : null}
		</>
	);
};
