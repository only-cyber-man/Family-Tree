"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/Logo";
import { CloseIcon, MenuIcon } from "@/components/Icons";
import styles from "./landing.module.css";

const LINKS = [
	{ href: "#features", label: "Features" },
	{ href: "#calendar", label: "Calendar" },
	{ href: "#mobile", label: "Mobile app" },
	{ href: "#how", label: "How it works" },
];

export const LandingNav = () => {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		if (!open) {
			return;
		}
		const close = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, [open]);

	return (
		<nav ref={ref} className={`${styles.wrap} ${styles.nav}`} aria-label="Main">
			<Brand size={30} />
			<div className={styles.navLinks}>
				{LINKS.map((link) => (
					<a key={link.href} href={link.href}>
						{link.label}
					</a>
				))}
			</div>
			<div className={styles.navActions}>
				<Link href="/sign-in" className={styles.linkBtn}>
					Log in
				</Link>
				<Link href="/sign-up" className={`btn btn-primary ${styles.hideNarrow}`}>
					Sign up
				</Link>
				<button
					className={styles.menuBtn}
					aria-label={open ? "Close menu" : "Open menu"}
					aria-expanded={open}
					onClick={() => setOpen((v) => !v)}
				>
					{open ? <CloseIcon size={20} /> : <MenuIcon />}
				</button>
			</div>
			{open ? (
				<div className={styles.mobileMenu}>
					{LINKS.map((link) => (
						<a key={link.href} href={link.href} onClick={() => setOpen(false)}>
							{link.label}
						</a>
					))}
					<Link href="/sign-up" onClick={() => setOpen(false)}>
						Sign up
					</Link>
				</div>
			) : null}
		</nav>
	);
};
