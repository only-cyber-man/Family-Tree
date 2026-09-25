import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { initPocketBase } from "@/lib/ssr";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignUpPage() {
	const pb = await initPocketBase();
	if (pb.authStore.isValid) {
		return redirect("/trees");
	}
	return (
		<AuthShell prompt="Already have an account?" linkLabel="Sign in" linkHref="/sign-in">
			<RegisterForm />
		</AuthShell>
	);
}
