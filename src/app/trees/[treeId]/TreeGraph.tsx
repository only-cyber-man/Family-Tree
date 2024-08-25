"use client";

import { useEffect, useRef } from "react";
import { Network } from "vis-network/esnext";
import { AddNodeButton } from "./AddNodeButton";
import { useTree } from "@/lib/hooks/useTree";
import { AddRelationshipButton } from "./AddRelationshipButton";
import { RemoveNodeButton } from "./RemoveNodeButton";
import { RemoveRelationshipButton } from "./RemoveRelationshipButton";
import { Node } from "@/lib";
import { FiltersButton } from "./FiltersButton";
import { SelectNodeModal } from "./SelectNodeModal";
import { ExportVisibleButton } from "./ExportVisibleButton";

export const TreeGraph = () => {
	const {
		tree,
		shouldUpdateRelationships,
		setShouldUpdateRelationships,
		setSelectedNode,
	} = useTree();
	const graphArea = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = graphArea.current;
		if (!container || !tree) {
			return;
		}
		const baseYear = tree.nodes.reduce((acc, node) => {
			if (node.birthDate.getFullYear() < acc) {
				return node.birthDate.getFullYear();
			}
			return acc;
		}, Infinity);
		const nodesWithLevel: { node: Node; level: number }[] = tree.nodes
			.filter((n) => n.isVisible)
			.map((node) => ({
				node,
				level: node.birthDate.getFullYear() - baseYear,
			}));

		const rangeInterval = 20;
		const Xrange: { [key: number]: number } = {};
		const getX = (level: number) => {
			const selectedRange = Math.floor(level / rangeInterval);
			if (!Xrange[selectedRange]) {
				Xrange[selectedRange] = 1;
			} else {
				Xrange[selectedRange] += 1;
			}
			return Xrange[selectedRange];
		};

		const network = new Network(
			container,
			{
				nodes: nodesWithLevel.map(({ node, level }) =>
					node.visualization(level * 8, getX(level) * 200)
				),
				edges: tree.relationships
					.filter((r) => r.isVisible)
					.map((r) => r.visualization()),
			},
			{
				physics: {
					enabled: false,
				},
				edges: {
					smooth: false,
					length: 500,
				},
				nodes: {
					shape: "box",
				},
				layout: {
					randomSeed: 1,
				},
			}
		);
		network.on("click", (properties) => {
			const {
				nodes: [nodeId],
			} = properties;
			const node = tree.nodes.find((n) => n.id === nodeId);
			if (node) {
				setSelectedNode(node);
			} else {
				setSelectedNode(null);
			}
		});
		setShouldUpdateRelationships(false);
		return () => {
			network.destroy();
		};
	}, [
		tree,
		graphArea,
		shouldUpdateRelationships,
		setShouldUpdateRelationships,
		setSelectedNode,
	]);

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
					display: "flex",
					flexWrap: "wrap",
					margin: 16,
				}}
			>
				{tree.isCreator ? (
					<>
						<RemoveRelationshipButton />
						<RemoveNodeButton />
						<AddNodeButton />
						<AddRelationshipButton />
					</>
				) : null}
				<FiltersButton />
				<SelectNodeModal />
				<ExportVisibleButton />
			</div>
		</>
	);
};
