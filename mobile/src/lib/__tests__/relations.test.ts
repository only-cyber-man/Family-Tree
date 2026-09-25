import { classifyName, humanizeName, isDuplicateRelationship, relativesOf, sheetGroups, emphasisFor } from "../relations";
import { full } from "./fixtures";
import { graph } from "./fixtures";

describe("relations", () => {
	it("classifies relationship names", () => {
		expect(classifyName("IS_MOTHER_OF")).toEqual({ kind: "parent", reversed: false });
		expect(classifyName("IS_CHILD_OF")).toEqual({ kind: "parent", reversed: true });
		expect(classifyName("IS_GODPARENT_OF").kind).toBe("other");
		expect(classifyName("IS_MARRIED_TO").kind).toBe("spouse");
		expect(classifyName("LIVES_WITH").kind).toBe("partner");
		expect(humanizeName("IS_MOTHER_OF")).toBe("Mother of");
		expect(humanizeName("LIVES_WITH")).toBe("Lives with");
		expect(emphasisFor("IS_MARRIED_TO")).toBe("strong");
		expect(emphasisFor("LIVES_WITH")).toBe("weak");
		expect(emphasisFor("IS_MOTHER_OF")).toBe("normal");
	});

	it("collects relatives including siblings through a shared parent", () => {
		const r = relativesOf(graph, "tomasz");
		expect(r.parents.map((p) => p.id).sort()).toEqual(["jan", "maria"]);
		expect(r.siblings.map((p) => p.id)).toEqual(["ewa"]);
		expect(relativesOf(graph, "anna").partners.map((p) => p.id)).toEqual(["piotr"]);
		expect(relativesOf(graph, "anna").children.map((p) => p.id)).toEqual(["zofia"]);
	});

	it("groups a person's rows by relationship group", () => {
		const groups = sheetGroups(graph, "stan");
		expect(groups.map((g) => g.group)).toEqual(["BIOLOGICAL", "IN-LAW", "IRRELEVANT"]);
		expect(groups[0].rows[0]).toMatchObject({ role: "Child" });
		expect(groups[1].rows[0]).toMatchObject({ role: "Married to" });
		const zofia = sheetGroups(graph, "zofia");
		const church = zofia.find((g) => g.group === "CHURCH")!;
		expect(church.rows[0].role).toBe("Godparent");
		const bio = zofia.find((g) => g.group === "BIOLOGICAL")!;
		expect(bio.rows.map((r) => r.role).sort()).toEqual(["Father", "Mother"]);
	});
});

describe("duplicate relationships", () => {
	const rels = full.relationships;
	const types = full.relationshipNames;
	it("detects the same pair and type", () => {
		expect(isDuplicateRelationship(rels, types, { sourceNode: "jan", targetNode: "tomasz", relationshipName: "rn_father" })).toBe(true);
	});
	it("detects reversed pairs for bidirectional types", () => {
		// jan IS_MARRIED_TO maria exists; maria -> jan is the same marriage.
		expect(isDuplicateRelationship(rels, types, { sourceNode: "maria", targetNode: "jan", relationshipName: "rn_married" })).toBe(true);
	});
	it("does not treat reversed directional types as duplicates", () => {
		expect(isDuplicateRelationship(rels, types, { sourceNode: "tomasz", targetNode: "jan", relationshipName: "rn_father" })).toBe(false);
		expect(isDuplicateRelationship(rels, types, { sourceNode: "jan", targetNode: "tomasz", relationshipName: "rn_god" })).toBe(false);
	});
});
