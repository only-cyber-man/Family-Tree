import { initPocketBase } from "@/lib/ssr";
import Link from "next/link";
import { Subtitle } from "./Subtitle";
import { Title } from "./Title";

export default async function Main({
	searchParams: { err },
}: {
	searchParams: { err?: string };
}) {
	if (err) {
		return (
			<main>
				<h1 className="title">🚨 Error occurred 🚨</h1>
				<p>{err}</p>
			</main>
		);
	}
	const pb = await initPocketBase();
	return (
		<main className="hero">
			<div className="hero-body">
				<Title />
				<Subtitle />
				<div className="buttons">
					{!pb.authStore.isValid && (
						<>
							<Link className="button is-secondary" href="/sign-in">
								Sign in
							</Link>
							<Link className="button is-link" href="/sign-up">
								or Sign up
							</Link>
						</>
					)}
				</div>
			</div>
		</main>
	);
}
