import type { Lang } from "./index";

// Plural categories. Intl.PluralRules is used when the JS engine has it;
// Hermes' Intl coverage differs by platform/version, so the CLDR cardinal
// rules for every supported language are also implemented directly (and
// tested to agree with Intl where it exists).

export type PluralCategory = "one" | "few" | "many" | "other";

/** BCP 47 tag whose CLDR plural rules each language uses. */
export const PLURAL_LOCALE: Record<Lang, string> = {
	en: "en-GB",
	pl: "pl-PL",
	es: "es-ES",
	fr: "fr-FR",
	de: "de-DE",
	pt: "pt-BR",
	af: "af-ZA",
	hi: "hi-IN",
};

function manual(lang: Lang, n: number): PluralCategory {
	const i = Math.trunc(Math.abs(n));
	switch (lang) {
		case "pl": {
			if (!Number.isInteger(n)) return "other";
			if (n === 1) return "one";
			const m10 = i % 10;
			const m100 = i % 100;
			if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return "few";
			return "many";
		}
		case "fr":
		case "pt":
			// Integer part 0 or 1 is singular: "0 pessoa", "1,5 heure".
			return i <= 1 ? "one" : "other";
		case "hi":
			// 0 and 1 are singular.
			return i === 0 || n === 1 ? "one" : "other";
		default:
			// en, es, de, af: exactly one.
			return n === 1 ? "one" : "other";
	}
}

const cache: Partial<Record<string, Intl.PluralRules | null>> = {};

export function pluralCategory(lang: Lang, n: number): PluralCategory {
	const locale = PLURAL_LOCALE[lang];
	if (cache[locale] === undefined) {
		try {
			cache[locale] = typeof Intl !== "undefined" && "PluralRules" in Intl ? new Intl.PluralRules(locale) : null;
		} catch {
			cache[locale] = null;
		}
	}
	const rules = cache[locale];
	if (rules) {
		const c = rules.select(n) as PluralCategory;
		if (c === "one" || c === "few" || c === "many" || c === "other") return c;
	}
	return manual(lang, n);
}

export const manualPluralCategory = manual;

/** Noun form for n in a language with singular and plural only: form("de", 3, "Jahr", "Jahre"). */
export function form(lang: Lang, n: number, one: string, other: string): string {
	return pluralCategory(lang, n) === "one" ? one : other;
}

/** Polish noun form for n: one (1 rok), few (2 lata), many (5 lat). */
export function plForm(n: number, one: string, few: string, many: string): string {
	const c = pluralCategory("pl", n);
	return c === "one" ? one : c === "few" ? few : many;
}

export function enForm(n: number, one: string, other: string): string {
	return form("en", n, one, other);
}
