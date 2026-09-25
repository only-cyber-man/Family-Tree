import { deleteOwnAccount, deletionRequestMailto, type DeletionClient } from "../account";

function fakeServer(failOn?: string) {
	const data: Record<string, { id: string; creator?: string; tree?: string }[]> = {
		ft_trees: [
			{ id: "t1", creator: "me" },
			{ id: "t2", creator: "me" },
			{ id: "shared", creator: "other" },
		],
		ft_nodes: [
			{ id: "n1", tree: "t1" },
			{ id: "n2", tree: "t2" },
			{ id: "n3", tree: "shared" },
		],
		ft_relationships: [
			{ id: "r1", tree: "t1" },
			{ id: "r3", tree: "shared" },
		],
		ft_users: [{ id: "me" }, { id: "other" }],
	};
	const log: string[] = [];
	const client: DeletionClient = {
		filter: (expr, params) => expr.replace(/\{:(\w+)\}/g, (_, k) => String(params[k])),
		collection: (name) => ({
			getFullList: async ({ filter }) => {
				const [field, value] = filter.split(" = ");
				return data[name].filter((r) => (r as Record<string, unknown>)[field] === value);
			},
			delete: async (id) => {
				if (failOn === `${name}:${id}`) throw new Error("server said no");
				log.push(`${name}:${id}`);
				data[name] = data[name].filter((r) => r.id !== id);
			},
		}),
	};
	return { client, data, log };
}

describe("account deletion", () => {
	it("deletes own trees (relationships, then people, then tree), then the user, like the web", async () => {
		const { client, data, log } = fakeServer();
		await deleteOwnAccount(client, "me");
		expect(log).toEqual(["ft_relationships:r1", "ft_nodes:n1", "ft_trees:t1", "ft_nodes:n2", "ft_trees:t2", "ft_users:me"]);
		// Trees shared with the account are untouched.
		expect(data.ft_trees.map((t) => t.id)).toEqual(["shared"]);
		expect(data.ft_nodes.map((n) => n.id)).toEqual(["n3"]);
		expect(data.ft_users.map((u) => u.id)).toEqual(["other"]);
	});

	it("stops at the failing step and never deletes the user record", async () => {
		const { client, data } = fakeServer("ft_trees:t2");
		await expect(deleteOwnAccount(client, "me")).rejects.toThrow("server said no");
		expect(data.ft_users.map((u) => u.id)).toContain("me");
	});

	it("builds the deletion-request email", () => {
		const url = deletionRequestMailto("anna@example.com");
		expect(url.startsWith("mailto:family-tree@cyber-man.pl?subject=Delete%20my%20Family%20Tree%20account&body=")).toBe(true);
		expect(decodeURIComponent(url.split("body=")[1])).toBe("Please delete my Family Tree account (anna@example.com) and all trees I created.");
		expect(decodeURIComponent(deletionRequestMailto().split("body=")[1])).toBe("Please delete my Family Tree account and all trees I created.");
	});
});
