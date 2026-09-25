"use client";

import { ToastProvider } from "@/components/Toast";
import { TreeProvider } from "@/lib/hooks/useTree";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ToastProvider>
			<TreeProvider>{children}</TreeProvider>
		</ToastProvider>
	);
}
