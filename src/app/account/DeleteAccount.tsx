"use client";

import { useState } from "react";
import { deleteOwnAccount, deletionRequestMailto } from "@/lib/account";
import { getPocketbaseError } from "@/lib";
import { ConfirmDialog } from "@/components/Dialog";
import { AlertIcon } from "@/components/Icons";
import { useT } from "@/i18n/client";

export const DeleteAccount = ({ email }: { email: string }) => {
	const t = useT();
	const a = t.account;
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
						{a.failedBefore(error)}
						<a href={deletionRequestMailto(t, email)} style={{ color: "inherit", fontWeight: 700 }}>
							{a.failedLink}
						</a>
						{a.failedAfter}
					</span>
				</div>
			) : null}
			<div>
				<button className="btn btn-danger" onClick={() => setOpen(true)}>
					{a.deleteButton}
				</button>
			</div>
			{open ? (
				<ConfirmDialog
					title={a.confirmTitle}
					body={a.confirmBody}
					confirmLabel={a.confirmLabel}
					cancelLabel={a.keep}
					busy={busy}
					disabled={!a.confirmWords.includes(typed.trim().toLowerCase())}
					onConfirm={remove}
					onClose={() => {
						setOpen(false);
						setTyped("");
					}}
				>
					<label className="field">
						<span className="field-label">{a.typeToConfirm}</span>
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
