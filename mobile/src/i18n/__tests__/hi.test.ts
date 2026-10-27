import { formatDayMonth, formatLong } from "../../lib/dates";
import { inDays, relativeTime } from "../../lib/format";
import { bloodTerm, describeKinship, relationshipPath, stepLabel } from "../../lib/path";
import { sheetGroups, typeLabel, typeSentence } from "../../lib/relations";
import { eventTitle, upcomingEvents } from "../../lib/upcoming";
import { graph } from "../../lib/__tests__/fixtures";
import { hi } from "../hi";

const kin = (a: string, b: string) => describeKinship(graph, relationshipPath(graph, a, b)!.steps, hi);

describe("Hindi kinship", () => {
	it("names side-independent relatives with आपका/आपकी/आपके agreement", () => {
		expect(kin("tomasz", "maria").phrase).toBe("आपकी माँ");
		expect(kin("tomasz", "jan").phrase).toBe("आपके पिता");
		expect(kin("tomasz", "ewa").phrase).toBe("आपकी बहन");
		expect(kin("maria", "tomasz").title).toBe("आपका बेटा");
	});

	it("spells side-dependent relatives as a possessive chain with oblique forms", () => {
		expect(kin("tomasz", "stan").term).toBeNull();
		expect(kin("tomasz", "stan").phrase).toBe("आपके पिता के पिता");
		expect(kin("tomasz", "andrzej").phrase).toBe("आपकी माँ का भाई");
		expect(kin("tomasz", "anna").phrase).toBe("आपकी माँ के भाई की बेटी");
		expect(kin("bron", "zofia").phrase).toBe("आपके बेटे की बेटी की बेटी");
		expect(kin("jan", "roman").phrase).toBe("आपके पिता का दोस्त");
	});

	it("uses in-law words only where they do not depend on the side", () => {
		expect(kin("jan", "maria").phrase).toBe("आपकी पत्नी");
		expect(kin("maria", "stan").phrase).toBe("आपके ससुर");
		expect(kin("andrzej", "piotr").phrase).toBe("आपके दामाद");
		// Brother-in-law would be साला here, but it could be देवर or जेठ: the chain says which.
		expect(kin("jan", "andrzej").phrase).toBe("आपकी पत्नी का भाई");
	});

	it("distinguishes nephews and nieces by the sibling's gender", () => {
		expect(bloodTerm(1, 2, "male", hi, "male")).toBe("भतीजा");
		expect(bloodTerm(1, 2, "female", hi, "male")).toBe("भतीजी");
		expect(bloodTerm(1, 2, "male", hi, "female")).toBe("भांजा");
		expect(bloodTerm(1, 2, "female", hi, "female")).toBe("भांजी");
		expect(bloodTerm(2, 0, "male", hi)).toBeNull();
		expect(bloodTerm(2, 2, "female", hi)).toBeNull();
	});

	it("labels path steps with bare nouns", () => {
		const p = relationshipPath(graph, "tomasz", "anna")!;
		expect(p.steps.map((s) => stepLabel(graph, s, hi))).toEqual(["बेटा", "बेटी", "माँ", "पिता"]);
	});
});

describe("Hindi relationship types", () => {
	it("chip labels, forward-pointing sentences and sheet roles", () => {
		expect(typeLabel("IS_MOTHER_OF", hi)).toBe("माँ");
		expect(typeSentence("IS_GODPARENT_OF", "female", hi)).toBe("इनकी धर्ममाता हैं");
		expect(hi.addRel.sentence("Maria", typeSentence("IS_MOTHER_OF", "female", hi), "Tomasz")).toBe("Maria इनकी माँ हैं: Tomasz।");
		expect(sheetGroups(graph, "zofia", graph.edges, hi).find((g) => g.group === "CHURCH")!.rows[0].role).toBe("धर्मपिता");
		expect(sheetGroups(graph, "andrzej", graph.edges, hi).find((g) => g.group === "CHURCH")!.rows[0].role).toBe("धर्मपुत्री");
	});
});

describe("Hindi plurals, dates and times", () => {
	it("keeps 0 and 1 singular", () => {
		expect([0, 1, 2].map((n) => hi.trees.people(n))).toEqual(["0 व्यक्ति", "1 व्यक्ति", "2 लोग"]);
		expect([1, 3].map((n) => hi.time.weeksAgo(n))).toEqual(["1 हफ़्ता पहले", "3 हफ़्ते पहले"]);
	});

	it("formats dates with Hindi month names", () => {
		expect(formatLong({ year: 1950, month: 2, day: 4 }, hi)).toBe("4 फ़रवरी 1950");
		expect(formatDayMonth({ year: 2026, month: 10, day: 15 }, hi)).toBe("15 अक्टू॰");
	});

	it("relative times", () => {
		const now = new Date("2026-09-25T12:00:00Z");
		expect(relativeTime("2026-09-23 12:00:00.000Z", now, hi)).toBe("2 दिन पहले");
		expect(relativeTime("2026-09-24 11:00:00.000Z", now, hi)).toBe("कल");
		expect(relativeTime("2026-09-25 11:55:00.000Z", now, hi)).toBe("5 मिनट पहले");
		expect(relativeTime("2021-09-25 12:00:00.000Z", now, hi)).toBe("5 साल पहले");
		expect(inDays(8, hi)).toBe("8 दिन में");
	});

	it("event titles use ordinals in the gender of जन्मदिन / पुण्यतिथि", () => {
		const events = upcomingEvents(graph.persons, { year: 2026, month: 9, day: 25 });
		expect(eventTitle(events[0], hi)).toBe("Maria का 75वाँ जन्मदिन");
		expect(eventTitle(events.find((e) => e.personId === "stan")!, hi)).toBe("† Stanisław, 28वीं पुण्यतिथि");
	});
});
