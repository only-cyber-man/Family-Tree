import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { RecordModel } from "pocketbase";
import { initPocketBase } from "@/lib/ssr";
import { AppNav } from "@/components/AppNav";
import { isAdmin, type AdminNodeRow, type AdminRelationshipRow, type AdminTreeRow } from "@/lib/adminStats";
import { buildCanvas } from "@/lib/stains";
import { StainCanvas } from "./StainCanvas";
import s from "./admin.module.css";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const str = (value: unknown) => (typeof value === "string" ? value : "");

const toTree = (r: RecordModel): AdminTreeRow => ({
	id: r.id,
	name: str(r.name),
	created: str(r.created),
	updated: str(r.updated),
	creatorEmail: str(r.creatorEmail),
	creatorUsername: str(r.creatorUsername),
});

const toNode = (r: RecordModel): AdminNodeRow => ({
	id: r.id,
	tree: str(r.tree),
	name: str(r.name),
	gender: r.gender === "female" ? "female" : "male",
	birthDate: str(r.birthDate),
	deathDate: str(r.deathDate),
	picture: str(r.picture),
	created: str(r.created),
	updated: str(r.updated),
});

const toRelationship = (r: RecordModel): AdminRelationshipRow => ({
	id: r.id,
	tree: str(r.tree),
	sourceNode: str(r.sourceNode),
	targetNode: str(r.targetNode),
	relationshipName: str(r.relationshipName),
	created: str(r.created),
});

/** Every tree from every account on one big canvas you can pan and zoom. */
export default async function AdminPage() {
	const pb = await initPocketBase();
	if (!pb.authStore.isValid) {
		return redirect("/sign-in");
	}
	const me = pb.authStore.record;
	if (!isAdmin(me)) {
		notFound();
	}
	const userName: string = me?.username || me?.name || me?.email || "Admin";

	let canvas: ReturnType<typeof buildCanvas> | null = null;
	let error: string | null = null;
	try {
		const [trees, nodes, relationships, names] = await Promise.all([
			pb.collection("ft_admin_trees").getFullList({ batch: 1000, sort: "id" }),
			pb.collection("ft_admin_nodes").getFullList({ batch: 1000, sort: "id" }),
			pb.collection("ft_admin_relationships").getFullList({ batch: 1000, sort: "id" }),
			pb.collection("ft_relationships_names").getFullList({ batch: 1000 }),
		]);
		canvas = buildCanvas(
			trees.map(toTree),
			nodes.map(toNode),
			relationships.map(toRelationship),
			names.map((n) => ({ id: n.id, name: str(n.name) }))
		);
	} catch (e: any) {
		error = e?.response?.message || e?.message || String(e);
	}

	return (
		<div className={s.page}>
			<AppNav userName={userName} isAdmin current="admin" />
			{canvas && canvas.stains.length > 0 ? (
				<StainCanvas stains={canvas.stains} emptyTrees={canvas.emptyTrees} />
			) : (
				<main className={s.message}>
					<h1>Admin</h1>
					{error ? (
						<div className="alert" role="alert">
							<span>Could not load the admin views: {error}</span>
						</div>
					) : (
						<p>
							No trees with people came back. If there should be some, check the views&apos; API rules
							and that this account&apos;s email is verified.
						</p>
					)}
					<p>
						The canvas reads three PocketBase views: <code>ft_admin_trees</code>, <code>ft_admin_nodes</code>{" "}
						and <code>ft_admin_relationships</code>. Their queries and API rules are at the top of{" "}
						<code>src/lib/adminStats.ts</code>.
					</p>
				</main>
			)}
		</div>
	);
}
