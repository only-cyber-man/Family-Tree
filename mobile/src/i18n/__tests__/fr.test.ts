import { formatDayMonth, formatLong } from "../../lib/dates";
import { inDays, relativeTime } from "../../lib/format";
import { bloodTerm, describeKinship, relationshipPath, stepLabel } from "../../lib/path";
import { roleLabel, sheetGroups, typeLabel, typeSentence } from "../../lib/relations";
import { eventSubtitle, eventTitle, upcomingEvents } from "../../lib/upcoming";
import { graph } from "../../lib/__tests__/fixtures";
import { fr } from "../fr";

const kin = (a: string, b: string) => describeKinship(graph, relationshipPath(graph, a, b)!.steps, fr);

describe("French kinship", () => {
	it("names blood relatives with the right gender", () => {
		expect(kin("tomasz", "maria").phrase).toBe("votre mère");
		expect(kin("tomasz", "stan").phrase).toBe("votre grand-père");
		expect(kin("tomasz", "ewa").phrase).toBe("votre sœur");
		expect(kin("tomasz", "andrzej").phrase).toBe("votre oncle");
		expect(kin("tomasz", "anna").title).toBe("Votre cousine");
		expect(kin("bron", "zofia").phrase).toBe("votre arrière-petite-fille");
		expect(kin("tomasz", "tomasz").phrase).toBe("vous");
	});

	it("uses the French in-law vocabulary", () => {
		expect(kin("jan", "maria").phrase).toBe("votre femme");
		expect(kin("maria", "stan").phrase).toBe("votre beau-père");
		expect(kin("andrzej", "piotr").phrase).toBe("votre gendre");
	});

	it("builds chains with articles and contractions when there is no single word", () => {
		expect(kin("tomasz", "anna").chain).toBe("la fille du frère de votre mère");
		// Cousin once removed: no French word, so the chain is the phrase.
		const z = kin("tomasz", "zofia");
		expect(z.term).toBeNull();
		expect(z.phrase).toBe("la fille de la fille du frère de votre mère");
		expect(kin("jan", "roman").phrase).toBe("l’ami de votre père");
	});

	it("repeats arrière- and counts cousin degrees", () => {
		expect(bloodTerm(4, 0, "male", fr)).toBe("arrière-arrière-grand-père");
		expect(bloodTerm(0, 3, "female", fr)).toBe("arrière-petite-fille");
		expect(bloodTerm(3, 1, "female", fr)).toBe("grand-tante");
		expect(bloodTerm(1, 3, "male", fr)).toBe("petit-neveu");
		expect(bloodTerm(3, 3, "female", fr)).toBe("cousine au second degré");
		expect(bloodTerm(2, 3, "male", fr)).toBeNull();
	});

	it("labels path steps", () => {
		const p = relationshipPath(graph, "tomasz", "anna")!;
		expect(p.steps.map((s) => stepLabel(graph, s, fr))).toEqual(["fils de", "fille de", "mère de", "père de"]);
	});
});

describe("French relationship types", () => {
	it("labels, sentences and roles", () => {
		expect(typeLabel("IS_MOTHER_OF", fr)).toBe("Mère");
		expect(typeSentence("IS_MARRIED_TO", "female", fr)).toBe("est mariée avec");
		expect(typeSentence("IS_GODPARENT_OF", "male", fr)).toBe("est le parrain de");
		expect(sheetGroups(graph, "zofia", graph.edges, fr).find((g) => g.group === "CHURCH")!.rows[0].role).toBe("Parrain");
		expect(sheetGroups(graph, "andrzej", graph.edges, fr).find((g) => g.group === "CHURCH")!.rows[0].role).toBe("Filleule");
		const e = graph.edges.find((x) => x.name === "IS_MARRIED_TO")!;
		expect(roleLabel(e, graph.byId[e.source], graph.byId[e.target], fr)).toBe("Mariage");
	});
});

describe("French plurals, dates and times", () => {
	it("keeps 0 and 1 singular", () => {
		expect([0, 1, 2].map((n) => fr.person.ageAlive("Homme", n))).toEqual(["Homme · 0 an", "Homme · 1 an", "Homme · 2 ans"]);
		expect(fr.trees.people(1)).toBe("1 personne");
		expect(fr.trees.people(5)).toBe("5 personnes");
	});

	it("formats dates", () => {
		expect(formatLong({ year: 1950, month: 2, day: 4 }, fr)).toBe("4 février 1950");
		expect(formatLong({ year: 2000, month: 1, day: 1 }, fr)).toBe("1er janvier 2000");
		expect(formatDayMonth({ year: 2026, month: 10, day: 15 }, fr)).toBe("15 oct.");
	});

	it("relative times", () => {
		const now = new Date("2026-09-25T12:00:00Z");
		expect(relativeTime("2026-09-25 11:59:00.000Z", now, fr)).toBe("il y a 1 minute");
		expect(relativeTime("2026-09-25 11:55:00.000Z", now, fr)).toBe("il y a 5 minutes");
		expect(relativeTime("2026-09-24 11:00:00.000Z", now, fr)).toBe("hier");
		expect(relativeTime("2026-09-23 12:00:00.000Z", now, fr)).toBe("il y a 2 jours");
		expect(relativeTime("2026-09-17 12:00:00.000Z", now, fr)).toBe("il y a 1 semaine");
		expect(relativeTime("2026-09-04 12:00:00.000Z", now, fr)).toBe("il y a 3 semaines");
		expect(relativeTime("2021-09-25 12:00:00.000Z", now, fr)).toBe("il y a 5 ans");
		expect(inDays(1, fr)).toBe("demain");
		expect(inDays(8, fr)).toBe("dans 8 jours");
	});

	it("event titles", () => {
		const events = upcomingEvents(graph.persons, { year: 2026, month: 9, day: 25 });
		expect(eventTitle(events[0], fr)).toBe("Maria fête ses 75 ans");
		expect(eventSubtitle(events[0], fr)).toBe("Anniversaire · dans 8 jours · âge rond");
		expect(eventTitle(events.find((e) => e.personId === "stan")!, fr)).toBe("† Stanisław, il y a 28 ans");
	});
});
