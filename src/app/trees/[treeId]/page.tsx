import { initPocketBase } from "@/lib/ssr";
import { redirect } from "next/navigation";
import { TreeGraph } from "./TreeGraph";
import { Node, Relationship, Tree } from "@/lib";

interface Params {
	params: {
		treeId: string;
	};
	searchParams: {};
}

export default async function TreePage({ params: { treeId } }: Params) {
	const pb = await initPocketBase();
	if (!pb.authStore.isValid) {
		return redirect("/");
	}
	let tree: Tree;
	let relationships: Relationship[];
	let nodes: Node[];
	try {
		const treeRecord = await pb.collection("ft_trees").getOne(treeId);
		tree = new Tree(treeRecord);
		const relationshipsRecords = await pb
			.collection("ft_relationships")
			.getFullList({
				expand: "relationshipName",
				filter: `tree.id = "${tree.id}"`,
			});
		relationships = relationshipsRecords.map(
			(relationshipRecord) => new Relationship(relationshipRecord)
		);
		const nodesRecords = await pb.collection("ft_nodes").getFullList({
			filter: `tree.id = "${tree.id}"`,
		});
		nodes = nodesRecords.map((nodeRecord) => new Node(nodeRecord));
	} catch (error) {
		console.error(error);
		return redirect("/trees");
	}
	return (
		<div>
			<h1 className="title">Tree {treeId}</h1>
			<TreeGraph
				treeData={tree.serialize()}
				relationshipsData={relationships.map((r) => r.serialize())}
				nodesData={nodes.map((n) => n.serialize())}
			/>
		</div>
	);
}
