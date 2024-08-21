import { initPocketBase } from "@/lib/ssr";
import { redirect } from "next/navigation";

export default async function TreesPage() {
	const pb = await initPocketBase();
	if (!pb.authStore.isValid) {
		return redirect("/");
	}
	return (
		<div>
			<h1 className="title">Trees</h1>
		</div>
	);
}
