"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPocketbaseError, Node, pb } from "@/lib";
import { useTree } from "@/lib/hooks/useTree";
import { activeFilterCount, AGE_MAX, AGE_MIN, EMPTY_FILTERS, TreeFilters, visibleGraph } from "@/lib/filters";
import { buildCalendar, downloadText, slugify } from "@/lib/calendar";
import { layoutTree, NODE_H, NODE_W } from "@/lib/treeLayout";
import { relationshipsOf, sentence } from "@/lib/relationshipStyle";
import { LogoMark } from "@/components/Logo";
import { UserAvatar } from "@/components/AppNav";
import { ConfirmDialog } from "@/components/Dialog";
import { useToast } from "@/components/Toast";
import {
	CalendarIcon,
	ChevronLeftIcon,
	CloseIcon,
	FilterIcon,
	FitIcon,
	LinkIcon,
	MinusIcon,
	PencilIcon,
	PersonAddIcon,
	PlusIcon,
	SearchIcon,
	TrashIcon,
} from "@/components/Icons";
import { EmailAvatar, InvitedUser } from "../shared";
import { ManageInvitedDialog } from "../TreeDialogs";
import { clampScale, TreeCanvas, View, zoomAt } from "./TreeCanvas";
import { EdgePanel, PersonPanel } from "./PersonPanel";
import { FiltersDrawer, typeLabel } from "./FiltersDrawer";
import { ExportDialog, FindDialog, PersonDialog, RelationshipDialog } from "./TreeViewDialogs";
import s from "./treeView.module.css";

type Modal =
	| { kind: "find" }
	| { kind: "person"; node: Node | null }
	| { kind: "relationship"; from: Node | null }
	| { kind: "delete-person"; node: Node }
	| { kind: "delete-edge"; id: string }
	| { kind: "export" }
	| { kind: "invited" }
	| null;

const Legend = () => (
	<div className={s.legend} aria-label="Legend">
		{[
			{ label: "● Biological", color: "var(--bio)", width: 2.5 },
			{ label: "◆ Married", color: "var(--inlaw)", width: 4, cap: true },
			{ label: "◆ Lives with", color: "var(--inlaw)", width: 1.25, dash: "2 6", cap: true },
			{ label: "◆ In-law", color: "var(--inlaw)", width: 2, dash: "8 5" },
			{ label: "✝ Church", color: "var(--church)", width: 2, dash: "2 5", cap: true },
			{ label: "○ Other", color: "var(--other)", width: 1, dash: "3 7", muted: true },
		].map((row) => (
			<div key={row.label} className={s.legendRow}>
				<svg width="34" height="8" aria-hidden>
					<line
						x1="1"
						y1="4"
						x2="33"
						y2="4"
						strokeWidth={row.width}
						strokeDasharray={row.dash}
						strokeLinecap={row.cap ? "round" : undefined}
						style={{ stroke: row.color }}
					/>
				</svg>
				<span style={row.muted ? { color: "var(--ink2)" } : undefined}>{row.label}</span>
			</div>
		))}
		<div className={s.legendSep} />
		<div className={s.legendRow} style={{ gap: 12, fontWeight: 500 }}>
			<span style={{ display: "flex", alignItems: "center", gap: 6 }}>
				<span className={s.swatch} style={{ background: "var(--male-fill)", border: "2px solid var(--male-border)" }} />
				Male
			</span>
			<span style={{ display: "flex", alignItems: "center", gap: 6 }}>
				<span className={s.swatch} style={{ background: "var(--female-fill)", border: "2px solid var(--female-border)" }} />
				Female
			</span>
			<span style={{ color: "var(--ink3)" }}>† deceased</span>
		</div>
	</div>
);

