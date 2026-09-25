import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/Logo";

export default function Err({
	searchParams: { err },
}: {
	searchParams: { err?: string };
}): JSX.Element {
	if (!err) {
		return redirect("/");
	}
	return (
		<main className="page-center" style={{ minHeight: "100vh" }}>
			<LogoMark size={40} />
			<h1 style={{ fontSize: 28, color: "var(--ink)" }}>Something went wrong</h1>
			<p style={{ maxWidth: 520, whiteSpace: "pre-line" }}>{err}</p>
			<Link href="/" className="btn btn-primary">
				Go to the main page
			</Link>
		</main>
	);
}
