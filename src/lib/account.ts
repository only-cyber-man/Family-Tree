import { pb } from "./data";

/**
 * Deletes the signed-in account in one request. PocketBase lets a user delete
 * their own `ft_users` record (delete rule `id = @request.auth.id`) and does
 * the rest in the same transaction: `ft_trees.creator` cascades to every tree
 * the account created, and those cascade to their people and relationships.
 * Trees shared with the account lose it from their invited lists, and people
 * linked to it in other trees are unlinked. Nothing is deleted if it fails.
 */
export const deleteOwnAccount = async () => {
	const me = pb.authStore.record;
	if (!me) {
		throw new Error("You are not signed in.");
	}
	await pb.collection("ft_users").delete(me.id);
	pb.authStore.clear();
	document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};
