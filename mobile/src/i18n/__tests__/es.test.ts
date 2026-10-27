import { formatDayMonth, formatLong, formatShort } from "../../lib/dates";
import { DEFAULT_FILTERS, filterChips } from "../../lib/filters";
import { inDays, relativeTime } from "../../lib/format";
import { buildIcs } from "../../lib/ics";
import { bloodTerm, describeKinship, relationshipPath, stepLabel } from "../../lib/path";
import { groupLabel, roleLabel, sheetGroups, typeLabel, typeSentence } from "../../lib/relations";
import { eventSubtitle, eventTitle, groupByMonth, planReminders, upcomingEvents } from "../../lib/upcoming";
import { graph } from "../../lib/__tests__/fixtures";
import { es } from "../es";

describe("Spanish kinship", () => {
	const kin = (a: string, b: string) => describeKinship(graph, relationshipPath(graph, a, b)!.steps, es);

	it("names blood relatives and in-laws with the right gender", () => {
		expect(kin("tomasz", "maria").phrase).toBe("tu madre");
		expect(kin("tomasz", "stan").phrase).toBe("tu abuelo");
		expect(kin("tomasz", "ewa").phrase).toBe("tu hermana");
		expect(kin("tomasz", "andrzej").phrase).toBe("tu tío");
		expect(kin("tomasz", "anna").title).toBe("Tu prima");
		expect(kin("bron", "zofia").phrase).toBe("tu bisnieta");
		expect(kin("jan", "maria").phrase).toBe("tu esposa");
		expect(kin("maria", "stan").phrase).toBe("tu suegro");
		expect(kin("andrzej", "piotr").phrase).toBe("tu yerno");
	});

	it("builds chains with articles and “del”, and uses them when there is no single word", () => {
		expect(kin("tomasz", "anna").chain).toBe("la hija del hermano de tu madre");
		const zofia = kin("tomasz", "zofia");
		expect(zofia.phrase).toBe("tu sobrina segunda");
		expect(zofia.chain).toBe("la hija de la hija del hermano de tu madre");
		expect(kin("ewa", "stan").term).toBeNull();
		expect(kin("ewa", "stan").phrase).toBe("el padre del esposo de tu madre");
		expect(kin("jan", "roman").phrase).toBe("el amigo de tu padre");
	});

	it("has words up to the fourth generation, then falls back to the chain", () => {
		expect(bloodTerm(4, 0, "male", es)).toBe("tatarabuelo");
		expect(bloodTerm(5, 0, "male", es)).toBeNull();
		expect(bloodTerm(3, 1, "female", es)).toBe("tía abuela");
		expect(bloodTerm(1, 3, "male", es)).toBe("sobrino nieto");
		expect(bloodTerm(3, 3, "female", es)).toBe("prima segunda");
		expect(bloodTerm(4, 2, "male", es)).toBeNull();
	});

	it("labels path steps and relationship types", () => {
		const p = relationshipPath(graph, "tomasz", "anna")!;
		expect(p.steps.map((s) => stepLabel(graph, s, es))).toEqual(["hijo de", "hija de", "madre de", "padre de"]);
		expect(typeLabel("IS_MOTHER_OF", es)).toBe("Madre");
		expect(typeSentence("IS_ENGAGED_TO", "female", es)).toBe("está comprometida con");
		expect(typeSentence("IS_GODPARENT_OF", "male", es)).toBe("es padrino de");
		expect(groupLabel("IN-LAW", es)).toBe("Afinidad");
		expect(sheetGroups(graph, "zofia", graph.edges, es).find((g) => g.group === "CHURCH")!.rows[0].role).toBe("Padrino");
		expect(sheetGroups(graph, "andrzej", graph.edges, es).find((g) => g.group === "CHURCH")!.rows[0].role).toBe("Ahijada");
		const married = graph.edges.find((x) => x.name === "IS_MARRIED_TO")!;
		expect(roleLabel(married, graph.byId[married.source], graph.byId[married.target], es)).toBe("Matrimonio");
	});
});

describe("Spanish plurals, dates and times", () => {
	it("only 1 is singular", () => {
		expect([0, 1, 2].map((n) => es.time.yearsAgo(n))).toEqual(["hace 0 años", "hace 1 año", "hace 2 años"]);
		expect(es.events.birthdayTitle("Maria", 1)).toBe("Maria cumple 1 año");
		expect(es.trees.people(21)).toBe("21 personas");
	});

	it("writes “de” in full dates only", () => {
		expect(formatLong({ year: 1950, month: 2, day: 4 }, es)).toBe("4 de febrero de 1950");
		expect(formatShort({ year: 1921, month: 3, day: 12 }, es)).toBe("12 mar 1921");
		expect(formatDayMonth({ year: 2026, month: 10, day: 15 }, es)).toBe("15 oct");
	});

	it("relative times", () => {
		const now = new Date("2026-09-25T12:00:00Z");
		expect(relativeTime("2026-09-25 11:59:00.000Z", now, es)).toBe("hace 1 minuto");
		expect(relativeTime("2026-09-24 11:00:00.000Z", now, es)).toBe("ayer");
		expect(relativeTime("2026-09-23 12:00:00.000Z", now, es)).toBe("hace 2 días");
		expect(relativeTime("2026-09-17 12:00:00.000Z", now, es)).toBe("hace 1 semana");
		expect(relativeTime("2026-09-04 12:00:00.000Z", now, es)).toBe("hace 3 semanas");
		expect(relativeTime("2021-09-25 12:00:00.000Z", now, es)).toBe("hace 5 años");
		expect(inDays(1, es)).toBe("mañana");
		expect(inDays(8, es)).toBe("en 8 días");
	});
});

describe("Spanish events, reminders and export", () => {
	const today = { year: 2026, month: 9, day: 25 };
	const events = upcomingEvents(graph.persons, today);

	it("titles, subtitles and reminders", () => {
		expect(eventTitle(events[0], es)).toBe("Maria cumple 75 años");
		expect(eventSubtitle(events[0], es)).toBe("Cumpleaños · en 8 días · cifra redonda");
		expect(eventTitle(events.find((e) => e.personId === "stan")!, es)).toBe("† Stanisław, 28.º aniversario");
		expect(groupByMonth(events, today, es)[0].label).toBe("Octubre");
		const plan = planReminders(events, { birthdays: true, remembrance: true, roundEarly: true }, new Date(2026, 8, 25, 12), undefined, es);
		expect(plan.filter((r) => r.personId === "maria").map((r) => r.title)).toEqual(["En una semana Maria cumple 75 años", "Mañana Maria cumple 75 años"]);
		expect(plan.find((r) => r.personId === "stan")!.title).toBe("† Stanisław Kowalski, 28.º aniversario");
	});

	it("filter chips and .ics", () => {
		const chips = filterChips({ ...DEFAULT_FILTERS, hiddenRelationshipNames: ["IS_MOTHER_OF"], maxAge: 80, gender: "female" }, es);
		expect(chips.map((c) => c.label)).toEqual(["Ocultar: Madre", "Edad 0–80", "Solo mujeres"]);
		const ics = buildIcs(graph.persons.filter((p) => p.id === "stan"), { treeId: "t1", L: es }).replace(/\r\n /g, "");
		expect(ics).toContain("SUMMARY:Cumpleaños de Stanisław Kowalski");
		expect(ics).toContain("SUMMARY:Aniversario del fallecimiento de Stanisław Kowalski");
		expect(ics).toContain("X-WR-CALNAME:Cumpleaños");
	});
});
