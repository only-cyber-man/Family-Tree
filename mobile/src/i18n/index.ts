import { getLocales } from "expo-localization";
import { useSettings } from "../store/settings";
import { en, type Dict } from "./en";
import { pl } from "./pl";

export type { Dict, KinGender, KinTerm, KinWord, StepMove, TypeText } from "./en";
export type Lang = "en" | "pl";
export type LanguagePreference = "system" | Lang;

export const dictionaries: Record<Lang, Dict> = { en, pl };

/** The device language if supported, else English. */
export function deviceLang(): Lang {
	try {
		const code = getLocales()[0]?.languageCode?.toLowerCase();
		return code === "pl" ? "pl" : "en";
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
