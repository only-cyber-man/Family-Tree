import { eventTitle, eventSubtitle, groupByMonth, isRoundAge, planReminders, upcomingEvents } from "../upcoming";
import { graph } from "./fixtures";

const today = { year: 2026, month: 9, day: 25 };

describe("upcoming dates", () => {
	const events = upcomingEvents(graph.persons, today);

	it("lists birthdays of the living and remembrance of the deceased, nearest first", () => {
		expect(events[0]).toMatchObject({ kind: "birthday", personId: "maria", daysUntil: 8, years: 75, isRound: true });
		expect(eventTitle(events[0])).toBe("Maria turns 75");
		expect(eventSubtitle(events[0])).toBe("Birthday · in 8 days · round age");
		const stan = events.find((e) => e.personId === "stan")!;
		expect(stan).toMatchObject({ kind: "remembrance", years: 28, date: { year: 2026, month: 10, day: 15 } });
		expect(eventTitle(stan)).toBe("† Stanisław, 28 years");
		expect(events.some((e) => e.personId === "stan" && e.kind === "birthday")).toBe(false);
		for (let i = 1; i < events.length; i++) expect(events[i].daysUntil).toBeGreaterThanOrEqual(events[i - 1].daysUntil);
	});

	it("uses 28 Feb for leap-day birthdays in common years", () => {
		const roman = events.find((e) => e.personId === "roman")!;
		expect(roman.date).toEqual({ year: 2027, month: 2, day: 28 });
	});

	it("groups by month", () => {
		const groups = groupByMonth(events, today);
		expect(groups[0].label).toBe("October");
		expect(groups.some((g) => g.label === "January 2027")).toBe(true);
	});

	it("detects round ages", () => {
		expect([18, 50, 55, 75, 90].every(isRoundAge)).toBe(true);
		expect([17, 45, 51, 20].some(isRoundAge)).toBe(false);
	});

	it("plans reminders per preferences, capped and nearest first", () => {
		const now = new Date(2026, 8, 25, 12, 0);
		const plan = planReminders(events, { birthdays: true, remembrance: true, roundEarly: true }, now);
		const maria = plan.filter((r) => r.personId === "maria");
		expect(maria.map((r) => r.title)).toEqual(["Maria turns 75 in a week", "Maria turns 75 tomorrow"]);
		// 3 Oct 2026: week before is 26 Sep 09:00, day before 2 Oct 09:00
		expect(maria[0].fireAt).toEqual(new Date(2026, 8, 26, 9, 0));
		expect(maria[1].fireAt).toEqual(new Date(2026, 9, 2, 9, 0));
		const stan = plan.find((r) => r.personId === "stan")!;
		expect(stan.title).toBe("† Stanisław Kowalski, 28 years");
		expect(stan.fireAt).toEqual(new Date(2026, 9, 15, 9, 0));
		for (let i = 1; i < plan.length; i++) expect(plan[i].fireAt.getTime()).toBeGreaterThanOrEqual(plan[i - 1].fireAt.getTime());

		expect(planReminders(events, { birthdays: false, remembrance: true, roundEarly: true }, now).every((r) => r.title.startsWith("†"))).toBe(true);
		expect(planReminders(events, { birthdays: true, remembrance: true, roundEarly: false }, now).some((r) => r.id.endsWith(":week"))).toBe(false);
		expect(planReminders(events, { birthdays: true, remembrance: true, roundEarly: true }, now, 3)).toHaveLength(3);
	});

	it("skips reminders already in the past", () => {
		// Maria's birthday is today: the day-before reminder has passed.
		const e = upcomingEvents(graph.persons, { year: 2026, month: 10, day: 3 });
		const plan = planReminders(e, { birthdays: true, remembrance: true, roundEarly: true }, new Date(2026, 9, 3, 8, 0));
		expect(plan.some((r) => r.personId === "maria" && r.fireAt.getFullYear() === 2026)).toBe(false);
	});
});
