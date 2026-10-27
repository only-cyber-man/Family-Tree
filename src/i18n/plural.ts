import type { Locale } from "./config";

export interface PluralForms {
	one: string;
	/** Polish 2–4, 22–24, … */
	few?: string;
	/** Polish 0, 5–21, 25–31, … */
	many?: string;
	other: string;
}

/** BCP 47 tag whose CLDR plural rules each language uses. */
const LOCALE_TAGS: Record<Locale, string> = {
	en: "en-GB",
	pl: "pl-PL",
	es: "es-ES",
	fr: "fr-FR",
	de: "de-DE",
	pt: "pt-BR",
	af: "af-ZA",
	hi: "hi-IN",
};

const rules: Partial<Record<Locale, Intl.PluralRules>> = {};

/** Picks the form for n with Intl.PluralRules (one / few / many / other). */
export const plural = (locale: Locale, n: number, forms: PluralForms) => {
	const r = (rules[locale] ??= new Intl.PluralRules(LOCALE_TAGS[locale]));
	const category = r.select(n);
	if (category === "one") {
		return forms.one;
	}
	if (category === "few") {
		return forms.few ?? forms.other;
	}
	if (category === "many") {
		return forms.many ?? forms.other;
	}
	return forms.other;
};

/** English noun: "1 person", "3 people". */
export const en = (n: number, one: string, other: string) =>
	`${n} ${plural("en", n, { one, other })}`;

/** Polish noun: "1 osoba", "3 osoby", "5 osób". */
export const pl = (n: number, one: string, few: string, many: string) =>
	`${n} ${plural("pl", n, { one, few, many, other: many })}`;

/** Noun in a language with singular and plural only: simple("de", 3, "Person", "Personen"). */
export const simple = (locale: Locale, n: number, one: string, other: string) =>
	`${n} ${plural(locale, n, { one, other })}`;
