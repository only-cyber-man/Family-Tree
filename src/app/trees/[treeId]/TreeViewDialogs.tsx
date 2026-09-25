"use client";

import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { Gender, getPocketbaseError, Node, Relationship, RelationshipName } from "@/lib";
import { normalizeText } from "@/lib/filters";
import { pictureUrl, sortByName, toDateInput, yearsText } from "@/lib/people";
import { GROUPS, GROUP_ORDER, groupLabel, sentence, typeLabel } from "@/lib/relationshipStyle";
import { Dialog } from "@/components/Dialog";
import { AlertIcon, CalendarIcon, CameraIcon, DownloadIcon, SearchIcon } from "@/components/Icons";
import { PersonAvatar } from "./PersonAvatar";
import { useT } from "@/i18n/client";
import s from "./treeView.module.css";

/** Name or note contains the query, ignoring case and diacritics. */
const matches = (nodes: Node[], query: string) => {
	const q = normalizeText(query.trim());
	return [...nodes]
		.filter((n) => normalizeText(n.name).includes(q) || normalizeText(n.note).includes(q))
		.sort(sortByName);
};

export const FindDialog = ({
	nodes,
	onPick,
	onClose,
}: {
	nodes: Node[];
	onPick: (node: Node) => void;
	onClose: () => void;
}) => {
	const t = useT();
	const dl = t.dialogs;
	const [query, setQuery] = useState("");
	const [active, setActive] = useState(0);
	const results = useMemo(() => matches(nodes, query), [nodes, query]);

	return (
		<Dialog title={dl.findTitle} onClose={onClose} width={460} placement="top" bare className="dialog-flush">
			<div className={s.findInput}>
				<SearchIcon />
				<input
					autoFocus
					placeholder={dl.findPlaceholder}
					aria-label={dl.searchPeople}
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setActive(0);
					}}
					onKeyDown={(e) => {
						if (e.key === "ArrowDown") {
							e.preventDefault();
							setActive((i) => Math.min(i + 1, results.length - 1));
						} else if (e.key === "ArrowUp") {
							e.preventDefault();
							setActive((i) => Math.max(i - 1, 0));
						} else if (e.key === "Enter" && results[active]) {
							onPick(results[active]);
						}
					}}
				/>
			</div>
			<div className={s.results} role="listbox">
				{results.map((node, i) => (
					<button
						key={node.id}
						role="option"
						aria-selected={i === active}
						className={`${s.result} ${i === active ? s.resultActive : ""}`}
						onMouseEnter={() => setActive(i)}
						onClick={() => onPick(node)}
					>
						<PersonAvatar node={node} size={32} fontSize={11} />
						<span>
							<span className={s.resultName}>{node.name}</span>
							<span className={s.resultMeta}>{yearsText(node)}</span>
						</span>
					</button>
				))}
				{results.length === 0 ? <div className={s.noResults}>{dl.noResults}</div> : null}
			</div>
		</Dialog>
	);
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_NOTE = 2000;

export interface AccountOption {
	id: string;
	/** Shown in the select: "Me (tomek)", or the email. */
	label: string;
	/** Used in messages: the username or email. */
	name: string;
}

