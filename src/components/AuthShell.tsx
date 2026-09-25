import Link from "next/link";
import { ReactNode } from "react";
import { Brand } from "./Logo";
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
			<a href="mailto:family-tree@cyber-man.pl">family-tree@cyber-man.pl</a>
		</footer>
	</div>
);
