"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
	LANG_COOKIE,
	PREF_COOKIE_MAX_AGE,
	THEME_COLORS,
	THEME_COOKIE,
	type Locale,
	type ThemePref,
} from "./config";
import { getDict, type Dict } from "./index";

interface Preferences {
	locale: Locale;
	theme: ThemePref;
	t: Dict;
	setLocale: (locale: Locale) => void;
	setTheme: (theme: ThemePref) => void;
}

const PreferencesContext = createContext<Preferences | null>(null);

const writeCookie = (name: string, value: string) => {
	document.cookie = `${name}=${value}; path=/; max-age=${PREF_COOKIE_MAX_AGE}; samesite=lax`;
};

/**
 * Applies a theme to the open page. The server renders the same state from the
 * ft_theme cookie, so reloads do not flash.
 */
const applyTheme = (theme: ThemePref) => {
	const root = document.documentElement;
	if (theme === "system") {
		root.removeAttribute("data-theme");
	} else {
		root.setAttribute("data-theme", theme);
	}
	const metas = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'));
	if (theme === "system" && metas.length >= 2) {
		metas[0].media = "(prefers-color-scheme: light)";
		metas[0].content = THEME_COLORS.light;
		metas[1].media = "(prefers-color-scheme: dark)";
		metas[1].content = THEME_COLORS.dark;
	} else {
		const dark =
			theme === "dark" ||
			(theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
		metas.forEach((meta) => {
			meta.removeAttribute("media");
			meta.content = dark ? THEME_COLORS.dark : THEME_COLORS.light;
		});
	}
	document
		.querySelector('meta[name="color-scheme"]')
		?.setAttribute("content", theme === "system" ? "light dark" : theme);
};

export const PreferencesProvider = ({
	locale: serverLocale,
	theme: serverTheme,
	children,
}: {
	locale: Locale;
	theme: ThemePref;
	children: React.ReactNode;
}) => {
	const router = useRouter();
	const [locale, setLocaleState] = useState(serverLocale);
	const [theme, setThemeState] = useState(serverTheme);

	// A refresh re-renders the layout with the cookie values; follow them.
	useEffect(() => setLocaleState(serverLocale), [serverLocale]);
	useEffect(() => setThemeState(serverTheme), [serverTheme]);

	const setLocale = useCallback(
		(next: Locale) => {
			writeCookie(LANG_COOKIE, next);
			document.documentElement.lang = next;
			setLocaleState(next);
			// Server components (pages, metadata) render the new language.
			router.refresh();
		},
		[router]
	);

	const setTheme = useCallback((next: ThemePref) => {
		writeCookie(THEME_COOKIE, next);
		applyTheme(next);
		setThemeState(next);
	}, []);

	const value = useMemo(
		() => ({ locale, theme, t: getDict(locale), setLocale, setTheme }),
		[locale, theme, setLocale, setTheme]
	);

	return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => {
	const value = useContext(PreferencesContext);
	if (!value) {
		throw new Error("usePreferences must be used within a PreferencesProvider");
	}
	return value;
};

/** The dictionary for the current UI language. */
export const useT = () => usePreferences().t;