export const PersonDialog = ({
	node,
	nodes,
	treeId,
	accounts,
	onSave,
	onClose,
}: {
	node: Node | null;
	/** Everyone in the tree, to keep one account linked to one person. */
	nodes: Node[];
	treeId: string;
	/** Accounts that can be linked: the signed-in user first, then the others with access. */
	accounts: AccountOption[];
	onSave: (data: FormData) => Promise<void>;
	onClose: () => void;
}) => {
	const t = useT();
	const dl = t.dialogs;
	const [name, setName] = useState(node?.name ?? "");
	const [gender, setGender] = useState<Gender>(node?.gender ?? "female");
	const [birth, setBirth] = useState(toDateInput(node?.birthDate ?? null));
	const [death, setDeath] = useState(toDateInput(node?.deathDate ?? null));
	const [note, setNote] = useState(node?.note ?? "");
	const [linkedUser, setLinkedUser] = useState(node?.userId ?? "");
	const [photo, setPhoto] = useState<File | null>(null);
	const [removePhoto, setRemovePhoto] = useState(false);
	const [errors, setErrors] = useState<{
		name?: string;
		birth?: string;
		death?: string;
		photo?: string;
		note?: string;
	}>({});
	const noteId = useId();
	const linkedId = useId();
	const linkedElsewhere = linkedUser
		? nodes.find((n) => n.userId === linkedUser && n.id !== node?.id) ?? null
		: null;
	const linkConflict = linkedElsewhere
		? dl.linkedConflict(
				accounts.find((a) => a.id === linkedUser)?.name ?? linkedUser,
				linkedElsewhere.name
		  )
		: null;
	const [serverError, setServerError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const fileInput = useRef<HTMLInputElement>(null);

	const previewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
	useEffect(() => () => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
	}, [previewUrl]);
	const existingUrl = node && !removePhoto ? pictureUrl(node, "200x200") : null;
	const shownPhoto = previewUrl ?? existingUrl;

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		const found: typeof errors = {};
		if (!name.trim()) {
			found.name = dl.nameRequired;
		}
		if (!birth) {
			found.birth = dl.birthRequired;
		}
		if (birth && death && death < birth) {
			found.death = dl.deathBeforeBirth;
		}
		if (note.length > MAX_NOTE) {
			found.note = dl.noteTooLong(MAX_NOTE);
		}
		setErrors(found);
		if (Object.keys(found).length > 0 || linkConflict) {
			return;
		}
		const data = new FormData();
		data.append("name", name.trim());
		data.append("gender", gender);
		data.append("note", note.trim());
		// An empty value clears the link.
		data.append("user", linkedUser);
		data.append("birthDate", birth);
		if (death || node) {
			// An empty value clears a previously set death date.
			data.append("deathDate", death);
		}
		if (photo) {
			data.append("picture", photo);
		} else if (removePhoto && node?.pictureUrl) {
			data.append("picture", "");
		}
		if (!node) {
			data.append("tree", treeId);
		}
		setBusy(true);
		setServerError(null);
		try {
			await onSave(data);
		} catch (err: any) {
			setServerError(getPocketbaseError(err));
			setBusy(false);
		}
	};

	return (
		<Dialog
			title={node ? dl.editPerson : dl.addPerson}
			subtitle={dl.personSubtitle}
			onClose={onClose}
			width={520}
		>
			<form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
				{serverError ? (
					<div className="alert" role="alert">
						<AlertIcon />
						<span>{serverError}</span>
					</div>
				) : null}
				<div className={s.photoRow}>
					<div
						className={`${s.photo} ${shownPhoto ? s.photoFilled : ""}`}
						style={shownPhoto ? { backgroundImage: `url("${shownPhoto}")` } : undefined}
						aria-hidden
					>
						{shownPhoto ? null : <CameraIcon />}
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
						<div style={{ display: "flex", gap: 8 }}>
							<button type="button" className="btn btn-outline btn-sm" style={{ fontSize: 13 }} onClick={() => fileInput.current?.click()}>
								{shownPhoto ? dl.changePhoto : dl.uploadPhoto}
							</button>
							{shownPhoto ? (
								<button
									type="button"
									className="btn btn-ghost btn-sm"
									style={{ fontSize: 13, color: "var(--ink3)" }}
									onClick={() => {
										setPhoto(null);
										setRemovePhoto(true);
										if (fileInput.current) {
											fileInput.current.value = "";
										}
									}}
								>
									{t.common.remove}
								</button>
							) : null}
						</div>
						{errors.photo ? (
							<span className="field-error">
								<AlertIcon size={14} />
								{errors.photo}
							</span>
						) : (
							<span className="field-hint">{dl.photoHint}</span>
						)}
						<input
							ref={fileInput}
							type="file"
							accept="image/png,image/jpeg,image/webp,image/gif"
							hidden
							onChange={(e) => {
								const file = e.target.files?.[0] ?? null;
								if (file && file.size > MAX_PHOTO_BYTES) {
									setErrors((x) => ({ ...x, photo: dl.photoTooLarge }));
									e.target.value = "";
									return;
								}
								setErrors((x) => ({ ...x, photo: undefined }));
								setPhoto(file);
								setRemovePhoto(false);
							}}
						/>
					</div>
				</div>
				<label className="field">
					<span className="field-label">{dl.fullName}</span>
					<input
						className={`input input-sunken ${errors.name ? "is-invalid" : ""}`}
						placeholder={dl.namePlaceholder}
						value={name}
						onChange={(e) => {
						setName(e.target.value);
						setErrors((x) => ({ ...x, name: undefined }));
					}}
						autoFocus
					/>
					{errors.name ? (
						<span className="field-error">
							<AlertIcon size={14} />
							{errors.name}
						</span>
					) : null}
				</label>
				<div className="field">
					<span className="field-label">{t.filters.gender}</span>
					<div style={{ display: "flex", gap: 8 }} role="radiogroup" aria-label={t.filters.gender}>
						{(["female", "male"] as const).map((value) => (
							<button
								key={value}
								type="button"
								role="radio"
								aria-checked={gender === value}
								className={`${s.genderPick} ${gender === value ? s.genderPickOn : ""}`}
								onClick={() => setGender(value)}
							>
								<span
									className={s.swatch}
									style={{
										background: `var(--${value}-fill)`,
										border: `2px solid var(--${value}-border)`,
									}}
								/>
								{value === "female" ? t.common.female : t.common.male}
							</button>
						))}
					</div>
				</div>
				<div className={s.twoCol}>
					<label className="field">
						<span className="field-label">{dl.birthDate}</span>
						<input
							type="date"
							className={`input input-sunken ${errors.birth ? "is-invalid" : ""}`}
							value={birth}
							max={toDateInput(new Date())}
							onChange={(e) => {
								setBirth(e.target.value);
								setErrors((x) => ({ ...x, birth: undefined, death: undefined }));
							}}
						/>
						{errors.birth ? (
							<span className="field-error">
								<AlertIcon size={14} />
								{errors.birth}
							</span>
						) : null}
					</label>
					<label className="field">
						<span className="field-label">
							<span>
								{dl.deathDate} <span className="field-optional">{t.common.optional}</span>
							</span>
						</span>
						<input
							type="date"
							className={`input input-sunken ${errors.death ? "is-invalid" : ""}`}
							value={death}
							min={birth || undefined}
							onChange={(e) => {
								setDeath(e.target.value);
								setErrors((x) => ({ ...x, death: undefined }));
							}}
						/>
						{errors.death ? (
							<span className="field-error">
								<AlertIcon size={14} />
								{errors.death}
							</span>
						) : null}
					</label>
				</div>
				<div className="field">
					<label className="field-label" htmlFor={noteId}>
						<span>
							{dl.note} <span className="field-optional">{t.common.optional}</span>
						</span>
						<span
							className="field-optional"
							aria-live="polite"
							style={note.length > MAX_NOTE ? { color: "var(--danger)" } : undefined}
						>
							{dl.noteCount(note.length, MAX_NOTE)}
						</span>
					</label>
					<textarea
						id={noteId}
						className={`input input-sunken ${s.noteInput} ${errors.note ? "is-invalid" : ""}`}
						rows={3}
						maxLength={MAX_NOTE}
						placeholder={dl.noteHint}
						value={note}
						onChange={(e) => {
							setNote(e.target.value);
							setErrors((x) => ({ ...x, note: undefined }));
						}}
					/>
					{errors.note ? (
						<span className="field-error">
							<AlertIcon size={14} />
							{errors.note}
						</span>
					) : null}
				</div>
				<div className="field">
					<label className="field-label" htmlFor={linkedId}>
						<span>
							{dl.linkedAccount} <span className="field-optional">{t.common.optional}</span>
						</span>
					</label>
					<select
						id={linkedId}
						className={`input input-sunken ${linkConflict ? "is-invalid" : ""}`}
						value={linkedUser}
						aria-invalid={!!linkConflict}
						aria-describedby={`${linkedId}-hint`}
						onChange={(e) => setLinkedUser(e.target.value)}
					>
						<option value="">{dl.linkedNone}</option>
						{accounts.map((account) => (
							<option key={account.id} value={account.id}>
								{account.label}
							</option>
						))}
					</select>
					{linkConflict ? (
						<span className="field-error" id={`${linkedId}-hint`} role="alert">
							<AlertIcon size={14} />
							{linkConflict}
						</span>
					) : (
						<span className="field-hint" id={`${linkedId}-hint`}>
							{dl.linkedHint}
						</span>
					)}
				</div>
				<div className="dialog-actions" style={{ paddingTop: 4 }}>
					<button type="button" className="btn btn-outline" onClick={onClose}>
						{t.common.cancel}
					</button>
					<button type="submit" className="btn btn-primary" disabled={busy || !!linkConflict}>
						{busy ? <span className="spinner" /> : null}
						{node ? dl.saveChanges : dl.addToTree}
					</button>
				</div>
			</form>
		</Dialog>
	);
};

