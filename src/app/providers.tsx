"use client";

import { TreeProvider } from "@/lib/hooks/useTree";

export function Providers({ children }: { children: React.ReactNode }) {
	return <TreeProvider>{children}</TreeProvider>;
}
