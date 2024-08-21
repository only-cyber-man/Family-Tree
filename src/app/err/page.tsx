import Link from "next/link";
import { redirect } from "next/navigation";

export default function Err({
	searchParams: { err },
}: {
	searchParams: { err?: string };
}): JSX.Element {
	if (err) {
		return (
			<main>
				<h1 className="title">🚨 Error occurred 🚨</h1>
				<p>{err}</p>
				<hr />
				<Link href="/">Click here to go to the main page</Link>
			</main>
		);
	} else {
		return redirect("/");
	}
}
