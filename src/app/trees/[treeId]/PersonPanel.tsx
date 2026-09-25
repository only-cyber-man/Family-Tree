"use client";

import { useMemo, useState } from "react";
import { Node, Relationship } from "@/lib";
import { ageText, formatDate } from "@/lib/people";
import { extendedFamily } from "@/lib/relatives";
import {
	GROUPS,
	GROUP_ORDER,
	groupLabel,
	relationshipsOf,
	roleText,
	sentence,
} from "@/lib/relationshipStyle";
import { AccountIcon, CloseIcon, LockIcon, TrashIcon } from "@/components/Icons";
import { PersonAvatar } from "./PersonAvatar";
import { useT } from "@/i18n/client";
import s from "./treeView.module.css";

export const PersonPanel = ({
	node,
	nodes,
	relationships,
	isOwner,
	linkText,
	isYou,
	onClose,
	onSelectNode,
	onEdit,
	onDelete,
	onAddRelationship,
	onRemoveRelationship,
}: {
	node: Node;
	nodes: Node[];
	relationships: Relationship[];
	isOwner: boolean;
	/** "This is you" / "Linked to …", or null when the person has no account. */
	linkText: string | null;
	isYou: boolean;
	onClose: () => void;
	onSelectNode: (id: string) => void;
	onEdit: () => void;
	onDelete: () => void;
	onAddRelationship: () => void;
	onRemoveRelationship: (id: string) => void;
}) => {
	const t = useT();
	const p = t.panel;
	const [showFamily, setShowFamily] = useState(false);
	const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
	const own = relationshipsOf(relationships, node.id);
	const groups = GROUP_ORDER.map((group) => ({
		group,
		rows: own.filter((r) => (r.relationshipName?.group ?? "IRRELEVANT") === group),
	})).filter((g) => g.rows.length > 0);
	const family = showFamily ? extendedFamily({ nodes, relationships }, node.id, t) : [];

	return (
		<aside className={s.panel} aria-label={p.details(node.name)} data-side-panel>
			<div className={s.panelHead}>
				<PersonAvatar node={node} size={64} fontSize={20} />
				<div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
					<h2 className={s.panelName}>{node.name}</h2>
					<div className={s.panelMeta}>
						{node.gender === "male" ? t.common.male : t.common.female} · {ageText(node, t)}
					</div>
					<div className={s.panelDates}>
						<span>★ {formatDate(node.birthDate, t)}</span>
						{node.deathDate ? <span>† {formatDate(node.deathDate, t)}</span> : null}
					</div>

				</div>
				<button className="icon-btn" aria-label={t.common.close} onClick={onClose} style={{ width: 32, height: 32 }}>
					<CloseIcon size={16} />
				</button>
			</div>
			<div className={s.panelBody}>
				{linkText ? (
					<span className={`${s.linkBadge} ${isYou ? s.linkBadgeYou : ""}`} title={linkText}>
						<AccountIcon size={12} />
						<span className={s.linkBadgeText}>{linkText}</span>
					</span>
				) : null}
				{node.note ? (
					<section className={s.note} aria-label={p.note}>
						{node.note}
					</section>
				) : null}
				{groups.map(({ group, rows }) => (
					<div key={group} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
						<div className={s.groupTitle} style={{ color: GROUPS[group].color }}>
							<span aria-hidden>{GROUPS[group].glyph}</span>
							{groupLabel(t, group)}
						</div>
						{rows.map((r) => {
							const otherId = r.sourceNodeId === node.id ? r.targetNodeId : r.sourceNodeId;
							const other = byId.get(otherId);
							if (!other) {
								return null;
							}
							return (
								<div key={r.id} className={s.relRow}>
									<button className={s.relGo} onClick={() => onSelectNode(other.id)}>
										<PersonAvatar node={other} size={30} fontSize={11} />
										<span style={{ minWidth: 0 }}>
											<span className={s.relName}>{other.name}</span>
											<span className={s.relRole}>{roleText(t, r, node, other)}</span>
										</span>
									</button>
									{isOwner ? (
										<button
											className={s.relRemove}
											aria-label={p.removeWith(other.name)}
											title={t.common.removeRelationship}
											onClick={() => onRemoveRelationship(r.id)}
										>
											<CloseIcon size={14} />
										</button>
									) : null}
								</div>
							);
						})}
					</div>
				))}
				{groups.length === 0 ? <div className={s.emptyRels}>{p.noRelationships}</div> : null}
				{groups.length > 0 ? (
					<button className={s.familyToggle} onClick={() => setShowFamily((v) => !v)}>
						{showFamily ? p.hideFamily : p.showFamily}
					</button>
				) : null}
				{showFamily && family.length === 0 ? (
					<div className={s.emptyRels}>{p.noFamily}</div>
				) : null}
				{family.map((group) => (
					<div key={group.label} className={s.familyGroup}>
						<span className={s.familyLabel}>{group.label}</span>
						<div className={s.familyPeople}>
							{group.people.map((person) => (
								<button
									key={person.id}
									className={s.familyPerson}
									onClick={() => onSelectNode(person.id)}
								>
									{person.name}
									{person.deathDate ? " †" : ""}
								</button>
							))}
						</div>
					</div>
				))}
			</div>
			<div className={s.panelFoot}>
				{isOwner ? (
					<>
						<button className="btn btn-outline btn-sm" style={{ flex: 1, height: 40 }} onClick={onEdit}>
							{t.common.edit}
						</button>
						<button className="btn btn-primary btn-sm" style={{ flex: 1, height: 40 }} onClick={onAddRelationship}>
							{t.common.addRelationship}
						</button>
						<button
							className="btn btn-danger-outline"
							style={{ width: 40, height: 40, padding: 0 }}
							aria-label={p.removeNamed(node.name)}
							onClick={onDelete}
						>
							<TrashIcon />
						</button>
					</>
				) : (
					<div className={s.readOnly}>
						<LockIcon />
						{p.readOnly}
					</div>
				)}
			</div>
		</aside>
	);
};

