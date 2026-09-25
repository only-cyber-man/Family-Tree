import Link from "next/link";
import { ReactNode } from "react";
import { getT } from "@/i18n/server";
import { Brand } from "./Logo";
import { PreferenceControls } from "./PreferenceControls";
import styles from "./legal.module.css";

/** Server-only: reads the request's language. */
export const LegalLinks = () => {
	const t = getT();
	return (
		<>
			<Link href="/privacy">{t.legal.privacy}</Link>
			<Link href="/delete-account">{t.legal.deleteAccount}</Link>
			<a href="mailto:family-tree@cyber-man.pl">family-tree@cyber-man.pl</a>
		</>
	);
};

export const LegalShell = ({ children }: { children: ReactNode }) => {
	const t = getT();
	return (
		<div className={styles.shell}>
			<nav className={styles.nav} aria-label={t.common.mainNav}>
				<Brand collapsible />
				<div className={styles.navEnd}>
					<PreferenceControls />
					<Link href="/sign-in" style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>
						{t.legal.signIn}
					</Link>
				</div>
			</nav>
			<main className={styles.main}>{children}</main>
			<footer className={styles.footer}>
				<span>{t.common.createdBy}</span>
				<div className={styles.footerLinks}>
					<LegalLinks />
				</div>
			</footer>
		</div>
	);
};
