import { AGE_MAX, applyFilters, clearChip, DEFAULT_FILTERS, filterChips } from "../filters";
import { searchPersons, fold } from "../search";
import { graph } from "./fixtures";

const today = { year: 2026, month: 9, day: 25 };

describe("filters", () => {
	it("shows everyone by default", () => {
		const v = applyFilters(graph.persons, graph.edges, DEFAULT_FILTERS, today);
		expect(v.persons).toHaveLength(graph.persons.length);
		expect(v.edges).toHaveLength(graph.edges.length);
	});

	it("hides relationship types, by gender, by age and by name fragments", () => {
		const hidden = applyFilters(graph.persons, graph.edges, { ...DEFAULT_FILTERS, hiddenRelationshipNames: ["IS_MARRIED_TO"] }, today);
		expect(hidden.edges.some((e) => e.name === "IS_MARRIED_TO")).toBe(false);

		const women = applyFilters(graph.persons, graph.edges, { ...DEFAULT_FILTERS, gender: "female" }, today);
		expect(women.persons.every((p) => p.gender === "female")).toBe(true);
		expect(women.edges.every((e) => women.personIds.has(e.source) && women.personIds.has(e.target))).toBe(true);

		// Age uses age at death for the deceased, like the web.
		const young = applyFilters(graph.persons, graph.edges, { ...DEFAULT_FILTERS, maxAge: 30 }, today);
		expect(young.persons.map((p) => p.id)).toEqual(["zofia"]);

		const names = applyFilters(graph.persons, graph.edges, { ...DEFAULT_FILTERS, excludeNames: "nowak, Lis" }, today);
		expect(names.persons.some((p) => /Nowak|Lis/.test(p.name))).toBe(false);
	});

	it("describes and clears active filters as chips", () => {
		const f = { ...DEFAULT_FILTERS, hiddenRelationshipNames: ["IS_FRIEND_OF"], maxAge: 80, gender: "male" as const, excludeNames: "Nowak, Roman" };
		const chips = filterChips(f);
		expect(chips.map((c) => c.label)).toEqual(["Hide: Friend of", "Age 0–80", "Men only", "Not: Nowak, Roman"]);
		expect(clearChip(f, "age").maxAge).toBe(AGE_MAX);
		expect(clearChip(f, "rel:IS_FRIEND_OF").hiddenRelationshipNames).toEqual([]);
		expect(filterChips(DEFAULT_FILTERS)).toEqual([]);
	});
});

describe("search", () => {
	it("folds diacritics", () => {
		expect(fold("Wiśniewska Łucja")).toBe("wisniewska lucja");
	});

	it("matches case- and diacritic-insensitively with highlight ranges", () => {
		const res = searchPersons(graph.persons, "wisn");
		expect(res.map((r) => r.person.id).sort()).toEqual(["anna", "piotr", "zofia"]);
		const anna = res.find((r) => r.person.id === "anna")!;
		expect(anna.person.name.slice(...anna.range!)).toBe("Wiśn");
		expect(searchPersons(graph.persons, "ann")[0].person.id).toBe("anna");
		expect(searchPersons(graph.persons, "  ")).toEqual([]);
	});
});
