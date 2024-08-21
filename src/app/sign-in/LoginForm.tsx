"use client";

import { pb } from "@/lib";
import { useEffect, useState } from "react";

const loginButtonHandler = async (
	setIsLoading: (arg: boolean) => void,
	login: string,
	password: string
) => {
	setIsLoading(true);
	try {
		await pb.collection("users").authWithPassword(login, password);
		document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
		window.location.reload();
	} catch (error: any) {
		try {
			await pb.admins.authWithPassword(login, password);
			document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
			window.location.reload();
		} catch (error: any) {
			alert(error?.message ?? error.toString());
		}
	} finally {
		setIsLoading(false);
	}
};

export const LoginForm = () => {
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const keyDownHandler = (event: KeyboardEvent) => {
			if (event.key === "Enter") {
				loginButtonHandler(setIsLoading, login, password);
			}
		};
		document.addEventListener("keydown", keyDownHandler);
		return () => {
			document.removeEventListener("keydown", keyDownHandler);
		};
	}, [login, password, setIsLoading]);
	return (
		<div>
			<div className="field">
				<p className="control has-icons-left has-icons-right">
					<input
						className="input"
						type="text"
						placeholder="Username or e-mail"
						onChange={(event) => {
							setLogin(event.target.value);
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
						onChange={(event) => {
							setPassword(event.target.value);
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
							loginButtonHandler(setIsLoading, login, password);
						}}>
						Login
					</button>
				</p>
			</div>
		</div>
	);
};
