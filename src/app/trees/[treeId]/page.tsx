import { initPocketBase } from "@/lib/ssr";
import { redirect } from "next/navigation";
import { TreeGraph } from "./TreeGraph";

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
	return (
		<div>
			<h1 className="title">Tree {treeId}</h1>
			<TreeGraph />
		</div>
	);
}
