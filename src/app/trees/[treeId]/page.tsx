import { initPocketBase } from "@/lib/ssr";
import { redirect } from "next/navigation";
import { TreeBody } from "./TreeBody";

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
	return <TreeBody treeId={treeId} />;
}
