"use client";

import { useEffect, useRef, useState } from "react";
import { Node, Relationship } from "@/lib";
import { isDeceased, yearsText } from "@/lib/people";
import { edgeLabel, edgeStyle, GROUPS, GROUP_ORDER } from "@/lib/relationshipStyle";
import { edgePath, Layout, NODE_H, NODE_W } from "@/lib/treeLayout";
import { AccountIcon } from "@/components/Icons";
import { PersonAvatar } from "./PersonAvatar";
import { useT } from "@/i18n/client";
import s from "./treeView.module.css";

export interface View {
	tx: number;
	ty: number;
	scale: number;
}

export const MIN_SCALE = 0.2;
export const MAX_SCALE = 2.5;

export const clampScale = (scale: number) =>
	Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

/** Zoom by `factor` keeping the point (px, py) of the viewport fixed. */
export const zoomAt = (view: View, factor: number, px: number, py: number): View => {
	const scale = clampScale(view.scale * factor);
	const ratio = scale / view.scale;
	return { scale, tx: px - (px - view.tx) * ratio, ty: py - (py - view.ty) * ratio };
};

interface TreeCanvasProps {
	layout: Layout;
	nodes: Node[];
	relationships: Relationship[];
	selectedNodeId: string | null;
	selectedEdgeId: string | null;
	onSelectNode: (id: string) => void;
	onSelectEdge: (id: string) => void;
	onClear: () => void;
	view: View;
	setView: (update: (view: View) => View) => void;
	viewportRef: React.RefObject<HTMLDivElement>;
	/** A card got keyboard focus; the view should bring it on screen. */
	onFocusNode: (id: string) => void;
	/** The signed-in account; the person linked to it is marked "you". */
	currentUserId: string;
}

const DRAG_THRESHOLD = 4;

