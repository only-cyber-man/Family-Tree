import type { Edge, Person } from "./types";

// Canvas helpers for generation bands and the opening view.

export type BandLabelMode = "full" | "short" | "none";

export interface BandLabelPlacement {
	/** Baseline y of the label on screen. */
	y: number;
	mode: BandLabelMode;
}

/** On-screen band height below which the label is abbreviated / hidden. */
export const BAND_LABEL_FULL_MIN = 34;
export const BAND_LABEL_SHORT_MIN = 18;
const PAD_TOP = 14;
const PAD_BOTTOM = 4;

/**
 * One label per band, always inside its own band: pinned to the top of the
 * visible area while the band is scrolled partly above it, but never pushed
 * out of the band (so labels of consecutive bands cannot stack). Bands too
 * short on screen get an abbreviated label or none.
 */
export function placeBandLabel(y0: number, y1: number, visibleTop: number): BandLabelPlacement {
	const h = y1 - y0;
	const mode: BandLabelMode = h >= BAND_LABEL_FULL_MIN ? "full" : h >= BAND_LABEL_SHORT_MIN ? "short" : "none";
	const pinned = Math.max(y0, visibleTop) + PAD_TOP;
	const y = Math.min(pinned, y1 - PAD_BOTTOM);
	// Not enough of the band left on screen to hold the label.
	if (y1 - Math.max(y0, visibleTop) < PAD_TOP) return { y, mode: "none" };
	return { y, mode };
}

/**
 * Who the Tree tab opens on: "me" if known, else the most-connected person;
 * ties go to the person closest to the middle generation (median birth year).
 */
export function pickHomePerson(persons: Person[], edges: Edge[], meId?: string | null): Person | null {
	if (!persons.length) return null;
	if (meId) {
		const me = persons.find((p) => p.id === meId);
		if (me) return me;
	}
	const degree = new Map<string, number>();
	for (const e of edges) {
		degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
		degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
	}
	const years = persons.map((p) => p.birth?.year).filter((y): y is number => y != null).sort((a, b) => a - b);
	const median = years.length ? years[Math.floor(years.length / 2)] : 0;
	const dist = (p: Person) => (p.birth ? Math.abs(p.birth.year - median) : Infinity);
	return [...persons].sort((a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0) || dist(a) - dist(b) || a.name.localeCompare(b.name))[0];
}

/** Opening zoom: fit-all when the whole tree fits at a readable (compact) scale, else the compact scale. */
export const OPENING_SCALE = 0.6;
export function openingScale(fitScale: number, compactMin: number): number {
	return fitScale >= compactMin ? fitScale : Math.max(OPENING_SCALE, compactMin);
}
