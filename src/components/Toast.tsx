"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { CloseIcon } from "./Icons";
import { useT } from "@/i18n/client";

type ToastKind = "success" | "error";

interface ToastAction {
	label: string;
	fn: () => void;
}

interface ToastItem {
	id: number;
	text: string;
	kind: ToastKind;
	action?: ToastAction;
}

type ShowToast = (text: string, kind?: ToastKind, action?: ToastAction) => void;

const ToastContext = createContext<ShowToast | null>(null);

const TOAST_MS = 5000;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
	const t = useT();
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const nextId = useRef(1);
	const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

	const dismiss = useCallback((id: number) => {
		setToasts((all) => all.filter((t) => t.id !== id));
		const timer = timers.current.get(id);
		if (timer) {
			clearTimeout(timer);
			timers.current.delete(id);
		}
	}, []);

	const show = useCallback<ShowToast>(
		(text, kind = "success", action) => {
			const id = nextId.current++;
			setToasts((all) => [...all, { id, text, kind, action }]);
			timers.current.set(
				id,
				setTimeout(() => dismiss(id), TOAST_MS)
			);
		},
		[dismiss]
	);

	useEffect(() => {
		const pending = timers.current;
		return () => pending.forEach((timer) => clearTimeout(timer));
	}, []);

	return (
		<ToastContext.Provider value={show}>
			{children}
			<div className="toasts">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className="toast"
						role={toast.kind === "error" ? "alert" : "status"}
					>
						<span
							className={`toast-dot ${toast.kind === "error" ? "is-error" : ""}`}
						/>
						<span style={{ flex: 1, whiteSpace: "pre-line" }}>{toast.text}</span>
						{toast.action ? (
							<button
								className="toast-action"
								onClick={() => {
									toast.action?.fn();
									dismiss(toast.id);
								}}
							>
								{toast.action.label}
							</button>
						) : null}
						<button
							className="toast-close"
							aria-label={t.common.dismiss}
							onClick={() => dismiss(toast.id)}
						>
							<CloseIcon size={12} />
						</button>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const show = useContext(ToastContext);
	if (!show) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return show;
};
