// Account deletion, mirroring the web client (../src/lib/account.ts):
// every tree the account created (its relationships, then its people, then the
// tree), then the ft_users record. Trees shared *with* the account are not
// touched; the server drops the account from their invited lists.

import { en, type Dict } from "../i18n/en";

export const SUPPORT_EMAIL = "family-tree@cyber-man.pl";

/** Fallback when a server step fails: a prefilled email to support. */
export function deletionRequestMailto(email?: string | null, L: Dict = en): string {
	return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(L.deleteAccount.mailSubject)}&body=${encodeURIComponent(L.deleteAccount.mailBody(email ?? undefined))}`;
}

/** The slice of the PocketBase client this needs (injectable for tests). */
export interface DeletionClient {
	filter: (expr: string, params: Record<string, unknown>) => string;
	collection: (name: string) => {
		getFullList: (opts: { filter: string; fields: string }) => Promise<{ id: string }[]>;
		delete: (id: string) => Promise<unknown>;
	};
}

export async function deleteOwnAccount(client: DeletionClient, userId: string): Promise<void> {
	const trees = await client.collection("ft_trees").getFullList({ filter: client.filter("creator = {:id}", { id: userId }), fields: "id" });
	for (const tree of trees) {
		const filter = client.filter("tree = {:tree}", { tree: tree.id });
		const [relationships, nodes] = await Promise.all([
			client.collection("ft_relationships").getFullList({ filter, fields: "id" }),
			client.collection("ft_nodes").getFullList({ filter, fields: "id" }),
		]);
		for (const r of relationships) await client.collection("ft_relationships").delete(r.id);
		for (const n of nodes) await client.collection("ft_nodes").delete(n.id);
		await client.collection("ft_trees").delete(tree.id);
	}
	await client.collection("ft_users").delete(userId);
}
