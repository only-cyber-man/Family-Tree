// Plural categories. Intl.PluralRules is used when the JS engine has it;
// Hermes' Intl coverage differs by platform/version, so the CLDR rules for
// the two supported languages are also implemented directly (and tested to
// agree with Intl where it exists).

export type PluralCategory = "one" | "few" | "many" | "other";

function manual(lang: "en" | "pl", n: number): PluralCategory {
	if (lang === "en") return n === 1 ? "one" : "other";
	if (!Number.isInteger(n)) return "other";
	if (n === 1) return "one";
	const m10 = n % 10;
	const m100 = n % 100;
	if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return "few";
	return "many";
}

const cache: Partial<Record<string, Intl.PluralRules | null>> = {};

export function pluralCategory(lang: "en" | "pl", n: number): PluralCategory {
	const locale = lang === "pl" ? "pl-PL" : "en-GB";
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

/** Polish noun form for n: one (1 rok), few (2 lata), many (5 lat). */
export function plForm(n: number, one: string, few: string, many: string): string {
	const c = pluralCategory("pl", n);
	return c === "one" ? one : c === "few" ? few : many;
}

export function enForm(n: number, one: string, other: string): string {
	return pluralCategory("en", n) === "one" ? one : other;
}
