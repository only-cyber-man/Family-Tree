import { pb } from "./data";

export const SUPPORT_EMAIL = "family-tree@cyber-man.pl";

export const deletionRequestMailto = (email?: string) =>
	`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
		"Delete my Family Tree account"
	)}&body=${encodeURIComponent(
		`Please delete my Family Tree account${
			email ? ` (${email})` : ""
		} and all trees I created.`
	)}`;

/**
 * Deletes the signed-in account: every tree it created (with their people and
 * relationships), then the user record. Trees shared with the account are not
 * touched; the server drops the account from their invited lists.
 */
export const deleteOwnAccount = async () => {
	const me = pb.authStore.record;
	if (!me) {
		throw new Error("You are not signed in.");
	}
	const trees = await pb.collection("ft_trees").getFullList({
		filter: pb.filter("creator = {:id}", { id: me.id }),
		fields: "id",
	});
	for (const tree of trees) {
		const filter = pb.filter("tree = {:tree}", { tree: tree.id });
		const [relationships, nodes] = await Promise.all([
			pb.collection("ft_relationships").getFullList({ filter, fields: "id" }),
			pb.collection("ft_nodes").getFullList({ filter, fields: "id" }),
		]);
		for (const r of relationships) {
			await pb.collection("ft_relationships").delete(r.id);
		}
		for (const n of nodes) {
			await pb.collection("ft_nodes").delete(n.id);
		}
		await pb.collection("ft_trees").delete(tree.id);
	}
	await pb.collection("ft_users").delete(me.id);
	pb.authStore.clear();
	document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};
