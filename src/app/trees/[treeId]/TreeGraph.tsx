"use client";

import { useEffect, useRef } from "react";
import { Network } from "vis-network/esnext";
import { AddNodeButton } from "./AddNodeButton";
import { useTree } from "@/lib/hooks/useTree";
import { AddRelationshipButton } from "./AddRelationshipButton";
import { RemoveNodeButton } from "./RemoveNodeButton";
import { RemoveRelationshipButton } from "./RemoveRelationshipButton";
import { Node, Relationship } from "@/lib";

export const TreeGraph = () => {
	const { tree } = useTree();
	const graphArea = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = graphArea.current;
		if (!container || !tree) {
			return;
		}

		// TODO: sort hierarchically in the family (y, isOther)

		const network = new Network(
			container,
			{
				nodes: tree.nodes.map((n) => n.visualization(0, false)),
				edges: tree.relationships.map((r) => r.visualization()),
			},
			{
				physics: {
					enabled: false,
				},
				edges: {
					physics: false,
					smooth: false,
				},
				nodes: {
					physics: false,
					shape: "box",
				},
			}
		);
		return () => {
			network.destroy();
		};
	}, [tree, graphArea]);

	if (!tree) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<div
				style={{
					width: "100%",
					height: "70vh",
					flex: 1,
					border: "1px solid black",
					backgroundColor: "white",
					borderRadius: "5px",
					position: "relative",
				}}
				ref={graphArea}
			></div>
			<div
				style={{
					width: "100%",
					flexDirection: "row",
					justifyContent: "space-evenly",
					display: "flex",
					margin: 16,
				}}
			>
				<RemoveRelationshipButton />
				<RemoveNodeButton />
				<AddNodeButton />
				<AddRelationshipButton />
			</div>
		</>
	);
};
