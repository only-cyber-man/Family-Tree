import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { initPocketBase } from "@/lib/ssr";
import { getT } from "@/i18n/server";
import { TreeView } from "./TreeView";

export const generateMetadata = (): Metadata => ({ title: getT().meta.tree });

export default async function TreePage({ params: { treeId } }: { params: { treeId: string } }) {
	const pb = await initPocketBase();
	if (!pb.authStore.isValid) {
		return redirect("/");
	}
	const me = pb.authStore.record;
	const userName: string = me?.username || me?.name || me?.email || getT().common.you;
	return <TreeView treeId={treeId} userName={userName} userId={me?.id ?? ""} />;
}
