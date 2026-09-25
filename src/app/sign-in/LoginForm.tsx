"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { pb } from "@/lib";
import { AlertIcon } from "@/components/Icons";
import { PasswordInput } from "@/components/PasswordInput";
import styles from "@/components/auth.module.css";

const saveSession = () => {
	document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
	window.location.href = "/trees";
};

export const LoginForm = () => {
	const [mode, setMode] = useState<"sign-in" | "reset">("sign-in");
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const signIn = async (e: FormEvent) => {
		e.preventDefault();
		if (!login.trim() || !password) {
			setError("Enter your username or email and your password.");
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
				setError(userError?.message ?? "Could not reach the server. Try again.");
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
					? "Wrong username or password. Check both and try again."
					: adminError?.message ?? "Could not reach the server. Try again."
			);
			setIsLoading(false);
		}
	};

	const requestReset = async (e: FormEvent) => {
		e.preventDefault();
		const email = login.trim();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setError("Enter the email address of your account.");
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			await pb.collection("ft_users").requestPasswordReset(email);
			setNotice(
				`If ${email} has an account, a reset link is on its way. Check your inbox.`
			);
		} catch (err: any) {
			setError(err?.message ?? "Could not send the reset email. Try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const isReset = mode === "reset";

	return (
		<form className={styles.card} onSubmit={isReset ? requestReset : signIn} noValidate>
			<div>
				<h1 className={styles.title}>{isReset ? "Reset password" : "Welcome back"}</h1>
				<p className={styles.subtitle}>
					{isReset
						? "We'll email you a link to choose a new one."
						: "Sign in to open your trees."}
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
				<span className="field-label">{isReset ? "Email" : "Username or email"}</span>
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
						<label htmlFor="password">Password</label>
						<button
							type="button"
							className={styles.linkButton}
							onClick={() => {
								setMode("reset");
								setError(null);
							}}
						>
							Forgot?
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
						? "Sending…"
						: "Send reset link"
					: isLoading
					? "Signing in…"
					: "Sign in"}
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
						Back to sign in
					</button>
				) : (
					<>
						Don&apos;t have an account?{" "}
						<Link href="/sign-up" style={{ fontWeight: 600 }}>
							Sign up
						</Link>
					</>
				)}
			</div>
		</form>
	);
};
