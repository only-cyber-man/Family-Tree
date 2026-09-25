"use client";

import { FormEvent, useState } from "react";
import { isValidEmail, pb } from "@/lib";
import { AlertIcon } from "@/components/Icons";
import { PasswordInput } from "@/components/PasswordInput";
import styles from "@/components/auth.module.css";

type Field = "username" | "name" | "email" | "password" | "passwordConfirm";

const MIN_PASSWORD = 8;

const validate = (data: Record<Field, string>) => {
	const errors: Partial<Record<Field, string>> = {};
	if (!data.username.trim()) {
		errors.username = "Pick a username.";
	}
	if (!isValidEmail(data.email.trim())) {
		errors.email = "That doesn't look like a full email address.";
	}
	if (data.password.length < MIN_PASSWORD) {
		errors.password = `At least ${MIN_PASSWORD} characters.`;
	}
	if (data.passwordConfirm !== data.password) {
		errors.passwordConfirm = "Passwords don't match.";
	}
	return errors;
};

const FieldError = ({ message }: { message?: string }) =>
	message ? (
		<span className="field-error">
			<AlertIcon size={14} />
			{message}
		</span>
	) : null;

export const RegisterForm = () => {
	const [data, setData] = useState<Record<Field, string>>({
		username: "",
		name: "",
		email: "",
		password: "",
		passwordConfirm: "",
	});
	const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
	const [serverError, setServerError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setData((d) => ({ ...d, [field]: e.target.value }));
		if (errors[field]) {
			setErrors((current) => ({ ...current, [field]: undefined }));
		}
	};

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		const found = validate(data);
		setErrors(found);
		setServerError(null);
		if (Object.keys(found).length > 0) {
			return;
		}
		setIsLoading(true);
		const username = data.username.trim();
		const email = data.email.trim();
		try {
			await pb.collection("ft_users").create({
				username,
				name: data.name.trim() || username,
				email,
				password: data.password,
				passwordConfirm: data.passwordConfirm,
			});
		} catch (error: any) {
			const fieldErrors: Partial<Record<Field, string>> = {};
			const other: string[] = [];
			Object.entries(error?.response?.data ?? {}).forEach(([key, value]: [string, any]) => {
				if (["username", "name", "email", "password", "passwordConfirm"].includes(key)) {
					fieldErrors[key as Field] = value?.message;
				} else {
					other.push(`${key}: ${value?.message}`);
				}
			});
			setErrors(fieldErrors);
			if (other.length > 0 || Object.keys(fieldErrors).length === 0) {
				setServerError(
					[error?.message ?? "Could not create the account.", ...other].join("\n")
				);
			}
			setIsLoading(false);
			return;
		}
		try {
			await pb.collection("ft_users").requestVerification(email);
		} catch {
			// The account exists; verification can be requested again later.
		}
		try {
			await pb.collection("ft_users").authWithPassword(username, data.password);
			document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
			window.location.href = "/trees";
		} catch (error: any) {
			setServerError(
				`Your account was created, but signing in failed: ${
					error?.message ?? "unknown error"
				}. Try signing in.`
			);
			setIsLoading(false);
		}
	};

	const inputClass = (field: Field) => `input ${errors[field] ? "is-invalid" : ""}`;

	return (
		<form className={`${styles.card} ${styles.cardTight}`} onSubmit={submit} noValidate>
			<div>
				<h1 className={styles.title}>Start your tree</h1>
				<p className={styles.subtitle}>Free, private, no ads.</p>
			</div>
			{serverError ? (
				<div className="alert" role="alert">
					<AlertIcon />
					<span>{serverError}</span>
				</div>
			) : null}
			<div className={styles.row}>
				<label className="field">
					<span className="field-label">Username</span>
					<input
						className={inputClass("username")}
						autoComplete="username"
						value={data.username}
						onChange={set("username")}
						aria-invalid={!!errors.username}
						autoFocus
					/>
					<FieldError message={errors.username} />
				</label>
				<label className="field">
					<span className="field-label">
						<span>
							Display name <span className="field-optional">optional</span>
						</span>
					</span>
					<input
						className={inputClass("name")}
						autoComplete="name"
						placeholder={data.username || "Tomek"}
						value={data.name}
						onChange={set("name")}
					/>
					<FieldError message={errors.name} />
				</label>
			</div>
			<label className="field">
				<span className="field-label">Email</span>
				<input
					className={inputClass("email")}
					type="email"
					autoComplete="email"
					value={data.email}
					onChange={set("email")}
					aria-invalid={!!errors.email}
				/>
				<FieldError message={errors.email} />
			</label>
			<label className="field">
				<span className="field-label">Password</span>
				<PasswordInput
					className={inputClass("password")}
					autoComplete="new-password"
					value={data.password}
					onChange={set("password")}
					aria-invalid={!!errors.password}
				/>
				{errors.password ? (
					<FieldError message={errors.password} />
				) : (
					<span className="field-hint">At least {MIN_PASSWORD} characters.</span>
				)}
			</label>
			<label className="field">
				<span className="field-label">Confirm password</span>
				<PasswordInput
					className={inputClass("passwordConfirm")}
					autoComplete="new-password"
					value={data.passwordConfirm}
					onChange={set("passwordConfirm")}
					aria-invalid={!!errors.passwordConfirm}
				/>
				<FieldError message={errors.passwordConfirm} />
			</label>
			<button
				type="submit"
				className="btn btn-primary btn-lg"
				style={{ marginTop: 4 }}
				disabled={isLoading}
			>
				{isLoading ? <span className="spinner" /> : null}
				{isLoading ? "Creating account…" : "Create account"}
			</button>
			<div className={styles.note}>
				We&apos;ll send a verification email. Your tree is visible only to you and
				the people you invite.
			</div>
		</form>
	);
};
