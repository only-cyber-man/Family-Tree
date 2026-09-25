import type { Dict } from "@/i18n";

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	["year", 365 * 24 * 3600],
	["month", 30 * 24 * 3600],
	["week", 7 * 24 * 3600],
	["day", 24 * 3600],
	["hour", 3600],
	["minute", 60],
];

/** "2 days ago", "yesterday", "just now" (or "2 dni temu", "wczoraj", "przed chwilą"). */
export const timeAgo = (iso: string, t: Dict, now = Date.now()) => {
	const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
	const format = new Intl.RelativeTimeFormat(t.locale, { numeric: "auto" });
	for (const [unit, size] of UNITS) {
		if (Math.abs(seconds) >= size) {
			return format.format(Math.round(seconds / size), unit);
		}
	}
	return t.common.justNow;
};
