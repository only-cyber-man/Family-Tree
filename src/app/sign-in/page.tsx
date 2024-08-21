import { initPocketBase } from "@/lib/ssr";
import { LoginForm } from "./LoginForm";
import { redirect } from "next/navigation";

export default async function SignInPage() {
	const pb = await initPocketBase();
	if (pb.authStore.isValid) {
		return redirect("/");
	}
	return (
		<div>
			<h1 className="title">Sign in</h1>
			<LoginForm />
		</div>
	);
}
