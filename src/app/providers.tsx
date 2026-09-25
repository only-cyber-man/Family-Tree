"use client";

import { ToastProvider } from "@/components/Toast";
import type { Locale, ThemePref } from "@/i18n/config";
import { PreferencesProvider } from "@/i18n/client";
import { TreeProvider } from "@/lib/hooks/useTree";

export function Providers({
	locale,
	theme,
	children,
}: {
	locale: Locale;
	theme: ThemePref;
	children: React.ReactNode;
}) {
	return (
		<PreferencesProvider locale={locale} theme={theme}>
			<ToastProvider>
				<TreeProvider>{children}</TreeProvider>
			</ToastProvider>
		</PreferencesProvider>
	);
}