export const TreeView = ({ treeId, userName }: { treeId: string; userName: string }) => {
	const {
		tree,
		fetchTree,
		createNode,
		editNode,
		deleteNode,
		createRelationship,
		deleteRelationship,
		isLoading,
		error,
	} = useTree();
	const toast = useToast();
	const viewportRef = useRef<HTMLDivElement>(null);
	const [view, setViewState] = useState<View>({ tx: 40, ty: 80, scale: 0.8 });
	const setView = useCallback((update: (v: View) => View) => setViewState(update), []);
	const [filters, setFilters] = useState<TreeFilters>(EMPTY_FILTERS);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
	const [modal, setModal] = useState<Modal>(null);
	const [busy, setBusy] = useState(false);
	// Viewer emails, tagged with the tree they belong to. A reload of the same
	// tree keeps showing the previous list until the new one arrives.
	const [viewers, setViewers] = useState<{ treeId: string; users: InvitedUser[] } | null>(null);
	const invited = viewers?.treeId === treeId ? viewers.users : null;
	const fitted = useRef<string | null>(null);
	// The tree this view is showing right now; null once it unmounts. A toast's
	// Undo can fire after the user moved on, and must not reload a tree that is
	// no longer on screen over the one that is.
	const shownTree = useRef<string | null>(treeId);
	shownTree.current = treeId;
	useEffect(() => {
		shownTree.current = treeId;
		return () => {
			shownTree.current = null;
		};
	}, [treeId]);

	useEffect(() => {
		fitted.current = null;
		setSelectedNodeId(null);
		setSelectedEdgeId(null);
		setFilters(EMPTY_FILTERS);
		fetchTree(treeId);
	}, [treeId, fetchTree]);

	const loadedTree = tree?.object.id === treeId ? tree : null;
	const invitedKey = loadedTree ? `${treeId}:${loadedTree.object.invitedIds.join(",")}` : "";
	useEffect(() => {
		if (!invitedKey) {
			return;
		}
		const [forTree, list] = invitedKey.split(":");
		const ids = list ? list.split(",") : [];
		let cancelled = false;
		Promise.all(
			ids.map(async (id) => {
				try {
					const record = await pb.collection("ft_gettable_users_id_email").getOne(id);
					return { id, email: record.email as string };
				} catch {
					return { id, email: "unknown account" };
				}
			})
		).then((users) => {
			if (!cancelled) {
				setViewers({ treeId: forTree, users });
			}
		});
		return () => {
			cancelled = true;
		};
	}, [invitedKey]);

	const current = tree && tree.object.id === treeId ? tree : null;
	const nodes = useMemo(() => current?.nodes ?? [], [current]);
	const relationships = useMemo(() => current?.relationships ?? [], [current]);
	const isOwner = current?.isCreator ?? false;

	// Positions come from everyone, so filtering never reshuffles the canvas.
	const layout = useMemo(() => layoutTree(nodes, relationships), [nodes, relationships]);
	const { visibleNodes, visibleRelationships } = useMemo(
		() => visibleGraph(nodes, relationships, filters),
		[nodes, relationships, filters]
	);

	const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
	const selectedEdge = relationships.find((r) => r.id === selectedEdgeId) ?? null;

	const fit = useCallback(() => {
		const el = viewportRef.current;
		if (!el || layout.width === 0) {
			return;
		}
		const vw = el.clientWidth;
		const vh = el.clientHeight;
		const top = 72;
		const scale = clampScale(
			Math.min((vw - 32) / layout.width, (vh - top - 24) / layout.height, 1.1)
		);
		setViewState({
			scale,
			tx: Math.max(16, (vw - layout.width * scale) / 2),
			ty: top,
		});
	}, [layout]);

	useEffect(() => {
		if (current && fitted.current !== current.object.id) {
			fitted.current = current.object.id;
			// Wait a frame so the viewport has its final size.
			requestAnimationFrame(fit);
		}
	}, [current, fit]);

	const focusOn = (node: Node) => {
		const el = viewportRef.current;
		const position = layout.positions.get(node.id);
		if (!el || !position) {
			return;
		}
		const panelOffset = el.clientWidth > 760 ? 180 : 0;
		const narrow = el.clientWidth <= 760;
		setViewState({
			scale: 1,
			tx: el.clientWidth / 2 - (position.x + NODE_W / 2) - panelOffset,
			ty: (narrow ? el.clientHeight * 0.3 : el.clientHeight / 2) - (position.y + NODE_H / 2),
		});
	};

	/** Jumping to someone the filters hide would pan to an empty spot. */
	const revealIfHidden = (node: Node) => {
		if (!visibleNodes.some((n) => n.id === node.id)) {
			setFilters(EMPTY_FILTERS);
			toast("Filters cleared to show them");
		}
	};

	const selectNode = (id: string) => {
		setSelectedNodeId(id);
		setSelectedEdgeId(null);
		setFiltersOpen(false);
	};

	const selectEdge = (id: string) => {
		setSelectedEdgeId(id);
		setSelectedNodeId(null);
		setFiltersOpen(false);
	};

	const clearSelection = () => {
		setSelectedNodeId(null);
		setSelectedEdgeId(null);
	};

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (modal) {
				return;
			}
			const typing = (e.target as HTMLElement)?.closest?.("input, textarea, select");
			if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
				e.preventDefault();
				setModal({ kind: "find" });
			} else if (e.key === "Escape" && !typing) {
				if (filtersOpen) {
					setFiltersOpen(false);
				} else {
					setSelectedNodeId(null);
					setSelectedEdgeId(null);
				}
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [modal, filtersOpen]);

	const zoomBy = (factor: number) => {
		const el = viewportRef.current;
		if (!el) {
			return;
		}
		setViewState((v) => zoomAt(v, factor, el.clientWidth / 2, el.clientHeight / 2));
	};

	const typeName = (id: string) => {
		const name = current?.relationshipNames.find((n) => n.id === id);
		return name ? typeLabel(name) : "Unknown";
	};

	const chips: { text: string; remove: () => void }[] = [
		...filters.hiddenTypes.map((id) => ({
			text: `Hide: ${typeName(id)}`,
			remove: () => setFilters((f) => ({ ...f, hiddenTypes: f.hiddenTypes.filter((t) => t !== id) })),
		})),
		...(filters.minAge > AGE_MIN || filters.maxAge < AGE_MAX
			? [
					{
						text: `Age ${filters.minAge}–${filters.maxAge}${filters.maxAge >= AGE_MAX ? "+" : ""}`,
						remove: () => setFilters((f) => ({ ...f, minAge: AGE_MIN, maxAge: AGE_MAX })),
					},
			  ]
			: []),
		...(filters.gender !== "both"
			? [
					{
						text: filters.gender === "male" ? "Men only" : "Women only",
						remove: () => setFilters((f) => ({ ...f, gender: "both" as const })),
					},
			  ]
			: []),
		...(filters.nameFilter.trim()
			? [
					{
						text: `Not: ${filters.nameFilter.trim()}`,
						remove: () => setFilters((f) => ({ ...f, nameFilter: "" })),
					},
			  ]
			: []),
	];
	const filterCount = activeFilterCount(filters);

	const run = async (action: () => Promise<void>) => {
		setBusy(true);
		try {
			await action();
		} catch (err: any) {
			toast(getPocketbaseError(err), "error");
		} finally {
			setBusy(false);
		}
	};

	const exportCalendar = () => {
		try {
			const ics = buildCalendar(visibleNodes, window.location.href);
			const filename = `${slugify(current?.object.name ?? "family-tree")}.ics`;
			downloadText(filename, ics, "text/calendar;charset=utf-8");
			setModal(null);
			toast(
				`${filename} downloaded · ${visibleNodes.length} ${visibleNodes.length === 1 ? "person" : "people"}`
			);
		} catch (err: any) {
			toast(err?.message ?? "Could not build the calendar", "error");
		}
	};

	if (!current) {
		return (
			<div className={s.shell}>
				<header className={s.header}>
					<div className={s.headerLeft}>
						<Link href="/trees" className={s.back} aria-label="Back to trees">
							<ChevronLeftIcon />
						</Link>
						<LogoMark size={26} />
					</div>
				</header>
				<div className="page-center">
					{error && !isLoading ? (
						<>
							<h1 style={{ fontSize: 24, color: "var(--ink)" }}>This tree could not be opened</h1>
							<p style={{ whiteSpace: "pre-line" }}>{error}</p>
							<Link href="/trees" className="btn btn-primary">
								Back to your trees
							</Link>
						</>
					) : (
						<>
							<span className="spinner" style={{ width: 28, height: 28, color: "var(--primary)" }} />
							<p>Loading the tree…</p>
						</>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className={s.shell}>
			<header className={s.header}>
				<div className={s.headerLeft}>
					<Link href="/trees" className={s.back} aria-label="Back to trees">
						<ChevronLeftIcon />
					</Link>
					<span className="hide-sm" style={{ display: "flex" }}>
						<LogoMark size={26} />
					</span>
					<h1 className={s.treeName}>{current.object.name}</h1>
					<span className={`badge ${isOwner ? "badge-owner" : "badge-shared"} ${s.hideNarrow}`} style={{ padding: "3px 9px" }}>
						{isOwner ? "Owner" : "Viewer · read-only"}
					</span>
					<span className={`${s.count} ${s.hideNarrow}`}>
						{nodes.length} {nodes.length === 1 ? "person" : "people"} · {relationships.length}{" "}
						{relationships.length === 1 ? "relationship" : "relationships"}
					</span>
				</div>
				<div className={s.headerRight}>
					{invited && invited.length > 0 ? (
						<div className={`avatar-stack ${s.hideNarrow}`}>
							{invited.slice(0, 3).map((user) => (
								<EmailAvatar key={user.id} email={user.email} />
							))}
						</div>
					) : null}
					{isOwner ? (
						<button
							className={`btn btn-outline btn-sm ${s.hideNarrow}`}
							disabled={!invited}
							onClick={() => setModal({ kind: "invited" })}
						>
							Manage invited
						</button>
					) : null}
					<UserAvatar name={userName} size={32} />
				</div>
			</header>

			<div className={s.stage}>
				<TreeCanvas
					layout={layout}
					nodes={visibleNodes}
					relationships={visibleRelationships}
					selectedNodeId={selectedNodeId}
					selectedEdgeId={selectedEdgeId}
					onSelectNode={selectNode}
					onSelectEdge={selectEdge}
					onClear={clearSelection}
					view={view}
					setView={setView}
					viewportRef={viewportRef}
					onFocusNode={(id) => {
						const node = nodes.find((n) => n.id === id);
						const position = layout.positions.get(id);
						const el = viewportRef.current;
						if (!node || !position || !el) {
							return;
						}
						const left = view.tx + position.x * view.scale;
						const top = view.ty + position.y * view.scale;
						const right = left + NODE_W * view.scale;
						const bottom = top + NODE_H * view.scale;
						if (left < 0 || top < 0 || right > el.clientWidth || bottom > el.clientHeight) {
							focusOn(node);
						}
					}}
				/>

				{nodes.length === 0 ? (
					<div className={s.emptyCanvas}>
						<div className={s.emptyCard}>
							<h2 style={{ fontSize: 24 }}>No one here yet</h2>
							<p>
								{isOwner
									? "Add the first person, yourself is a good start. Everyone you add lines up by birth year."
									: "The creator hasn't added anyone to this tree yet."}
							</p>
							{isOwner ? (
								<button className="btn btn-primary" onClick={() => setModal({ kind: "person", node: null })}>
									<PersonAddIcon />
									Add the first person
								</button>
							) : null}
						</div>
					</div>
				) : null}

				<div className={s.toolbars}>
					{isOwner ? (
						<div className={s.toolbar} role="toolbar" aria-label="Edit tree">
							<button className={s.tool} onClick={() => setModal({ kind: "person", node: null })}>
								<PersonAddIcon />
								<span className={s.toolLabel}>Add person</span>
							</button>
							<button
								className={s.tool}
								disabled={nodes.length < 2}
								onClick={() => setModal({ kind: "relationship", from: selectedNode })}
							>
								<LinkIcon />
								<span className={s.toolLabel}>Add relationship</span>
							</button>
							<div className={`${s.toolSep} ${s.hideNarrow}`} />
							<button
								className={`${s.tool} ${s.hideNarrow}`}
								disabled={!selectedNode}
								onClick={() => selectedNode && setModal({ kind: "person", node: selectedNode })}
							>
								<PencilIcon />
								<span className={s.toolLabel}>Edit</span>
							</button>
							<button
								className={`${s.tool} ${s.toolDanger} ${s.hideNarrow}`}
								disabled={!selectedNode}
								onClick={() => selectedNode && setModal({ kind: "delete-person", node: selectedNode })}
							>
								<TrashIcon />
								<span className={s.toolLabel}>Remove</span>
							</button>
						</div>
					) : null}
					<div className={s.toolbar} role="toolbar" aria-label="View">
						<button className={s.tool} onClick={() => setModal({ kind: "find" })} disabled={nodes.length === 0}>
							<SearchIcon />
							<span className={s.toolLabel}>Find person</span>
						</button>
						<button
							className={`${s.tool} ${filtersOpen ? s.toolActive : ""}`}
							aria-expanded={filtersOpen}
							onClick={() => {
								setFiltersOpen((v) => !v);
								clearSelection();
							}}
						>
							<FilterIcon />
							<span className={s.toolLabel}>Filters</span>
							{filterCount > 0 ? <span className={s.countBadge}>{filterCount}</span> : null}
						</button>
						<button className={s.tool} onClick={() => setModal({ kind: "export" })} disabled={nodes.length === 0}>
							<CalendarIcon />
							<span className={s.toolLabel}>Export to calendar</span>
						</button>
					</div>
					{chips.length > 0 ? (
						<div className={s.chips}>
							{chips.map((chip) => (
								<button key={chip.text} className={s.chip} onClick={chip.remove} aria-label={`Remove filter ${chip.text}`}>
									{chip.text}
									<span className={s.chipX}>
										<CloseIcon size={10} />
									</span>
								</button>
							))}
							<button className={s.clearAll} onClick={() => setFilters(EMPTY_FILTERS)}>
								Clear all
							</button>
						</div>
					) : null}
				</div>

				<Legend />

				<div className={s.zoom}>
					<button className={s.zoomBtn} aria-label="Zoom in" onClick={() => zoomBy(1.25)}>
						<PlusIcon />
					</button>
					<div className={s.zoomSep} />
					<button className={s.zoomBtn} aria-label="Zoom out" onClick={() => zoomBy(1 / 1.25)}>
						<MinusIcon />
					</button>
					<div className={s.zoomSep} />
					<button className={s.zoomBtn} aria-label="Fit to screen" onClick={fit}>
						<FitIcon />
					</button>
					<div className={s.zoomSep} />
					<div className={s.zoomPct} aria-live="polite">
						{Math.round(view.scale * 100)}%
					</div>
				</div>

				{selectedNode && !filtersOpen ? (
					<PersonPanel
						key={selectedNode.id}
						node={selectedNode}
						nodes={nodes}
						relationships={relationships}
						isOwner={isOwner}
						onClose={() => setSelectedNodeId(null)}
						onSelectNode={(id) => {
							const node = nodes.find((n) => n.id === id);
							if (!node) {
								return;
							}
							revealIfHidden(node);
							selectNode(id);
							focusOn(node);
						}}
						onEdit={() => setModal({ kind: "person", node: selectedNode })}
						onDelete={() => setModal({ kind: "delete-person", node: selectedNode })}
						onAddRelationship={() => setModal({ kind: "relationship", from: selectedNode })}
						onRemoveRelationship={(id) => setModal({ kind: "delete-edge", id })}
					/>
				) : null}

				{selectedEdge && !filtersOpen ? (
					<EdgePanel
						relationship={selectedEdge}
						nodes={nodes}
						isOwner={isOwner}
						onClose={() => setSelectedEdgeId(null)}
						onRemove={() => setModal({ kind: "delete-edge", id: selectedEdge.id })}
					/>
				) : null}

				{filtersOpen ? (
					<FiltersDrawer
						filters={filters}
						setFilters={(update) => setFilters(update)}
						relationshipNames={current.relationshipNames}
						visibleText={`${visibleNodes.length} of ${nodes.length} people visible`}
						onClear={() => setFilters(EMPTY_FILTERS)}
						onClose={() => setFiltersOpen(false)}
					/>
				) : null}
			</div>

			{modal?.kind === "find" ? (
				<FindDialog
					nodes={nodes}
					onClose={() => setModal(null)}
					onPick={(node) => {
						setModal(null);
						revealIfHidden(node);
						selectNode(node.id);
						focusOn(node);
					}}
				/>
			) : null}

			{modal?.kind === "person" ? (
				<PersonDialog
					node={modal.node}
					treeId={treeId}
					onClose={() => setModal(null)}
					onSave={async (data) => {
						if (modal.node) {
							await editNode(modal.node.id, data);
							toast("Changes saved");
						} else {
							const node = await createNode(data);
							if (node) {
								toast(`${node.name} added to the tree`);
								setSelectedNodeId(node.id);
								setSelectedEdgeId(null);
							}
						}
						setModal(null);
					}}
				/>
			) : null}

			{modal?.kind === "relationship" ? (
				<RelationshipDialog
					nodes={nodes}
					relationships={relationships}
					relationshipNames={current.relationshipNames}
					initialFrom={modal.from}
					onClose={() => setModal(null)}
					onSave={async (from, to, type) => {
						const created = await createRelationship({
							sourceNode: from.id,
							targetNode: to.id,
							relationshipName: type.id,
							tree: treeId,
						});
						setModal(null);
						if (created) {
							toast("Relationship added", "success", {
								label: "Undo",
								fn: () => {
									deleteRelationship(created.id).catch((err) =>
										toast(getPocketbaseError(err), "error")
									);
								},
							});
						}
					}}
				/>
			) : null}

			{modal?.kind === "delete-person" ? (
				<ConfirmDialog
					title={`Remove ${modal.node.name}?`}
					body={(() => {
						const count = relationshipsOf(relationships, modal.node.id).length;
						return `This also removes ${count} ${count === 1 ? "relationship" : "relationships"} connected to them. There is no undo.`;
					})()}
					confirmLabel="Remove person"
					busy={busy}
					onClose={() => setModal(null)}
					onConfirm={() =>
						run(async () => {
							const { id, name } = modal.node;
							await deleteNode(id);
							setModal(null);
							setSelectedNodeId(null);
							toast(`${name} removed`);
							// Their panel (and its buttons) are gone; land keyboard focus on the canvas.
							requestAnimationFrame(() => viewportRef.current?.focus());
						})
					}
				/>
			) : null}

			{modal?.kind === "delete-edge"
				? (() => {
						const edge = relationships.find((r) => r.id === modal.id);
						if (!edge) {
							return null;
						}
						const from = nodes.find((n) => n.id === edge.sourceNodeId)?.name ?? "Someone";
						const to = nodes.find((n) => n.id === edge.targetNodeId)?.name ?? "someone";
						return (
							<ConfirmDialog
								title="Remove this relationship?"
								body={`${sentence(from, edge.relationshipName, to)}. The two people stay in the tree.`}
								confirmLabel="Remove relationship"
								busy={busy}
								onClose={() => setModal(null)}
								onConfirm={() =>
									run(async () => {
										await deleteRelationship(edge.id);
										setModal(null);
										setSelectedEdgeId(null);
										requestAnimationFrame(() => viewportRef.current?.focus());
										toast("Relationship removed");
									})
								}
							/>
						);
				  })()
				: null}

			{modal?.kind === "export" ? (
				<ExportDialog nodes={visibleNodes} onExport={exportCalendar} onClose={() => setModal(null)} />
			) : null}

			{modal?.kind === "invited" ? (
				<ManageInvitedDialog
					tree={{
						id: current.object.id,
						name: current.object.name,
						updated: current.object.updated.toISOString(),
						isOwner,
						people: nodes.length,
						invited: invited ?? [],
						creatorEmail: null,
					}}
					userName={userName}
					onClose={() => setModal(null)}
					onChanged={() => {
						if (shownTree.current === current.object.id) {
							fetchTree(current.object.id);
						}
					}}
				/>
			) : null}
		</div>
	);
};
