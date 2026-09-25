import Link from "next/link";
import { ReactNode } from "react";
import { Brand } from "./Logo";
import { LegalLinks } from "./LegalShell";
import styles from "./auth.module.css";

export const AuthShell = ({
	prompt,
	linkLabel,
	linkHref,
	children,
}: {
	prompt: string;
	linkLabel: string;
	linkHref: string;
	children: ReactNode;
}) => (
	<div className={styles.shell}>
		<nav className={styles.nav}>
			<Brand />
			<div className={styles.prompt}>
				<span className="hide-sm">{prompt} </span>
				<Link href={linkHref} style={{ fontWeight: 600 }}>
					{linkLabel}
				</Link>
			</div>
		</nav>
		<main className={styles.main}>{children}</main>
		<footer className={styles.footer}>
			<span>Created by tomek7667</span>
			<span style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
				<LegalLinks />
			</span>
		</footer>
	</div>
);
