import { compareDates, fromJsDate, toJsDate } from "./dates";
import type { CalendarDate } from "./types";

// Android's date dialog runs on java.util.GregorianCalendar, which labels the
// days before 15 October 1582 in the Julian calendar, while a JS Date is
// proleptic Gregorian. Both describe the same instant, so a day picked in the
// dialog would arrive in JS under a label up to 13 days away ("1 March 1500"
// becomes 11 March 1500). The app stores dates as they were written, so the
// label the person saw is the label that must be saved: these functions
// convert between the two calendars for the same day. iOS (Foundation) and the
// browsers are proleptic Gregorian and need nothing.

/** The first day the Android dialog labels in the Gregorian calendar. */
export const GREGORIAN_START: CalendarDate = { year: 1582, month: 10, day: 15 };

const div = (a: number, b: number) => Math.floor(a / b);

/** Julian Day Number of a proleptic Gregorian day. */
export function gregorianToJdn(d: CalendarDate): number {
	const a = div(14 - d.month, 12);
	const y = d.year + 4800 - a;
	const m = d.month + 12 * a - 3;
	return d.day + div(153 * m + 2, 5) + 365 * y + div(y, 4) - div(y, 100) + div(y, 400) - 32045;
}

/** Julian Day Number of a Julian-calendar day. */
export function julianToJdn(d: CalendarDate): number {
	const a = div(14 - d.month, 12);
	const y = d.year + 4800 - a;
	const m = d.month + 12 * a - 3;
	return d.day + div(153 * m + 2, 5) + 365 * y + div(y, 4) - 32083;
}

// Richards' algorithm (Explanatory Supplement to the Astronomical Almanac).
function fromJdn(f: number): CalendarDate {
	const e = 4 * f + 3;
	const g = div(e % 1461, 4);
	const h = 5 * g + 2;
	const day = div(h % 153, 5) + 1;
	const month = ((div(h, 153) + 2) % 12) + 1;
	const year = div(e, 1461) - 4716 + div(14 - month, 12);
	return { year, month, day };
}

export function jdnToGregorian(jdn: number): CalendarDate {
	return fromJdn(jdn + 1401 + div(div(4 * jdn + 274277, 146097) * 3, 4) - 38);
}

export function jdnToJulian(jdn: number): CalendarDate {
	return fromJdn(jdn + 1401);
}

export function julianToGregorian(d: CalendarDate): CalendarDate {
	return jdnToGregorian(julianToJdn(d));
}

export function gregorianToJulian(d: CalendarDate): CalendarDate {
	return jdnToJulian(gregorianToJdn(d));
}

/**
 * The Date to hand the Android dialog so that it displays `label`. Noon, so
 * the zone offsets Java and JS assume for old dates (they differ by minutes)
 * cannot move it to another day.
 */
export function toAndroidPickerDate(label: CalendarDate): Date {
	const day = compareDates(label, GREGORIAN_START) < 0 ? julianToGregorian(label) : label;
	return toJsDate(day, 12);
}

/** The label the Android dialog displayed for the Date it returned. */
export function fromAndroidPickerDate(d: Date): CalendarDate {
	const day = fromJsDate(d);
	return compareDates(day, GREGORIAN_START) < 0 ? gregorianToJulian(day) : day;
}
