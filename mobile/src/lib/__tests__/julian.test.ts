import { fromJsDate, toJsDate } from "../dates";
import { fromAndroidPickerDate, gregorianToJdn, gregorianToJulian, jdnToGregorian, jdnToJulian, julianToGregorian, julianToJdn, toAndroidPickerDate } from "../julian";

// Known pairs: the same day under both calendars.
const PAIRS: [julian: [number, number, number], gregorian: [number, number, number]][] = [
	[[1582, 10, 4], [1582, 10, 14]], // the last Julian day before the reform
	[[1582, 10, 5], [1582, 10, 15]], // the first Gregorian day
	[[1500, 3, 1], [1500, 3, 11]],
	[[1500, 2, 29], [1500, 3, 10]], // a Julian leap day that Gregorian skips
	[[1700, 2, 29], [1700, 3, 11]],
	[[1000, 1, 1], [1000, 1, 6]],
	[[1, 1, 3], [1, 1, 1]],
	[[1900, 1, 1], [1900, 1, 13]], // 12 days apart until the Julian leap day of 1900
	[[1900, 3, 1], [1900, 3, 14]], // 13 days from then on
	[[2026, 10, 10], [2026, 10, 23]],
];
const d = ([year, month, day]: [number, number, number]) => ({ year, month, day });

describe("julian", () => {
	it("agrees with the reform: JDN 2299161 is 15 October 1582 (Gregorian) and 5 October 1582 (Julian)", () => {
		expect(gregorianToJdn({ year: 1582, month: 10, day: 15 })).toBe(2299161);
		expect(julianToJdn({ year: 1582, month: 10, day: 5 })).toBe(2299161);
		expect(jdnToGregorian(2299161)).toEqual({ year: 1582, month: 10, day: 15 });
		expect(jdnToJulian(2299161)).toEqual({ year: 1582, month: 10, day: 5 });
		// Unix epoch.
		expect(gregorianToJdn({ year: 1970, month: 1, day: 1 })).toBe(2440588);
	});

	it("converts known days both ways", () => {
		for (const [j, g] of PAIRS) {
			expect(julianToGregorian(d(j))).toEqual(d(g));
			expect(gregorianToJulian(d(g))).toEqual(d(j));
		}
	});

	it("round-trips every day across 2,000 years", () => {
		let broken: number | null = null;
		for (let jdn = 1721426; jdn <= 2460000 && broken === null; jdn++) {
			if (gregorianToJdn(jdnToGregorian(jdn)) !== jdn || julianToJdn(jdnToJulian(jdn)) !== jdn) broken = jdn;
		}
		expect(broken).toBeNull();
	});

	it("gives the Android dialog a Date it labels like the stored day, and reads its answer back", () => {
		// Before the reform the dialog shows the Julian label of the instant it is given.
		const old = toAndroidPickerDate({ year: 1500, month: 3, day: 1 });
		expect(fromJsDate(old)).toEqual({ year: 1500, month: 3, day: 11 });
		expect(old.getHours()).toBe(12);
		expect(fromAndroidPickerDate(old)).toEqual({ year: 1500, month: 3, day: 1 });
		expect(fromAndroidPickerDate(toJsDate({ year: 1000, month: 1, day: 6 }, 12))).toEqual({ year: 1000, month: 1, day: 1 });
		expect(fromJsDate(toAndroidPickerDate({ year: 1, month: 1, day: 1 }))).toEqual({ year: 0, month: 12, day: 30 });
		// From the reform on, both calendars agree and nothing moves.
		for (const day of [
			{ year: 1582, month: 10, day: 15 },
			{ year: 1750, month: 6, day: 15 },
			{ year: 1899, month: 12, day: 31 },
			{ year: 2026, month: 10, day: 23 },
		]) {
			expect(fromJsDate(toAndroidPickerDate(day))).toEqual(day);
			expect(fromAndroidPickerDate(toJsDate(day, 12))).toEqual(day);
		}
	});
});
