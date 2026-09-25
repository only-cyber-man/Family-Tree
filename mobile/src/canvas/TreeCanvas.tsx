import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { cancelAnimation, Easing, runOnJS, useAnimatedStyle, useSharedValue, withDecay, withSpring, withTiming } from "react-native-reanimated";
import Svg, { Circle, ClipPath, Defs, G, Image as SvgImage, Path, Pattern, Rect, Text as SvgText } from "react-native-svg";
import {
	centerOn,
	clamp,
	easeStandard,
	fitCamera,
	isAwayFrom,
	lerpCamera,
	MAX_SCALE,
	MIN_SCALE,
	panLimits,
	rubberBand,
	zoomAt,
	type Camera,
	type Viewport,
} from "../lib/camera";
import { arrowPath, edgeGeometry, edgeMayBeVisible, edgeStyle, type Box } from "../lib/edges";
import { yearsLabel, initials, firstName } from "../lib/format";
import { focusLayout, layoutByBirthYear, DEFAULT_LAYOUT, type LayoutOptions, type Point } from "../lib/layout";
import { NODE_SIZE, selectLod, type Lod } from "../lib/lod";
import { humanizeName, relativesOf } from "../lib/relations";
import type { Visibility } from "../lib/filters";
import type { CalendarDate, Graph, Person } from "../lib/types";
import { haptics } from "../services/haptics";
import { fonts, motion } from "../theme/theme";
import { useTheme } from "../theme/useTheme";

/**
 * Overscan: the SVG is drawn this far past every viewport edge, so panning
 * reveals already-rendered content until the gesture settles and redraws.
 * (Bounded because the layer's backing store grows with its area.)
 */
const MARGIN = 240;
/** Wider columns than the web so compact cards (120 pt) never overlap at 0.45. */
export const MOBILE_LAYOUT: LayoutOptions = { ...DEFAULT_LAYOUT, columnPx: Math.max(DEFAULT_LAYOUT.columnPx, 280) };
const EASING = Easing.bezier(0.2, 0.8, 0.2, 1);
const GRID = 20;

export interface CanvasHandle {
	resetView: () => void;
	centerOn: (id: string) => void;
}

export interface TreeCanvasProps {
	graph: Graph;
	visible: Visibility;
	pictures: Record<string, string>;
	today: CalendarDate;
	selectedId: string | null;
	onSelect: (id: string | null) => void;
	onLongPress?: (id: string) => void;
	focusId: string | null;
	onRequestFocus: (id: string) => void;
	/** Space taken by overlays at the top and bottom of the canvas. */
	insets: { top: number; bottom: number };
	/** Camera resets to fit-all when this changes (e.g. switching trees). */
	treeKey: string;
	onAwayChange?: (away: boolean) => void;
}

interface Display {
	pos: Record<string, Point>;
	op: Record<string, number>;
}

function fitText(s: string, maxChars: number): string {
	return s.length <= maxChars ? s : s.slice(0, Math.max(1, maxChars - 1)).trimEnd() + "…";
}

