import Link from "next/link";
import { ReactNode } from "react";
import { Brand } from "./Logo";
import styles from "./legal.module.css";

export const LegalLinks = () => (
	<>
		<Link href="/privacy">Privacy</Link>
		<Link href="/delete-account">Delete account</Link>
		<a href="mailto:family-tree@cyber-man.pl">family-tree@cyber-man.pl</a>
	</>
);

export const LegalShell = ({ children }: { children: ReactNode }) => (
	<div className={styles.shell}>
		<nav className={styles.nav}>
			<Brand />
			<Link href="/sign-in" style={{ fontWeight: 600, fontSize: 14 }}>
				Sign in
			</Link>
		</nav>
		<main className={styles.main}>{children}</main>
		<footer className={styles.footer}>
			<span>Created by tomek7667</span>
			<div className={styles.footerLinks}>
				<LegalLinks />
			</div>
		</footer>
	</div>
);
