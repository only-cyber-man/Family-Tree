import { initPocketBase } from "@/lib/ssr";
import { redirect } from "next/navigation";
import { RegisterForm } from "./RegisterForm";

export default async function SignUpPage() {
	const pb = await initPocketBase();
	if (pb.authStore.isValid) {
		return redirect("/");
	}
	return (
		<div>
			<h1 className="title">Sign up</h1>
			<RegisterForm />
		</div>
	);
}
