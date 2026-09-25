"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPocketbaseError, Node, pb } from "@/lib";
import { useTree } from "@/lib/hooks/useTree";
import { activeFilterCount, AGE_MAX, AGE_MIN, EMPTY_FILTERS, TreeFilters, visibleGraph } from "@/lib/filters";
import { buildCalendar, downloadText, slugify } from "@/lib/calendar";
import { layoutTree, NODE_H, NODE_W } from "@/lib/treeLayout";
import { groupLabel, relationshipsOf, sentence, typeLabel } from "@/lib/relationshipStyle";
import { LogoMark } from "@/components/Logo";
import { UserAvatar } from "@/components/AppNav";
import { ConfirmDialog } from "@/components/Dialog";
import { PreferenceControls } from "@/components/PreferenceControls";
import type { Dict } from "@/i18n";
import { useT } from "@/i18n/client";
import { useToast } from "@/components/Toast";
import {
	AccountIcon,
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
import { FiltersDrawer } from "./FiltersDrawer";
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

const Legend = ({ t }: { t: Dict }) => (
	<div className={s.legend} aria-label={t.tree.legend}>
		{[
			{ label: `● ${groupLabel(t, "BIOLOGICAL")}`, color: "var(--bio)", width: 2.5 },
			{ label: `◆ ${t.rel.legend.married}`, color: "var(--inlaw)", width: 4, cap: true },
			{ label: `◆ ${t.rel.legend.livesWith}`, color: "var(--inlaw)", width: 1.25, dash: "2 6", cap: true },
			{ label: `◆ ${groupLabel(t, "IN-LAW")}`, color: "var(--inlaw)", width: 2, dash: "8 5" },
			{ label: `✝ ${groupLabel(t, "CHURCH")}`, color: "var(--church)", width: 2, dash: "2 5", cap: true },
			{ label: `○ ${groupLabel(t, "IRRELEVANT")}`, color: "var(--other)", width: 1, dash: "3 7", muted: true },
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
				{t.common.male}
			</span>
			<span style={{ display: "flex", alignItems: "center", gap: 6 }}>
				<span className={s.swatch} style={{ background: "var(--female-fill)", border: "2px solid var(--female-border)" }} />
				{t.common.female}
			</span>
			<span style={{ color: "var(--ink3)" }}>{t.tree.deceased}</span>
		</div>
		<div className={s.legendRow} style={{ gap: 12, fontWeight: 500 }}>
			<span style={{ display: "flex", alignItems: "center", gap: 6 }}>
				<span className={`${s.swatch} ${s.swatchYou}`} />
				{t.tree.legendYou}
			</span>
			<span style={{ display: "flex", alignItems: "center", gap: 6 }}>
				<AccountIcon size={13} style={{ color: "var(--ink2)" }} />
				{t.tree.legendLinked}
			</span>
		</div>
	</div>
);

export const TreeView = ({
	treeId,
	userName,
	userId,
}: {
	treeId: string;
	userName: string;
	/** The signed-in account, to mark "you" in the tree. */
	userId: string;
}) => {
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
	const t = useT();
	const tv = t.tree;
	const viewportRef = useRef<HTMLDivElement>(null);
	const [view, setViewState] = useState<View>({ tx: 40, ty: 80, scale: 0.8 });
	const setView = useCallback((update: (v: View) => View) => setViewState(update), []);
	const [filters, setFilters] = useState<TreeFilters>(EMPTY_FILTERS);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
	const [modal, setModal] = useState<Modal>(null);
	const [busy, setBusy] = useState(false);
	// Account emails (viewers, the creator, linked people), tagged with the tree
	// they belong to. A reload of the same tree keeps showing the previous list
	// until the new one arrives.
	const [accounts, setAccounts] = useState<{
		treeId: string;
		invitedIds: string[];
		emails: Record<string, string | null>;
	} | null>(null);
	const loadedAccounts = accounts?.treeId === treeId ? accounts : null;
	const emailOf = useCallback(
		(id: string) => loadedAccounts?.emails[id] ?? t.common.unknownAccount,
		[loadedAccounts, t]
	);
	const invited: InvitedUser[] | null = useMemo(
		() => loadedAccounts?.invitedIds.map((id) => ({ id, email: emailOf(id) })) ?? null,
		[loadedAccounts, emailOf]
	);
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
	const accountsKey = loadedTree
		? [
				treeId,
				loadedTree.object.invitedIds.join(","),
				Array.from(
					new Set([
						loadedTree.object.creatorId,
						...loadedTree.nodes.map((n) => n.userId ?? ""),
					])
				)
					.filter(Boolean)
					.sort()
					.join(","),
		  ].join("|")
		: "";
	useEffect(() => {
		if (!accountsKey) {
			return;
		}
		const [forTree, invitedList, otherList] = accountsKey.split("|");
		const invitedIds = invitedList ? invitedList.split(",") : [];
		const ids = Array.from(new Set([...invitedIds, ...(otherList ? otherList.split(",") : [])]));
		let cancelled = false;
		Promise.all(
			ids.map(async (id) => {
				try {
					const record = await pb.collection("ft_gettable_users_id_email").getOne(id);
					return [id, (record.email as string) || null] as const;
				} catch {
					return [id, null] as const;
				}
			})
		).then((pairs) => {
			if (!cancelled) {
				setAccounts({ treeId: forTree, invitedIds, emails: Object.fromEntries(pairs) });
			}
		});
		return () => {
			cancelled = true;
		};
	}, [accountsKey]);

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
			toast(tv.filtersCleared);
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
		return name ? typeLabel(t, name) : tv.unknownType;
	};

	const chips: { text: string; remove: () => void }[] = [
		...filters.hiddenTypes.map((id) => ({
			text: tv.chipHide(typeName(id)),
			remove: () => setFilters((f) => ({ ...f, hiddenTypes: f.hiddenTypes.filter((t) => t !== id) })),
		})),
		...(filters.minAge > AGE_MIN || filters.maxAge < AGE_MAX
			? [
					{
						text: tv.chipAge(filters.minAge, filters.maxAge, filters.maxAge >= AGE_MAX),
						remove: () => setFilters((f) => ({ ...f, minAge: AGE_MIN, maxAge: AGE_MAX })),
					},
			  ]
			: []),
		...(filters.gender !== "both"
			? [
					{
						text: filters.gender === "male" ? tv.chipMen : tv.chipWomen,
						remove: () => setFilters((f) => ({ ...f, gender: "both" as const })),
					},
			  ]
			: []),
		...(filters.includeFilter.trim()
			? [
					{
						text: tv.chipOnly(filters.includeFilter.trim()),
						remove: () => setFilters((f) => ({ ...f, includeFilter: "" })),
					},
			  ]
			: []),
		...(filters.nameFilter.trim()
			? [
					{
						text: tv.chipNot(filters.nameFilter.trim()),
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
			const ics = buildCalendar(visibleNodes, window.location.href, t);
			const filename = `${slugify(current?.object.name ?? t.calendar.fileFallback)}.ics`;
			downloadText(filename, ics, "text/calendar;charset=utf-8");
			setModal(null);
			toast(tv.exported(filename, visibleNodes.length));
		} catch (err: any) {
			toast(err?.message ?? tv.calendarFailed, "error");
		}
	};

	if (!current) {
		return (
			<div className={s.shell}>
				<header className={s.header}>
					<div className={s.headerLeft}>
						<Link href="/trees" className={s.back} aria-label={tv.back}>
							<ChevronLeftIcon />
						</Link>
						<LogoMark size={26} />
					</div>
					<div className={s.headerRight}>
						<PreferenceControls />
					</div>
				</header>
				<div className="page-center">
					{error && !isLoading ? (
						<>
							<h1 style={{ fontSize: 24, color: "var(--ink)" }}>{tv.openFailed}</h1>
							<p style={{ whiteSpace: "pre-line" }}>{error}</p>
							<Link href="/trees" className="btn btn-primary">
								{tv.backToTrees}
							</Link>
						</>
					) : (
						<>
							<span className="spinner" style={{ width: 28, height: 28, color: "var(--primary)" }} />
							<p>{tv.loadingTree}</p>
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
					<Link href="/trees" className={s.back} aria-label={tv.back}>
						<ChevronLeftIcon />
					</Link>
					<span className="hide-sm" style={{ display: "flex" }}>
						<LogoMark size={26} />
					</span>
					<h1 className={s.treeName}>{current.object.name}</h1>
					<span className={`badge ${isOwner ? "badge-owner" : "badge-shared"} ${s.hideNarrow}`} style={{ padding: "3px 9px" }}>
						{isOwner ? t.common.owner : t.common.viewerReadOnly}
					</span>
					<span className={`${s.count} ${s.hideNarrow}`}>
						{tv.counts(nodes.length, relationships.length)}
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
							{t.common.manageInvited}
						</button>
					) : null}
					<PreferenceControls />
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
					currentUserId={userId}
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
							<h2 style={{ fontSize: 24 }}>{tv.emptyTitle}</h2>
							<p>
								{isOwner ? tv.emptyOwner : tv.emptyViewer}
							</p>
							{isOwner ? (
								<button className="btn btn-primary" onClick={() => setModal({ kind: "person", node: null })}>
									<PersonAddIcon />
									{tv.addFirst}
								</button>
							) : null}
						</div>
					</div>
				) : null}

				<div className={s.toolbars}>
					{isOwner ? (
						<div className={s.toolbar} role="toolbar" aria-label={tv.editToolbar}>
							<button className={s.tool} onClick={() => setModal({ kind: "person", node: null })}>
								<PersonAddIcon />
								<span className={s.toolLabel}>{tv.addPerson}</span>
							</button>
							<button
								className={s.tool}
								disabled={nodes.length < 2}
								onClick={() => setModal({ kind: "relationship", from: selectedNode })}
							>
								<LinkIcon />
								<span className={s.toolLabel}>{t.common.addRelationship}</span>
							</button>
							<div className={`${s.toolSep} ${s.hideNarrow}`} />
							<button
								className={`${s.tool} ${s.hideNarrow}`}
								disabled={!selectedNode}
								onClick={() => selectedNode && setModal({ kind: "person", node: selectedNode })}
							>
								<PencilIcon />
								<span className={s.toolLabel}>{t.common.edit}</span>
							</button>
							<button
								className={`${s.tool} ${s.toolDanger} ${s.hideNarrow}`}
								disabled={!selectedNode}
								onClick={() => selectedNode && setModal({ kind: "delete-person", node: selectedNode })}
							>
								<TrashIcon />
								<span className={s.toolLabel}>{t.common.remove}</span>
							</button>
						</div>
					) : null}
					<div className={s.toolbar} role="toolbar" aria-label={tv.viewToolbar}>
						<button className={s.tool} onClick={() => setModal({ kind: "find" })} disabled={nodes.length === 0}>
							<SearchIcon />
							<span className={s.toolLabel}>{tv.findPerson}</span>
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
							<span className={s.toolLabel}>{tv.filters}</span>
							{filterCount > 0 ? <span className={s.countBadge}>{filterCount}</span> : null}
						</button>
						<button className={s.tool} onClick={() => setModal({ kind: "export" })} disabled={nodes.length === 0}>
							<CalendarIcon />
							<span className={s.toolLabel}>{tv.exportCalendar}</span>
						</button>
					</div>
					{chips.length > 0 ? (
						<div className={s.chips}>
							{chips.map((chip) => (
								<button key={chip.text} className={s.chip} onClick={chip.remove} aria-label={tv.removeFilter(chip.text)}>
									{chip.text}
									<span className={s.chipX}>
										<CloseIcon size={10} />
									</span>
								</button>
							))}
							<button className={s.clearAll} onClick={() => setFilters(EMPTY_FILTERS)}>
								{t.common.clearAll}
							</button>
						</div>
					) : null}
				</div>

				<Legend t={t} />

				<div className={s.zoom}>
					<button className={s.zoomBtn} aria-label={tv.zoomIn} onClick={() => zoomBy(1.25)}>
						<PlusIcon />
					</button>
					<div className={s.zoomSep} />
					<button className={s.zoomBtn} aria-label={tv.zoomOut} onClick={() => zoomBy(1 / 1.25)}>
						<MinusIcon />
					</button>
					<div className={s.zoomSep} />
					<button className={s.zoomBtn} aria-label={tv.fit} onClick={fit}>
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
						linkText={
							selectedNode.userId
								? selectedNode.userId === userId
									? t.panel.thisIsYou
									: t.panel.linkedTo(emailOf(selectedNode.userId))
								: null
						}
						isYou={!!selectedNode.userId && selectedNode.userId === userId}
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
						visibleText={tv.visible(visibleNodes.length, nodes.length)}
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
					nodes={nodes}
					treeId={treeId}
					accounts={(() => {
						const others = [current.object.creatorId, ...current.object.invitedIds, modal.node?.userId ?? ""]
							.filter((id) => id && id !== userId);
						return [
							{ id: userId, label: t.dialogs.linkedMe(userName), name: userName },
							...Array.from(new Set(others)).map((id) => ({ id, label: emailOf(id), name: emailOf(id) })),
						];
					})()}
					onClose={() => setModal(null)}
					onSave={async (data) => {
						if (modal.node) {
							await editNode(modal.node.id, data);
							toast(tv.saved);
						} else {
							const node = await createNode(data);
							if (node) {
								toast(tv.added(node.name));
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
							toast(tv.relationshipAdded, "success", {
								label: t.common.undo,
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
					title={tv.removePersonTitle(modal.node.name)}
					body={tv.removePersonBody(relationshipsOf(relationships, modal.node.id).length)}
					confirmLabel={tv.removePerson}
					busy={busy}
					onClose={() => setModal(null)}
					onConfirm={() =>
						run(async () => {
							const { id, name } = modal.node;
							await deleteNode(id);
							setModal(null);
							setSelectedNodeId(null);
							toast(tv.personRemoved(name));
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
						const fromNode = nodes.find((n) => n.id === edge.sourceNodeId);
						const from = fromNode?.name ?? t.common.someone;
						const to = nodes.find((n) => n.id === edge.targetNodeId)?.name ?? t.common.someoneLower;
						return (
							<ConfirmDialog
								title={tv.removeEdgeTitle}
								body={tv.removeEdgeBody(sentence(t, from, edge.relationshipName, to, fromNode?.gender))}
								confirmLabel={t.common.removeRelationship}
								busy={busy}
								onClose={() => setModal(null)}
								onConfirm={() =>
									run(async () => {
										await deleteRelationship(edge.id);
										setModal(null);
										setSelectedEdgeId(null);
										requestAnimationFrame(() => viewportRef.current?.focus());
										toast(tv.relationshipRemoved);
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
