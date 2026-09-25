import Link from "next/link";

/** The Family Tree mark: two parents joining into a child. */
export const LogoMark = ({
	size = 28,
	variant = "color",
}: {
	size?: number;
	variant?: "color" | "white";
}) => {
	const stroke = variant === "white" ? "#F5F0E6" : "var(--logo-stem)";
	const child = variant === "white" ? "#E0955E" : "var(--logo-child)";
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 64 64"
			aria-hidden
			className="logo-mark"
		>
			<g
				fill="none"
				stroke={stroke}
				strokeWidth="6"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M32 46V33M32 33L16 17M32 33L48 17" />
			</g>
			<circle cx="16" cy="16" r="8" fill={stroke} />
			<circle cx="48" cy="16" r="8" fill={stroke} />
			<circle cx="32" cy="50" r="8" fill={child} />
		</svg>
	);
};

export const Brand = ({
	href = "/",
	size = 28,
	variant,
	collapsible = false,
}: {
	href?: string;
	size?: number;
	variant?: "color" | "white";
	/** Hide the name on very narrow screens, keeping the mark. */
	collapsible?: boolean;
}) => (
	<Link
		href={href}
		className={`brand ${collapsible ? "brand-collapsible" : ""}`}
		aria-label={collapsible ? "Family Tree" : undefined}
	>
		<LogoMark size={size} variant={variant} />
		<span className="brand-name">Family Tree</span>
	</Link>
);
