import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";
import { getLocale, getT } from "@/i18n/server";
import styles from "@/components/legal.module.css";
import { PRIVACY_CONTENT } from "./content";

export const generateMetadata = (): Metadata => {
	const t = getT();
	return { title: t.meta.privacy, description: t.meta.privacyDescription };
};

export default function PrivacyPage() {
	const t = getT();
	const Content = PRIVACY_CONTENT[getLocale()];
	return (
		<LegalShell>
			<header>
				<div className={styles.eyebrow}>{t.common.appName}</div>
				<h1 className={styles.title}>{t.legal.privacyTitle}</h1>
				<p className={styles.meta}>{t.legal.privacyEffective}</p>
			</header>
			<Content />
		</LegalShell>
	);
}