export const TreeCanvas = forwardRef<CanvasHandle, TreeCanvasProps>(function TreeCanvas(props, ref) {
	const { graph, visible, pictures, today, selectedId, focusId, insets, treeKey } = props;
	const t = useTheme();
	const [size, setSize] = useState<{ width: number; height: number } | null>(null);
	const layout = useMemo(() => layoutByBirthYear(visible.persons, visible.edges, MOBILE_LAYOUT), [visible]);
	const viewport = useMemo<Viewport | null>(() => (size ? { ...size, insetTop: insets.top, insetBottom: insets.bottom } : null), [size, insets.top, insets.bottom]);
	const fit = useMemo(() => (viewport ? fitCamera(layout.bounds, viewport, 24) : null), [layout, viewport]);
	const [camera, setCamera] = useState<Camera | null>(null);
	const [display, setDisplay] = useState<Display | null>(null);

	// Live camera (UI thread, follows the fingers) and committed camera (what the SVG was drawn with).
	const lx = useSharedValue(0);
	const ly = useSharedValue(0);
	const lk = useSharedValue(1);
	const cx = useSharedValue(0);
	const cy = useSharedValue(0);
	const ck = useSharedValue(1);
	const rawK = useSharedValue(1);
	const minK = useSharedValue(MIN_SCALE);
	const boundsSV = useSharedValue(layout.bounds);
	const vpSV = useSharedValue<Viewport>({ width: 1, height: 1 });

	useEffect(() => {
		boundsSV.value = layout.bounds;
		if (fit) minK.value = Math.min(MIN_SCALE, fit.k);
	}, [layout, fit, boundsSV, minK]);
	useEffect(() => {
		if (viewport) vpSV.value = viewport;
	}, [viewport, vpSV]);

	const setLive = useCallback(
		(c: Camera) => {
			lx.value = c.x;
			ly.value = c.y;
			lk.value = c.k;
		},
		[lx, ly, lk],
	);
	const commit = useCallback(() => setCamera({ x: lx.value, y: ly.value, k: lk.value }), [lx, ly, lk]);
	useLayoutEffect(() => {
		if (!camera) return;
		cx.value = camera.x;
		cy.value = camera.y;
		ck.value = camera.k;
	}, [camera, cx, cy, ck]);

	// Fit-all on first layout and whenever the tree changes; a centre request
	// that arrived before the canvas was laid out (e.g. ?person= deep link)
	// takes precedence over fit-all.
	const initFor = useRef<string | null>(null);
	const preFocus = useRef<Camera | null>(null);
	const appliedFocus = useRef<string | null>(null);
	const appliedLayout = useRef<typeof layout | null>(null);
	const pendingCenter = useRef<string | null>(null);
	useEffect(() => {
		if (!fit || !viewport || initFor.current === treeKey) return;
		initFor.current = treeKey;
		const want = pendingCenter.current ? layout.positions[pendingCenter.current] : undefined;
		const start = want ? centerOn(want, Math.max(fit.k, 0.9), viewport) : fit;
		if (want) pendingCenter.current = null;
		setLive(start);
		setCamera(start);
		setDisplay(null);
		preFocus.current = null;
		appliedFocus.current = null;
		appliedLayout.current = null;
	}, [fit, viewport, treeKey, layout, setLive]);

	/** Centres on a pending request once its person is laid out. */
	const applyPendingCenter = useCallback(() => {
		const id = pendingCenter.current;
		if (!id || !viewport || initFor.current !== treeKey) return;
		const p = layout.positions[id];
		if (!p) return;
		pendingCenter.current = null;
		const cfg = { duration: motion.slow, easing: EASING };
		const c = centerOn(p, Math.max(lk.value, 0.9), viewport);
		lx.value = withTiming(c.x, cfg);
		ly.value = withTiming(c.y, cfg);
		lk.value = withTiming(c.k, cfg, (finished) => {
			if (finished) runOnJS(commit)();
		});
	}, [viewport, treeKey, layout, lx, ly, lk, commit]);
	// The person may only appear in the layout after data arrives.
	useEffect(() => {
		applyPendingCenter();
	}, [applyPendingCenter]);

	const cam = camera ?? fit;
	useEffect(() => {
		if (cam && fit) props.onAwayChange?.(isAwayFrom(cam, fit));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cam, fit]);

	const animateTo = useCallback(
		(c: Camera, duration: number) => {
			const cfg = { duration, easing: EASING };
			lx.value = withTiming(c.x, cfg);
			ly.value = withTiming(c.y, cfg);
			lk.value = withTiming(c.k, cfg, (finished) => {
				if (finished) runOnJS(commit)();
			});
		},
		[lx, ly, lk, commit],
	);

	// ---- focus transitions (JS-driven: node positions tween per frame) ----
	const raf = useRef<number | null>(null);
	const displayRef = useRef<Display | null>(null);
	displayRef.current = display;

	const runTransition = useCallback(
		(spec: { to: Display; ring: Record<string, number>; duration: number; stagger: number; camTo: Camera; onDone?: () => void }) => {
			if (raf.current) cancelAnimationFrame(raf.current);
			const from: Display = displayRef.current ?? { pos: layout.positions, op: {} };
			const camFrom: Camera = { x: lx.value, y: ly.value, k: lk.value };
			const ids = new Set([...Object.keys(layout.positions), ...Object.keys(spec.to.pos)]);
			const start = Date.now();
			const total = spec.duration + 3 * spec.stagger;
			const step = () => {
				const el = Date.now() - start;
				const pos: Record<string, Point> = {};
				const op: Record<string, number> = {};
				for (const id of ids) {
					const a = from.pos[id] ?? layout.positions[id];
					const b = spec.to.pos[id] ?? layout.positions[id];
					if (!a || !b) continue;
					const oa = from.op[id] ?? 1;
					const ob = spec.to.op[id] ?? 1;
					const e = easeStandard(clamp((el - (spec.ring[id] ?? 0) * spec.stagger) / spec.duration, 0, 1));
					pos[id] = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
					const fadeDur = ob < oa ? Math.min(200, spec.duration) : spec.duration;
					op[id] = oa + (ob - oa) * easeStandard(clamp(el / fadeDur, 0, 1));
				}
				const c = lerpCamera(camFrom, spec.camTo, easeStandard(clamp(el / spec.duration, 0, 1)));
				setLive(c);
				setCamera(c);
				setDisplay({ pos, op });
				if (el < total) raf.current = requestAnimationFrame(step);
				else {
					raf.current = null;
					spec.onDone?.();
				}
			};
			raf.current = requestAnimationFrame(step);
		},
		[layout, lx, ly, lk, setLive],
	);
	useEffect(() => () => void (raf.current && cancelAnimationFrame(raf.current)), []);

	// Re-runs when the layout / viewport arrive, so a focus requested before
	// the canvas was mounted (e.g. "Focus on tree" from another tab) applies.
	// While focused, a data change (people / relationships edited, added,
	// synced) recomputes the focus layout instead of keeping frozen positions.
	useEffect(() => {
		if (!viewport || !fit) return;
		const sameFocus = focusId === appliedFocus.current;
		if (sameFocus && (!focusId || layout === appliedLayout.current)) return;
		if (focusId && !layout.positions[focusId]) return;
		const refresh = sameFocus && !!focusId;
		appliedFocus.current = focusId;
		appliedLayout.current = layout;
		if (focusId) {
			const rel = relativesOf(graph, focusId, visible.edges);
			const only = (ps: Person[]) => ps.filter((p) => visible.personIds.has(p.id)).map((p) => p.id);
			const fl = focusLayout({ id: focusId, at: layout.positions[focusId] }, { parents: only(rel.parents), partners: only(rel.partners), children: only(rel.children) });
			const op: Record<string, number> = {};
			for (const id of Object.keys(layout.positions)) op[id] = fl.positions[id] ? 1 : 0;
			if (!preFocus.current) preFocus.current = { x: lx.value, y: ly.value, k: lk.value };
			runTransition({
				to: { pos: { ...layout.positions, ...fl.positions }, op },
				ring: refresh ? {} : fl.ring,
				duration: refresh ? motion.base : motion.focus,
				stagger: refresh ? 0 : 30,
				camTo: centerOn(fl.positions[focusId], refresh ? lk.value : 1, viewport),
				onDone: refresh ? undefined : () => haptics.success(),
			});
		} else if (displayRef.current) {
			const back = preFocus.current ?? fit;
			preFocus.current = null;
			runTransition({ to: { pos: layout.positions, op: {} }, ring: {}, duration: motion.slow, stagger: 0, camTo: back, onDone: () => setDisplay(null) });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [focusId, fit, viewport, layout]);

	// ---- LOD with a 150 ms crossfade, decided once per committed camera ----
	const lod: Lod = display ? "full" : selectLod(cam?.k ?? 1, visible.persons.length);
	const [fade, setFade] = useState(1);
	const lastLod = useRef(lod);
	useEffect(() => {
		if (lastLod.current === lod) return;
		lastLod.current = lod;
		const start = Date.now();
		let id = 0;
		const step = () => {
			const p = clamp((Date.now() - start) / motion.fast, 0, 1);
			setFade(0.35 + 0.65 * p);
			if (p < 1) id = requestAnimationFrame(step);
		};
		id = requestAnimationFrame(step);
		return () => cancelAnimationFrame(id);
	}, [lod]);

	// ---- hit testing (screen space, live camera) ----
	const positionsRef = useRef<Record<string, Point>>({});
	const hitTest = useCallback(
		(sx: number, sy: number): string | null => {
			const c = { x: lx.value, y: ly.value, k: lk.value };
			const box = NODE_SIZE[lod];
			const hw = Math.max(box.w, 44) / 2;
			const hh = Math.max(box.h, 44) / 2;
			let best: string | null = null;
			let bestD = Infinity;
			for (const [id, p] of Object.entries(positionsRef.current)) {
				if (display && (display.op[id] ?? 1) < 0.5) continue;
				const x = p.x * c.k + c.x;
				const y = p.y * c.k + c.y;
				if (Math.abs(sx - x) <= hw && Math.abs(sy - y) <= hh) {
					const d = Math.hypot(sx - x, sy - y);
					if (d < bestD) (bestD = d), (best = id);
				}
			}
			return best;
		},
		[lx, ly, lk, lod, display],
	);

	const handlers = useRef({
		tap: (_x: number, _y: number) => {},
		doubleTap: (_x: number, _y: number) => {},
		longPress: (_x: number, _y: number) => {},
	});
	handlers.current = {
		tap: (x, y) => {
			const id = hitTest(x, y);
			if (id) haptics.select();
			props.onSelect(id);
		},
		doubleTap: (x, y) => {
			const id = hitTest(x, y);
			if (id) return props.onRequestFocus(id);
			animateTo(zoomAt({ x: lx.value, y: ly.value, k: lk.value }, { x, y }, 1), 280);
		},
		longPress: (x, y) => {
			const id = hitTest(x, y);
			if (id && props.onLongPress) {
				haptics.longPress();
				props.onLongPress(id);
			}
		},
	};
	const jsTap = useCallback((x: number, y: number) => handlers.current.tap(x, y), []);
	const jsDoubleTap = useCallback((x: number, y: number) => handlers.current.doubleTap(x, y), []);
	const jsLongPress = useCallback((x: number, y: number) => handlers.current.longPress(x, y), []);
	const focusing = useSharedValue(false);
	useEffect(() => {
		focusing.value = !!display;
	}, [display, focusing]);

	const gesture = useMemo(() => {
		const pan = Gesture.Pan()
			.minDistance(4)
			.averageTouches(true)
			.onStart(() => {
				cancelAnimation(lx);
				cancelAnimation(ly);
			})
			.onChange((e) => {
				lx.value += e.changeX;
				ly.value += e.changeY;
			})
			.onEnd((e) => {
				const L = panLimits(boundsSV.value, lk.value, vpSV.value, 120);
				lx.value = withDecay({ velocity: e.velocityX, deceleration: 0.995, clamp: [Math.min(L.minX, lx.value), Math.max(L.maxX, lx.value)] }, (f) => {
					if (f) runOnJS(commit)();
				});
				ly.value = withDecay({ velocity: e.velocityY, deceleration: 0.995, clamp: [Math.min(L.minY, ly.value), Math.max(L.maxY, ly.value)] }, (f) => {
					if (f) runOnJS(commit)();
				});
			});
		const pinch = Gesture.Pinch()
			.onStart(() => {
				cancelAnimation(lk);
				rawK.value = lk.value;
			})
			.onChange((e) => {
				rawK.value *= e.scaleChange;
				const k1 = rubberBand(rawK.value, minK.value, MAX_SCALE);
				const r = k1 / lk.value;
				lx.value = e.focalX - (e.focalX - lx.value) * r;
				ly.value = e.focalY - (e.focalY - ly.value) * r;
				lk.value = k1;
			})
			.onEnd((e) => {
				const k = clamp(lk.value, minK.value, MAX_SCALE);
				if (Math.abs(k - lk.value) > 1e-4) {
					const r = k / lk.value;
					const spring = { damping: 20, stiffness: 200 };
					lx.value = withSpring(e.focalX - (e.focalX - lx.value) * r, spring);
					ly.value = withSpring(e.focalY - (e.focalY - ly.value) * r, spring);
					lk.value = withSpring(k, spring, (f) => {
						if (f) runOnJS(commit)();
					});
				} else runOnJS(commit)();
			});
		const single = Gesture.Tap()
			.maxDuration(250)
			.onEnd((e, success) => {
				if (success) runOnJS(jsTap)(e.x, e.y);
			});
		const double = Gesture.Tap()
			.numberOfTaps(2)
			.onEnd((e, success) => {
				if (success) runOnJS(jsDoubleTap)(e.x, e.y);
			});
		const long = Gesture.LongPress()
			.minDuration(400)
			.onStart((e) => {
				runOnJS(jsLongPress)(e.x, e.y);
			});
		return Gesture.Race(Gesture.Simultaneous(pan, pinch), long, Gesture.Exclusive(double, single));
	}, [lx, ly, lk, rawK, minK, boundsSV, vpSV, commit, jsTap, jsDoubleTap, jsLongPress]);

	const transformStyle = useAnimatedStyle(() => {
		const r = lk.value / ck.value;
		return {
			transform: [{ translateX: lx.value - cx.value * r }, { translateY: ly.value - cy.value * r }, { scale: r }],
		};
	});

	useImperativeHandle(
		ref,
		() => ({
			resetView: () => fit && animateTo(fit, motion.slow),
			centerOn: (id: string) => {
				// Queued until the canvas is laid out and the person is in the layout.
				pendingCenter.current = id;
				applyPendingCenter();
			},
		}),
		[fit, animateTo, applyPendingCenter],
	);

	const onLayout = (e: LayoutChangeEvent) => {
		const { width, height } = e.nativeEvent.layout;
		if (!size || size.width !== width || size.height !== height) setSize({ width, height });
	};

	// ---- render in screen space at the committed camera ----
	const W = (size?.width ?? 0) + MARGIN * 2;
	const H = (size?.height ?? 0) + MARGIN * 2;
	const positions = display?.pos ?? layout.positions;
	positionsRef.current = positions;

	let content: React.ReactNode = null;
	if (cam && size) {
		const toS = (p: Point) => ({ x: p.x * cam.k + cam.x, y: p.y * cam.k + cam.y });
		const box = NODE_SIZE[lod];
		const inView = (s: Point, pad = 0) => s.x > -MARGIN - pad && s.x < size.width + MARGIN + pad && s.y > -MARGIN - pad && s.y < size.height + MARGIN + pad;
		const screen: Record<string, Point> = {};
		for (const [id, p] of Object.entries(positions)) screen[id] = toS(p);
		const opacityOf = (id: string) => (display ? (display.op[id] ?? 1) : 1);

		const bands = display
			? null
			: layout.bands.map((b) => {
					const y0 = b.y0 * cam.k + cam.y;
					const y1 = b.y1 * cam.k + cam.y;
					if (y1 < -MARGIN || y0 > size.height + MARGIN) return null;
					return (
						<G key={b.index}>
							{b.shaded ? <Rect x={-MARGIN} y={y0} width={W} height={y1 - y0} fill={t.c.band} /> : null}
							<SvgText x={12} y={Math.max(y0, -MARGIN) + 17} fontSize={11} fontFamily={fonts.body[700]} fill={t.c.bandLabel}>
								{b.label}
							</SvgText>
						</G>
					);
				});

		const edgeEls: React.ReactNode[] = [];
		const labelEls: React.ReactNode[] = [];
		for (const e of visible.edges) {
			const a = screen[e.source];
			const b = screen[e.target];
			if (!a || !b) continue;
			const op = Math.min(opacityOf(e.source), opacityOf(e.target));
			if (op < 0.02) continue;
			if (!edgeMayBeVisible(a, b, Math.max(box.w, box.h), { minX: -MARGIN, minY: -MARGIN, maxX: size.width + MARGIN, maxY: size.height + MARGIN })) continue;
			const sel = selectedId != null && (e.source === selectedId || e.target === selectedId);
			const st = edgeStyle(e, t.scheme, lod, false);
			const g = edgeGeometry({ ...a, w: box.w, h: box.h } as Box, { ...b, w: box.w, h: box.h } as Box, !e.bidirectional, lod === "dot");
			edgeEls.push(
				<G key={e.id} opacity={op}>
					<Path d={g.d} stroke={st.color} strokeWidth={st.width} strokeDasharray={st.dash} strokeLinecap="round" fill="none" />
					{st.arrow ? <Path d={arrowPath(g.end, g.angle, 7 * 1)} fill={st.color} /> : null}
				</G>,
			);
			if (sel && lod === "full" && !display) {
				const label = humanizeName(e.name);
				const w = label.length * 5.6 + 14;
				labelEls.push(
					<G key={`l${e.id}`}>
						<Rect x={g.mid.x - w / 2} y={g.mid.y - 9} width={w} height={18} rx={9} fill={t.c.labelBg} stroke={t.c.border} strokeWidth={1} />
						<SvgText x={g.mid.x} y={g.mid.y + 3.5} fontSize={10} fontFamily={fonts.body[600]} fill={t.scheme === "dark" ? "#B9B3A5" : "#4A524C"} textAnchor="middle">
							{label}
						</SvgText>
					</G>,
				);
			}
		}

		const nodeEls: React.ReactNode[] = [];
		const clipDefs: React.ReactNode[] = [];
		const ordered = [...visible.persons].sort((p, q) => (p.id === selectedId ? 1 : q.id === selectedId ? -1 : 0));
		for (const p of ordered) {
			const s = screen[p.id];
			if (!s || !inView(s, 80)) continue;
			const op = opacityOf(p.id);
			if (op < 0.02) continue;
			const sel = p.id === selectedId;
			const nc = t.node[p.gender];
			const deceased = !!p.death;
			if (lod === "dot") {
				const r = sel ? NODE_SIZE.dot.rSelected : NODE_SIZE.dot.r;
				nodeEls.push(
					<G key={p.id} opacity={op}>
						<Circle
							cx={s.x}
							cy={s.y}
							r={r}
							fill={nc.border}
							stroke={sel ? nc.selectedBorder : undefined}
							strokeWidth={sel ? 3 : 0}
							opacity={deceased ? 0.8 : 1}
						/>
						<SvgText x={s.x} y={s.y + 3} fontSize={8} fontFamily={fonts.body[700]} fill={t.c.onAvatar} textAnchor="middle">
							{initials(p.name)}
						</SvgText>
					</G>,
				);
				continue;
			}
			const w = box.w;
			const h = box.h;
			const x = s.x - w / 2;
			const y = s.y - h / 2;
			const rx = lod === "full" ? 12 : 10;
			const years = yearsLabel(p, today);
			const card = (
				<>
					{sel ? <Rect x={x} y={y + 4} width={w} height={h} rx={rx} fill="#000" opacity={t.scheme === "dark" ? 0.35 : 0.1} /> : null}
					<Rect
						x={x}
						y={y}
						width={w}
						height={h}
						rx={rx}
						fill={nc.fill}
						stroke={sel ? nc.selectedBorder : nc.border}
						strokeWidth={sel ? 3 : 2}
					/>
				</>
			);
			if (lod === "compact") {
				nodeEls.push(
					<G key={p.id} opacity={op}>
						{card}
						<SvgText x={x + 10} y={y + 23} fontSize={12} fontFamily={fonts.body[700]} fill={nc.text}>
							{fitText(p.name, 15)}
						</SvgText>
						<SvgText x={x + 10} y={y + 40} fontSize={11} fontFamily={fonts.body[500]} fill={t.c.ink2}>
							{years}
						</SvgText>
					</G>,
				);
				continue;
			}
			const av = 40;
			const ax = x + 12 + av / 2;
			const uri = pictures[p.id];
			if (uri) {
				clipDefs.push(
					<ClipPath key={`c${p.id}`} id={`clip-${p.id}`}>
						<Circle cx={ax} cy={s.y} r={av / 2} />
					</ClipPath>,
				);
			}
			const name = p.name.length <= 12 ? p.name : fitText(firstName(p.name), 12);
			nodeEls.push(
				<G key={p.id} opacity={op}>
					{card}
					<G opacity={deceased ? 0.75 : 1}>
						<Circle cx={ax} cy={s.y} r={av / 2} fill={nc.border} />
						{uri ? (
							<SvgImage href={{ uri }} x={ax - av / 2} y={s.y - av / 2} width={av} height={av} preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-${p.id})`} />
						) : (
							<SvgText x={ax} y={s.y + 4.5} fontSize={13} fontFamily={fonts.body[700]} fill={t.c.onAvatar} textAnchor="middle">
								{initials(p.name)}
							</SvgText>
						)}
					</G>
					<SvgText x={x + 62} y={s.y - 3} fontSize={13} fontFamily={fonts.body[700]} fill={nc.text}>
						{name}
					</SvgText>
					<SvgText x={x + 62} y={s.y + 13} fontSize={11} fontFamily={fonts.body[500]} fill={t.c.ink2}>
						{years}
					</SvgText>
				</G>,
			);
		}

		const gx = ((cam.x % GRID) + GRID) % GRID;
		const gy = ((cam.y % GRID) + GRID) % GRID;
		content = (
			<Svg width={W} height={H}>
				<Defs>
					<Pattern id="grid" patternUnits="userSpaceOnUse" x={gx + MARGIN} y={gy + MARGIN} width={GRID} height={GRID}>
						<Circle cx={1} cy={1} r={1} fill={t.c.grid} />
					</Pattern>
					{clipDefs}
				</Defs>
				<Rect x={0} y={0} width={W} height={H} fill="url(#grid)" />
				<G transform={`translate(${MARGIN}, ${MARGIN})`}>
					{bands}
					<G opacity={fade}>
						{edgeEls}
						{nodeEls}
						{labelEls}
					</G>
				</G>
			</Svg>
		);
	}

	return (
		<GestureDetector gesture={gesture}>
			<View
				style={[styles.fill, { backgroundColor: t.c.canvasBg }]}
				onLayout={onLayout}
				accessible
				accessibilityLabel={`Family tree with ${visible.persons.length} people. Use search to find someone.`}
			>
				<Animated.View
					style={[{ position: "absolute", left: -MARGIN, top: -MARGIN, width: W, height: H, transformOrigin: [MARGIN, MARGIN, 0] }, transformStyle]}
				>
					{content}
				</Animated.View>
			</View>
		</GestureDetector>
	);
});

const styles = StyleSheet.create({ fill: { flex: 1, overflow: "hidden" } });
