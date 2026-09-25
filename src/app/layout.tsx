import type { Metadata, Viewport } from "next";
import { Literata, Manrope } from "next/font/google";
import { THEME_COLORS } from "@/i18n/config";
import { getLocale, getT, getTheme } from "@/i18n/server";
import { Providers } from "./providers";
import "./globals.css";

const literata = Literata({
	subsets: ["latin", "latin-ext"],
	weight: ["400", "600"],
	style: ["normal", "italic"],
	variable: "--font-literata",
	display: "swap",
});

const manrope = Manrope({
	subsets: ["latin", "latin-ext"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-manrope",
	display: "swap",
});

export function generateMetadata(): Metadata {
	const t = getT();
	return {
		title: {
			default: t.common.appName,
			template: `%s · ${t.common.appName}`,
		},
		description: t.meta.description,
	};
}

/** Browser chrome follows the chosen theme, or the system one. */
export function generateViewport(): Viewport {
	const theme = getTheme();
	if (theme !== "system") {
		return { themeColor: THEME_COLORS[theme], colorScheme: theme };
	}
	return {
		themeColor: [
			{ media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
			{ media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
		],
		colorScheme: "light dark",
	};
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const locale = getLocale();
	const theme = getTheme();
	return (
		<html
			lang={locale}
			data-theme={theme === "system" ? undefined : theme}
			className={`${literata.variable} ${manrope.variable}`}
		>
			<body>
				<Providers locale={locale} theme={theme}>
					{children}
				</Providers>
			</body>
		</html>
	);
}
