import type { Metadata, Viewport } from "next";
import { Literata, Manrope } from "next/font/google";
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

export const metadata: Metadata = {
	title: {
		default: "Family Tree",
		template: "%s · Family Tree",
	},
	description:
		"A private family tree, drawn as a graph. Add the people you know, link how they are related, and see the generations line up by birth year.",
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#F5F0E6" },
		{ media: "(prefers-color-scheme: dark)", color: "#121714" },
	],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${literata.variable} ${manrope.variable}`}>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