const PersonPicker = ({
	label,
	nodes,
	value,
	onChange,
	exclude,
}: {
	label: string;
	nodes: Node[];
	value: Node | null;
	onChange: (node: Node | null) => void;
	exclude?: string;
}) => {
	const t = useT();
	const [query, setQuery] = useState(value?.name ?? "");
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(0);
	const wrap = useRef<HTMLDivElement>(null);
	const listId = useId();
	const results = useMemo(
		() => matches(nodes, value ? "" : query).filter((n) => n.id !== exclude),
		[nodes, query, value, exclude]
	);

	useEffect(() => {
		// Typing clears the value; keep what was typed rather than wiping it.
		if (value) {
			setQuery(value.name);
		}
	}, [value]);

	useEffect(() => {
		if (!open) {
			return;
		}
		const close = (e: MouseEvent) => {
			if (wrap.current && !wrap.current.contains(e.target as globalThis.Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, [open]);

	const pick = (node: Node) => {
		onChange(node);
		setOpen(false);
	};

	return (
		<div className={`field ${s.picker}`} ref={wrap}>
			<span className="field-label">{label}</span>
			<input
				className="input input-sunken"
				placeholder={t.dialogs.search}
				value={query}
				role="combobox"
				aria-expanded={open}
				aria-controls={listId}
				aria-label={label}
				onFocus={() => setOpen(true)}
				onChange={(e) => {
					setQuery(e.target.value);
					onChange(null);
					setOpen(true);
					setActive(0);
				}}
				onKeyDown={(e) => {
					if (e.key === "ArrowDown") {
						e.preventDefault();
						setOpen(true);
						setActive((i) => Math.min(i + 1, results.length - 1));
					} else if (e.key === "ArrowUp") {
						e.preventDefault();
						setActive((i) => Math.max(i - 1, 0));
					} else if (e.key === "Enter" && open && results[active]) {
						e.preventDefault();
						pick(results[active]);
					} else if (e.key === "Escape" && open) {
						e.preventDefault();
						setOpen(false);
					}
				}}
			/>
			{open && results.length > 0 ? (
				<div className={s.pickerList} role="listbox" id={listId}>
					{results.map((node, i) => (
						<button
							key={node.id}
							type="button"
							role="option"
							aria-selected={i === active}
							className={`${s.pickerItem} ${i === active ? s.pickerItemActive : ""}`}
							onMouseEnter={() => setActive(i)}
							onClick={() => pick(node)}
						>
							<PersonAvatar node={node} size={26} fontSize={10} />
							{node.name}
							<span className={s.pickerYear}>{node.birthDate.getFullYear()}</span>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
};

export const RelationshipDialog = ({
	nodes,
	relationships,
	relationshipNames,
	initialFrom,
	onSave,
	onClose,
}: {
	nodes: Node[];
	relationships: Relationship[];
	relationshipNames: RelationshipName[];
	initialFrom: Node | null;
	onSave: (from: Node, to: Node, type: RelationshipName) => Promise<void>;
	onClose: () => void;
}) => {
	const t = useT();
	const dl = t.dialogs;
	const [from, setFrom] = useState<Node | null>(initialFrom);
	const [to, setTo] = useState<Node | null>(null);
	const [type, setType] = useState<RelationshipName | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const duplicate =
		from && to && type
			? relationships.some(
					(r) =>
						r.relationshipId === type.id &&
						((r.sourceNodeId === from.id && r.targetNodeId === to.id) ||
							(type.isBidirectional && r.sourceNodeId === to.id && r.targetNodeId === from.id))
			  )
			: false;
	const invalid = !(from && to && type && from.id !== to.id) || duplicate;

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		if (invalid || !from || !to || !type) {
			return;
		}
		setBusy(true);
		setError(null);
		try {
			await onSave(from, to, type);
		} catch (err: any) {
			setError(getPocketbaseError(err));
			setBusy(false);
		}
	};

	return (
		<Dialog
			title={t.common.addRelationship}
			subtitle={
				<>
					{dl.readAsSentence}{" "}
					<em style={{ fontFamily: "var(--font-heading)" }}>
						{type
							? `${sentence(
									t,
									from?.name ?? t.common.someone,
									type,
									to?.name ?? t.common.someoneLower,
									from?.gender
							  )}.`
							: `${from?.name ?? t.common.someone} … ${to?.name ?? t.common.someoneLower}.`}
					</em>
				</>
			}
			onClose={onClose}
			width={560}
		>
			<form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
				{error || duplicate ? (
					<div className="alert" role="alert">
						<AlertIcon />
						<span>{error ?? dl.duplicate}</span>
					</div>
				) : null}
				<div className={s.twoCol}>
					<PersonPicker label={dl.fromPerson} nodes={nodes} value={from} onChange={setFrom} exclude={to?.id} />
					<PersonPicker label={dl.toPerson} nodes={nodes} value={to} onChange={setTo} exclude={from?.id} />
				</div>
				<div className="field" style={{ gap: 8 }}>
					<span className="field-label">{dl.relationType}</span>
					<div className={s.typeGroups}>
						{GROUP_ORDER.map((group) => {
							const types = relationshipNames.filter((n) => n.group === group);
							if (types.length === 0) {
								return null;
							}
							return (
								<div key={group} className={s.typeGroup}>
									<span className={s.typeGroupLabel} style={{ color: GROUPS[group].color }}>
										{GROUPS[group].glyph} {groupLabel(t, group)}
									</span>
									{types.map((option) => (
										<button
											key={option.id}
											type="button"
											aria-pressed={type?.id === option.id}
											className={`${s.typePick} ${type?.id === option.id ? s.typePickOn : ""}`}
											onClick={() => setType(option)}
										>
											{typeLabel(t, option)}
											<span className={s.typeDir} aria-label={option.isBidirectional ? dl.bothWays : dl.oneWay}>
												{option.isBidirectional ? "↔" : "→"}
											</span>
										</button>
									))}
								</div>
							);
						})}
					</div>
				</div>
				<div className="dialog-actions">
					<button type="button" className="btn btn-outline" onClick={onClose}>
						{t.common.cancel}
					</button>
					<button type="submit" className="btn btn-primary" disabled={invalid || busy}>
						{busy ? <span className="spinner" /> : null}
						{t.common.addRelationship}
					</button>
				</div>
			</form>
		</Dialog>
	);
};

export const ExportDialog = ({
	nodes,
	onExport,
	onClose,
}: {
	nodes: Node[];
	onExport: () => void;
	onClose: () => void;
}) => {
	const t = useT();
	const dl = t.dialogs;
	const living = nodes.filter((n) => !n.deathDate).length;
	const dead = nodes.length - living;
	return (
		<Dialog onClose={onClose} bare title={dl.exportTitle} width={460}>
			<div className="dialog-icon is-primary">
				<CalendarIcon size={22} />
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
				<h2 className="dialog-title" style={{ fontSize: 22 }}>
					{dl.exportHeading(nodes.length)}
				</h2>
				<p className="dialog-sub" style={{ fontSize: 15 }}>
					{dl.exportBody}
				</p>
			</div>
			<div className={s.stats}>
				<div>
					<span>{dl.birthdays}</span>
					<strong>{living}</strong>
				</div>
				<div>
					<span>{dl.remembrances}</span>
					<strong>{dead}</strong>
				</div>
			</div>
			<div className="dialog-actions">
				<button className="btn btn-outline" onClick={onClose}>
					{t.common.cancel}
				</button>
				<button className="btn btn-primary" disabled={nodes.length === 0} onClick={onExport}>
					<DownloadIcon />
					{dl.download}
				</button>
			</div>
		</Dialog>
	);
};
