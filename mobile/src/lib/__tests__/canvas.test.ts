import { clamp, fitCamera, isAwayFrom, panLimits, rubberBand, screenToWorld, worldToScreen, zoomAt, easeStandard, visibleWorld } from "../camera";
import { arrowPath, edgeGeometry, edgeMayBeVisible, edgeStyle } from "../edges";
import { DEFAULT_LAYOUT, focusLayout, layoutByBirthYear } from "../layout";
import { selectLod } from "../lod";
import { graph } from "./fixtures";

describe("layout by birth year", () => {
	const layout = layoutByBirthYear(graph.persons, graph.edges);

	it("places everyone, older people higher", () => {
		expect(Object.keys(layout.positions)).toHaveLength(graph.persons.length);
		expect(layout.positions.jozef.y).toBeLessThan(layout.positions.jan.y);
		expect(layout.positions.jan.y).toBeLessThan(layout.positions.tomasz.y);
		expect(layout.positions.tomasz.y).toBeLessThan(layout.positions.zofia.y);
	});

	it("uses 20-year bands with 8 px per year and 200 px columns", () => {
		expect(layout.firstYear).toBe(1900);
		expect(layout.bands[0]).toMatchObject({ startYear: 1900, y0: 0, y1: 160, label: "1900s", shaded: true });
		expect(layout.bands[1].shaded).toBe(false);
		expect(layout.positions.jan.y).toBeCloseTo((1948 + 3 / 12 + 19 / 365 - 1900) * 8, 5);
		for (const p of Object.values(layout.positions)) expect(Math.abs(p.x % 200)).toBe(0);
	});

	it("never stacks two cards in one column closer than rowGap, even across bands", () => {
		const assertNoOverlap = (positions: Record<string, { x: number; y: number }>) => {
			const pts = Object.entries(positions);
			for (let i = 0; i < pts.length; i++)
				for (let j = i + 1; j < pts.length; j++) {
					const [, a] = pts[i];
					const [, b] = pts[j];
					if (a.x === b.x) expect(Math.abs(a.y - b.y)).toBeGreaterThanOrEqual(DEFAULT_LAYOUT.rowGap);
					else expect(Math.abs(a.x - b.x)).toBeGreaterThanOrEqual(DEFAULT_LAYOUT.columnPx);
				}
		};
		assertNoOverlap(layout.positions);
		// 1978 and 1982 sit in different 20-year bands but only 32 px apart.
		const p = (id: string, y: number) => ({ id, name: id, gender: "male" as const, birth: { year: y, month: 6, day: 1 }, death: null });
		const pair = layoutByBirthYear([p("a", 1978), p("b", 1982)], []);
		expect(pair.positions.a.x).not.toBe(pair.positions.b.x);
		// A dense random-ish population stays overlap-free.
		const many = Array.from({ length: 60 }, (_, i) => p(`p${i}`, 1900 + ((i * 37) % 110)));
		assertNoOverlap(layoutByBirthYear(many, []).positions);
	});

	it("keeps partners next to each other", () => {
		expect(Math.abs(layout.positions.jan.x - layout.positions.maria.x)).toBe(200);
		expect(Math.abs(layout.positions.anna.x - layout.positions.piotr.x)).toBe(200);
	});

	it("computes a focus layout around one person", () => {
		const f = focusLayout({ id: "anna", at: { x: 0, y: 0 } }, { parents: ["andrzej"], partners: ["piotr"], children: ["zofia"] });
		expect(f.positions.andrzej).toEqual({ x: 0, y: -190 });
		expect(f.positions.piotr).toEqual({ x: 170, y: 0 });
		expect(f.positions.zofia).toEqual({ x: 0, y: 220 });
		expect(f.ring).toEqual({ anna: 0, piotr: 1, andrzej: 2, zofia: 3 });
		const two = focusLayout({ id: "tomasz", at: { x: 100, y: 0 } }, { parents: ["jan", "maria"], partners: [], children: [] });
		expect(two.positions.jan.x).toBe(19);
		expect(two.positions.maria.x).toBe(181);
	});
});

describe("level of detail", () => {
	it("follows tokens.mobile.zoomLOD", () => {
		expect(selectLod(0.3, 10)).toBe("dot");
		expect(selectLod(0.45, 10)).toBe("compact");
		expect(selectLod(0.89, 10)).toBe("compact");
		expect(selectLod(0.9, 10)).toBe("full");
		expect(selectLod(2, 151)).toBe("dot");
	});
});

