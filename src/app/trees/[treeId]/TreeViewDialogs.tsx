"use client";

import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { Gender, getPocketbaseError, Node, Relationship, RelationshipName } from "@/lib";
import { pictureUrl, sortByName, toDateInput, yearsText } from "@/lib/people";
import { GROUPS, GROUP_ORDER, sentence } from "@/lib/relationshipStyle";
import { Dialog } from "@/components/Dialog";
import { AlertIcon, CalendarIcon, CameraIcon, DownloadIcon, SearchIcon } from "@/components/Icons";
import { PersonAvatar } from "./PersonAvatar";
import { typeLabel } from "./FiltersDrawer";
import s from "./treeView.module.css";

const matches = (nodes: Node[], query: string) => {
	const q = query.trim().toLowerCase();
	return [...nodes].filter((n) => n.name.toLowerCase().includes(q)).sort(sortByName);
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
	const [query, setQuery] = useState("");
	const [active, setActive] = useState(0);
	const results = useMemo(() => matches(nodes, query), [nodes, query]);

	return (
		<Dialog title="Find person" onClose={onClose} width={460} placement="top" bare className="dialog-flush">
			<div className={s.findInput}>
				<SearchIcon />
				<input
					autoFocus
					placeholder="Type a name…"
					aria-label="Search people"
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
				{results.length === 0 ? <div className={s.noResults}>No one by that name.</div> : null}
			</div>
		</Dialog>
	);
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export const PersonDialog = ({
	node,
	treeId,
	onSave,
	onClose,
}: {
	node: Node | null;
	treeId: string;
	onSave: (data: FormData) => Promise<void>;
	onClose: () => void;
}) => {
	const [name, setName] = useState(node?.name ?? "");
	const [gender, setGender] = useState<Gender>(node?.gender ?? "female");
	const [birth, setBirth] = useState(toDateInput(node?.birthDate ?? null));
	const [death, setDeath] = useState(toDateInput(node?.deathDate ?? null));
	const [photo, setPhoto] = useState<File | null>(null);
	const [removePhoto, setRemovePhoto] = useState(false);
	const [errors, setErrors] = useState<{ name?: string; birth?: string; death?: string; photo?: string }>({});
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
			found.name = "Enter a name.";
		}
		if (!birth) {
			found.birth = "Enter a birth date.";
		}
		if (birth && death && death < birth) {
			found.death = "Death date is before the birth date.";
		}
		setErrors(found);
		if (Object.keys(found).length > 0) {
			return;
		}
		const data = new FormData();
		data.append("name", name.trim());
		data.append("gender", gender);
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
			title={node ? "Edit person" : "Add person"}
			subtitle="Name and birth date are required. Everything else can wait."
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
								{shownPhoto ? "Change photo" : "Upload photo"}
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
									Remove
								</button>
							) : null}
						</div>
						{errors.photo ? (
							<span className="field-error">
								<AlertIcon size={14} />
								{errors.photo}
							</span>
						) : (
							<span className="field-hint">JPG or PNG, up to 5 MB. Square works best.</span>
						)}
						<input
							ref={fileInput}
							type="file"
							accept="image/png,image/jpeg,image/webp,image/gif"
							hidden
							onChange={(e) => {
								const file = e.target.files?.[0] ?? null;
								if (file && file.size > MAX_PHOTO_BYTES) {
									setErrors((x) => ({ ...x, photo: "That photo is larger than 5 MB." }));
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
					<span className="field-label">Full name</span>
					<input
						className={`input input-sunken ${errors.name ? "is-invalid" : ""}`}
						placeholder="e.g. Maria Kowalska"
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
					<span className="field-label">Gender</span>
					<div style={{ display: "flex", gap: 8 }} role="radiogroup" aria-label="Gender">
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
								{value === "female" ? "Female" : "Male"}
							</button>
						))}
					</div>
				</div>
				<div className={s.twoCol}>
					<label className="field">
						<span className="field-label">Birth date</span>
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
								Death date <span className="field-optional">optional</span>
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
				<div className="dialog-actions" style={{ paddingTop: 4 }}>
					<button type="button" className="btn btn-outline" onClick={onClose}>
						Cancel
					</button>
					<button type="submit" className="btn btn-primary" disabled={busy}>
						{busy ? <span className="spinner" /> : null}
						{node ? "Save changes" : "Add to tree"}
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
				placeholder="Search…"
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
			title="Add relationship"
			subtitle={
				<>
					Read it as a sentence:{" "}
					<em style={{ fontFamily: "var(--font-heading)" }}>
						{type
							? `${sentence(from?.name ?? "Someone", type, to?.name ?? "someone")}.`
							: `${from?.name ?? "Someone"} … ${to?.name ?? "someone"}.`}
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
						<span>{error ?? "That relationship is already in the tree."}</span>
					</div>
				) : null}
				<div className={s.twoCol}>
					<PersonPicker label="From person" nodes={nodes} value={from} onChange={setFrom} exclude={to?.id} />
					<PersonPicker label="To person" nodes={nodes} value={to} onChange={setTo} exclude={from?.id} />
				</div>
				<div className="field" style={{ gap: 8 }}>
					<span className="field-label">Relation type</span>
					<div className={s.typeGroups}>
						{GROUP_ORDER.map((group) => {
							const types = relationshipNames.filter((n) => n.group === group);
							if (types.length === 0) {
								return null;
							}
							return (
								<div key={group} className={s.typeGroup}>
									<span className={s.typeGroupLabel} style={{ color: GROUPS[group].color }}>
										{GROUPS[group].glyph} {GROUPS[group].label}
									</span>
									{types.map((t) => (
										<button
											key={t.id}
											type="button"
											aria-pressed={type?.id === t.id}
											className={`${s.typePick} ${type?.id === t.id ? s.typePickOn : ""}`}
											onClick={() => setType(t)}
										>
											{typeLabel(t)}
											<span className={s.typeDir} aria-label={t.isBidirectional ? "both ways" : "one way"}>
												{t.isBidirectional ? "↔" : "→"}
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
						Cancel
					</button>
					<button type="submit" className="btn btn-primary" disabled={invalid || busy}>
						{busy ? <span className="spinner" /> : null}
						Add relationship
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
	const living = nodes.filter((n) => !n.deathDate).length;
	const dead = nodes.length - living;
	return (
		<Dialog onClose={onClose} bare title="Export to calendar" width={460}>
			<div className="dialog-icon is-primary">
				<CalendarIcon size={22} />
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
				<h2 className="dialog-title" style={{ fontSize: 22 }}>
					Export {nodes.length} {nodes.length === 1 ? "person" : "people"} to your calendar
				</h2>
				<p className="dialog-sub" style={{ fontSize: 15 }}>
					A single .ics file with a yearly birthday for each living person and a
					yearly remembrance day for each person who has passed. Hidden people are
					not included.
				</p>
			</div>
			<div className={s.stats}>
				<div>
					<span>Birthdays</span>
					<strong>{living}</strong>
				</div>
				<div>
					<span>Remembrance anniversaries</span>
					<strong>{dead}</strong>
				</div>
			</div>
			<div className="dialog-actions">
				<button className="btn btn-outline" onClick={onClose}>
					Cancel
				</button>
				<button className="btn btn-primary" disabled={nodes.length === 0} onClick={onExport}>
					<DownloadIcon />
					Download .ics
				</button>
			</div>
		</Dialog>
	);
};