export const EdgePanel = ({
	relationship,
	nodes,
	isOwner,
	onClose,
	onRemove,
}: {
	relationship: Relationship;
	nodes: Node[];
	isOwner: boolean;
	onClose: () => void;
	onRemove: () => void;
}) => {
	const t = useT();
	const groupKey = relationship.relationshipName?.group ?? "IRRELEVANT";
	const group = GROUPS[groupKey] ?? GROUPS.IRRELEVANT;
	const from = nodes.find((n) => n.id === relationship.sourceNodeId);
	const to = nodes.find((n) => n.id === relationship.targetNodeId);
	return (
		<div className={s.edgePanel} role="dialog" aria-label={t.panel.relationship}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<div className={s.groupTitle} style={{ color: group.color }}>
					<span aria-hidden>{group.glyph}</span>
					{groupLabel(t, groupKey)}
				</div>
				<button className="icon-btn" aria-label={t.common.close} onClick={onClose} style={{ width: 28, height: 28 }}>
					<CloseIcon size={14} />
				</button>
			</div>
			<div className={s.edgeSentence}>
				{sentence(
					t,
					from?.name ?? t.common.someone,
					relationship.relationshipName,
					to?.name ?? t.common.someoneLower,
					from?.gender
				)}
			</div>
			<div className={s.mono}>
				{relationship.relationshipName?.name ?? "UNKNOWN"} ·{" "}
				{relationship.isBidirectional ? t.panel.bidirectional : t.panel.directional}
			</div>
			{isOwner ? (
				<button className="btn btn-danger-outline" style={{ height: 40, fontSize: 14 }} onClick={onRemove}>
					{t.common.removeRelationship}
				</button>
			) : null}
		</div>
	);
};
