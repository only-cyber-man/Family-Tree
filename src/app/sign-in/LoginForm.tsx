"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { pb } from "@/lib";
import { AlertIcon } from "@/components/Icons";
import { PasswordInput } from "@/components/PasswordInput";
import { useT } from "@/i18n/client";
import styles from "@/components/auth.module.css";

const saveSession = () => {
	document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
	window.location.href = "/trees";
};

export const LoginForm = () => {
	const t = useT();
	const a = t.auth;
	const [mode, setMode] = useState<"sign-in" | "reset">("sign-in");
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const signIn = async (e: FormEvent) => {
		e.preventDefault();
		if (!login.trim() || !password) {
			setError(a.missingCredentials);
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			await pb.collection("ft_users").authWithPassword(login.trim(), password);
			saveSession();
			return;
		} catch (userError: any) {
			// 400 is PocketBase's "wrong credentials"; anything else is a real failure.
			if (userError?.status !== 400) {
				setError(userError?.message ?? a.unreachable);
				setIsLoading(false);
				return;
			}
		}
		try {
			await pb.admins.authWithPassword(login.trim(), password);
			saveSession();
		} catch (adminError: any) {
			setError(
				adminError?.status === 400 || adminError?.status === 404
					? a.wrongCredentials
					: adminError?.message ?? a.unreachable
			);
			setIsLoading(false);
		}
	};

	const requestReset = async (e: FormEvent) => {
		e.preventDefault();
		const email = login.trim();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setError(a.resetEmailMissing);
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			await pb.collection("ft_users").requestPasswordReset(email);
			setNotice(a.resetSent(email));
		} catch (err: any) {
			setError(err?.message ?? a.resetFailed);
		} finally {
			setIsLoading(false);
		}
	};

	const isReset = mode === "reset";

	return (
		<form className={styles.card} onSubmit={isReset ? requestReset : signIn} noValidate>
			<div>
				<h1 className={styles.title}>{isReset ? a.resetTitle : a.welcomeTitle}</h1>
				<p className={styles.subtitle}>
					{isReset ? a.resetSubtitle : a.welcomeSubtitle}
				</p>
			</div>
			{error ? (
				<div className="alert" role="alert">
					<AlertIcon />
					<span>{error}</span>
				</div>
			) : null}
			{notice ? (
				<div className="alert alert-info" role="status">
					<AlertIcon />
					<span>{notice}</span>
				</div>
			) : null}
			<label className="field">
				<span className="field-label">{isReset ? a.email : a.usernameOrEmail}</span>
				<input
					className="input"
					type={isReset ? "email" : "text"}
					autoComplete={isReset ? "email" : "username"}
					value={login}
					onChange={(e) => setLogin(e.target.value)}
					autoFocus
				/>
			</label>
			{isReset ? null : (
				<div className="field">
					<span className="field-label">
						<label htmlFor="password">{a.password}</label>
						<button
							type="button"
							className={styles.linkButton}
							onClick={() => {
								setMode("reset");
								setError(null);
							}}
						>
							{a.forgot}
						</button>
					</span>
					<PasswordInput
						id="password"
						className="input"
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
			)}
			<button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
				{isLoading ? <span className="spinner" /> : null}
				{isReset
					? isLoading
						? a.sending
						: a.sendReset
					: isLoading
					? a.signingIn
					: a.signIn}
			</button>
			<div className={styles.foot}>
				{isReset ? (
					<button
						type="button"
						className={styles.linkButton}
						style={{ fontSize: 14 }}
						onClick={() => {
							setMode("sign-in");
							setError(null);
							setNotice(null);
						}}
					>
						{a.backToSignIn}
					</button>
				) : (
					<>
						{a.noAccount}{" "}
						<Link href="/sign-up" style={{ fontWeight: 600 }}>
							{a.signUp}
						</Link>
					</>
				)}
			</div>
		</form>
	);
};
