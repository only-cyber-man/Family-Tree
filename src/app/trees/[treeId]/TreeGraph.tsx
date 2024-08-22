"use client";

import {
	Node,
	NodeData,
	Relationship,
	RelationshipData,
	Tree,
	TreeData,
} from "@/lib";
import { BasicNvlWrapper } from "@neo4j-nvl/react";

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

	return (
		<div
			style={{
				width: "100%",
				height: "70vh",
				flex: 1,
				border: "1px solid black",
			}}
		>
			{/* <BasicNvlWrapper
				nodes={nodes.map((n) => n.visualization)}
				rels={relationships.map((r) => r.visualization)}
				nvlOptions={{}}
				nvlCallbacks={{
					onLayoutDone: () => {
						console.log("Layout done");
					},
				}}
				style={{
					width: "100%",
					height: "100%",
				}}
			/> */}
			<BasicNvlWrapper
				nodes={[{ id: "0" }, { id: "1" }]}
				rels={[{ id: "10", from: "0", to: "1" }]}
				nvlOptions={{ initialZoom: 2 }}
				nvlCallbacks={{ onLayoutDone: () => console.log("layout done") }}
			/>
		</div>
	);
};
