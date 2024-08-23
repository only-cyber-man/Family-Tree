"use client";

import { getPocketbaseError } from "@/lib";
import { useTree } from "@/lib/hooks/useTree";
import { useRef, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export const AddNodeButton = () => {
	const { createNode, tree } = useTree();
	const [isLoading, setIsLoading] = useState(false);
	const nameRef = useRef<HTMLInputElement>(null);
	const birthDateRef = useRef<HTMLInputElement>(null);
	const deathDateRef = useRef<HTMLInputElement>(null);
	const genderRef = useRef<HTMLSelectElement>(null);
	const fileRef = useRef<HTMLInputElement>(null);

	if (!tree) {
		return null;
	}

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
						<label className="label">Name - Required</label>
						<div className="control">
							<input
								className="input"
								type="text"
								placeholder="John"
								ref={nameRef}
							/>
						</div>
					</div>

					<div className="field">
						<label className="label">Gender - Required</label>
						<div className="control">
							<div className="select is-fullwidth">
								<select ref={genderRef}>
									<option value={"male"}>Male</option>
									<option value={"female"}>Female</option>
								</select>
							</div>
						</div>
					</div>

					<div className="field">
						<label className="label">Birth Date - Required</label>
						<div className="control">
							<input className="input" type="date" ref={birthDateRef} />
						</div>
					</div>

					<div className="field">
						<label className="label">Death Date - Optional</label>
						<div className="control">
							<input className="input" type="date" ref={deathDateRef} />
						</div>
					</div>

					<div className="field">
						<label className="label">Picture - Optional</label>
						<div className="file is-fullwidth">
							<label className="file-label">
								<input className="file-input" type="file" ref={fileRef} />
								<span
									className="file-cta"
									style={{
										width: "100%",
									}}
								>
									<span className="file-icon">
										<i className="fas fa-upload"></i>
									</span>
									<span className="file-label">Choose a file…</span>
								</span>
							</label>
						</div>
					</div>
				</div>
			),
			confirmButtonText: "Add Node",
			showCancelButton: true,
			preConfirm: async () => {
				let name = nameRef.current?.value;
				let birthDate = birthDateRef.current?.value;
				let deathDate = deathDateRef.current?.value;
				let gender = genderRef.current?.value;
				let picture = fileRef.current?.files?.[0];
				const data = new FormData();

				if (name) {
					data.append("name", name);
				}
				if (birthDate) {
					data.append("birthDate", birthDate);
				}
				if (deathDate) {
					data.append("deathDate", deathDate);
				}
				if (gender) {
					data.append("gender", gender);
				}
				if (picture) {
					data.append("picture", picture);
				}
				data.append("tree", tree.object.id);
				try {
					setIsLoading(true);
					await createNode(data);
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
		>
			Add Node
		</button>
	);
};
