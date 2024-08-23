"use client";

import { getPocketbaseError, pb, Tree, TreeData } from "@/lib";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface GettableUserId {
	id: string;
	email: string;
}

const isValidEmail = (email: string) => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const ManageInvitedButton = ({ treeData }: { treeData: TreeData }) => {
	const tree = new Tree(treeData);
	const [isLoading, setIsLoading] = useState(true);
	const [invited, setInvited] = useState<GettableUserId[]>([]);
	const invitedSelectRef = useRef<HTMLSelectElement>(null);
	const deleteSelectedButtonRef = useRef<HTMLButtonElement>(null);
	const invitedInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		pb.autoCancellation(false);
		const getEmails = async () => {
			try {
				setIsLoading(true);
				const _invited: GettableUserId[] = [];
				for (const invitedId of tree.invitedIds) {
					const { id, email } = await pb
						.collection("ft_gettable_users_id_email")
						.getOne(invitedId);
					_invited.push({ id, email });
				}
				setInvited(_invited);
			} catch (error: any) {
				alert(getPocketbaseError(error));
			} finally {
				setIsLoading(false);
			}
		};

		getEmails();
	}, []);

	const deleteSelectedHandler = async () => {
		try {
			const invitedId = invitedSelectRef.current?.value;
			if (!invitedId) {
				return;
			}
			tree.revoke(invitedId);
			await pb.collection("ft_trees").update(tree.id, tree.serialize());
			window.location.reload();
		} catch (error: any) {
			alert(getPocketbaseError(error));
		}
	};

	const manageHandler = async () => {
		try {
			setIsLoading(true);
			await withReactContent(Swal).fire({
				background: "currentColor",
				didOpen: () => {
					if (!deleteSelectedButtonRef.current) {
						return;
					}
					deleteSelectedButtonRef.current.addEventListener(
						"click",
						deleteSelectedHandler
					);
				},
				didClose: () => {
					deleteSelectedButtonRef.current?.removeEventListener(
						"click",
						deleteSelectedHandler
					);
				},
				html: (
					<div
						style={{
							alignItems: "flex-start",
						}}
					>
						<div className="field">
							<label className="label">Revoking invited</label>
							<div className="control">
								<div className="select is-fullwidth">
									<select ref={invitedSelectRef}>
										{invited.map((node) => (
											<option key={node.id} value={node.id}>
												{node.email}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>
						<div className="field">
							<div className="control">
								<button
									className="button is-danger"
									ref={deleteSelectedButtonRef}
								>
									Revoke
								</button>
							</div>
						</div>

						<div className="field">
							<label className="label">Invite new viewer</label>
							<div className="control">
								<input
									ref={invitedInputRef}
									className="input"
									type="email"
									placeholder="john@doe.com"
								/>
							</div>
						</div>
					</div>
				),
				confirmButtonText: "Invite",
				showCancelButton: true,
				preConfirm: async () => {
					const email = invitedInputRef.current?.value ?? "";
					if (!isValidEmail(email)) {
						return Swal.showValidationMessage("Invalid email");
					}

					try {
						const { userId } = await pb
							.collection("ft_gettable_users_email")
							.getOne(email);
						tree.invitedIds.push(userId);
						await pb.collection("ft_trees").update(tree.id, tree.serialize());
						window.location.reload();
					} catch (error: any) {
						return Swal.showValidationMessage(getPocketbaseError(error));
					}
				},
			});
		} catch (error: any) {
			alert(getPocketbaseError(error));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<a
			onClick={manageHandler}
			className={`card-footer-item is-link ${isLoading && "is-loading"}`}
		>
			Manage
		</a>
	);
};
