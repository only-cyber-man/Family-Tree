import { formatLong, formatDayMonth } from "../../lib/dates";
import { DEFAULT_FILTERS, filterChips } from "../../lib/filters";
import { relativeTime, inDays } from "../../lib/format";
import { buildIcs } from "../../lib/ics";
import { describeKinship, relationshipPath, stepLabel, bloodTerm } from "../../lib/path";
import { roleLabel, sheetGroups, typeLabel, typeSentence, groupLabel } from "../../lib/relations";
import { eventTitle, eventSubtitle, groupByMonth, planReminders, upcomingEvents } from "../../lib/upcoming";
import { graph } from "../../lib/__tests__/fixtures";
import { en } from "../en";
import { pl } from "../pl";
import { manualPluralCategory, pluralCategory, plForm } from "../plural";

/** Same keys, same value kinds, all the way down. */
function shape(v: unknown): unknown {
	if (typeof v === "function") return "fn";
	if (Array.isArray(v)) return v.map(shape);
	if (v && typeof v === "object") return Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, shape((v as Record<string, unknown>)[k])]));
	return typeof v;
}

describe("dictionaries", () => {
	it("Polish has exactly the English keys (compile-time too: pl is typed as Dict)", () => {
		expect(shape(pl)).toEqual(shape(en));
	});
	it("has no empty strings", () => {
		const walk = (v: unknown, path: string) => {
			if (typeof v === "string") expect(`${path}=${v.trim()}`).not.toBe(`${path}=`);
			else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`);
		};
		walk(pl, "pl");
		walk(en, "en");
	});
});

describe("Polish plurals", () => {
	it("uses one / few / many", () => {
		const f = (n: number) => plForm(n, "rok", "lata", "lat");
		expect([1, 2, 4, 5, 11, 12, 14, 21, 22, 25, 102, 112, 122].map((n) => `${n} ${f(n)}`)).toEqual([
			"1 rok", "2 lata", "4 lata", "5 lat", "11 lat", "12 lat", "14 lat", "21 lat", "22 lata", "25 lat", "102 lata", "112 lat", "122 lata",
		]);
	});
	it("matches Intl.PluralRules where the engine has it", () => {
		if (typeof Intl === "undefined" || !("PluralRules" in Intl)) return;
		const rules = new Intl.PluralRules("pl-PL");
		for (let n = 0; n < 250; n++) expect(manualPluralCategory("pl", n)).toBe(rules.select(n));
		expect(pluralCategory("en", 1)).toBe("one");
		expect(pluralCategory("en", 2)).toBe("other");
	});
});

describe("dates and times", () => {
	it("formats with Polish month names (genitive in dates)", () => {
		expect(formatLong({ year: 1950, month: 2, day: 4 }, pl)).toBe("4 lutego 1950");
		expect(formatDayMonth({ year: 2026, month: 10, day: 15 }, pl)).toBe("15 paź");
		expect(formatLong({ year: 1950, month: 2, day: 4 })).toBe("4 February 1950");
	});
	it("relative times", () => {
		const now = new Date("2026-09-25T12:00:00Z");
		expect(relativeTime("2026-09-23 12:00:00.000Z", now, pl)).toBe("2 dni temu");
		expect(relativeTime("2026-09-24 11:00:00.000Z", now, pl)).toBe("wczoraj");
		expect(relativeTime("2026-09-04 12:00:00.000Z", now, pl)).toBe("3 tygodnie temu");
		expect(relativeTime("2026-09-17 12:00:00.000Z", now, pl)).toBe("tydzień temu");
		expect(relativeTime("2021-09-25 12:00:00.000Z", now, pl)).toBe("5 lat temu");
		expect(relativeTime("2026-09-25 11:55:00.000Z", now, pl)).toBe("5 minut temu");
		expect(relativeTime("2026-09-25 11:58:00.000Z", now, pl)).toBe("2 minuty temu");
		expect(inDays(1, pl)).toBe("jutro");
		expect(inDays(8, pl)).toBe("za 8 dni");
	});
});

describe("Polish kinship", () => {
	const kin = (a: string, b: string) => describeKinship(graph, relationshipPath(graph, a, b)!.steps, pl);

	it("names blood relatives with the right gender", () => {
		expect(kin("tomasz", "maria").phrase).toBe("twoja matka");
		expect(kin("tomasz", "stan").phrase).toBe("twój dziadek");
		expect(kin("tomasz", "ewa").phrase).toBe("twoja siostra");
		expect(kin("tomasz", "andrzej").phrase).toBe("twój wujek");
		expect(kin("tomasz", "anna").title).toBe("Twoja kuzynka");
		expect(kin("bron", "zofia").phrase).toBe("twoja prawnuczka");
	});

	it("uses the Polish in-law vocabulary", () => {
		expect(kin("jan", "maria").phrase).toBe("twoja żona");
		expect(kin("maria", "stan").phrase).toBe("twój teść");
		expect(kin("andrzej", "piotr").phrase).toBe("twój zięć");
	});

	it("builds genitive chains when there is no single word", () => {
		const k = kin("tomasz", "anna");
		expect(k.chain).toBe("córka brata twojej matki");
		// Cousin once removed: Polish has no term, so the chain is the phrase.
		const z = kin("tomasz", "zofia");
		expect(z.term).toBeNull();
		expect(z.phrase).toBe("córka córki brata twojej matki");
		expect(kin("jan", "roman").phrase).toBe("przyjaciel twojego ojca");
	});

	it("distinguishes nephews/nieces by the sibling's gender", () => {
		expect(bloodTerm(1, 2, "male", pl, "male")).toBe("bratanek");
		expect(bloodTerm(1, 2, "female", pl, "male")).toBe("bratanica");
		expect(bloodTerm(1, 2, "male", pl, "female")).toBe("siostrzeniec");
		expect(bloodTerm(1, 2, "female", pl, "female")).toBe("siostrzenica");
		expect(bloodTerm(3, 3, "female", pl)).toBe("kuzynka drugiego stopnia");
		expect(bloodTerm(4, 0, "male", pl)).toBe("prapradziadek");
	});

	it("labels path steps", () => {
		const p = relationshipPath(graph, "tomasz", "anna")!;
		expect(p.steps.map((s) => stepLabel(graph, s, pl))).toEqual(["syn", "córka", "matka", "ojciec"]);
	});
});

describe("relationship types", () => {
	it("translates known types and falls back to the humanised name", () => {
		expect(typeLabel("IS_MOTHER_OF", pl)).toBe("Matka");
		expect(typeLabel("IS_STEPPARENT_OF", en)).toBe("Stepparent of");
		expect(typeLabel("IS_NEIGHBOUR_OF", pl)).toBe("Neighbour of");
		expect(typeSentence("IS_ENGAGED_TO", "female", pl)).toBe("jest zaręczona z");
		expect(typeSentence("IS_GODPARENT_OF", "male", pl)).toBe("jest chrzestnym dla");
		expect(groupLabel("IN-LAW", pl)).toBe("Powinowactwo");
	});

	it("gives Polish roles in the person sheet", () => {
		const zofia = sheetGroups(graph, "zofia", graph.edges, pl);
		expect(zofia.find((g) => g.group === "CHURCH")!.rows[0].role).toBe("Chrzestny");
		const andrzej = sheetGroups(graph, "andrzej", graph.edges, pl);
		expect(andrzej.find((g) => g.group === "CHURCH")!.rows[0].role).toBe("Chrześniaczka");
		const bio = zofia.find((g) => g.group === "BIOLOGICAL")!.rows.map((r) => r.role).sort();
		expect(bio).toEqual(["Matka", "Ojciec"]);
		const e = graph.edges.find((x) => x.name === "IS_MARRIED_TO")!;
		expect(roleLabel(e, graph.byId[e.source], graph.byId[e.target], pl)).toBe("Małżeństwo");
	});
});

describe("Polish dates, reminders and export", () => {
	const today = { year: 2026, month: 9, day: 25 };
	const events = upcomingEvents(graph.persons, today);

	it("titles and subtitles", () => {
		expect(eventTitle(events[0], pl)).toBe("Maria kończy 75 lat");
		expect(eventSubtitle(events[0], pl)).toBe("Urodziny · za 8 dni · okrągłe urodziny");
		const stan = events.find((e) => e.personId === "stan")!;
		expect(eventTitle(stan, pl)).toBe("† Stanisław, 28. rocznica");
		expect(groupByMonth(events, today, pl)[0].label).toBe("Październik");
	});

	it("reminder texts", () => {
		const plan = planReminders(events, { birthdays: true, remembrance: true, roundEarly: true }, new Date(2026, 8, 25, 12), undefined, pl);
		const maria = plan.filter((r) => r.personId === "maria").map((r) => r.title);
		expect(maria).toEqual(["Za tydzień Maria kończy 75 lat", "Jutro Maria kończy 75 lat"]);
		expect(plan.find((r) => r.personId === "stan")!.title).toBe("† Stanisław Kowalski, 28. rocznica śmierci");
	});

	it("filter chips", () => {
		expect(filterChips({ ...DEFAULT_FILTERS, hiddenRelationshipNames: ["IS_MOTHER_OF"], maxAge: 80, gender: "female" }, pl).map((c) => c.label)).toEqual([
			"Ukryte: Matka",
			"Wiek 0–80",
			"Tylko kobiety",
		]);
	});

	it(".ics in Polish, English unchanged (matches the web)", () => {
		const persons = graph.persons.filter((p) => p.id === "stan");
		const plIcs = buildIcs(persons, { treeId: "t1", L: pl }).replace(/\r\n /g, "");
		expect(plIcs).toContain("SUMMARY:Urodziny: Stanisław Kowalski");
		expect(plIcs).toContain("SUMMARY:Rocznica śmierci: Stanisław Kowalski");
		expect(plIcs).toContain("X-WR-CALNAME:Urodziny");
		const enIcs = buildIcs(persons, { treeId: "t1" }).replace(/\r\n /g, "");
		expect(enIcs).toContain("SUMMARY:Stanisław Kowalski birthday");
	});
});
