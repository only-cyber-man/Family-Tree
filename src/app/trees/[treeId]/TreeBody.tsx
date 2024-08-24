"use client";

import { useTree } from "@/lib/hooks/useTree";
import { TreeGraph } from "./TreeGraph";
import { useEffect } from "react";

export const TreeBody = ({ treeId }: { treeId: string }) => {
	const { fetchTree, error, tree } = useTree();
	useEffect(() => {
		fetchTree(treeId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [treeId]);

	if (error || !tree) {
		return <div>{error}</div>;
	}

	return (
		<div>
			<h1 className="title">{tree.object.name}</h1>
			<TreeGraph />
		</div>
	);
};
