import { BAND_LABEL_FULL_MIN, openingScale, pickHomePerson, placeBandLabel } from "../bands";
import { graph } from "./fixtures";

describe("band labels", () => {
	it("keeps each label inside its own band, so consecutive labels never stack", () => {
		// Three 40 pt bands, the first two scrolled above the visible top (0).
		const bands = [
			[-80, -40],
			[-40, 0],
			[0, 40],
			[40, 80],
		].map(([a, b]) => placeBandLabel(a, b, 0));
		expect(bands[0].mode).toBe("none");
		expect(bands[1].mode).toBe("none");
		expect(bands[2]).toEqual({ y: 14, mode: "full" });
		expect(bands[3]).toEqual({ y: 54, mode: "full" });
		const shown = bands.filter((b) => b.mode !== "none").map((b) => b.y);
		for (let i = 1; i < shown.length; i++) expect(shown[i] - shown[i - 1]).toBeGreaterThanOrEqual(BAND_LABEL_FULL_MIN);
	});

	it("pins to the visible top while the band is partly above it, but not past the band's end", () => {
		expect(placeBandLabel(-100, 60, 0)).toEqual({ y: 14, mode: "full" });
		expect(placeBandLabel(-100, 10, 0).mode).toBe("none");
		expect(placeBandLabel(-100, 16, 0)).toEqual({ y: 12, mode: "full" });
	});

	it("abbreviates or hides labels of short bands", () => {
		expect(placeBandLabel(100, 125, 0).mode).toBe("short");
		expect(placeBandLabel(100, 110, 0).mode).toBe("none");
	});
});

describe("opening view", () => {
	it("opens on me when known", () => {
		expect(pickHomePerson(graph.persons, graph.edges, "zofia")?.id).toBe("zofia");
	});
	it("otherwise on the most-connected person, ties to the middle generation", () => {
		// Maria: 2 children, mother + father, married = 5 links; Anna and Stanisław have fewer.
		expect(pickHomePerson(graph.persons, graph.edges, null)?.id).toBe("maria");
		expect(pickHomePerson(graph.persons, [], "nobody")?.birth?.year).toBe(1954); // median of the 13 birth years
	});
	it("uses fit-all only when it is already readable", () => {
		expect(openingScale(0.2, 0.45)).toBe(0.6);
		expect(openingScale(0.8, 0.45)).toBe(0.8);
	});
});
