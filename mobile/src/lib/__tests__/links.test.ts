import { applyFilters, clearChip, DEFAULT_FILTERS, filterChips } from "../filters";
import { accountsWithAccess, linkConflict, resolveMe } from "../links";
import { searchPersons } from "../search";
import type { Person } from "../types";
import { graph } from "./fixtures";

const today = { year: 2026, month: 9, day: 25 };
const person = (id: string, extra: Partial<Person> = {}): Person => ({ id, name: id, gender: "male", birth: null, death: null, ...extra });

describe("linked accounts", () => {
	const persons = [person("a", { userId: "u1" }), person("b"), person("c", { userId: "u2" })];

	it("prefers the server link over the on-device pick", () => {
		expect(resolveMe(persons, "u1", "b")).toEqual({ person: persons[0], source: "server" });
		expect(resolveMe(persons, "u9", "b")).toEqual({ person: persons[1], source: "device" });
		expect(resolveMe(persons, "u9", null)).toEqual({ person: null, source: null });
		expect(resolveMe(persons, null, "gone")).toEqual({ person: null, source: null });
	});

	it("detects an account already linked to someone else", () => {
		expect(linkConflict(persons, "u1", "b")?.id).toBe("a");
		expect(linkConflict(persons, "u1", "a")).toBeNull();
		expect(linkConflict(persons, "", "b")).toBeNull();
	});

	it("lists the creator and invitees once", () => {
		expect(accountsWithAccess({ creator: "u1", invited: ["u2", "u1", "u3"] })).toEqual(["u1", "u2", "u3"]);
	});
});

describe("include filter", () => {
	it("keeps only names containing any fragment, diacritic-insensitive, then excludes", () => {
		const only = applyFilters(graph.persons, graph.edges, { ...DEFAULT_FILTERS, includeNames: "wisniewsk, kowalski" }, today);
		expect(only.persons.map((p) => p.id).sort()).toEqual(["anna", "jan", "piotr", "stan", "tomasz", "zofia"]);
		const both = applyFilters(graph.persons, graph.edges, { ...DEFAULT_FILTERS, includeNames: "Wiśniewsk", excludeNames: "PIOTR" }, today);
		expect(both.persons.map((p) => p.id).sort()).toEqual(["anna", "zofia"]);
		// Exclude is diacritic-insensitive too.
		const ex = applyFilters(graph.persons, graph.edges, { ...DEFAULT_FILTERS, excludeNames: "stanislaw" }, today);
		expect(ex.personIds.has("stan")).toBe(false);
	});

	it("shows and clears an Only chip", () => {
		const f = { ...DEFAULT_FILTERS, includeNames: "Nowak,  Lis" };
		expect(filterChips(f).map((c) => c.label)).toEqual(["Only: Nowak, Lis"]);
		expect(clearChip(f, "include").includeNames).toBe("");
	});
});

describe("search notes", () => {
	const persons = [person("Anna Nowak", { id: "a", note: "Lives in Kraków, loves gardening" }), person("Jan", { id: "j" })];
	it("matches the note too, without highlighting the name", () => {
		const r = searchPersons(persons, "krakow");
		expect(r.map((m) => m.person.id)).toEqual(["a"]);
		expect(r[0].range).toBeUndefined();
		expect(r[0].noteSnippet).toContain("Kraków");
	});
	it("ranks name matches before note-only matches", () => {
		const ps = [person("Garden Smith", { id: "g" }), ...persons];
		expect(searchPersons(ps, "garden").map((m) => m.person.id)).toEqual(["g", "a"]);
	});
});
