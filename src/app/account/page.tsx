import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { initPocketBase } from "@/lib/ssr";
import { AppNav } from "@/components/AppNav";
import styles from "@/components/legal.module.css";
import { DeleteAccount } from "./DeleteAccount";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
	const pb = await initPocketBase();
	if (!pb.authStore.isValid) {
		return redirect("/sign-in");
	}
	const me = pb.authStore.record;
	const userName: string = me?.username || me?.name || me?.email || "you";
	const email: string = me?.email ?? "";

	return (
		<>
			<AppNav userName={userName} />
			<main className={styles.main}>
				<header>
					<h1 className={styles.title}>Your account</h1>
				</header>
				<section className={styles.card}>
					<div className={styles.section}>
						<p>
							<strong>Username:</strong> {me?.username ?? "—"}
						</p>
						{me?.name ? (
							<p>
								<strong>Display name:</strong> {me.name}
							</p>
						) : null}
						<p>
							<strong>Email:</strong> {email || "—"}
						</p>
					</div>
				</section>
				<section className={styles.section}>
					<h2>Delete account</h2>
					<p>
						Deletes your account and every tree you created, with all the
						people, photos and relationships in them. Trees other people shared
						with you are not affected. See the{" "}
						<Link href="/privacy">privacy policy</Link>.
					</p>
					<DeleteAccount email={email} />
				</section>
			</main>
		</>
	);
}
