import { Tree } from "@/lib";
import { initPocketBase } from "@/lib/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateTreeButton } from "./CreateTree";
import { DeleteTreeButton } from "./DeleteTreeButton";
import { ManageInvitedButton } from "./ManageInvitedButton";

export default async function TreesPage() {
	const pb = await initPocketBase();
	if (!pb.authStore.isValid) {
		return redirect("/");
	}
	let trees: Tree[];
	try {
		const treesRecords = await pb.collection("ft_trees").getFullList({
			sort: "-updated",
		});
		trees = treesRecords.map((record) => new Tree(record));
	} catch (error) {
		console.error(error);
		return null;
	}
	return (
		<div>
			<h1 className="title">Trees</h1>
			<div className="columns is-multiline">
				{trees.map((tree) => (
					<div key={tree.id} className="column is-one-third">
						<div className="card">
							<div className="card-content">
								<p className="title">{tree.name}</p>
							</div>
							<footer className="card-footer">
								<Link href={`/trees/${tree.id}`} className="card-footer-item">
									View
								</Link>
								<DeleteTreeButton treeId={tree.id} treeName={tree.name} />
								<ManageInvitedButton treeData={tree.serialize()} />
							</footer>
						</div>
					</div>
				))}
			</div>
			<CreateTreeButton />
		</div>
	);
}
