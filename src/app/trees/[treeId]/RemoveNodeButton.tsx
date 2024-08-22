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

export const RemoveNodeButton = () => {
	const { deleteNode, tree } = useTree();
	const [isLoading, setIsLoading] = useState(false);
	const nodeRef = useRef<HTMLSelectElement>(null);
	const nodes = tree?.nodes.map((n) => ({ id: n.id, name: n.name })) ?? [];

	if (!tree) {
		return null;
	}

	const removeNode = () => {
		withReactContent(Swal).fire({
			background: "currentColor",
			html: (
				<div
					style={{
						alignItems: "flex-start",
					}}
				>
					<div className="field">
						<label className="label">Node to delete</label>
						<div className="control">
							<div className="select is-fullwidth">
								<select ref={nodeRef}>
									{nodes.map((node) => (
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
			confirmButtonText: "Remove Node",
			showCancelButton: true,
			preConfirm: async () => {
				const id = nodeRef.current?.value ?? "";
				try {
					setIsLoading(true);
					await deleteNode(id);
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
			onClick={removeNode}
		>
			Remove Node
		</button>
	);
};
