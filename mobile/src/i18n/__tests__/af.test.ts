import { formatDayMonth, formatLong } from "../../lib/dates";
import { inDays, relativeTime } from "../../lib/format";
import { bloodTerm, describeKinship, relationshipPath, stepLabel } from "../../lib/path";
import { sheetGroups, typeLabel, typeSentence } from "../../lib/relations";
import { eventSubtitle, eventTitle, upcomingEvents } from "../../lib/upcoming";
import { graph } from "../../lib/__tests__/fixtures";
import { af } from "../af";

const kin = (a: string, b: string) => describeKinship(graph, relationshipPath(graph, a, b)!.steps, af);

describe("Afrikaans kinship", () => {
	it("names blood relatives in the everyday register", () => {
		expect(kin("tomasz", "maria").phrase).toBe("jou ma");
		expect(kin("tomasz", "stan").phrase).toBe("jou oupa");
		expect(kin("tomasz", "ewa").phrase).toBe("jou suster");
		expect(kin("tomasz", "andrzej").phrase).toBe("jou oom");
		expect(kin("tomasz", "anna").title).toBe("Jou niggie");
		expect(kin("bron", "zofia").phrase).toBe("jou agterkleindogter");
		expect(bloodTerm(4, 0, "male", af)).toBe("oor-oupagrootjie");
		expect(bloodTerm(3, 1, "female", af)).toBe("groottante");
	});

	it("uses the in-law vocabulary", () => {
		expect(kin("jan", "maria").phrase).toBe("jou vrou");
		expect(kin("maria", "stan").phrase).toBe("jou skoonpa");
		expect(kin("andrzej", "piotr").phrase).toBe("jou skoonseun");
	});

	it("builds forward 'se' chains where there is no single word", () => {
		expect(kin("tomasz", "anna").chain).toBe("jou ma se broer se dogter");
		// Cousin once removed: no Afrikaans term, so the chain is the phrase.
		const z = kin("tomasz", "zofia");
		expect(z.term).toBeNull();
		expect(z.phrase).toBe("jou ma se broer se dogter se dogter");
		// Nieces are said with the chain too, because "niggie" would also mean cousin.
		expect(bloodTerm(1, 2, "female", af, "male")).toBeNull();
		expect(kin("maria", "anna").title).toBe("Jou broer se dogter");
		expect(kin("jan", "roman").phrase).toBe("jou pa se vriend");
	});

	it("labels path steps and relationship types", () => {
		const p = relationshipPath(graph, "tomasz", "anna")!;
		expect(p.steps.map((s) => stepLabel(graph, s, af))).toEqual(["seun van", "dogter van", "ma van", "pa van"]);
		expect(typeLabel("IS_MOTHER_OF", af)).toBe("Ma van");
		expect(`Jan ${typeSentence("IS_FATHER_OF", "male", af)}${af.addRel.sentenceJoin}Tomasz.`).toBe("Jan is die pa van Tomasz.");
		expect(typeSentence("IS_GODPARENT_OF", "female", af)).toBe("is die peetma van");
		const zofia = sheetGroups(graph, "zofia", graph.edges, af);
		expect(zofia.find((g) => g.group === "CHURCH")!.rows[0].role).toBe("Peetpa");
		expect(zofia.find((g) => g.group === "BIOLOGICAL")!.rows.map((r) => r.role).sort()).toEqual(["Ma", "Pa"]);
	});
});

describe("Afrikaans plurals, dates and events", () => {
	it("keeps 'jaar' singular and pluralises 'persoon'", () => {
		expect(af.events.remembranceTitle("Jan", 1)).toBe("† Jan, 1 jaar");
		expect(af.events.remembranceTitle("Jan", 2)).toBe("† Jan, 2 jaar");
		expect(af.trees.people(1)).toBe("1 persoon");
		expect(af.trees.people(2)).toBe("2 persone");
		expect(af.path.stepsThrough(1, 0)).toBe("1 stap deur 0 persone.");
	});

	it("formats dates", () => {
		expect(formatLong({ year: 1950, month: 2, day: 4 }, af)).toBe("4 Februarie 1950");
		expect(formatDayMonth({ year: 2026, month: 10, day: 15 }, af)).toBe("15 Okt.");
	});

	it("relative times", () => {
		const now = new Date("2026-09-25T12:00:00Z");
		expect(relativeTime("2026-09-25 11:59:30.000Z", now, af)).toBe("nou net");
		expect(relativeTime("2026-09-25 11:59:00.000Z", now, af)).toBe("1 minuut gelede");
		expect(relativeTime("2026-09-25 11:55:00.000Z", now, af)).toBe("5 minute gelede");
		expect(relativeTime("2026-09-25 09:00:00.000Z", now, af)).toBe("3 uur gelede");
		expect(relativeTime("2026-09-24 11:00:00.000Z", now, af)).toBe("gister");
		expect(relativeTime("2026-09-23 12:00:00.000Z", now, af)).toBe("2 dae gelede");
		expect(relativeTime("2026-09-17 12:00:00.000Z", now, af)).toBe("1 week gelede");
		expect(relativeTime("2026-09-04 12:00:00.000Z", now, af)).toBe("3 weke gelede");
		expect(relativeTime("2021-09-25 12:00:00.000Z", now, af)).toBe("5 jaar gelede");
		expect(inDays(1, af)).toBe("môre");
		expect(inDays(8, af)).toBe("oor 8 dae");
	});

	it("event titles", () => {
		const events = upcomingEvents(graph.persons, { year: 2026, month: 9, day: 25 });
		expect(eventTitle(events[0], af)).toBe("Maria word 75");
		expect(eventSubtitle(events[0], af)).toBe("Verjaarsdag · oor 8 dae · mylpaal");
		expect(eventTitle(events.find((e) => e.personId === "stan")!, af)).toBe("† Stanisław, 28 jaar");
	});
});
