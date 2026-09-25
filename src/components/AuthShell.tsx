import Link from "next/link";
import { ReactNode } from "react";
import { getT } from "@/i18n/server";
import { Brand } from "./Logo";
import { LegalLinks } from "./LegalShell";
import { PreferenceControls } from "./PreferenceControls";
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
}) => {
	const t = getT();
	return (
		<div className={styles.shell}>
			<nav className={styles.nav} aria-label={t.common.mainNav}>
				<Brand collapsible />
				<div className={styles.navEnd}>
					<PreferenceControls />
					<div className={styles.prompt}>
						<span className="hide-sm">{prompt} </span>
						<Link href={linkHref} style={{ fontWeight: 600 }}>
							{linkLabel}
						</Link>
					</div>
				</div>
			</nav>
			<main className={styles.main}>{children}</main>
			<footer className={styles.footer}>
				<span>{t.common.createdBy}</span>
				<span style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
					<LegalLinks />
				</span>
			</footer>
		</div>
	);
};
