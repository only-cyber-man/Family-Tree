"use client";

import { useEffect, useRef } from "react";

const changeNavbar = () => {
	const menu = window["document"]?.getElementById("navbar-menu-unique");
	if (!menu) {
		return;
	}
	if (menu.classList.contains("is-active")) {
		menu.classList.remove("is-active");
	} else {
		menu.classList.add("is-active");
	}
};

export const BurgerButton = () => {
	const burgerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const menu =
				window["document"]?.getElementById("navbar-menu-unique");
			if (
				burgerRef.current &&
				!burgerRef.current.contains(event.target as Node) &&
				event.target !== burgerRef.current
			) {
				if (
					menu &&
					menu.classList.contains("is-active") &&
					event.target !== menu &&
					!menu.contains(event.target as Node)
				) {
					menu.classList.remove("is-active");
				}
			}
		};

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	return (
		<button
			ref={burgerRef}
			className="navbar-burger"
			aria-label="menu"
			aria-expanded="false"
			data-target="navbarBasicExample"
			onClick={changeNavbar}
		>
			<span aria-hidden="true" />
			<span aria-hidden="true" />
			<span aria-hidden="true" />
		</button>
	);
};
