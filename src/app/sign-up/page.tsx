import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { initPocketBase } from "@/lib/ssr";
import { AuthShell } from "@/components/AuthShell";
import { getT } from "@/i18n/server";
import { RegisterForm } from "./RegisterForm";

export const generateMetadata = (): Metadata => ({ title: getT().meta.signUp });

export default async function SignUpPage() {
	const pb = await initPocketBase();
	if (pb.authStore.isValid) {
		return redirect("/trees");
	}
	const t = getT();
	return (
		<AuthShell prompt={t.auth.signUpPrompt} linkLabel={t.auth.signUpLink} linkHref="/sign-in">
			<RegisterForm />
		</AuthShell>
	);
}
