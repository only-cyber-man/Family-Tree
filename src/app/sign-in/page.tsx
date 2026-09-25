import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { initPocketBase } from "@/lib/ssr";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
	const pb = await initPocketBase();
	if (pb.authStore.isValid) {
		return redirect("/trees");
	}
	return (
		<AuthShell prompt="New here?" linkLabel="Create an account" linkHref="/sign-up">
			<LoginForm />
		</AuthShell>
	);
}
