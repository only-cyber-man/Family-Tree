"use client";

import ForceGraph from "force-graph";
import { useEffect, useRef } from "react";

export const TreeGraph = () => {
	const treeGraph = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!treeGraph.current) {
			return;
		}
		// treeGraph.current.graph
		const Graph = ForceGraph()(treeGraph.current);
		Graph.graphData({
			nodes: [{ id: "Harry" }, { id: "Sally" }, { id: "Alice" }],
			links: [
				{ source: "Harry", target: "Sally" },
				{ source: "Harry", target: "Alice" },
			],
		}).nodeCanvasObject((node, ctx, globalScale) => {
			console.log(node.id);
		});
	}, [treeGraph]);

	return (
		<div
			ref={treeGraph}
			style={{
				maxHeight: "70vh",
				flex: 1,
				overflow: "hidden",
				border: "1px solid black",
				backgroundColor: "gray",
			}}
		></div>
	);
};
