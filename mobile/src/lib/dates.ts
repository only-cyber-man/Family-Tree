import { en, type Dict } from "../i18n/en";
import type { CalendarDate } from "./types";

// Dates in ft_nodes are calendar dates ("1950-02-04 00:00:00.000Z"). They are
// handled as plain year/month/day so a birthday never shifts by a timezone.
//
// Family trees reach centuries back, so dates have no floor beyond the
// calendar itself: 1 January of year 1. JS Date constructors read a two-digit
// year as 19xx, so every conversion below sets the year explicitly.

export const EARLIEST_DATE: CalendarDate = { year: 1, month: 1, day: 1 };

export const MONTHS = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December",
];
export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function parseDate(value?: string | null): CalendarDate | null {
	if (!value) return null;
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
	if (!m) return null;
	const year = Number(m[1]);
	const month = Number(m[2]);
	const day = Number(m[3]);
	if (month < 1 || month > 12 || day < 1 || day > 31) return null;
	return { year, month, day };
}

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

/** "YYYY-MM-DD", the format the web client sends to PocketBase. */
export function toISODate(d: CalendarDate): string {
	return `${pad(d.year, 4)}-${pad(d.month)}-${pad(d.day)}`;
}

export function fromJsDate(d: Date): CalendarDate {
	return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

/** Local-time Date at the given hour. */
export function toJsDate(d: CalendarDate, hour = 0, minute = 0): Date {
	const t = new Date(2000, 0, 1, hour, minute, 0, 0);
	t.setFullYear(d.year, d.month - 1, d.day);
	return t;
}

/** UTC midnight of a calendar day (plus `dayOffset` days), as a timestamp. */
function utcMs(d: CalendarDate, dayOffset = 0): number {
	const t = new Date(0);
	t.setUTCFullYear(d.year, d.month - 1, d.day + dayOffset);
	return t.getTime();
}

export function isLeapYear(y: number): boolean {
	return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
	return a.year - b.year || a.month - b.month || a.day - b.day;
}

export function clampDate(d: CalendarDate, min: CalendarDate, max: CalendarDate): CalendarDate {
	if (compareDates(d, min) < 0) return min;
	if (compareDates(d, max) > 0) return max;
	return d;
}

/** A typed year ("1742", "950") between min and max; null while incomplete or out of range. */
export function parseYear(text: string, min: number, max: number): number | null {
	const digits = text.trim();
	if (!/^\d{1,4}$/.test(digits)) return null;
	const year = Number(digits);
	return year >= min && year <= max ? year : null;
}

/** Days from a to b (b - a), independent of DST. */
export function daysBetween(a: CalendarDate, b: CalendarDate): number {
	return Math.round((utcMs(b) - utcMs(a)) / 86_400_000);
}

export function addDays(d: CalendarDate, n: number): CalendarDate {
	const t = new Date(utcMs(d, n));
	return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

export function dayOfWeek(d: CalendarDate): number {
	return new Date(utcMs(d)).getUTCDay();
}

/** The anniversary of d in the given year; 29 Feb falls on 28 Feb in common years. */
export function occurrenceInYear(d: CalendarDate, year: number): CalendarDate {
	if (d.month === 2 && d.day === 29 && !isLeapYear(year)) return { year, month: 2, day: 28 };
	return { year, month: d.month, day: d.day };
}

/** The next anniversary of d on or after today. */
export function nextOccurrence(d: CalendarDate, today: CalendarDate): CalendarDate {
	const thisYear = occurrenceInYear(d, today.year);
	return compareDates(thisYear, today) >= 0 ? thisYear : occurrenceInYear(d, today.year + 1);
}

/** Full years between birth and `on`. */
export function yearsBetween(from: CalendarDate, on: CalendarDate): number {
	let years = on.year - from.year;
	if (on.month < from.month || (on.month === from.month && on.day < from.day)) years -= 1;
	return years;
}

export interface AgeInfo {
	/** Age today, or age at death. */
	age: number;
	deceased: boolean;
	/** For the deceased: the age they would be today. */
	wouldBe?: number;
}

export function ageInfo(birth: CalendarDate | null, death: CalendarDate | null, today: CalendarDate): AgeInfo | null {
	if (!birth) return null;
	if (death) return { age: yearsBetween(birth, death), deceased: true, wouldBe: yearsBetween(birth, today) };
	return { age: yearsBetween(birth, today), deceased: false };
}

// Month / weekday names come from the dictionary (Polish needs the genitive
// inside a date: "4 lutego 1950"), not from Intl, whose data differs between
// Hermes builds.

/** "4 February 1950" / "4 lutego 1950" / "4. Februar 1950" */
export function formatLong(d: CalendarDate, L: Dict = en): string {
	return L.dateNames.dayMonthYear(d.day, L.dateNames.monthsInDate[d.month - 1], d.year);
}

/** "12 Mar 1921" / "12 mar 1921" */
export function formatShort(d: CalendarDate, L: Dict = en): string {
	return L.dateNames.dayMonthYear(d.day, L.dateNames.monthsShort[d.month - 1], d.year);
}

/** "15 Oct" / "15 paź" */
export function formatDayMonth(d: CalendarDate, L: Dict = en): string {
	return L.dateNames.dayMonth(d.day, L.dateNames.monthsShort[d.month - 1]);
}

export function todayDate(now: Date = new Date()): CalendarDate {
	return fromJsDate(now);
}
