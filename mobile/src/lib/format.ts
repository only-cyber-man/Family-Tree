import { ageInfo } from "./dates";
import type { CalendarDate, Person } from "./types";

/** "Anna Wiśniewska" -> "AW", "tomek" -> "T". */
export function initials(name: string): string {
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return "?";
	const first = Array.from(words[0])[0] ?? "";
	if (words.length === 1) return first.toUpperCase();
	const last = Array.from(words[words.length - 1])[0] ?? "";
	return (first + last).toUpperCase();
}

export function firstName(name: string): string {
	return name.trim().split(/\s+/)[0] ?? name;
}

/** "1948 · 78" for the living, "1921 – †1998" for the deceased. */
export function yearsLabel(p: Pick<Person, "birth" | "death">, today: CalendarDate): string {
	if (!p.birth) return p.death ? `† ${p.death.year}` : "";
	if (p.death) return `${p.birth.year} – †${p.death.year}`;
	const info = ageInfo(p.birth, null, today);
	return info ? `${p.birth.year} · ${info.age}` : String(p.birth.year);
}

/** "just now", "yesterday", "2 days ago", "3 weeks ago", "5 months ago", "2 years ago". */
export function relativeTime(iso: string, now: Date = new Date()): string {
	const t = Date.parse(iso.replace(" ", "T"));
	if (Number.isNaN(t)) return "";
	const diff = Math.max(0, now.getTime() - t);
	const min = 60_000;
	const hour = 60 * min;
	const day = 24 * hour;
	if (diff < min) return "just now";
	if (diff < hour) return plural(Math.floor(diff / min), "minute") + " ago";
	if (diff < day) return plural(Math.floor(diff / hour), "hour") + " ago";
	const days = Math.floor(diff / day);
	if (days === 1) return "yesterday";
	if (days < 7) return `${days} days ago`;
	if (days < 30) return plural(Math.floor(days / 7), "week") + " ago";
	if (days < 365) return plural(Math.floor(days / 30), "month") + " ago";
	return plural(Math.floor(days / 365), "year") + " ago";
}

export function plural(n: number, word: string, pluralWord = word + "s"): string {
	return `${n} ${n === 1 ? word : pluralWord}`;
}

/** "in 8 days", "tomorrow", "today" */
export function inDays(n: number): string {
	if (n <= 0) return "today";
	if (n === 1) return "tomorrow";
	return `in ${n} days`;
}

export function capitalize(s: string): string {
	return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
