"use client";

import { getPocketbaseError, pb } from "@/lib";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const DeleteTreeButton = ({
	treeId,
	treeName,
}: {
	treeId: string;
	treeName: string;
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const deleteHandler = async () => {
		try {
			setIsLoading(true);
			const isSure = confirm(
				`Are you sure you want to delete tree\n\n"${treeName}"?\n\nThis action is irreversible!`
			);
			if (isSure) {
				await pb.collection("ft_trees").delete(treeId);
				router.refresh();
			}
		} catch (error: any) {
			alert(getPocketbaseError(error));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<a
			onClick={deleteHandler}
			className={`card-footer-item is-link ${isLoading && "is-loading"}`}
		>
			Delete
		</a>
	);
};
