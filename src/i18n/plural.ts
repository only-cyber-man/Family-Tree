import type { Locale } from "./config";

export interface PluralForms {
	one: string;
	/** Polish 2–4, 22–24, … */
	few?: string;
	/** Polish 0, 5–21, 25–31, … */
	many?: string;
	other: string;
}

const rules: Partial<Record<Locale, Intl.PluralRules>> = {};

/** Picks the form for n with Intl.PluralRules (one / few / many / other). */
export const plural = (locale: Locale, n: number, forms: PluralForms) => {
	const r = (rules[locale] ??= new Intl.PluralRules(locale === "pl" ? "pl-PL" : "en-GB"));
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
