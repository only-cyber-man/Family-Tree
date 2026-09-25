"use client";

import { RelationshipName } from "@/lib";
import { AGE_MAX, AGE_MIN, TreeFilters } from "@/lib/filters";
import { GROUPS, GROUP_ORDER, humanize } from "@/lib/relationshipStyle";
import { CloseIcon } from "@/components/Icons";
import s from "./treeView.module.css";

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const typeLabel = (name: RelationshipName) => capitalize(humanize(name));

export const FiltersDrawer = ({
	filters,
	setFilters,
	relationshipNames,
	visibleText,
	onClear,
	onClose,
}: {
	filters: TreeFilters;
	setFilters: (update: (f: TreeFilters) => TreeFilters) => void;
	relationshipNames: RelationshipName[];
	visibleText: string;
	onClear: () => void;
	onClose: () => void;
}) => {
	const ordered = GROUP_ORDER.flatMap((group) =>
		relationshipNames.filter((n) => n.group === group)
	);
	const toggleType = (id: string) =>
		setFilters((f) => ({
			...f,
			hiddenTypes: f.hiddenTypes.includes(id)
				? f.hiddenTypes.filter((t) => t !== id)
				: [...f.hiddenTypes, id],
		}));

	return (
		<aside className={s.drawer} aria-label="Filters" data-side-panel>
			<div className={s.drawerHead}>
				<h2 style={{ fontSize: 20 }}>Filters</h2>
				<div style={{ display: "flex", gap: 6 }}>
					<button className={s.clearAll} style={{ fontSize: 13, height: 32 }} onClick={onClear}>
						Clear all
					</button>
					<button className="icon-btn" aria-label="Close" onClick={onClose} style={{ width: 32, height: 32 }}>
						<CloseIcon size={16} />
					</button>
				</div>
			</div>
			<div className={s.drawerBody}>
				<div className={s.drawerSection}>
					<div className={s.drawerLabel}>Hide relationship types</div>
					<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
						{ordered.map((name) => {
							const hidden = filters.hiddenTypes.includes(name.id);
							const group = GROUPS[name.group] ?? GROUPS.IRRELEVANT;
							return (
								<button
									key={name.id}
									className={`${s.typeChip} ${hidden ? s.typeChipOff : ""}`}
									aria-pressed={hidden}
									onClick={() => toggleType(name.id)}
								>
									<span style={{ color: group.color }} aria-hidden>
										{group.glyph}
									</span>
									{typeLabel(name)}
								</button>
							);
						})}
					</div>
					<div className="field-hint">
						Struck-through types are hidden from the canvas and the export.
					</div>
				</div>
				<div className={s.drawerSection}>
					<div className={s.drawerLabel}>
						<span>Age</span>
						<span style={{ color: "var(--ink2)", fontWeight: 600 }}>
							{filters.minAge} – {filters.maxAge}
							{filters.maxAge >= AGE_MAX ? "+" : ""}
						</span>
					</div>
					<label className={s.rangeLabel}>
						Minimum
						<input
							className={s.range}
							type="range"
							min={AGE_MIN}
							max={AGE_MAX}
							value={filters.minAge}
							onChange={(e) =>
								setFilters((f) => ({ ...f, minAge: Math.min(+e.target.value, f.maxAge) }))
							}
						/>
					</label>
					<label className={s.rangeLabel}>
						Maximum
						<input
							className={s.range}
							type="range"
							min={AGE_MIN}
							max={AGE_MAX}
							value={filters.maxAge}
							onChange={(e) =>
								setFilters((f) => ({ ...f, maxAge: Math.max(+e.target.value, f.minAge) }))
							}
						/>
					</label>
					<div className="field-hint">Age at death for people who have passed away.</div>
				</div>
				<div className={s.drawerSection}>
					<div className={s.drawerLabel}>Gender</div>
					<div className={s.segmented} role="radiogroup" aria-label="Gender">
						{(
							[
								["both", "Everyone"],
								["male", "Men"],
								["female", "Women"],
							] as const
						).map(([value, label]) => (
							<button
								key={value}
								role="radio"
								aria-checked={filters.gender === value}
								className={`${s.segment} ${filters.gender === value ? s.segmentOn : ""}`}
								onClick={() => setFilters((f) => ({ ...f, gender: value }))}
							>
								{label}
							</button>
						))}
					</div>
				</div>
				<label className="field">
					<span className={s.drawerLabel}>Exclude by name</span>
					<input
						className="input input-sunken"
						style={{ height: 40, fontSize: 14 }}
						placeholder="Nowak, Roman"
						value={filters.nameFilter}
						onChange={(e) => setFilters((f) => ({ ...f, nameFilter: e.target.value }))}
					/>
					<span className="field-hint">Comma-separated. Matches any part of a name.</span>
				</label>
			</div>
			<div className={s.drawerFoot}>
				<span>{visibleText}</span>
				<button className="btn btn-primary btn-sm" style={{ height: 40 }} onClick={onClose}>
					Done
				</button>
			</div>
		</aside>
	);
};
