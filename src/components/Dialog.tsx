"use client";

import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, TrashIcon } from "./Icons";

interface DialogProps {
	title?: ReactNode;
	subtitle?: ReactNode;
	onClose: () => void;
	children?: ReactNode;
	width?: number;
	role?: "dialog" | "alertdialog";
	placement?: "center" | "top";
	/** Hides the header row entirely (for dialogs that draw their own). */
	bare?: boolean;
	className?: string;
}

export const Dialog = ({
	title,
	subtitle,
	onClose,
	children,
	width = 440,
	role = "dialog",
	placement = "center",
	bare = false,
	className = "",
}: DialogProps) => {
	const panel = useRef<HTMLDivElement>(null);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;
	// Captured during the first render, before autoFocus moves focus inside.
	const returnFocus = useRef(
		typeof document === "undefined" ? null : (document.activeElement as HTMLElement | null)
	);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			// Inner widgets (a combobox list) claim Escape with preventDefault.
			if (e.key === "Escape" && !e.defaultPrevented) {
				onCloseRef.current();
			} else if (e.key === "Tab" && panel.current) {
				// Keep focus inside the dialog.
				const focusable = Array.from(
					panel.current.querySelectorAll<HTMLElement>(
						"button:not([disabled]), input:not([disabled]):not([hidden]), select, textarea, a[href], [tabindex]:not([tabindex='-1'])"
					)
				).filter((el) => el.offsetParent !== null);
				if (focusable.length === 0) {
					return;
				}
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				const active = document.activeElement;
				if (e.shiftKey && (active === first || !panel.current.contains(active))) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && (active === last || !panel.current.contains(active))) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener("keydown", onKey);
		const previous = returnFocus.current;
		// React has already applied autoFocus by now; only fall back when it did not.
		if (!panel.current?.contains(document.activeElement)) {
			panel.current
				?.querySelector<HTMLElement>("input, select, textarea, button:not([aria-label='Close'])")
				?.focus();
		}
		return () => {
			document.removeEventListener("keydown", onKey);
			// The opener may be gone (e.g. the panel of a person just deleted);
			// then the caller decides where focus goes.
			if (previous?.isConnected) {
				previous.focus();
			}
		};
	}, []);

	return createPortal(
		<div
			className={`dialog-backdrop ${placement === "top" ? "is-top" : ""}`}
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			<div
				ref={panel}
				role={role}
				aria-modal="true"
				aria-label={typeof title === "string" ? title : undefined}
				className={`dialog ${className}`}
				style={{ width }}
			>
				{bare ? null : (
					<div className="dialog-head">
						<div style={{ flex: 1, minWidth: 0 }}>
							{title ? <h2 className="dialog-title">{title}</h2> : null}
							{subtitle ? <p className="dialog-sub">{subtitle}</p> : null}
						</div>
						<button className="icon-btn" aria-label="Close" onClick={onClose}>
							<CloseIcon />
						</button>
					</div>
				)}
				{children}
			</div>
		</div>,
		document.body
	);
};

interface ConfirmDialogProps {
	title: string;
	body: ReactNode;
	confirmLabel: string;
	cancelLabel?: string;
	onConfirm: () => void | Promise<void>;
	onClose: () => void;
	busy?: boolean;
	disabled?: boolean;
	children?: ReactNode;
}

/** Destructive confirmation with the danger icon tile. */
export const ConfirmDialog = ({
	title,
	body,
	confirmLabel,
	cancelLabel = "Cancel",
	onConfirm,
	onClose,
	busy = false,
	disabled = false,
	children,
}: ConfirmDialogProps) => (
	<Dialog onClose={onClose} role="alertdialog" bare title={title}>
		<div className="dialog-icon">
			<TrashIcon size={22} />
		</div>
		<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
			<h2 className="dialog-title">{title}</h2>
			<p className="dialog-sub" style={{ fontSize: 15 }}>
				{body}
			</p>
		</div>
		{children}
		<div className="dialog-actions">
			<button className="btn btn-outline" onClick={onClose}>
				{cancelLabel}
			</button>
			<button
				className="btn btn-danger"
				disabled={busy || disabled}
				onClick={() => onConfirm()}
			>
				{busy ? <span className="spinner" /> : null}
				{confirmLabel}
			</button>
		</div>
	</Dialog>
);
