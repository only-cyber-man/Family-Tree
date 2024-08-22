"use client";

import { getPocketbaseError, pb } from "@/lib";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const CreateTreeButton = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [name, setName] = useState("");

	const createTreeButtonHandler = async () => {
		try {
			setIsLoading(true);
			const creator = pb.authStore.model?.id ?? "";
			await pb.collection("ft_trees").create({
				name,
				creator,
				invited: [],
			});

			router.refresh();
		} catch (error: any) {
			alert(getPocketbaseError(error));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="field has-addons">
			<div className="control">
				<input
					className={`input ${isLoading && "is-skeleton"}`}
					type="text"
					placeholder="My family tree"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			</div>
			<div className="control">
				<button
					className={`button is-primary ${isLoading && "is-loading"}`}
					onClick={createTreeButtonHandler}
				>
					Create
				</button>
			</div>
		</div>
	);
};