export const TreeCanvas = ({
	layout,
	nodes,
	relationships,
	selectedNodeId,
	selectedEdgeId,
	onSelectNode,
	onSelectEdge,
	onClear,
	view,
	setView,
	viewportRef,
	onFocusNode,
	currentUserId,
}: TreeCanvasProps) => {
	const t = useT();
	const genderOf = new Map(nodes.map((node) => [node.id, node.gender]));
	const pointers = useRef(new Map<number, { x: number; y: number }>());
	const moved = useRef(0);
	const pinchDistance = useRef<number | null>(null);
	const [dragging, setDragging] = useState(false);

	// Wheel has to be non-passive to stop the page from zooming/scrolling.
	useEffect(() => {
		const el = viewportRef.current;
		if (!el) {
			return;
		}
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			const rect = el.getBoundingClientRect();
			const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015));
			setView((v) => zoomAt(v, factor, e.clientX - rect.left, e.clientY - rect.top));
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, [viewportRef, setView]);

	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		if (e.pointerType === "mouse" && e.button !== 0) {
			return;
		}
		pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pointers.current.size === 1) {
			moved.current = 0;
		}
		pinchDistance.current = null;
	};

	const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		const previous = pointers.current.get(e.pointerId);
		if (!previous) {
			return;
		}
		const current = { x: e.clientX, y: e.clientY };
		pointers.current.set(e.pointerId, current);
		if (pointers.current.size >= 2) {
			const [a, b] = Array.from(pointers.current.values());
			const distance = Math.hypot(a.x - b.x, a.y - b.y);
			if (pinchDistance.current) {
				const rect = e.currentTarget.getBoundingClientRect();
				const factor = distance / pinchDistance.current;
				setView((v) =>
					zoomAt(v, factor, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top)
				);
			}
			pinchDistance.current = distance;
			moved.current += DRAG_THRESHOLD + 1;
			return;
		}
		const dx = current.x - previous.x;
		const dy = current.y - previous.y;
		moved.current += Math.abs(dx) + Math.abs(dy);
		if (moved.current > DRAG_THRESHOLD) {
			if (!dragging) {
				setDragging(true);
				// Capture only once it is a drag, so plain clicks still reach nodes.
				e.currentTarget.setPointerCapture(e.pointerId);
			}
			setView((v) => ({ ...v, tx: v.tx + dx, ty: v.ty + dy }));
		}
	};

	const endPointer = (e: React.PointerEvent<HTMLDivElement>) => {
		const wasTap = pointers.current.size === 1 && moved.current <= DRAG_THRESHOLD;
		pointers.current.delete(e.pointerId);
		pinchDistance.current = null;
		if (pointers.current.size === 0) {
			setDragging(false);
		}
		const onBackground = !(e.target as Element).closest?.("button, path");
		if (wasTap && e.type === "pointerup" && onBackground) {
			onClear();
		}
	};

	// A keyboard "click" (detail 0) is never the end of a drag.
	const tapped = (e: React.MouseEvent) => e.detail === 0 || moved.current <= DRAG_THRESHOLD;

	return (
		<div
			ref={viewportRef}
			className={`${s.viewport} ${dragging ? s.dragging : ""}`}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={endPointer}
			onPointerCancel={endPointer}
			// overflow:hidden still scrolls to a focused child; panning is done
			// with the transform, so undo any native scroll straight away.
			onScroll={(e) => {
				e.currentTarget.scrollTop = 0;
				e.currentTarget.scrollLeft = 0;
			}}
			tabIndex={-1}
			aria-label={t.tree.canvas}
			role="application"
		>
			<div
				className={s.world}
				style={{
					width: layout.width,
					height: layout.height,
					transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
				}}
			>
				{layout.bands.map((band) => (
					<div
						key={band.label}
						className={s.band}
						style={{
							top: band.y,
							height: band.h,
							background: band.shaded ? "var(--band)" : "transparent",
						}}
					>
						<span className={s.bandLabel}>{t.tree.band(band.year, band.span)}</span>
					</div>
				))}
				<svg
					className={s.edges}
					width={layout.width}
					height={layout.height}
					aria-hidden
				>
					<defs>
						{GROUP_ORDER.map((group) => (
							<marker
								key={group}
								id={`ar-${group}`}
								viewBox="0 0 10 10"
								refX="9"
								refY="5"
								markerWidth="7"
								markerHeight="7"
								orient="auto-start-reverse"
							>
								<path d="M0 0L10 5L0 10z" style={{ fill: GROUPS[group].color }} />
							</marker>
						))}
						<marker
							id="ar-sel"
							viewBox="0 0 10 10"
							refX="9"
							refY="5"
							markerWidth="7"
							markerHeight="7"
							orient="auto-start-reverse"
						>
							<path d="M0 0L10 5L0 10z" style={{ fill: "var(--accent)" }} />
						</marker>
					</defs>
					{relationships.map((r) => {
						const geometry = edgePath(r, layout.positions);
						if (!geometry) {
							return null;
						}
						const style = edgeStyle(r.relationshipName);
						const selected = r.id === selectedEdgeId;
						const group = r.relationshipName?.group ?? "IRRELEVANT";
						return (
							<g key={r.id}>
								<path
									d={geometry.d}
									fill="none"
									stroke="transparent"
									strokeWidth={16}
									className={s.edgeHit}
									onClick={(e) => {
										e.stopPropagation();
										if (tapped(e)) {
											onSelectEdge(r.id);
										}
									}}
								/>
								<path
									d={geometry.d}
									fill="none"
									strokeWidth={selected ? style.width + 1 : style.width}
									strokeDasharray={style.dash || undefined}
									strokeLinecap="round"
									markerEnd={
										r.isBidirectional
											? undefined
											: `url(#${selected ? "ar-sel" : `ar-${group}`})`
									}
									style={{
										stroke: selected ? "var(--accent)" : style.color,
										pointerEvents: "none",
									}}
								/>
							</g>
						);
					})}
				</svg>
				{relationships.map((r) => {
					const geometry = edgePath(r, layout.positions);
					if (!geometry) {
						return null;
					}
					return (
						<div
							key={`label-${r.id}`}
							className={s.edgeLabel}
							style={{
								left: geometry.mid.x,
								top: geometry.mid.y,
								fontWeight: edgeStyle(r.relationshipName).labelWeight,
							}}
						>
							{edgeLabel(t, r.relationshipName, genderOf.get(r.sourceNodeId))}
						</div>
					);
				})}
				{nodes.map((node) => {
					const position = layout.positions.get(node.id);
					if (!position) {
						return null;
					}
					const selected = node.id === selectedNodeId;
					const link = node.userId
						? node.userId === currentUserId
							? "you"
							: "linked"
						: null;
					return (
						<button
							key={node.id}
							type="button"
							className={`${s.node} ${node.gender === "male" ? s.male : s.female} ${
								selected ? s.selected : ""
							} ${link === "you" ? s.isYou : ""}`}
							style={{ left: position.x, top: position.y, width: NODE_W, height: NODE_H }}
							aria-pressed={selected}
							onFocus={(e) => {
								// Keyboard focus only; a click already shows what was clicked.
								if (e.currentTarget.matches(":focus-visible")) {
									onFocusNode(node.id);
								}
							}}
							aria-label={t.tree.nodeLabel(node.name, yearsText(node), isDeceased(node), link)}
							onClick={(e) => {
								e.stopPropagation();
								if (tapped(e)) {
									onSelectNode(node.id);
								}
							}}
						>
							<PersonAvatar node={node} size={40} fontSize={13} />
							<span className={s.nodeText}>
								<span className={s.nodeName}>{node.name}</span>
								<span className={s.nodeYears}>{yearsText(node)}</span>
							</span>
							<span className={s.glyph} aria-hidden>
								{node.gender === "male" ? "♂" : "♀"}
							</span>
							{link === "you" ? (
								<span className={s.youPill} aria-hidden>
									{t.tree.youPill}
								</span>
							) : link === "linked" ? (
								<span className={s.linkedGlyph} aria-hidden>
									<AccountIcon size={11} />
								</span>
							) : null}
						</button>
					);
				})}
			</div>
		</div>
	);
};
