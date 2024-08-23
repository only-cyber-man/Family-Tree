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

		const isParent = (name?: string) => {
			return name === "IS_MOTHER_OF" || name === "IS_FATHER_OF";
		};
		const isSameLevel = (name?: string) => {
			return name === "IS_MARRIED_TO" || name === "IS_DIVORCED_TO";
		};

		const nodesWithLevel: { node: Node; level: number; isOther: boolean }[] =
			tree.nodes.map((node) => {
				let parentId = tree.relationships.find(
					(relationship) =>
						isParent(relationship.relationshipName?.name) &&
						relationship.targetNodeId === node.id
				)?.sourceNodeId;
				// let level = parentId === undefined ? 0 : 1;
				let level = 0;
				while (parentId) {
					parentId = tree.relationships.find(
						(relationship) =>
							isParent(relationship.relationshipName?.name) &&
							relationship.targetNodeId === parentId
					)?.sourceNodeId;
					level++;
				}
				return {
					node,
					level,
					isOther: false,
				};
			});
		// level out // TODO: FIX
		// const nodesWithLevelOut = nodesWithLevel.map((nwl) => {
		// 	let marriedSrc = tree.relationships.find(
		// 		(relationship) =>
		// 			isSameLevel(relationship.relationshipName?.name) &&
		// 			relationship.sourceNodeId === nwl.node.id
		// 	);
		// 	let marriedTrgt = tree.relationships.find(
		// 		(relationship) =>
		// 			isSameLevel(relationship.relationshipName?.name) &&
		// 			relationship.targetNodeId === nwl.node.id
		// 	);
		// 	if (marriedSrc) {
		// 		const leveledNode = nodesWithLevel.find(
		// 			({ node }) => node.id === marriedSrc.targetNodeId
		// 		);
		// 		if (leveledNode) {
		// 			console.log("src", nwl);
		// 			nwl.level = leveledNode.level;
		// 		}
		// 	}
		// 	if (marriedTrgt) {
		// 		const leveledNode = nodesWithLevel.find(
		// 			({ node }) => node.id === marriedTrgt.sourceNodeId
		// 		);
		// 		if (leveledNode) {
		// 			console.log("tgt", nwl);
		// 			nwl.level = leveledNode.level;
		// 		}
		// 	}
		// 	return nwl;
		// });

		const network = new Network(
			container,
			{
				nodes: nodesWithLevel.map(({ node, isOther, level }) =>
					node.visualization(level * 200, isOther)
				),
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
