import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { initPocketBase } from "@/lib/ssr";
import { AppNav } from "@/components/AppNav";
import { getT } from "@/i18n/server";
import styles from "@/components/legal.module.css";
import { DeleteAccount } from "./DeleteAccount";

export const generateMetadata = (): Metadata => ({ title: getT().meta.account });

export default async function AccountPage() {
	const pb = await initPocketBase();
	if (!pb.authStore.isValid) {
		return redirect("/sign-in");
	}
	const t = getT();
	const me = pb.authStore.record;
	const userName: string = me?.username || me?.name || me?.email || t.common.you;
	const email: string = me?.email ?? "";

	return (
		<>
			<AppNav userName={userName} />
			<main className={styles.main}>
				<header>
					<h1 className={styles.title}>{t.account.title}</h1>
				</header>
				<section className={styles.card}>
					<div className={styles.section}>
						<p>
							<strong>{t.account.username}</strong> {me?.username ?? "—"}
						</p>
						{me?.name ? (
							<p>
								<strong>{t.account.displayName}</strong> {me.name}
							</p>
						) : null}
						<p>
							<strong>{t.account.email}</strong> {email || "—"}
						</p>
					</div>
				</section>
				<section className={styles.section}>
					<h2>{t.account.deleteHeading}</h2>
					<p>
						{t.account.deleteBodyBefore}
						<Link href="/privacy">{t.account.deleteBodyLink}</Link>
						{t.account.deleteBodyAfter}
					</p>
					<DeleteAccount email={email} />
				</section>
			</main>
		</>
	);
}
