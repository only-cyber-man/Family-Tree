"use client";

import { pb } from "@/lib";
import { Alert, Snackbar } from "@mui/material";
import { useState } from "react";

interface RegistrationData {
	username: string;
	name: string;
	email: string;
	password: string;
	passwordConfirm: string;
}

export const RegisterForm = () => {
	const [open, setOpen] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [registrationData, setRegistrationData] = useState<RegistrationData>({
		username: "",
		email: "",
		password: "",
		passwordConfirm: "",
		name: "",
	});
	const [isLoading, setIsLoading] = useState(false);

	const lastRegisterStep = async () => {
		await pb
			.collection("users")
			.authWithPassword(
				registrationData.username,
				registrationData.password
			);
		document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
		window.location.reload();
	};

	const registerButtonHandler = async () => {
		setIsLoading(true);
		try {
			const username = registrationData.username;
			const name =
				registrationData.name.length > 0
					? registrationData.name
					: username;
			setRegistrationData({
				...registrationData,
				name,
			});
			const email = registrationData.email;
			const password = registrationData.password;
			const passwordConfirm = registrationData.passwordConfirm;
			if (password !== passwordConfirm) {
				throw new Error("Passwords do not match!");
			}
			await pb.collection("users").create({
				username,
				name,
				email,
				password,
				passwordConfirm,
			});
			await pb.collection("users").requestVerification(email);
			await lastRegisterStep();
		} catch (error: any) {
			console.log(JSON.stringify(error, null, 2));
			let message = "";
			if (error?.response?.data) {
				const data = error["response"]["data"];
				Object.keys(data).forEach((key) => {
					message += `${key}: ${data[key]["message"]}\n`;
				});
				message = error.message + "\n" + message;
			} else {
				message = error?.message ?? error.toString();
			}

			setErrorMessage(message);
			setOpen(true);
		} finally {
			setIsLoading(false);
		}
	};

	const keyDownHandler = (event: KeyboardEvent) => {
		if (event.key === "Enter") {
			registerButtonHandler();
		}
	};
	document.addEventListener("keydown", keyDownHandler);

	return (
		<div>
			<Snackbar
				open={open}
				autoHideDuration={15000}
				onClose={() => setOpen(false)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				<Alert
					onClose={() => setOpen(false)}
					severity="error"
					variant="filled"
					sx={{ width: "100%" }}
				>
					{errorMessage}
				</Alert>
			</Snackbar>
			<div className="field">
				<p className="control has-icons-left has-icons-right">
					<input
						className="input"
						type="text"
						placeholder="Username"
						value={registrationData.username}
						onChange={(event) => {
							setRegistrationData({
								...registrationData,
								username: event.target.value,
							});
						}}
					/>
					<span className="icon is-small is-left">
						<i className="fas fa-user"></i>
					</span>
					<span className="icon is-small is-right">
						<i className="fas fa-check"></i>
					</span>
				</p>
			</div>
			<div className="field">
				<p className="control has-icons-left has-icons-right">
					<input
						className="input"
						type="text"
						placeholder="Name (empty for username)"
						value={registrationData.name}
						onChange={(event) => {
							setRegistrationData({
								...registrationData,
								name: event.target.value,
							});
						}}
					/>
					<span className="icon is-small is-left">
						<i className="fas fa-person"></i>
					</span>
					<span className="icon is-small is-right">
						<i className="fas fa-check"></i>
					</span>
				</p>
			</div>
			<div className="field">
				<p className="control has-icons-left has-icons-right">
					<input
						className="input"
						type="email"
						placeholder="E-mail"
						value={registrationData.email}
						onChange={(event) => {
							setRegistrationData({
								...registrationData,
								email: event.target.value,
							});
						}}
					/>
					<span className="icon is-small is-left">
						<i className="fas fa-envelope"></i>
					</span>
					<span className="icon is-small is-right">
						<i className="fas fa-check"></i>
					</span>
				</p>
			</div>
			<div className="field">
				<p className="control has-icons-left">
					<input
						className="input"
						type="password"
						placeholder="Password"
						value={registrationData.password}
						onChange={(event) => {
							setRegistrationData({
								...registrationData,
								password: event.target.value,
							});
						}}
					/>
					<span className="icon is-small is-left">
						<i className="fas fa-lock"></i>
					</span>
				</p>
			</div>
			<div className="field">
				<p className="control has-icons-left">
					<input
						className="input"
						type="password"
						placeholder="Confirm password"
						value={registrationData.passwordConfirm}
						onChange={(event) => {
							setRegistrationData({
								...registrationData,
								passwordConfirm: event.target.value,
							});
						}}
					/>
					<span className="icon is-small is-left">
						<i className="fas fa-lock"></i>
					</span>
				</p>
			</div>
			<div className="field">
				<p className="control">
					<button
						className={`button is-primary ${
							isLoading ? "is-loading" : ""
						}`}
						onClick={() => {
							registerButtonHandler();
						}}
					>
						Sign up
					</button>
				</p>
			</div>
		</div>
	);
};
