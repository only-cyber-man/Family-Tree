"use client";

import { useMemo, useState } from "react";
import { Node, Relationship } from "@/lib";
import { ageText, formatDate } from "@/lib/people";
import { extendedFamily } from "@/lib/relatives";
import {
	GROUPS,
	GROUP_ORDER,
	groupOf,
	humanize,
	relationshipsOf,
	sentence,
} from "@/lib/relationshipStyle";
import { CloseIcon, LockIcon, TrashIcon } from "@/components/Icons";
import { PersonAvatar } from "./PersonAvatar";
import s from "./treeView.module.css";

const firstName = (name: string) => name.split(/\s+/)[0];

/** How the other person relates, phrased from the selected person's side. */
const roleText = (relationship: Relationship, selected: Node) => {
	const phrase = humanize(relationship.relationshipName);
	const prefix = /^IS_/.test(relationship.relationshipName?.name ?? "") ? "is " : "";
	if (relationship.isBidirectional) {
		return phrase;
	}
	return relationship.sourceNodeId === selected.id
		? `${firstName(selected.name)} ${prefix}${phrase}`
		: `${prefix}${phrase} ${firstName(selected.name)}`;
};

export const PersonPanel = ({
	node,
	nodes,
	relationships,
	isOwner,
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
	onClose: () => void;
	onSelectNode: (id: string) => void;
	onEdit: () => void;
	onDelete: () => void;
	onAddRelationship: () => void;
	onRemoveRelationship: (id: string) => void;
}) => {
	const [showFamily, setShowFamily] = useState(false);
	const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
	const own = relationshipsOf(relationships, node.id);
	const groups = GROUP_ORDER.map((group) => ({
		group,
		rows: own.filter((r) => (r.relationshipName?.group ?? "IRRELEVANT") === group),
	})).filter((g) => g.rows.length > 0);
	const family = showFamily ? extendedFamily({ nodes, relationships }, node.id) : [];

	return (
		<aside className={s.panel} aria-label={`${node.name} details`} data-side-panel>
			<div className={s.panelHead}>
				<PersonAvatar node={node} size={64} fontSize={20} />
				<div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
					<h2 className={s.panelName}>{node.name}</h2>
					<div className={s.panelMeta}>
						{node.gender === "male" ? "Male" : "Female"} · {ageText(node)}
					</div>
					<div className={s.panelDates}>
						<span>★ {formatDate(node.birthDate)}</span>
						{node.deathDate ? <span>† {formatDate(node.deathDate)}</span> : null}
					</div>
				</div>
				<button className="icon-btn" aria-label="Close" onClick={onClose} style={{ width: 32, height: 32 }}>
					<CloseIcon size={16} />
				</button>
			</div>
			<div className={s.panelBody}>
				{groups.map(({ group, rows }) => (
					<div key={group} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
						<div className={s.groupTitle} style={{ color: GROUPS[group].color }}>
							<span aria-hidden>{GROUPS[group].glyph}</span>
							{GROUPS[group].label}
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
											<span className={s.relRole}>{roleText(r, node)}</span>
										</span>
									</button>
									{isOwner ? (
										<button
											className={s.relRemove}
											aria-label={`Remove relationship with ${other.name}`}
											title="Remove relationship"
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
				{groups.length === 0 ? <div className={s.emptyRels}>No relationships yet.</div> : null}
				{groups.length > 0 ? (
					<button className={s.familyToggle} onClick={() => setShowFamily((v) => !v)}>
						{showFamily ? "Hide extended family" : "Show extended family"}
					</button>
				) : null}
				{showFamily && family.length === 0 ? (
					<div className={s.emptyRels}>
						No parent or marriage links to work out the wider family from.
					</div>
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
							Edit
						</button>
						<button className="btn btn-primary btn-sm" style={{ flex: 1, height: 40 }} onClick={onAddRelationship}>
							Add relationship
						</button>
						<button
							className="btn btn-danger-outline"
							style={{ width: 40, height: 40, padding: 0 }}
							aria-label={`Remove ${node.name}`}
							onClick={onDelete}
						>
							<TrashIcon />
						</button>
					</>
				) : (
					<div className={s.readOnly}>
						<LockIcon />
						Read-only. Only the tree&apos;s creator can edit.
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
	const group = groupOf(relationship.relationshipName);
	const from = nodes.find((n) => n.id === relationship.sourceNodeId);
	const to = nodes.find((n) => n.id === relationship.targetNodeId);
	return (
		<div className={s.edgePanel} role="dialog" aria-label="Relationship">
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<div className={s.groupTitle} style={{ color: group.color }}>
					<span aria-hidden>{group.glyph}</span>
					{group.label}
				</div>
				<button className="icon-btn" aria-label="Close" onClick={onClose} style={{ width: 28, height: 28 }}>
					<CloseIcon size={14} />
				</button>
			</div>
			<div className={s.edgeSentence}>
				{sentence(from?.name ?? "Someone", relationship.relationshipName, to?.name ?? "someone")}
			</div>
			<div className={s.mono}>
				{relationship.relationshipName?.name ?? "UNKNOWN"} ·{" "}
				{relationship.isBidirectional ? "bidirectional" : "directional →"}
			</div>
			{isOwner ? (
				<button className="btn btn-danger-outline" style={{ height: 40, fontSize: 14 }} onClick={onRemove}>
					Remove relationship
				</button>
			) : null}
		</div>
	);
};
