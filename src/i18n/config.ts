export type Locale = "en" | "pl";
export type ThemePref = "light" | "dark" | "system";
export type Gender = "male" | "female";

export const LOCALES: Locale[] = ["en", "pl"];
export const THEMES: ThemePref[] = ["light", "dark", "system"];

export const LANG_COOKIE = "ft_lang";
export const THEME_COOKIE = "ft_theme";
/** One year; preferences are not sensitive. */
export const PREF_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Browser chrome colours (tokens.json → bg), used for <meta name="theme-color">. */
export const THEME_COLORS = { light: "#F5F0E6", dark: "#121714" } as const;

export const isLocale = (value?: string | null): value is Locale =>
	value === "en" || value === "pl";

export const parseTheme = (value?: string | null): ThemePref =>
	value === "light" || value === "dark" ? value : "system";

/** Cookie first; otherwise Polish when the browser's first language is Polish. */
export const detectLocale = (cookie?: string | null, acceptLanguage?: string | null): Locale => {
	if (isLocale(cookie)) {
		return cookie;
	}
	return (acceptLanguage ?? "").trim().toLowerCase().startsWith("pl") ? "pl" : "en";
};
