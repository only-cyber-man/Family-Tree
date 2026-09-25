import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { getT } from "@/i18n/server";

export default function Err({
	searchParams: { err },
}: {
	searchParams: { err?: string };
}): JSX.Element {
	if (!err) {
		return redirect("/");
	}
	const t = getT();
	return (
		<main className="page-center" style={{ minHeight: "100vh" }}>
			<LogoMark size={40} />
			<h1 style={{ fontSize: 28, color: "var(--ink)" }}>{t.errorPage.title}</h1>
			<p style={{ maxWidth: 520, whiteSpace: "pre-line" }}>{err}</p>
			<Link href="/" className="btn btn-primary">
				{t.errorPage.home}
			</Link>
		</main>
	);
}
