import { Gender } from "@/lib";
import { useTree } from "@/lib/hooks/useTree";
import { useState } from "react";

export const FiltersButton = () => {
	const { filterOut, tree, setShouldUpdateRelationships } = useTree();
	const [relationshipNameFilters, setRelationshipNameFilters] = useState<
		string[]
	>([]);
	const [minimumAge, setMinimumAge] = useState(0);
	const [maximumAge, setMaximumAge] = useState(100);
	const [gender, setGender] = useState<Gender | "both">("both");
	const [nameFilter, setNameFilter] = useState("");
	const [currentFilter, setCurrentFilter] = useState(
		tree?.relationshipNames.map((rn) => rn.name)[0] ?? ""
	);
	const [isOpen, setIsOpen] = useState(false);
	if (!tree) {
		return null;
	}

	const relationShipNamesToChooseFrom = tree.relationshipNames.map(
		(rn) => rn.name
	);

	const filterOutButtonHandler = () => {
		filterOut({
			relationships: { relationShipNames: relationshipNameFilters },
			nodesAge: { minAge: minimumAge, maxAge: maximumAge },
			nodesGender: { genderToSee: gender },
			nodesName: { name: nameFilter },
		});
		setShouldUpdateRelationships(true);
		setIsOpen(false);
	};

	return (
		<>
			<div className={`modal ${isOpen && "is-active"}`}>
				<div
					className="modal-background"
					onClick={() => setIsOpen(false)}
				></div>
				<div className="modal-content box">
					<div className="field">
						<label className="label">Relationship to exlude</label>
						<div className="control">
							<div className="select">
								<select
									value={currentFilter}
									onChange={(e) => setCurrentFilter(e.target.value)}
								>
									{relationShipNamesToChooseFrom.map((name, index) => (
										<option key={`name-${index}`}>{name}</option>
									))}
								</select>
							</div>
							<button
								className="button"
								onClick={() => {
									if (relationshipNameFilters.includes(currentFilter)) {
										return;
									}
									setRelationshipNameFilters([
										...relationshipNameFilters,
										currentFilter,
									]);
									setCurrentFilter(relationShipNamesToChooseFrom[0]);
								}}
							>
								Add
							</button>
						</div>
						{relationshipNameFilters.map((name, index) => (
							<div
								key={`filter-${index}`}
								className="tag"
								style={{
									margin: "0.5rem",
									marginBottom: "0.1rem",
								}}
							>
								{name}
								<button
									className="delete"
									onClick={() => {
										setRelationshipNameFilters(
											relationshipNameFilters.filter((r) => r !== name)
										);
									}}
								></button>
							</div>
						))}
					</div>
					<div className="field">
						<label className="label">Minimum Age</label>
						<input
							style={{
								width: "100%",
							}}
							value={minimumAge}
							onChange={(e) => setMinimumAge(Number(e.target.value))}
							min={-1}
							max={maximumAge}
							type="range"
						/>
						<div
							className="is-fullwidth"
							style={{
								display: "flex",
								justifyContent: "space-between",
							}}
						>
							<span>-1</span>
							<span>{minimumAge}</span>
							<span>{maximumAge}</span>
						</div>
					</div>
					<div className="field">
						<label className="label">Maximum Age</label>
						<input
							style={{
								width: "100%",
							}}
							value={maximumAge}
							onChange={(e) => setMaximumAge(Number(e.target.value))}
							min={minimumAge}
							max={100}
							type="range"
						/>
						<div
							className="is-fullwidth"
							style={{
								display: "flex",
								justifyContent: "space-between",
							}}
						>
							<span>{minimumAge}</span>
							<span>{maximumAge}</span>
							<span>{100}</span>
						</div>
					</div>
					<div className="field">
						<label className="label">Gender to see</label>
						<div className="control">
							<div className="select is-fullwidth">
								<select
									value={gender}
									onChange={(e) => setGender(e.target.value as Gender | "both")}
								>
									<option>both</option>
									<option>male</option>
									<option>female</option>
								</select>
							</div>
						</div>
					</div>
					<div className="field">
						<label className="label">
							Exclude by name <i>(comma separate for multiple)</i>
						</label>
						<div className="control">
							<input
								type="text"
								className="input"
								placeholder="John"
								value={nameFilter}
								onChange={(e) => setNameFilter(e.target.value)}
							/>
						</div>
					</div>
					<button
						className="button is-link is-fullwidth"
						onClick={filterOutButtonHandler}
					>
						Filter out
					</button>
				</div>

				<button
					className="modal-close is-large"
					aria-label="close"
					onClick={() => setIsOpen(false)}
				></button>
			</div>
			<button
				className="button is-link"
				style={{ marginBottom: "1rem", marginRight: "1rem" }}
				onClick={() => setIsOpen(true)}
			>
				Filters
			</button>
		</>
	);
};
