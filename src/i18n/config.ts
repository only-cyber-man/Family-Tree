export type Locale = "en" | "pl" | "es" | "fr" | "de" | "pt" | "af" | "hi";
export type ThemePref = "light" | "dark" | "system";
export type Gender = "male" | "female";

/** In the order they are offered. */
export const LOCALES: Locale[] = ["en", "pl", "es", "fr", "de", "pt", "af", "hi"];
export const THEMES: ThemePref[] = ["light", "dark", "system"];

/** Language names are written in their own language. */
export const LOCALE_NAMES: Record<Locale, string> = {
	en: "English",
	pl: "Polski",
	es: "Español",
	fr: "Français",
	de: "Deutsch",
	pt: "Português (Brasil)",
	af: "Afrikaans",
	hi: "हिन्दी",
};

export const LANG_COOKIE = "ft_lang";
export const THEME_COOKIE = "ft_theme";
/** One year; preferences are not sensitive. */
export const PREF_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Browser chrome colours (tokens.json → bg), used for <meta name="theme-color">. */
export const THEME_COLORS = { light: "#F5F0E6", dark: "#121714" } as const;

export const isLocale = (value?: string | null): value is Locale =>
	(LOCALES as string[]).includes(value ?? "");

export const parseTheme = (value?: string | null): ThemePref =>
	value === "light" || value === "dark" ? value : "system";

/**
 * Cookie first; otherwise the first Accept-Language entry the site has
 * (pt-BR counts as pt), else English.
 */
export const detectLocale = (cookie?: string | null, acceptLanguage?: string | null): Locale => {
	if (isLocale(cookie)) {
		return cookie;
	}
	for (const entry of (acceptLanguage ?? "").split(",")) {
		const code = entry.split(";")[0].trim().toLowerCase().split("-")[0];
		if (isLocale(code)) {
			return code;
		}
	}
	return "en";
};