describe("camera", () => {
	const vp = { width: 400, height: 800 };

	it("round-trips world and screen coordinates", () => {
		const c = { x: 10, y: 20, k: 2 };
		expect(screenToWorld(c, worldToScreen(c, { x: 5, y: 7 }))).toEqual({ x: 5, y: 7 });
	});

	it("zooms around a focal point", () => {
		const c = zoomAt({ x: 0, y: 0, k: 1 }, { x: 100, y: 100 }, 2);
		expect(worldToScreen(c, { x: 100, y: 100 })).toEqual({ x: 100, y: 100 });
		expect(c.k).toBe(2);
	});

	it("fits content without zooming past 1", () => {
		const c = fitCamera({ minX: -1000, maxX: 1000, minY: 0, maxY: 500 }, vp, 20);
		expect(c.k).toBeCloseTo(360 / 2000);
		expect(worldToScreen(c, { x: 0, y: 250 }).x).toBeCloseTo(200);
		expect(fitCamera({ minX: 0, maxX: 10, minY: 0, maxY: 10 }, vp).k).toBe(1);
		expect(isAwayFrom(c, c)).toBe(false);
		expect(isAwayFrom({ ...c, x: c.x + 50 }, c)).toBe(true);
	});

	it("clamps and rubber-bands", () => {
		expect(clamp(5, 0, 3)).toBe(3);
		expect(rubberBand(1)).toBe(1);
		expect(rubberBand(10)).toBeCloseTo(3.3);
		expect(rubberBand(0.1)).toBeCloseTo(0.225);
		const l = panLimits({ minX: 0, maxX: 100, minY: 0, maxY: 100 }, 1, vp);
		expect(l.minX).toBeLessThanOrEqual(l.maxX);
	});

	it("eases with the standard curve", () => {
		expect(easeStandard(0)).toBe(0);
		expect(easeStandard(1)).toBe(1);
		expect(easeStandard(0.5)).toBeGreaterThan(0.8);
	});

	it("computes the visible world with margin", () => {
		const b = visibleWorld({ x: 0, y: 0, k: 1 }, vp, 200);
		expect(b).toEqual({ minX: -200, minY: -200, maxX: 600, maxY: 1000 });
	});
});

describe("edges", () => {
	it("styles by group and emphasis", () => {
		expect(edgeStyle({ group: "BIOLOGICAL", name: "IS_MOTHER_OF", bidirectional: false }, "light", "full", false)).toEqual({ color: "#2F5D46", width: 2.5, dash: undefined, arrow: true });
		expect(edgeStyle({ group: "IN-LAW", name: "IS_MARRIED_TO", bidirectional: true }, "dark", "full", false)).toEqual({ color: "#E09A5F", width: 4, dash: undefined, arrow: false });
		expect(edgeStyle({ group: "IN-LAW", name: "LIVES_WITH", bidirectional: true }, "light", "full", false).dash).toEqual([2, 6]);
		const dot = edgeStyle({ group: "BIOLOGICAL", name: "IS_MOTHER_OF", bidirectional: false }, "light", "dot", false);
		expect(dot.width).toBeCloseTo(1.5);
		expect(dot.arrow).toBe(false);
		expect(edgeStyle({ group: "CHURCH", name: "IS_GODPARENT_OF", bidirectional: false }, "light", "full", true)).toMatchObject({ color: "#B5652B", width: 3 });
	});

	it("draws directional edges bottom to top and bidirectional ones side to side", () => {
		const a = { x: 0, y: 0, w: 150, h: 70 };
		const b = { x: 100, y: 300, w: 150, h: 70 };
		const g = edgeGeometry(a, b, true, false);
		expect(g.d).toBe("M0 35C0 150 100 150 100 265");
		expect(g.end).toEqual({ x: 100, y: 265 });
		const side = edgeGeometry(a, { x: 300, y: 10, w: 150, h: 70 }, false, false);
		expect(side.d).toBe("M75 0L225 10");
		expect(arrowPath({ x: 0, y: 0 }, Math.PI / 2, 7)).toBe("M0 0L-3.5 -7L3.5 -7Z");
	});
});

describe("edge culling", () => {
	const view = { minX: 0, minY: 0, maxX: 400, maxY: 800 };
	it("keeps an edge that crosses the viewport with both ends off-screen", () => {
		expect(edgeMayBeVisible({ x: 200, y: -500 }, { x: 200, y: 1500 }, 35, view)).toBe(true);
		expect(edgeMayBeVisible({ x: -300, y: 400 }, { x: 900, y: 400 }, 35, view)).toBe(true);
	});
	it("drops edges entirely outside", () => {
		expect(edgeMayBeVisible({ x: -500, y: -500 }, { x: -300, y: 2000 }, 35, view)).toBe(false);
		expect(edgeMayBeVisible({ x: 500, y: 900 }, { x: 900, y: 1200 }, 35, view)).toBe(false);
	});
	it("counts the card half-size as padding", () => {
		expect(edgeMayBeVisible({ x: -30, y: 100 }, { x: -60, y: 200 }, 35, view)).toBe(true);
	});
});
