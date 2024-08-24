import { useTree } from "@/lib/hooks/useTree";
import { useState } from "react";

export const FiltersButton = () => {
	const { filterOutRelationShips, tree } = useTree();
	const [relationshipNameFilters, setRelationshipNameFilters] = useState<
		string[]
	>([]);
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

	return (
		<>
			<div className={`modal ${isOpen && "is-active"}`}>
				<div
					className="modal-background"
					onClick={() => setIsOpen(false)}
				></div>
				<div className="modal-content box">
					<div className="field">
						<label className="label">Relationship to filter out</label>
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
						<hr />
						{relationshipNameFilters.map((name, index) => (
							<div
								key={`filter-${index}`}
								className="tag"
								style={{
									margin: "0.5rem",
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
					<button
						className="button is-link is-fullwidth"
						onClick={() => {
							filterOutRelationShips(relationshipNameFilters);
							setIsOpen(false);
						}}
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
