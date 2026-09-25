import { addDays, ageInfo, daysBetween, formatLong, nextOccurrence, parseDate, toISODate, yearsBetween } from "../dates";
import { initials, relativeTime, yearsLabel } from "../format";

describe("dates", () => {
	it("parses PocketBase dates as calendar dates", () => {
		expect(parseDate("1950-02-04 00:00:00.000Z")).toEqual({ year: 1950, month: 2, day: 4 });
		expect(parseDate("1950-02-04")).toEqual({ year: 1950, month: 2, day: 4 });
		expect(parseDate("")).toBeNull();
		expect(parseDate(undefined)).toBeNull();
		expect(parseDate("nonsense")).toBeNull();
	});

	it("formats back to the web's YYYY-MM-DD", () => {
		expect(toISODate({ year: 1950, month: 2, day: 4 })).toBe("1950-02-04");
		expect(formatLong({ year: 1950, month: 2, day: 4 })).toBe("4 February 1950");
	});

	it("computes ages like the web Node.age", () => {
		const today = { year: 2026, month: 9, day: 25 };
		expect(yearsBetween({ year: 1976, month: 5, day: 22 }, today)).toBe(50);
		expect(yearsBetween({ year: 1976, month: 9, day: 26 }, today)).toBe(49);
		expect(ageInfo({ year: 1921, month: 3, day: 12 }, { year: 1998, month: 10, day: 15 }, today)).toEqual({ age: 77, deceased: true, wouldBe: 105 });
	});

	it("handles leap-day anniversaries and year wrap", () => {
		expect(nextOccurrence({ year: 1960, month: 2, day: 29 }, { year: 2026, month: 1, day: 1 })).toEqual({ year: 2026, month: 2, day: 28 });
		expect(nextOccurrence({ year: 1960, month: 2, day: 29 }, { year: 2027, month: 3, day: 1 })).toEqual({ year: 2028, month: 2, day: 29 });
		expect(nextOccurrence({ year: 1990, month: 1, day: 5 }, { year: 2026, month: 9, day: 25 })).toEqual({ year: 2027, month: 1, day: 5 });
		expect(daysBetween({ year: 2026, month: 12, day: 31 }, { year: 2027, month: 1, day: 1 })).toBe(1);
		expect(addDays({ year: 2026, month: 3, day: 1 }, -1)).toEqual({ year: 2026, month: 2, day: 28 });
	});
});

describe("format", () => {
	it("makes initials", () => {
		expect(initials("Anna Wiśniewska")).toBe("AW");
		expect(initials("tomek")).toBe("T");
		expect(initials("  ")).toBe("?");
	});

	it("labels years", () => {
		const today = { year: 2026, month: 9, day: 25 };
		expect(yearsLabel({ birth: { year: 1948, month: 4, day: 20 }, death: null }, today)).toBe("1948 · 78");
		expect(yearsLabel({ birth: { year: 1921, month: 3, day: 12 }, death: { year: 1998, month: 10, day: 15 } }, today)).toBe("1921 – †1998");
	});

	it("describes relative time", () => {
		const now = new Date("2026-09-25T12:00:00Z");
		expect(relativeTime("2026-09-23 12:00:00.000Z", now)).toBe("2 days ago");
		expect(relativeTime("2026-09-24 11:00:00.000Z", now)).toBe("yesterday");
		expect(relativeTime("2026-09-04 12:00:00.000Z", now)).toBe("3 weeks ago");
	});
});
