"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/Logo";
import { CloseIcon, MenuIcon } from "@/components/Icons";
import { PreferenceControls } from "@/components/PreferenceControls";
import { useT } from "@/i18n/client";
import styles from "./landing.module.css";

export const LandingNav = () => {
	const t = useT();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLElement>(null);
	const links = [
		{ href: "#features", label: t.landing.nav.features },
		{ href: "#calendar", label: t.landing.nav.calendar },
		{ href: "#mobile", label: t.landing.nav.mobile },
		{ href: "#how", label: t.landing.nav.how },
	];

	useEffect(() => {
		if (!open) {
			return;
		}
		const close = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
		document.addEventListener("mousedown", close);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", close);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	return (
		<nav ref={ref} className={`${styles.wrap} ${styles.nav}`} aria-label={t.common.mainNav}>
			<Brand size={30} />
			<div className={styles.navLinks}>
				{links.map((link) => (
					<a key={link.href} href={link.href}>
						{link.label}
					</a>
				))}
			</div>
			<div className={styles.navActions}>
				<PreferenceControls variant="full" className={styles.hideNarrow} />
				<Link href="/sign-in" className={styles.linkBtn}>
					{t.landing.nav.logIn}
				</Link>
				<Link href="/sign-up" className={`btn btn-primary ${styles.hideNarrow}`}>
					{t.landing.nav.signUp}
				</Link>
				<button
					className={styles.menuBtn}
					aria-label={open ? t.landing.nav.closeMenu : t.landing.nav.openMenu}
					aria-expanded={open}
					aria-controls="landing-menu"
					onClick={() => setOpen((v) => !v)}
				>
					{open ? <CloseIcon size={20} /> : <MenuIcon />}
				</button>
			</div>
			{open ? (
				<div className={styles.mobileMenu} id="landing-menu">
					{links.map((link) => (
						<a key={link.href} href={link.href} className={styles.menuLink} onClick={() => setOpen(false)}>
							{link.label}
						</a>
					))}
					<Link href="/sign-up" className={`${styles.menuLink} ${styles.menuSignUp}`} onClick={() => setOpen(false)}>
						{t.landing.nav.signUp}
					</Link>
					<div className={styles.menuPrefs}>
						<PreferenceControls variant="full" />
					</div>
				</div>
			) : null}
		</nav>
	);
};
