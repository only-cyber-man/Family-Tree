import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Tree, getPocketbaseError } from "@/lib";
import { initPocketBase } from "@/lib/ssr";
import { AppNav } from "@/components/AppNav";
import { TreesDashboard, TreeSummary } from "./TreesDashboard";

export const metadata: Metadata = { title: "Your trees" };

export default async function TreesPage() {
	const pb = await initPocketBase();
	if (!pb.authStore.isValid) {
		return redirect("/");
	}
	const me = pb.authStore.record;
	const userName: string = me?.username || me?.name || me?.email || "you";

	let trees: Tree[];
	try {
		const records = await pb.collection("ft_trees").getFullList({ sort: "-updated" });
		trees = records.map((record) => new Tree(record));
	} catch (error: any) {
		return redirect(`/?err=${encodeURIComponent(getPocketbaseError(error))}`);
	}

	// Emails are only readable through the ft_gettable_users_id_email view.
	const emailCache = new Map<string, Promise<string | null>>();
	const emailOf = (id: string) => {
		if (!emailCache.has(id)) {
			emailCache.set(
				id,
				pb
					.collection("ft_gettable_users_id_email")
					.getOne(id)
					.then((r) => (r.email as string) ?? null)
					.catch(() => null)
			);
		}
		return emailCache.get(id)!;
	};

	const summaries: TreeSummary[] = await Promise.all(
		trees.map(async (tree) => {
			const isOwner = tree.creatorId === me?.id;
			const [people, invited, creatorEmail] = await Promise.all([
				pb
					.collection("ft_nodes")
					.getList(1, 1, {
						filter: pb.filter("tree.id = {:id}", { id: tree.id }),
						fields: "id",
					})
					.then((list) => list.totalItems)
					.catch(() => null),
				Promise.all(
					(tree.invitedIds ?? []).map(async (id) => ({
						id,
						email: (await emailOf(id)) ?? "unknown account",
					}))
				),
				isOwner ? Promise.resolve(null) : emailOf(tree.creatorId),
			]);
			return {
				id: tree.id,
				name: tree.name,
				updated: tree.updated.toISOString(),
				isOwner,
				people,
				invited,
				creatorEmail,
			};
		})
	);

	return (
		<>
			<AppNav userName={userName} />
			<TreesDashboard trees={summaries} userName={userName} />
		</>
	);
}
