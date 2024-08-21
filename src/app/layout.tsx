import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { initPocketBase } from "@/lib/ssr";
import { LogoutButton } from "./LogoutButton";
import { BurgerButton } from "./Burger";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Example App Name",
	description: "This is an example project description",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pb = await initPocketBase();

	return (
		<html lang="en">
			<head>
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/bulma@1.0.0/css/bulma.min.css"></link>
				<link
					rel="stylesheet"
					href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"></link>
			</head>
			<body className={inter.className}>
				<nav
					className="navbar"
					role="navigation"
					aria-label="main navigation">
					<div className="navbar-brand">
						<Link className="navbar-item" href="/">
							<Image
								src="/logo-no-background.svg"
								width="150"
								height="28"
								alt="logo"
							/>
						</Link>
						<BurgerButton />
					</div>
					<div className="navbar-menu" id="navbar-menu-unique">
						<Link href="/" className="navbar-item">
							Home
						</Link>
						{pb.authStore.isValid && (
							<Link href="/secure-link" className="navbar-item">
								Secure link
							</Link>
						)}
						<Link href="/unsecured-link" className="navbar-item">
							Unsecured link
						</Link>
						<div className="navbar-end">
							<div className="navbar-item">
								{pb.authStore.isValid && (
									<>
										<div style={{ marginRight: "1rem" }}>
											Logged as
											<b>
												{" "}
												{pb.authStore.model?.username ??
													pb.authStore.model?.email}
											</b>
										</div>
										<LogoutButton />
									</>
								)}

								{!pb.authStore.isValid && (
									<div className="buttons">
										<Link
											className="button is-primary"
											href="/sign-up">
											<strong>Sign up</strong>
										</Link>
										<Link
											className="button is-light"
											href="/sign-in">
											Log in
										</Link>
									</div>
								)}
							</div>
						</div>
					</div>
				</nav>
				<div className="hero">
					<div className="hero-body">{children}</div>
				</div>
			</body>
		</html>
	);
}
