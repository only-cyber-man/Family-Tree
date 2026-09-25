import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";
import { deletionRequestMailto, SUPPORT_EMAIL } from "@/lib/account";
import styles from "@/components/legal.module.css";

export const metadata: Metadata = {
	title: "Delete your account",
	description: "How to delete your Family Tree account and data.",
};

export default function DeleteAccountPage() {
	return (
		<LegalShell>
			<header>
				<div className={styles.eyebrow}>Family Tree</div>
				<h1 className={styles.title}>Delete your account</h1>
				<p className={styles.meta}>
					Applies to the Family Tree web site and the Family Tree app for Android
					and iOS (pl.cyberman.familytree).
				</p>
			</header>

			<section className={styles.section}>
				<h2>What gets deleted</h2>
				<ul>
					<li>Your account: username, display name, email address and password.</li>
					<li>
						Every tree you created, with all the people, photos, dates and
						relationships in it. People you invited lose access to those trees.
					</li>
					<li>Your access to trees other people shared with you.</li>
				</ul>
				<p>
					Nothing is kept after the deletion. Trees other people created are
					theirs and are not affected.
				</p>
			</section>

			<section className={styles.section}>
				<h2>How to delete it</h2>
				<div className={styles.card}>
					<p>
						<strong>In the app:</strong> Settings → Delete account.
					</p>
					<p>
						<strong>On the web:</strong> sign in and open your account page,
						then choose Delete account.
					</p>
					<div className={styles.actions}>
						<Link href="/account" className="btn btn-primary">
							Go to my account
						</Link>
					</div>
				</div>
				<div className={styles.card}>
					<p>
						<strong>Can&apos;t sign in?</strong> Email{" "}
						<a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from the
						address on your account and ask for it to be deleted. We confirm by
						email and delete everything listed above within 30 days.
					</p>
					<div className={styles.actions}>
						<a href={deletionRequestMailto()} className="btn btn-outline">
							Email a deletion request
						</a>
					</div>
				</div>
			</section>

			<section className={styles.section}>
				<p>
					See the <Link href="/privacy">privacy policy</Link> for everything we
					store and why.
				</p>
			</section>
		</LegalShell>
	);
}
