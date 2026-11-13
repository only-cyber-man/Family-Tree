"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pb } from "@/lib/data";
import { initials } from "@/lib/people";
import type { Stain, StainPerson } from "@/lib/stains";
import { FitIcon, MinusIcon, PlusIcon } from "@/components/Icons";
import tv from "@/app/trees/[treeId]/treeView.module.css";
import s from "./admin.module.css";

interface View {
	/** Screen position of the plane's origin, in CSS px. */
	tx: number;
	ty: number;
	/** CSS px per world unit. */
	k: number;
}

/** Zoom at which each level of detail appears (world units: LINK = 60). */
const NAMES_AT = 0.9;
const YEARS_AT = 1.4;
const FACES_AT = 2;
const MAX_ZOOM = 4;
const DRAG_THRESHOLD = 4;

const numbers = new Intl.NumberFormat("en-GB");

const lifeText = (p: StainPerson) =>
	p.born === null ? "" : p.died === null ? `${p.born}` : `${p.born} – †${p.died}`;

type Hover =
	| { kind: "tree"; stain: Stain; x: number; y: number }
	| { kind: "person"; stain: Stain; person: StainPerson; x: number; y: number };

export const StainCanvas = ({ stains, emptyTrees }: { stains: Stain[]; emptyTrees: number }) => {
	const wrapRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const view = useRef<View>({ tx: 0, ty: 0, k: 0.05 });
	const size = useRef({ w: 0, h: 0 });
	const frame = useRef(0);
	const animation = useRef(0);
	const pointers = useRef(new Map<number, { x: number; y: number }>());
	const pinch = useRef<number | null>(null);
	const moved = useRef(0);
	const images = useRef(new Map<string, HTMLImageElement | "failed">());
	const [hover, setHover] = useState<Hover | null>(null);
	const [dragging, setDragging] = useState(false);

	const people = stains.reduce((sum, st) => sum + st.people.length, 0);
	/** Radius of the whole plane, for "fit all" and the zoom-out limit. */
	const planeRadius = Math.max(1, ...stains.map((st) => Math.hypot(st.x, st.y) + st.r));

	const fitAllZoom = useCallback(
		() => Math.min(size.current.w, size.current.h) / (2 * planeRadius * 1.05),
		[planeRadius]
	);
	const clampZoom = useCallback((k: number) => Math.min(MAX_ZOOM, Math.max(fitAllZoom() * 0.5, k)), [fitAllZoom]);

	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) {
			return;
		}
		const { w, h } = size.current;
		const dpr = window.devicePixelRatio || 1;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const css = getComputedStyle(canvas);
		const color = (name: string) => css.getPropertyValue(name).trim();
		const ink = color("--ink");
		const ink2 = color("--ink2");
		const ink3 = color("--ink3");
		const paper = color("--bg");
		const surface2 = color("--surface2");
		const font = css.fontFamily;
		ctx.fillStyle = paper;
		ctx.fillRect(0, 0, w, h);

		const { tx, ty, k } = view.current;
		const lineWidth = Math.min(1.6, Math.max(0.6, k * 1.4));
		const dot = Math.min(5, Math.max(1.2, k * 4));
		const face = Math.min(22, k * 9);

		for (const st of stains) {
			const sx = st.x * k + tx;
			const sy = st.y * k + ty;
			const sr = st.r * k;
			if (sx + sr < 0 || sx - sr > w || sy + sr + 40 < 0 || sy - sr > h) {
				continue;
			}
			if (sr < 2.5) {
				ctx.fillStyle = ink;
				ctx.globalAlpha = 0.55;
				ctx.beginPath();
				ctx.arc(sx, sy, Math.max(1, sr * 0.6), 0, Math.PI * 2);
				ctx.fill();
				ctx.globalAlpha = 1;
				continue;
			}
			const px = (p: StainPerson) => sx + p.x * k;
			const py = (p: StainPerson) => sy + p.y * k;

			// Relationships: hairlines, partners twice as heavy.
			ctx.strokeStyle = ink;
			ctx.globalAlpha = k < NAMES_AT ? 0.4 : 0.5;
			for (const partner of [false, true]) {
				ctx.lineWidth = partner ? lineWidth * 2.2 : lineWidth;
				ctx.beginPath();
				for (const link of st.links) {
					if (link.partner !== partner) {
						continue;
					}
					const a = st.people[link.a];
					const b = st.people[link.b];
					ctx.moveTo(px(a), py(a));
					ctx.lineTo(px(b), py(b));
				}
				ctx.stroke();
			}
			ctx.globalAlpha = 1;

			// People: filled dots, hollow when they have died; faces when close.
			for (const p of st.people) {
				const x = px(p);
				const y = py(p);
				if (x < -60 || x > w + 60 || y < -60 || y > h + 60) {
					continue;
				}
				if (k >= FACES_AT) {
					ctx.fillStyle = surface2;
					ctx.strokeStyle = ink;
					ctx.lineWidth = 1.25;
					ctx.beginPath();
					ctx.arc(x, y, face, 0, Math.PI * 2);
					ctx.fill();
					const image = p.picture ? loadImage(p) : null;
					if (image && image !== "failed" && image.complete && image.naturalWidth > 0) {
						ctx.save();
						ctx.clip();
						ctx.drawImage(image, x - face, y - face, face * 2, face * 2);
						ctx.restore();
					} else {
						ctx.fillStyle = ink2;
						ctx.font = `600 ${Math.round(face * 0.7)}px ${font}`;
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.fillText(initials(p.name), x, y + 0.5);
					}
					ctx.globalAlpha = p.died !== null ? 0.45 : 1;
					ctx.beginPath();
					ctx.arc(x, y, face, 0, Math.PI * 2);
					ctx.stroke();
					ctx.globalAlpha = 1;
				} else {
					ctx.beginPath();
					ctx.arc(x, y, dot, 0, Math.PI * 2);
					if (p.died !== null) {
						ctx.fillStyle = paper;
						ctx.fill();
						ctx.strokeStyle = ink;
						ctx.lineWidth = Math.max(0.8, dot * 0.4);
						ctx.stroke();
					} else {
						ctx.fillStyle = ink;
						ctx.fill();
					}
				}
				if (k >= NAMES_AT) {
					const below = (k >= FACES_AT ? face : dot) + 4;
					ctx.textAlign = "center";
					ctx.textBaseline = "top";
					ctx.fillStyle = ink;
					ctx.font = `600 ${k >= YEARS_AT ? 12 : 11}px ${font}`;
					const name = k >= YEARS_AT || p.name.length <= 18 ? p.name : `${p.name.slice(0, 17)}…`;
					ctx.fillText(name, x, y + below);
					if (k >= YEARS_AT) {
						const life = lifeText(p);
						if (life) {
							ctx.fillStyle = ink3;
							ctx.font = `500 11px ${font}`;
							ctx.fillText(life, x, y + below + 15);
						}
					}
				}
			}

			// Tree name under the stain once it is big enough to tell apart.
			if (sr > 34 && k < NAMES_AT) {
				ctx.textAlign = "center";
				ctx.textBaseline = "top";
				ctx.fillStyle = ink2;
				ctx.font = `700 ${sr > 90 ? 14 : 12}px ${font}`;
				ctx.fillText(st.name || "Untitled", sx, sy + sr + 6);
				if (sr > 70) {
					ctx.fillStyle = ink3;
					ctx.font = `500 12px ${font}`;
					ctx.fillText(
						`${numbers.format(st.people.length)} ${st.people.length === 1 ? "person" : "people"} · ${st.generations} gen.`,
						sx,
						sy + sr + 24
					);
				}
			}
		}
	}, [stains]); // eslint-disable-line react-hooks/exhaustive-deps

	const redraw = useCallback(() => {
		cancelAnimationFrame(frame.current);
		frame.current = requestAnimationFrame(draw);
	}, [draw]);

	/** Photos load lazily, only once someone zooms in close enough to see faces. */
	const loadImage = (p: StainPerson) => {
		const cached = images.current.get(p.id);
		if (cached) {
			return cached;
		}
		const image = new Image();
		image.onload = redraw;
		image.onerror = () => images.current.set(p.id, "failed");
		image.src = `${pb.baseURL.replace(/\/$/, "")}/api/files/ft_nodes/${p.id}/${encodeURIComponent(p.picture)}?thumb=100x100`;
		images.current.set(p.id, image);
		return image;
	};

	/** Any move of the plane hides the tooltip; the next pointer move brings it back. */
	const setView = useCallback(
		(next: View) => {
			view.current = next;
			setHover(null);
			redraw();
		},
		[redraw]
	);

	const zoomAt = useCallback(
		(factor: number, px: number, py: number) => {
			const v = view.current;
			const k = clampZoom(v.k * factor);
			const ratio = k / v.k;
			setView({ k, tx: px - (px - v.tx) * ratio, ty: py - (py - v.ty) * ratio });
		},
		[clampZoom, setView]
	);

	/** Glides to a view; zoom is interpolated on a log scale so it feels even. */
	const flyTo = useCallback(
		(target: View) => {
			cancelAnimationFrame(animation.current);
			const from = view.current;
			const start = performance.now();
			const duration = 450;
			const step = (now: number) => {
				const t = Math.min(1, (now - start) / duration);
				const e = 1 - Math.pow(1 - t, 3);
				const k = Math.exp(Math.log(from.k) + (Math.log(target.k) - Math.log(from.k)) * e);
				// Keep the world point under the screen centre moving in a straight line.
				const cx = size.current.w / 2;
				const cy = size.current.h / 2;
				const fromWx = (cx - from.tx) / from.k;
				const fromWy = (cy - from.ty) / from.k;
				const toWx = (cx - target.tx) / target.k;
				const toWy = (cy - target.ty) / target.k;
				const wx = fromWx + (toWx - fromWx) * e;
				const wy = fromWy + (toWy - fromWy) * e;
				setView({ k, tx: cx - wx * k, ty: cy - wy * k });
				if (t < 1) {
					animation.current = requestAnimationFrame(step);
				}
			};
			animation.current = requestAnimationFrame(step);
		},
		[setView]
	);

	const fitAll = useCallback(
		(animate = true) => {
			const k = fitAllZoom();
			const next = { k, tx: size.current.w / 2, ty: size.current.h / 2 };
			if (animate) {
				flyTo(next);
			} else {
				setView(next);
			}
		},
		[fitAllZoom, flyTo, setView]
	);

	const focusStain = (st: Stain) => {
		const k = clampZoom(Math.min(Math.min(size.current.w, size.current.h) / (2 * st.r * 1.15), 2.4));
		flyTo({ k, tx: size.current.w / 2 - st.x * k, ty: size.current.h / 2 - st.y * k });
	};

	// Canvas follows its box; the first size fits every tree on screen.
	useEffect(() => {
		const wrap = wrapRef.current;
		const canvas = canvasRef.current;
		if (!wrap || !canvas) {
			return;
		}
		let first = true;
		const observer = new ResizeObserver(() => {
			const w = wrap.clientWidth;
			const h = wrap.clientHeight;
			const dpr = window.devicePixelRatio || 1;
			size.current = { w, h };
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			if (first) {
				first = false;
				fitAll(false);
			} else {
				redraw();
			}
		});
		observer.observe(wrap);
		return () => observer.disconnect();
	}, [fitAll, redraw]);

	// Redraw when the colour theme changes.
	useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const observer = new MutationObserver(redraw);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
		media.addEventListener("change", redraw);
		return () => {
			observer.disconnect();
			media.removeEventListener("change", redraw);
		};
	}, [redraw]);

	// Wheel has to be non-passive to stop the page from scrolling.
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			cancelAnimationFrame(animation.current);
			const rect = canvas.getBoundingClientRect();
			zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX - rect.left, e.clientY - rect.top);
		};
		canvas.addEventListener("wheel", onWheel, { passive: false });
		return () => canvas.removeEventListener("wheel", onWheel);
	}, [zoomAt]);

	useEffect(
		() => () => {
			cancelAnimationFrame(frame.current);
			cancelAnimationFrame(animation.current);
		},
		[]
	);

	/** The stain (and, when zoomed in, the person) under a screen point. */
	const hitTest = (x: number, y: number): Hover | null => {
		const { tx, ty, k } = view.current;
		const wx = (x - tx) / k;
		const wy = (y - ty) / k;
		const st = stains.find((candidate) => (candidate.x - wx) ** 2 + (candidate.y - wy) ** 2 <= candidate.r ** 2);
		if (!st) {
			return null;
		}
		if (k >= NAMES_AT * 0.6) {
			const reach = Math.max(10, k >= FACES_AT ? Math.min(22, k * 9) : 8) / k;
			let best: StainPerson | null = null;
			let bestD = reach * reach;
			for (const p of st.people) {
				const d = (st.x + p.x - wx) ** 2 + (st.y + p.y - wy) ** 2;
				if (d <= bestD) {
					best = p;
					bestD = d;
				}
			}
			if (best) {
				return { kind: "person", stain: st, person: best, x, y };
			}
		}
		return { kind: "tree", stain: st, x, y };
	};

	const local = (e: React.PointerEvent) => {
		const rect = e.currentTarget.getBoundingClientRect();
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	};

	const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (e.pointerType === "mouse" && e.button !== 0) {
			return;
		}
		cancelAnimationFrame(animation.current);
		pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pointers.current.size === 1) {
			moved.current = 0;
		}
		pinch.current = null;
		e.currentTarget.setPointerCapture(e.pointerId);
	};

	const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
		const previous = pointers.current.get(e.pointerId);
		if (!previous) {
			const { x, y } = local(e);
			const hit = hitTest(x, y);
			setHover((current) =>
				!hit && !current
					? current
					: hit &&
						  current &&
						  hit.kind === current.kind &&
						  hit.stain === current.stain &&
						  (hit.kind === "tree" || (current.kind === "person" && hit.person === current.person)) &&
						  Math.abs(hit.x - current.x) < 1 &&
						  Math.abs(hit.y - current.y) < 1
						? current
						: hit
			);
			return;
		}
		const current = { x: e.clientX, y: e.clientY };
		pointers.current.set(e.pointerId, current);
		if (pointers.current.size >= 2) {
			const [a, b] = Array.from(pointers.current.values());
			const distance = Math.hypot(a.x - b.x, a.y - b.y);
			if (pinch.current) {
				const rect = e.currentTarget.getBoundingClientRect();
				zoomAt(distance / pinch.current, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
			}
			pinch.current = distance;
			moved.current += DRAG_THRESHOLD + 1;
			return;
		}
		const dx = current.x - previous.x;
		const dy = current.y - previous.y;
		moved.current += Math.abs(dx) + Math.abs(dy);
		if (moved.current > DRAG_THRESHOLD) {
			if (!dragging) {
				setDragging(true);
				setHover(null);
			}
			const v = view.current;
			setView({ ...v, tx: v.tx + dx, ty: v.ty + dy });
		}
	};

	const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
		const wasClick = pointers.current.size === 1 && moved.current <= DRAG_THRESHOLD;
		pointers.current.delete(e.pointerId);
		pinch.current = null;
		if (pointers.current.size === 0) {
			setDragging(false);
		}
		if (wasClick) {
			const { x, y } = local(e);
			const hit = hitTest(x, y);
			if (hit) {
				focusStain(hit.stain);
			}
		}
	};

	const onKeyDown = (e: React.KeyboardEvent) => {
		const v = view.current;
		const pan = 80;
		const { w, h } = size.current;
		const keys: Record<string, () => void> = {
			ArrowLeft: () => setView({ ...v, tx: v.tx + pan }),
			ArrowRight: () => setView({ ...v, tx: v.tx - pan }),
			ArrowUp: () => setView({ ...v, ty: v.ty + pan }),
			ArrowDown: () => setView({ ...v, ty: v.ty - pan }),
			"+": () => zoomAt(1.25, w / 2, h / 2),
			"=": () => zoomAt(1.25, w / 2, h / 2),
			"-": () => zoomAt(1 / 1.25, w / 2, h / 2),
			"0": () => fitAll(),
		};
		const action = keys[e.key];
		if (action) {
			e.preventDefault();
			cancelAnimationFrame(animation.current);
			action();
		}
	};

	return (
		<div ref={wrapRef} className={s.stage}>
			<canvas
				ref={canvasRef}
				className={`${s.canvas} ${dragging ? s.grabbing : ""}`}
				tabIndex={0}
				role="img"
				aria-label={`${stains.length} family trees with ${people} people, scattered on a canvas. Drag to move, scroll to zoom, arrow keys and + / − also work.`}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
				onPointerLeave={() => setHover(null)}
				onKeyDown={onKeyDown}
			/>

			<div className={s.legend}>
				<strong>
					{numbers.format(stains.length)} trees · {numbers.format(people)} people
				</strong>
				<span>Drag to move · scroll or pinch to zoom · click a tree to fly to it</span>
				{emptyTrees ? <span>{numbers.format(emptyTrees)} empty trees not shown</span> : null}
			</div>

			{hover && !dragging ? (
				<div className={s.tip} style={{ left: hover.x, top: hover.y }}>
					{hover.kind === "person" ? (
						<>
							<strong>{hover.person.name}</strong>
							{lifeText(hover.person) ? <span>{lifeText(hover.person)}</span> : null}
							<span className={s.tipMuted}>{hover.stain.name || "Untitled"}</span>
						</>
					) : (
						<>
							<strong>{hover.stain.name || "Untitled"}</strong>
							<span>
								{numbers.format(hover.stain.people.length)}{" "}
								{hover.stain.people.length === 1 ? "person" : "people"} ·{" "}
								{numbers.format(hover.stain.links.length)} relationships · {hover.stain.generations}{" "}
								{hover.stain.generations === 1 ? "generation" : "generations"}
							</span>
							<span className={s.tipMuted}>{hover.stain.creator}</span>
						</>
					)}
				</div>
			) : null}

			<div className={tv.zoom}>
				<button
					className={tv.zoomBtn}
					aria-label="Zoom in"
					onClick={() => zoomAt(1.4, size.current.w / 2, size.current.h / 2)}
				>
					<PlusIcon />
				</button>
				<div className={tv.zoomSep} />
				<button
					className={tv.zoomBtn}
					aria-label="Zoom out"
					onClick={() => zoomAt(1 / 1.4, size.current.w / 2, size.current.h / 2)}
				>
					<MinusIcon />
				</button>
				<div className={tv.zoomSep} />
				<button className={tv.zoomBtn} aria-label="Show all trees" onClick={() => fitAll()}>
					<FitIcon />
				</button>
			</div>
		</div>
	);
};
