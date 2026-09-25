import { bloodTerm, describeKinship, relationshipPath, stepLabel } from "../path";
import { graph } from "./fixtures";

const kin = (a: string, b: string) => {
	const p = relationshipPath(graph, a, b);
	if (!p) return null;
	return describeKinship(graph, p.steps);
};

describe("relationship path", () => {
	it("finds the shortest family path and names it", () => {
		const p = relationshipPath(graph, "tomasz", "anna")!;
		expect(p.familyOnly).toBe(true);
		expect(p.steps.map((s) => s.to)).toEqual(["maria", "bron", "andrzej", "anna"]);
		const k = describeKinship(graph, p.steps);
		expect(k.term).toBe("cousin");
		expect(k.title).toBe("Your cousin");
		expect(k.chain).toBe("your mother's brother's daughter");
		expect(p.steps.map((s) => stepLabel(graph, s))).toEqual(["child of", "child of", "mother of", "father of"]);
	});

	it("names direct and in-law relations", () => {
		expect(kin("tomasz", "maria")?.term).toBe("mother");
		expect(kin("tomasz", "stan")?.term).toBe("grandfather");
		expect(kin("tomasz", "ewa")?.term).toBe("sister");
		expect(kin("tomasz", "andrzej")?.term).toBe("uncle");
		expect(kin("tomasz", "zofia")?.term).toBe("cousin once removed");
		expect(kin("jan", "maria")?.term).toBe("wife");
		expect(kin("maria", "stan")?.term).toBe("father-in-law");
		expect(kin("andrzej", "piotr")?.term).toBe("son-in-law");
		expect(kin("bron", "zofia")?.term).toBe("great-granddaughter");
	});

	it("falls back to any link when family links do not connect", () => {
		const p = relationshipPath(graph, "jan", "roman")!;
		expect(p.familyOnly).toBe(false);
		expect(describeKinship(graph, p.steps).term).toBeNull();
		expect(describeKinship(graph, p.steps).chain).toBe("your father's friend");
	});

	it("returns null for unconnected people", () => {
		expect(relationshipPath({ ...graph, edges: [] }, "jan", "anna")).toBeNull();
	});

	it("builds cousin terms", () => {
		expect(bloodTerm(3, 3, "male")).toBe("second cousin");
		expect(bloodTerm(2, 4, "female")).toBe("cousin twice removed");
		expect(bloodTerm(3, 1, "female")).toBe("great-aunt");
		expect(bloodTerm(1, 3, "male")).toBe("grandnephew");
		expect(bloodTerm(4, 0, "male")).toBe("great-great-grandfather");
	});
});
