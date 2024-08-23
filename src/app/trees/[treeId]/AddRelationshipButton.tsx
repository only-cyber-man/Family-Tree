"use client";

import {
	CreateRelationshipData,
	getPocketbaseError,
	RelationshipData,
} from "@/lib";
import { useTree } from "@/lib/hooks/useTree";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface SelectData {
	id: string;
	name: string;
}

export const AddRelationshipButton = () => {
	const { createRelationship, tree } = useTree();
	const [isLoading, setIsLoading] = useState(false);
	const sourceNodeRef = useRef<HTMLSelectElement>(null);
	const targetNodeRef = useRef<HTMLSelectElement>(null);
	const relationshipNameRef = useRef<HTMLSelectElement>(null);

	const [relationshipNames, setRelationshipNames] = useState<SelectData[]>(
		tree?.relationshipNames ?? []
	);
	const [sourceNodes, setSourceNodes] = useState<SelectData[]>(
		tree?.nodes.map((n) => ({ id: n.id, name: n.name })) ?? []
	);
	const [targetNodes, setTargetNodes] = useState<SelectData[]>(
		tree?.nodes.map((n) => ({ id: n.id, name: n.name })) ?? []
	);

	useEffect(() => {
		if (!tree) {
			return;
		}
		setRelationshipNames(tree.relationshipNames);
		setSourceNodes(tree.nodes.map((n) => ({ id: n.id, name: n.name })));
		setTargetNodes(tree.nodes.map((n) => ({ id: n.id, name: n.name })));
	}, [tree]);

	const addNode = () => {
		withReactContent(Swal).fire({
			background: "currentColor",
			html: (
				<div
					style={{
						alignItems: "flex-start",
					}}
				>
					<div className="field">
						<label className="label">From - Required</label>
						<div className="control">
							<div className="select is-fullwidth">
								<select ref={sourceNodeRef}>
									{sourceNodes.map((node) => (
										<option key={node.id} value={node.id}>
											{node.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					<div className="field">
						<label className="label">Relation - Required</label>
						<div className="control">
							<div className="select is-fullwidth">
								<select ref={relationshipNameRef}>
									{relationshipNames.map((relationship) => (
										<option key={relationship.id} value={relationship.id}>
											{relationship.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					<div className="field">
						<label className="label">To - Required</label>
						<div className="control">
							<div className="select is-fullwidth">
								<select ref={targetNodeRef}>
									{targetNodes.map((node) => (
										<option key={node.id} value={node.id}>
											{node.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
				</div>
			),
			confirmButtonText: "Add Relationship",
			showCancelButton: true,
			preConfirm: async () => {
				let data: CreateRelationshipData = {
					sourceNode: sourceNodeRef.current?.value ?? "",
					targetNode: targetNodeRef.current?.value ?? "",
					relationshipName: relationshipNameRef.current?.value ?? "",
					tree: tree?.object.id ?? "",
				};

				try {
					setIsLoading(true);
					await createRelationship(data);
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
			className={`button is-primary ${isLoading && "is-loading"}`}
			onClick={addNode}
			style={{ marginBottom: "1rem", marginRight: "1rem" }}
		>
			Add Relationship
		</button>
	);
};
