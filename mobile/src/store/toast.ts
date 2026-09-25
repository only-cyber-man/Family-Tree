import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export interface Toast {
	id: number;
	message: string;
	tone: ToastTone;
	action?: { label: string; onPress: () => void };
	/** ms; defaults to 4 s, 6 s with an action. */
	duration: number;
}

interface ToastState {
	current: Toast | null;
	show: (t: Omit<Toast, "id" | "duration"> & { duration?: number }) => void;
	dismiss: (id?: number) => void;
}

let nextId = 1;

/** One toast at a time; a new one replaces the current. */
export const useToast = create<ToastState>()((set, get) => ({
	current: null,
	show: (t) => set({ current: { ...t, id: nextId++, duration: t.duration ?? (t.action ? 6000 : 4000) } }),
	dismiss: (id) => {
		if (id === undefined || get().current?.id === id) set({ current: null });
	},
}));

export const toast = (message: string, tone: ToastTone = "info", action?: Toast["action"], duration?: number) =>
	useToast.getState().show({ message, tone, action, duration });
