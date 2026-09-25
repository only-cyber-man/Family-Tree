import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";
import { getLocale, getT } from "@/i18n/server";
import styles from "@/components/legal.module.css";
import { DELETE_ACCOUNT_CONTENT } from "./content";

export const generateMetadata = (): Metadata => {
	const t = getT();
	return { title: t.meta.deleteAccount, description: t.meta.deleteAccountDescription };
};

export default function DeleteAccountPage() {
	const t = getT();
	const Content = DELETE_ACCOUNT_CONTENT[getLocale()];
	return (
		<LegalShell>
			<header>
				<div className={styles.eyebrow}>{t.common.appName}</div>
				<h1 className={styles.title}>{t.legal.deleteTitle}</h1>
				<p className={styles.meta}>{t.legal.deleteAppliesTo}</p>
			</header>
			<Content />
		</LegalShell>
	);
}
