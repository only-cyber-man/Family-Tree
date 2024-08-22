"use client";

import {
	Node,
	NodeData,
	Relationship,
	RelationshipData,
	Tree,
	TreeData,
} from "@/lib";
import { ElementDefinition } from "cytoscape";
import CytoscapeComponent from "react-cytoscapejs";

export const TreeGraph = ({
	nodesData,
	relationshipsData,
	treeData,
}: {
	treeData: TreeData;
	relationshipsData: RelationshipData[];
	nodesData: NodeData[];
}) => {
	const tree = new Tree(treeData);
	const nodes = nodesData.map((n) => new Node(n));
	const relationships = relationshipsData.map((r) => new Relationship(r));

	const elements: ElementDefinition[] = [
		...nodes.map((n) => n.visualization),
		...relationships.map((r) => r.visualization),
	];

	return (
		<div
			style={{
				width: "100%",
				height: "70vh",
				flex: 1,
				border: "1px solid black",
				backgroundColor: "white",
				borderRadius: "5px",
			}}
		>
			<CytoscapeComponent
				elements={elements}
				style={{
					width: "100%",
					height: "100%",
				}}
				maxZoom={2}
				minZoom={0.5}
				// https://js.cytoscape.org/#layouts
				layout={{
					name: "grid", // random
				}}
			/>
		</div>
	);
};
