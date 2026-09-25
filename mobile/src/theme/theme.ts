import { Platform, type ViewStyle } from "react-native";
import { tokens } from "./tokens";

export type Scheme = "light" | "dark";
export type ThemePreference = "system" | Scheme;

type Palette = { -readonly [K in keyof (typeof tokens.color)["light"]]: string };

export interface Theme {
	scheme: Scheme;
	c: Palette & {
		skeleton: string;
		focusGlow: string;
		placeholder: string;
		/** Relationship group colours. */
		bio: string;
		inlaw: string;
		church: string;
		other: string;
		/** Text on gender-coloured avatars. */
		onAvatar: string;
		canvasBg: string;
		band: string;
		bandLabel: string;
		grid: string;
		labelBg: string;
		/** Pressed overlay on neutral surfaces (12% ink). */
		pressed: string;
		ripple: string;
	};
	node: {
		male: { fill: string; border: string; text: string; hoverFill: string; selectedBorder: string };
		female: { fill: string; border: string; text: string; hoverFill: string; selectedBorder: string };
	};
	shadow: (level: "sm" | "md" | "lg") => ViewStyle;
}

function hexToRgba(hex: string, alpha: number): string {
	const h = hex.replace("#", "");
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}

function build(scheme: Scheme): Theme {
	const base = tokens.color[scheme];
	const extra = tokens.extra[scheme];
	const canvas = tokens.canvas[scheme];
	return {
		scheme,
		c: {
			...base,
			...extra,
			bio: tokens.relationship.BIOLOGICAL[scheme],
			inlaw: tokens.relationship["IN-LAW"][scheme],
			church: tokens.relationship.CHURCH[scheme],
			other: tokens.relationship.IRRELEVANT[scheme],
			onAvatar: scheme === "light" ? tokens.color.light.bg : tokens.color.dark.bg,
			canvasBg: canvas.bg,
			band: canvas.band,
			bandLabel: canvas.bandLabel,
			grid: canvas.grid,
			labelBg: base.surface,
			pressed: hexToRgba(base.ink, 0.12),
			ripple: hexToRgba(base.ink, 0.12),
		},
		node: { male: { ...tokens.node.male[scheme] }, female: { ...tokens.node.female[scheme] } },
		shadow: (level) => {
			const s = tokens.shadow[level];
			if (Platform.OS === "android") return { elevation: s.androidElevation };
			return {
				shadowColor: scheme === "dark" ? "#000000" : s.ios.shadowColor,
				shadowOpacity: scheme === "dark" ? Math.min(0.6, s.ios.shadowOpacity * 3.5) : s.ios.shadowOpacity,
				shadowRadius: s.ios.shadowRadius,
				shadowOffset: { ...s.ios.shadowOffset },
			};
		},
	};
}

export const themes: Record<Scheme, Theme> = { light: build("light"), dark: build("dark") };

export const space = tokens.space;
export const radius = tokens.radius;
export const fontSize = tokens.font.size;
export const motion = tokens.mobile.motion;
export const TAB_BAR_HEIGHT = tokens.mobile.tabBarHeight;
export const MIN_TOUCH = tokens.mobile.minTouch;

/** Font family per weight: custom fonts ignore fontWeight on Android. */
export const fonts = {
	heading: { 400: "Literata_400Regular", 600: "Literata_600SemiBold", italic: "Literata_400Regular_Italic" },
	body: { 400: "Manrope_400Regular", 500: "Manrope_500Medium", 600: "Manrope_600SemiBold", 700: "Manrope_700Bold" },
} as const;

export type BodyWeight = keyof typeof fonts.body;
