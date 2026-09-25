import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { initPocketBase } from "@/lib/ssr";
import { TreeView } from "./TreeView";

export const metadata: Metadata = { title: "Tree" };

export default async function TreePage({ params: { treeId } }: { params: { treeId: string } }) {
	const pb = await initPocketBase();
	if (!pb.authStore.isValid) {
		return redirect("/");
	}
	const me = pb.authStore.record;
	const userName: string = me?.username || me?.name || me?.email || "you";
	return <TreeView treeId={treeId} userName={userName} />;
}
