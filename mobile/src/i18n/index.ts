import { getLocales } from "expo-localization";
import { useSettings } from "../store/settings";
import { af } from "./af";
import { de } from "./de";
import { en, type Dict } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { hi } from "./hi";
import { pl } from "./pl";
import { pt } from "./pt";

export type { Dict, KinGender, KinTerm, KinWord, StepMove, TypeText } from "./en";
export type Lang = "en" | "pl" | "es" | "fr" | "de" | "pt" | "af" | "hi";
export type LanguagePreference = "system" | Lang;

/** In the order they are offered. */
export const LANGS: Lang[] = ["en", "pl", "es", "fr", "de", "pt", "af", "hi"];

/** Language names are shown in their own language on purpose. */
export const LANGUAGE_NAMES: Record<Lang, string> = {
	en: "English",
	pl: "Polski",
	es: "Español",
	fr: "Français",
	de: "Deutsch",
	pt: "Português (Brasil)",
	af: "Afrikaans",
	hi: "हिन्दी",
};

export const dictionaries: Record<Lang, Dict> = { en, pl, es, fr, de, pt, af, hi };

export function isLang(code?: string | null): code is Lang {
	return !!code && (LANGS as string[]).includes(code);
}

/** The first of the device's languages the app has, else English. */
export function deviceLang(): Lang {
	try {
		for (const locale of getLocales()) {
			const code = locale.languageCode?.toLowerCase();
			if (isLang(code)) return code;
		}
		return "en";
	} catch {
		return "en";
	}
}

export function resolveLang(pref: LanguagePreference, device: Lang = deviceLang()): Lang {
	return pref === "system" ? device : pref;
}

/** Current dictionary, for code outside React (stores, services). */
export function getT(): Dict {
	return dictionaries[resolveLang(useSettings.getState().language)];
}

/** Current dictionary; re-renders when the language setting changes. */
export function useT(): Dict {
	const pref = useSettings((s) => s.language);
	return dictionaries[resolveLang(pref)];
}

export { en, pl };
