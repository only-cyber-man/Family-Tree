import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { initPocketBase } from "@/lib/ssr";
import { AuthShell } from "@/components/AuthShell";
import { getT } from "@/i18n/server";
import { LoginForm } from "./LoginForm";

export const generateMetadata = (): Metadata => ({ title: getT().meta.signIn });

export default async function SignInPage() {
	const pb = await initPocketBase();
	if (pb.authStore.isValid) {
		return redirect("/trees");
	}
	const t = getT();
	return (
		<AuthShell prompt={t.auth.signInPrompt} linkLabel={t.auth.signInLink} linkHref="/sign-up">
			<LoginForm />
		</AuthShell>
	);
}
