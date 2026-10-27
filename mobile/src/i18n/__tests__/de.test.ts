import { formatDayMonth, formatLong } from "../../lib/dates";
import { inDays, relativeTime } from "../../lib/format";
import { bloodTerm, describeKinship, relationshipPath, stepLabel } from "../../lib/path";
import { typeLabel, typeSentence } from "../../lib/relations";
import { eventSubtitle, eventTitle, upcomingEvents } from "../../lib/upcoming";
import { graph } from "../../lib/__tests__/fixtures";
import { de } from "../de";

const kin = (a: string, b: string) => describeKinship(graph, relationshipPath(graph, a, b)!.steps, de);

describe("German kinship", () => {
	it("names blood relatives with the right gender and possessive", () => {
		expect(kin("tomasz", "maria").phrase).toBe("deine Mutter");
		expect(kin("tomasz", "stan").phrase).toBe("dein Großvater");
		expect(kin("tomasz", "ewa").phrase).toBe("deine Schwester");
		expect(kin("tomasz", "andrzej").phrase).toBe("dein Onkel");
		expect(kin("tomasz", "anna").title).toBe("Deine Cousine");
		expect(kin("bron", "zofia").phrase).toBe("deine Urenkelin");
	});

	it("uses the German in-law vocabulary", () => {
		expect(kin("jan", "maria").phrase).toBe("deine Ehefrau");
		expect(kin("maria", "stan").phrase).toBe("dein Schwiegervater");
		expect(kin("andrzej", "piotr").phrase).toBe("dein Schwiegersohn");
	});

	it("builds genitive chains when there is no single word", () => {
		expect(kin("tomasz", "anna").chain).toBe("die Tochter des Bruders deiner Mutter");
		// Cousin once removed: German has no term, so the chain is the phrase.
		const z = kin("tomasz", "zofia");
		expect(z.term).toBeNull();
		expect(z.phrase).toBe("die Tochter der Tochter des Bruders deiner Mutter");
		expect(kin("jan", "roman").phrase).toBe("der Freund deines Vaters");
	});

	it("repeats Ur- and counts cousin degrees", () => {
		expect(bloodTerm(4, 0, "male", de)).toBe("Ururgroßvater");
		expect(bloodTerm(3, 1, "female", de)).toBe("Großtante");
		expect(bloodTerm(1, 3, "male", de)).toBe("Großneffe");
		expect(bloodTerm(3, 3, "female", de)).toBe("Cousine zweiten Grades");
		expect(bloodTerm(2, 3, "male", de)).toBeNull();
	});

	it("labels path steps", () => {
		const p = relationshipPath(graph, "tomasz", "anna")!;
		expect(p.steps.map((s) => stepLabel(graph, s, de))).toEqual(["Sohn von", "Tochter von", "Mutter von", "Vater von"]);
	});
});

describe("German dates, plurals and events", () => {
	it("formats dates with an ordinal day", () => {
		expect(formatLong({ year: 1950, month: 2, day: 4 }, de)).toBe("4. Februar 1950");
		expect(formatDayMonth({ year: 2026, month: 10, day: 15 }, de)).toBe("15. Okt.");
	});

	it("pluralises years: only 1 is singular", () => {
		expect([0, 1, 2].map((n) => de.person.ageAlive("Männlich", n))).toEqual(["Männlich · 0 Jahre", "Männlich · 1 Jahr", "Männlich · 2 Jahre"]);
		expect(de.trees.people(1)).toBe("1 Person");
	});

	it("relative times", () => {
		const now = new Date("2026-09-25T12:00:00Z");
		expect(relativeTime("2026-09-23 12:00:00.000Z", now, de)).toBe("vor 2 Tagen");
		expect(relativeTime("2026-09-24 11:00:00.000Z", now, de)).toBe("gestern");
		expect(relativeTime("2026-09-17 12:00:00.000Z", now, de)).toBe("vor einer Woche");
		expect(relativeTime("2021-09-25 12:00:00.000Z", now, de)).toBe("vor 5 Jahren");
		expect(relativeTime("2026-09-25 11:55:00.000Z", now, de)).toBe("vor 5 Minuten");
		expect(inDays(8, de)).toBe("in 8 Tagen");
	});

	it("event titles and relationship sentences", () => {
		const events = upcomingEvents(graph.persons, { year: 2026, month: 9, day: 25 });
		expect(eventTitle(events[0], de)).toBe("Maria wird 75");
		expect(eventSubtitle(events[0], de)).toBe("Geburtstag · in 8 Tagen · runder Geburtstag");
		expect(eventTitle(events.find((e) => e.personId === "stan")!, de)).toBe("† Stanisław, 28. Todestag");
		expect(typeLabel("IS_MOTHER_OF", de)).toBe("Mutter");
		expect(`Jan ${typeSentence("IS_GODPARENT_OF", "female", de)}${de.addRel.sentenceJoin}Zofia.`).toBe("Jan ist die Patin von Zofia.");
	});
});
