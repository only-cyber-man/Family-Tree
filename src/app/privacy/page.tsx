import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";
import styles from "@/components/legal.module.css";

export const metadata: Metadata = {
	title: "Privacy policy",
	description: "What Family Tree stores, why, and how to delete it.",
};

const EMAIL = "family-tree@cyber-man.pl";

export default function PrivacyPage() {
	return (
		<LegalShell>
			<header>
				<div className={styles.eyebrow}>Family Tree</div>
				<h1 className={styles.title}>Privacy policy</h1>
				<p className={styles.meta}>Effective 25 September 2026</p>
			</header>

			<section className={styles.section}>
				<p>
					Family Tree lets you build a private family tree on the web at
					family-tree.cyber-man.pl and in the Family Tree app for Android and
					iOS (package <strong>pl.cyberman.familytree</strong>). This policy
					explains what we store, why, who can see it, and how to delete it. It
					is written by the developer, tomek7667, who runs the service and is
					responsible for your data. Questions:{" "}
					<a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
				</p>
			</section>

			<section className={styles.section}>
				<h2>What we store</h2>
				<ul>
					<li>
						<strong>Your account:</strong> username, display name, email address
						and a password. The password is stored only as a secure hash.
					</li>
					<li>
						<strong>Your trees:</strong> the tree names you choose, and for each
						person you add: name, gender, birth date, optional death date and
						an optional photo, plus the relationships you draw between people.
					</li>
					<li>
						<strong>Sharing:</strong> the list of accounts you invite to view a
						tree. Inviting someone looks up whether an account exists for the
						email you type; it does not send them anything.
					</li>
				</ul>
				<p>
					We do not collect location, contacts, advertising identifiers,
					analytics or crash reports, and there is no advertising in the web
					site or the app.
				</p>
			</section>

			<section className={styles.section}>
				<h2>Why we store it</h2>
				<p>
					Only to provide the service you signed up for: signing you in,
					showing your trees to you and to the people you invite, and sending
					the one-off email that verifies your address or resets your
					password. The legal basis is the performance of our agreement with
					you (Art. 6(1)(b) GDPR). We never sell your data or use it for
					advertising or profiling.
				</p>
			</section>

			<section className={styles.section}>
				<h2>Information about your relatives</h2>
				<p>
					A family tree is, by its nature, information about other people. Add
					only what you are entitled to share, keep trees private unless the
					people in them would be comfortable with who you invite, and remove a
					person if they ask you to. You can edit or delete any person at any
					time.
				</p>
			</section>

			<section className={styles.section}>
				<h2>Who can see your data</h2>
				<ul>
					<li>You, and the accounts you explicitly invite to a tree (read-only).</li>
					<li>
						The developer, only as far as needed to run, secure and fix the
						service.
					</li>
				</ul>
				<p>
					There are no public trees and no search across families. We do not
					share your data with third parties, except where the law requires
					it.
				</p>
			</section>

			<section className={styles.section}>
				<h2>Where it is kept</h2>
				<p>
					Your account and trees are stored in a database on a server operated
					by the developer, and all traffic to it is encrypted (HTTPS). The web
					site sets one essential cookie, <code>pb_auth</code>, to keep you
					signed in; it is not used for tracking.
				</p>
				<p>
					The mobile app additionally keeps on your phone: your sign-in token
					in the system&apos;s secure storage, a copy of recently opened trees
					so you can look at them offline, and your app settings. If you turn
					on reminders, birthday and remembrance notifications are scheduled
					locally on your phone; nothing about them is sent to us. The camera
					and photo library are used only when you choose to add a photo to a
					person.
				</p>
			</section>

			<section className={styles.section}>
				<h2>How long we keep it, and deleting it</h2>
				<p>
					We keep your data for as long as you have an account. You can delete
					single people, relationships or whole trees at any time. Deleting your
					account removes the account and every tree you created, with all the
					people, photos and relationships in them. Trees other people created
					and shared with you are theirs and stay with them.
				</p>
				<p>
					Delete your account in the app (Settings → Delete account), on the
					web on your <Link href="/account">account page</Link>, or by emailing{" "}
					<a href={`mailto:${EMAIL}`}>{EMAIL}</a> from the address on your
					account. See <Link href="/delete-account">how to delete your account</Link>.
					Signing out of the app removes everything it stored on your phone.
				</p>
			</section>

			<section className={styles.section}>
				<h2>Your rights</h2>
				<p>
					You can ask for a copy of your data, have it corrected or deleted,
					restrict or object to its processing, and receive it in a portable
					format. Write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>; we answer
					within 30 days. You can also complain to your data protection
					authority; in Poland that is the President of the Personal Data
					Protection Office (UODO).
				</p>
			</section>

			<section className={styles.section}>
				<h2>Children</h2>
				<p>
					Family Tree is not directed at children, and accounts are for people
					aged 16 and over. Children may of course appear in a tree their
					family builds.
				</p>
			</section>

			<section className={styles.section}>
				<h2>Changes</h2>
				<p>
					If this policy changes, the new version will be published on this
					page with a new effective date. Significant changes will also be
					announced in the app.
				</p>
			</section>
		</LegalShell>
	);
}
