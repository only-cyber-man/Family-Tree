"use client";

import { InputHTMLAttributes, useState } from "react";
import { EyeIcon, EyeOffIcon } from "./Icons";
import styles from "./auth.module.css";

export const PasswordInput = (props: InputHTMLAttributes<HTMLInputElement>) => {
	const [visible, setVisible] = useState(false);
	return (
		<div className={styles.passwordWrap}>
			<input {...props} type={visible ? "text" : "password"} />
			<button
				type="button"
				className={styles.reveal}
				aria-label={visible ? "Hide password" : "Show password"}
				onClick={() => setVisible((v) => !v)}
			>
				{visible ? <EyeOffIcon /> : <EyeIcon />}
			</button>
		</div>
	);
};
