import {
	personPanelMode,
	breakpoint,
	cappedWidth,
	columnCount,
	contentWidth,
	FORM_MAX,
	navMode,
	orientationPolicy,
	RAIL_WIDTH,
	sheetPresentation,
	sideBySideHero,
	sidePanelWidth,
	splitPanes,
} from "../responsive";

// Reference devices (dp): phone 412×915, 7" tablet 600×960, 10" tablet 1280×800, iPad 1024×1366.
describe("breakpoints", () => {
	it("classifies windows by width, so rotation and split-screen re-classify", () => {
		expect(breakpoint(412)).toBe("phone");
		expect(breakpoint(600)).toBe("tablet");
		expect(breakpoint(960)).toBe("wide"); // 7" landscape
		expect(breakpoint(800)).toBe("tablet"); // 10" portrait
		expect(breakpoint(1280)).toBe("wide");
		expect(breakpoint(507)).toBe("phone"); // 10" in 40% split-screen
	});

	it("locks phones to portrait, lets tablets rotate", () => {
		expect(orientationPolicy(412, 915)).toBe("portrait");
		expect(orientationPolicy(915, 412)).toBe("portrait");
		expect(orientationPolicy(600, 960)).toBe("any");
		expect(orientationPolicy(1280, 800)).toBe("any");
	});

	it("uses a rail on tablets and keeps content unclipped", () => {
		expect(navMode("phone")).toBe("tabs");
		expect(navMode("tablet")).toBe("rail");
		expect(contentWidth(600, "tablet")).toBe(600 - RAIL_WIDTH);
		expect(contentWidth(412, "phone")).toBe(412);
	});

	it("sizes the side panel 360–400 dp", () => {
		expect(sidePanelWidth(600)).toBe(360);
		expect(sidePanelWidth(1280)).toBe(400);
		expect(sidePanelWidth(1180)).toBe(378);
	});

	it("presents sheets as bottom sheets on phones and cards / drawers on tablets", () => {
		expect(sheetPresentation("phone", "center")).toBe("bottom");
		expect(sheetPresentation("tablet", "center")).toBe("center");
		expect(sheetPresentation("wide", "side")).toBe("side");
	});

	it("splits master–detail only on wide windows", () => {
		expect(splitPanes("tablet")).toBe(false);
		expect(splitPanes("wide")).toBe(true);
	});

	it("computes columns and capped widths", () => {
		expect(columnCount(508, 320)).toBe(1);
		expect(columnCount(1188, 320)).toBe(3);
		expect(columnCount(700, 320)).toBe(2);
		expect(columnCount(-5, 320)).toBe(1);
		expect(cappedWidth(508, FORM_MAX)).toBe(468);
		expect(cappedWidth(1188, FORM_MAX)).toBe(FORM_MAX);
	});

	it("keeps the person panel only where the canvas stays usable", () => {
		expect(personPanelMode(412)).toBe("sheet");
		expect(personPanelMode(600)).toBe("sheet"); // 7" portrait: 508 dp content
		expect(personPanelMode(800)).toBe("sheet"); // 10" portrait: 708 - 360 < 480
		expect(personPanelMode(960)).toBe("panel"); // 7" landscape
		expect(personPanelMode(1280)).toBe("panel"); // 10" landscape
	});

	it("puts the hero beside the form only in roomy landscape", () => {
		expect(sideBySideHero(1280, 800)).toBe(true);
		expect(sideBySideHero(800, 1280)).toBe(false);
		expect(sideBySideHero(600, 960)).toBe(false);
	});
});
