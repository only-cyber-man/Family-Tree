"use client";

import { getPocketbaseError } from "@/lib";
import { useTree } from "@/lib/hooks/useTree";
import { useRef, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface SelectData {
	id: string;
	name: string;
}

export const RemoveRelationshipButton = () => {
	const { deleteRelationship, tree } = useTree();
	const [isLoading, setIsLoading] = useState(false);
	const nodeRef = useRef<HTMLSelectElement>(null);

	const relationships =
		tree?.relationships.map((r) => {
			const sourceNode = tree.nodes.find((n) => n.id === r.sourceNodeId);
			const targetNode = tree.nodes.find((n) => n.id === r.targetNodeId);
			const relationshipName = tree.relationshipNames.find(
				(rn) => rn.id === r.relationshipId
			)?.name;
			return {
				id: r.id,
				name: `${sourceNode?.name} ${relationshipName} ${targetNode?.name}`,
			};
		}) ?? [];

	if (!tree) {
		return null;
	}

	const removeRelationship = () => {
		withReactContent(Swal).fire({
			background: "currentColor",
			html: (
				<div
					style={{
						alignItems: "flex-start",
					}}
				>
					<div className="field">
						<label className="label">Relationship to delete</label>
						<div className="control">
							<div className="select is-fullwidth">
								<select ref={nodeRef}>
									{relationships.map((relationship) => (
										<option key={relationship.id} value={relationship.id}>
											{relationship.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
				</div>
			),
			confirmButtonText: "Remove Node",
			showCancelButton: true,
			preConfirm: async () => {
				const id = nodeRef.current?.value ?? "";
				try {
					setIsLoading(true);
					await deleteRelationship(id);
				} catch (error: any) {
					return Swal.showValidationMessage(getPocketbaseError(error));
				} finally {
					setIsLoading(false);
				}
			},
		});
	};

	return (
		<button
			className={`button is-danger ${isLoading && "is-loading"}`}
			onClick={removeRelationship}
		>
			Remove Relationship
		</button>
	);
};
