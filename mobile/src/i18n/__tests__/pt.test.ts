import { formatDayMonth, formatLong } from "../../lib/dates";
import { inDays, relativeTime } from "../../lib/format";
import { bloodTerm, describeKinship, relationshipPath, stepLabel } from "../../lib/path";
import { typeLabel, typeSentence } from "../../lib/relations";
import { eventTitle, upcomingEvents } from "../../lib/upcoming";
import { graph } from "../../lib/__tests__/fixtures";
import { pt } from "../pt";

const kin = (a: string, b: string) => describeKinship(graph, relationshipPath(graph, a, b)!.steps, pt);

describe("Brazilian Portuguese kinship", () => {
	it("names blood relatives with the right gender and possessive", () => {
		expect(kin("tomasz", "maria").phrase).toBe("sua mãe");
		expect(kin("tomasz", "jan").phrase).toBe("seu pai");
		expect(kin("tomasz", "stan").phrase).toBe("seu avô");
		expect(kin("tomasz", "ewa").phrase).toBe("sua irmã");
		expect(kin("tomasz", "andrzej").phrase).toBe("seu tio");
		expect(kin("andrzej", "tomasz").phrase).toBe("seu sobrinho");
		expect(kin("tomasz", "anna").title).toBe("Sua prima");
		expect(kin("bron", "zofia").phrase).toBe("sua bisneta");
	});

	it("uses the Portuguese in-law vocabulary", () => {
		expect(kin("jan", "maria").phrase).toBe("sua esposa");
		expect(kin("maria", "stan").phrase).toBe("seu sogro");
		expect(kin("andrzej", "piotr").phrase).toBe("seu genro");
		expect(kin("piotr", "andrzej").phrase).toBe("seu sogro");
	});

	it("chains with do/da when there is no single word", () => {
		expect(kin("tomasz", "anna").chain).toBe("a filha do irmão da sua mãe");
		const z = kin("tomasz", "zofia");
		expect(z.term).toBeNull();
		expect(z.phrase).toBe("a filha da filha do irmão da sua mãe");
		expect(z.title).toBe("A filha da filha do irmão da sua mãe");
		expect(kin("jan", "roman").phrase).toBe("o amigo do seu pai");
		expect(kin("tomasz", "tomasz").phrase).toBe("você");
	});

	it("knows the compound terms and cousin degrees, and gives up beyond them", () => {
		expect(bloodTerm(3, 1, "female", pt)).toBe("tia-avó");
		expect(bloodTerm(1, 3, "male", pt)).toBe("sobrinho-neto");
		expect(bloodTerm(3, 3, "female", pt)).toBe("prima de segundo grau");
		expect(bloodTerm(4, 0, "male", pt)).toBe("trisavô");
		expect(bloodTerm(5, 0, "female", pt)).toBe("tataravó");
		expect(bloodTerm(0, 4, "female", pt)).toBe("trineta");
		expect(bloodTerm(3, 2, "male", pt)).toBeNull();
		expect(bloodTerm(6, 0, "male", pt)).toBeNull();
	});

	it("labels path steps", () => {
		const p = relationshipPath(graph, "tomasz", "anna")!;
		expect(p.steps.map((s) => stepLabel(graph, s, pt))).toEqual(["filho de", "filha de", "mãe de", "pai de"]);
	});
});

describe("Brazilian Portuguese texts", () => {
	it("keeps 0 and 1 singular, as CLDR pt-BR does", () => {
		expect(pt.person.ageAlive("Feminino", 0)).toBe("Feminino · 0 ano");
		expect(pt.person.ageAlive("Feminino", 1)).toBe("Feminino · 1 ano");
		expect(pt.person.ageAlive("Feminino", 2)).toBe("Feminino · 2 anos");
		expect(pt.trees.people(5)).toBe("5 pessoas");
	});

	it("formats dates with “de”", () => {
		expect(formatLong({ year: 1950, month: 2, day: 4 }, pt)).toBe("4 de fevereiro de 1950");
		expect(formatDayMonth({ year: 2026, month: 10, day: 15 }, pt)).toBe("15 de out");
	});

	it("relative times", () => {
		const now = new Date("2026-09-25T12:00:00Z");
		expect(relativeTime("2026-09-25 11:59:00.000Z", now, pt)).toBe("há 1 minuto");
		expect(relativeTime("2026-09-24 11:00:00.000Z", now, pt)).toBe("ontem");
		expect(relativeTime("2026-09-23 12:00:00.000Z", now, pt)).toBe("há 2 dias");
		expect(relativeTime("2026-09-17 12:00:00.000Z", now, pt)).toBe("há 1 semana");
		expect(relativeTime("2026-09-04 12:00:00.000Z", now, pt)).toBe("há 3 semanas");
		expect(relativeTime("2021-09-25 12:00:00.000Z", now, pt)).toBe("há 5 anos");
		expect(inDays(1, pt)).toBe("amanhã");
		expect(inDays(8, pt)).toBe("em 8 dias");
	});

	it("event titles and relationship types", () => {
		const events = upcomingEvents(graph.persons, { year: 2026, month: 9, day: 25 });
		expect(eventTitle(events[0], pt)).toBe("Maria faz 75 anos");
		expect(eventTitle(events.find((e) => e.personId === "stan")!, pt)).toBe("† Stanisław, há 28 anos");
		expect(typeLabel("IS_MOTHER_OF", pt)).toBe("Mãe");
		expect(typeSentence("IS_MARRIED_TO", "female", pt)).toBe("é casada com");
		expect(typeSentence("IS_GODPARENT_OF", "male", pt)).toBe("é padrinho de");
	});
});
