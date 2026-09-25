// Pure layout rules for phones and tablets. Breakpoints use the *window*
// width in dp (so split-screen and rotation are handled); the orientation
// lock uses the device's smallest screen width (like Android's sw600dp).

export type Breakpoint = "phone" | "tablet" | "wide";

export const TABLET_MIN = 600;
export const WIDE_MIN = 900;

/** Left navigation rail on tablets. */
export const RAIL_WIDTH = 92;
/** Centred cards for forms (add person, sign in, invite…). */
export const FORM_MAX = 560;
/** Reading width for settings-like pages. */
export const READING_MAX = 640;
/** Single-column lists on tablets that are not wide. */
export const LIST_MAX = 720;

export function breakpoint(windowWidth: number): Breakpoint {
	if (windowWidth >= WIDE_MIN) return "wide";
	if (windowWidth >= TABLET_MIN) return "tablet";
	return "phone";
}

/** A tablet by hardware (not by current window), for the orientation policy. */
export function isTabletDevice(screenWidth: number, screenHeight: number): boolean {
	return Math.min(screenWidth, screenHeight) >= TABLET_MIN;
}

/** Phones stay portrait; tablets rotate freely. */
export function orientationPolicy(screenWidth: number, screenHeight: number): "portrait" | "any" {
	return isTabletDevice(screenWidth, screenHeight) ? "any" : "portrait";
}

export type NavMode = "tabs" | "rail";
export function navMode(bp: Breakpoint): NavMode {
	return bp === "phone" ? "tabs" : "rail";
}

/** Width available to screens once the rail takes its share. */
export function contentWidth(windowWidth: number, bp: Breakpoint): number {
	return navMode(bp) === "rail" ? Math.max(0, windowWidth - RAIL_WIDTH) : windowWidth;
}

/** Right-hand person / filters panel: ~32% of the window, 360–400 dp. */
export function sidePanelWidth(windowWidth: number): number {
	return Math.round(Math.min(400, Math.max(360, windowWidth * 0.32)));
}

/** How a route sheet is presented: bottom sheet on phones, centred card or right drawer on tablets. */
export type SheetPresentation = "bottom" | "center" | "side";
export function sheetPresentation(bp: Breakpoint, preferred: "center" | "side"): SheetPresentation {
	return bp === "phone" ? "bottom" : preferred;
}

/** Master–detail only when both panes get a usable width. */
export function splitPanes(bp: Breakpoint): boolean {
	return bp === "wide";
}

/** Number of equal columns of at least `minCol` dp that fit (1..max). */
export function columnCount(available: number, minCol: number, gap = 16, max = 3): number {
	if (available <= 0) return 1;
	return Math.max(1, Math.min(max, Math.floor((available + gap) / (minCol + gap))));
}

/** Width of a centred block: the available width, capped at `max`, minus side padding. */
export function cappedWidth(available: number, max: number, padding = 20): number {
	return Math.max(0, Math.min(available - padding * 2, max));
}

/** Minimum canvas width left of the persistent person panel. */
export const MIN_CANVAS_BESIDE_PANEL = 480;

/**
 * Tree tab: a persistent right panel only when the canvas keeps a usable
 * width beside it; otherwise the person opens in the bottom sheet.
 */
export function personPanelMode(windowWidth: number): "panel" | "sheet" {
	const bp = breakpoint(windowWidth);
	if (bp === "phone") return "sheet";
	return contentWidth(windowWidth, bp) - sidePanelWidth(windowWidth) >= MIN_CANVAS_BESIDE_PANEL ? "panel" : "sheet";
}

/** Illustration beside the form (onboarding / sign in) only in roomy landscape. */
export function sideBySideHero(windowWidth: number, windowHeight: number): boolean {
	return windowWidth >= WIDE_MIN && windowWidth > windowHeight;
}
