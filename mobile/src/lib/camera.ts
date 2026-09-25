import type { Bounds, Point } from "./layout";

// Camera maps world to screen: screen = world * k + (x, y).

export interface Camera {
	x: number;
	y: number;
	k: number;
}

export interface Viewport {
	width: number;
	height: number;
	/** Space covered by overlays (header, tab bar) to keep content clear of. */
	insetTop?: number;
	insetBottom?: number;
}

export const MIN_SCALE = 0.25;
export const MAX_SCALE = 3;

export function clamp(v: number, lo: number, hi: number): number {
	"worklet";
	return Math.min(hi, Math.max(lo, v));
}

/** Allows 10% past the limits while a pinch is in progress. */
export function rubberBand(k: number, lo = MIN_SCALE, hi = MAX_SCALE, factor = 0.1): number {
	"worklet";
	if (k < lo) return Math.max(lo * (1 - factor), lo - (lo - k) * 0.5);
	if (k > hi) return Math.min(hi * (1 + factor), hi + (k - hi) * 0.5);
	return k;
}

export function worldToScreen(c: Camera, p: Point): Point {
	return { x: p.x * c.k + c.x, y: p.y * c.k + c.y };
}

export function screenToWorld(c: Camera, p: Point): Point {
	return { x: (p.x - c.x) / c.k, y: (p.y - c.y) / c.k };
}

/** New camera with scale k keeping the focal screen point fixed. */
export function zoomAt(c: Camera, focal: Point, k: number): Camera {
	const w = screenToWorld(c, focal);
	return { k, x: focal.x - w.x * k, y: focal.y - w.y * k };
}

export function centerOn(world: Point, k: number, vp: Viewport): Camera {
	const top = vp.insetTop ?? 0;
	const bottom = vp.insetBottom ?? 0;
	const cy = top + (vp.height - top - bottom) / 2;
	return { k, x: vp.width / 2 - world.x * k, y: cy - world.y * k };
}

/** Smallest scale "fit all" may use for very wide trees (pinch allows down to min(fit, MIN_SCALE)). */
export const MIN_FIT_SCALE = 0.05;

/** Fit all content, never zooming in past 1. */
export function fitCamera(b: Bounds, vp: Viewport, padding = 24, maxK = 1): Camera {
	const top = vp.insetTop ?? 0;
	const bottom = vp.insetBottom ?? 0;
	const w = Math.max(1, b.maxX - b.minX);
	const h = Math.max(1, b.maxY - b.minY);
	const availW = Math.max(1, vp.width - padding * 2);
	const availH = Math.max(1, vp.height - top - bottom - padding * 2);
	const k = clamp(Math.min(availW / w, availH / h, maxK), MIN_FIT_SCALE, MAX_SCALE);
	return centerOn({ x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 }, k, vp);
}

/** Translation limits so content stays within reach: bounds + slack. */
export function panLimits(b: Bounds, k: number, vp: Viewport, slack = 120) {
	"worklet";
	// Content right edge must stay right of `slack`, left edge left of width - slack.
	const minX = slack - b.maxX * k;
	const maxX = vp.width - slack - b.minX * k;
	const minY = slack - b.maxY * k;
	const maxY = vp.height - slack - b.minY * k;
	return { minX: Math.min(minX, maxX), maxX: Math.max(minX, maxX), minY: Math.min(minY, maxY), maxY: Math.max(minY, maxY) };
}

/** "Reset view" shows when scale differs from fit or the offset exceeds 40 pt. */
export function isAwayFrom(c: Camera, fit: Camera, offset = 40): boolean {
	return Math.abs(c.k - fit.k) > 0.01 || Math.hypot(c.x - fit.x, c.y - fit.y) > offset;
}

export function lerpCamera(a: Camera, b: Camera, t: number): Camera {
	return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, k: a.k + (b.k - a.k) * t };
}

/** Visible world rectangle, grown by `margin` screen points. */
export function visibleWorld(c: Camera, vp: Viewport, margin = 200): Bounds {
	const a = screenToWorld(c, { x: -margin, y: -margin });
	const b = screenToWorld(c, { x: vp.width + margin, y: vp.height + margin });
	return { minX: a.x, minY: a.y, maxX: b.x, maxY: b.y };
}

/** cubic-bezier(0.2, 0.8, 0.2, 1), the one easing used everywhere. */
export function easeStandard(t: number): number {
	const x1 = 0.2, y1 = 0.8, x2 = 0.2, y2 = 1;
	if (t <= 0) return 0;
	if (t >= 1) return 1;
	// Solve x(s) = t with Newton iterations, then evaluate y(s).
	let s = t;
	for (let i = 0; i < 8; i++) {
		const x = bez(s, x1, x2) - t;
		const dx = bezD(s, x1, x2);
		if (Math.abs(x) < 1e-5 || dx === 0) break;
		s -= x / dx;
	}
	return bez(clamp(s, 0, 1), y1, y2);
}

function bez(s: number, p1: number, p2: number) {
	const u = 1 - s;
	return 3 * u * u * s * p1 + 3 * u * s * s * p2 + s * s * s;
}

function bezD(s: number, p1: number, p2: number) {
	const u = 1 - s;
	return 3 * u * u * p1 + 6 * u * s * (p2 - p1) + 3 * s * s * (1 - p2);
}
