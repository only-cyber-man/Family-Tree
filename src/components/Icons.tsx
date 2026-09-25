import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, props: IconProps, strokeWidth = 1.75) => ({
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth,
	strokeLinecap: "round" as const,
	strokeLinejoin: "round" as const,
	"aria-hidden": true,
	...props,
});

export const PlusIcon = ({ size = 18, ...p }: IconProps) => (
	<svg {...base(size, p, 2)}>
		<path d="M12 5v14M5 12h14" />
	</svg>
);

export const MinusIcon = ({ size = 18, ...p }: IconProps) => (
	<svg {...base(size, p, 2)}>
		<path d="M5 12h14" />
	</svg>
);

export const CloseIcon = ({ size = 18, ...p }: IconProps) => (
	<svg {...base(size, p, 2)}>
		<path d="M6 6l12 12M18 6L6 18" />
	</svg>
);

export const ChevronRightIcon = ({ size = 14, ...p }: IconProps) => (
	<svg {...base(size, p, 2.5)}>
		<path d="M9 5l7 7-7 7" />
	</svg>
);

export const ChevronLeftIcon = ({ size = 20, ...p }: IconProps) => (
	<svg {...base(size, p, 2)}>
		<path d="M15 5l-7 7 7 7" />
	</svg>
);

export const MoreIcon = ({ size = 18, ...p }: IconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="currentColor"
		aria-hidden
		{...p}
	>
		<circle cx="5" cy="12" r="2" />
		<circle cx="12" cy="12" r="2" />
		<circle cx="19" cy="12" r="2" />
	</svg>
);

export const UserPlusIcon = ({ size = 18, ...p }: IconProps) => (
	<svg {...base(size, p)}>
		<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
		<circle cx="9" cy="7" r="4" />
		<path d="M19 8v6M22 11h-6" />
	</svg>
);

export const PersonAddIcon = ({ size = 18, ...p }: IconProps) => (
	<svg {...base(size, p)}>
		<circle cx="10" cy="8" r="4" />
		<path d="M2 21v-1a6 6 0 0 1 6-6h4" />
		<path d="M19 14v6M16 17h6" />
	</svg>
);

export const LinkIcon = ({ size = 18, ...p }: IconProps) => (
	<svg {...base(size, p)}>
		<circle cx="6" cy="6" r="3" />
		<circle cx="18" cy="18" r="3" />
		<path d="M8.5 8.5l7 7" />
	</svg>
);

export const PencilIcon = ({ size = 18, ...p }: IconProps) => (
	<svg {...base(size, p)}>
		<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
	</svg>
);

export const TrashIcon = ({ size = 18, ...p }: IconProps) => (
	<svg {...base(size, p)}>
		<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
	</svg>
);

export const SearchIcon = ({ size = 18, ...p }: IconProps) => (
	<svg {...base(size, p)}>
		<circle cx="11" cy="11" r="7" />
		<path d="M20 20l-4-4" />
	</svg>
);

export const FilterIcon = ({ size = 18, ...p }: IconProps) => (
	<svg {...base(size, p)}>
		<path d="M3 5h18l-7 8v6l-4 2v-8z" />
	</svg>
);

export const CalendarIcon = ({ size = 18, ...p }: IconProps) => (
	<svg {...base(size, p)}>
		<rect x="3" y="5" width="18" height="16" rx="2" />
		<path d="M3 10h18M8 3v4M16 3v4" />
	</svg>
);

export const DownloadIcon = ({ size = 16, ...p }: IconProps) => (
	<svg {...base(size, p, 2)}>
		<path d="M12 4v12M6 10l6 6 6-6M4 20h16" />
	</svg>
);

export const FitIcon = ({ size = 18, ...p }: IconProps) => (
	<svg {...base(size, p, 2)}>
		<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
	</svg>
);

export const LockIcon = ({ size = 16, ...p }: IconProps) => (
	<svg {...base(size, p)}>
		<rect x="4" y="11" width="16" height="10" rx="2" />
		<path d="M8 11V7a4 4 0 0 1 8 0v4" />
	</svg>
);

export const CameraIcon = ({ size = 24, ...p }: IconProps) => (
	<svg {...base(size, p)}>
		<path d="M4 8a2 2 0 0 1 2-2h2l2-2h4l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
		<circle cx="12" cy="13" r="3.5" />
	</svg>
);

export const EyeIcon = ({ size = 20, ...p }: IconProps) => (
	<svg {...base(size, p)}>
		<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);

export const EyeOffIcon = ({ size = 20, ...p }: IconProps) => (
	<svg {...base(size, p)}>
		<path d="M3 3l18 18M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6" />
		<path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
	</svg>
);

export const AlertIcon = ({ size = 18, ...p }: IconProps) => (
	<svg {...base(size, p, 2)}>
		<circle cx="12" cy="12" r="9" />
		<path d="M12 8v5M12 16.5v.5" />
	</svg>
);

export const MenuIcon = ({ size = 22, ...p }: IconProps) => (
	<svg {...base(size, p)}>
		<path d="M4 7h16M4 12h16M4 17h16" />
	</svg>
);
