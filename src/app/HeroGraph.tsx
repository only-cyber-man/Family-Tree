/** The example four-generation tree in the landing hero. */

import { getT } from "@/i18n/server";

type Person = {
	x: number;
	y: number;
	name: string;
	years: string;
	gender: "male" | "female";
	deceased?: boolean;
	selected?: boolean;
};

const PEOPLE: Person[] = [
	{ x: 200, y: 30, name: "Stanisław", years: "1921 – †1998", gender: "male", deceased: true },
	{ x: 340, y: 30, name: "Helena", years: "1924 – †2010", gender: "female", deceased: true },
	{ x: 60, y: 140, name: "Krystyna", years: "1946 · 80", gender: "female" },
	{ x: 200, y: 140, name: "Jan", years: "1948 · 78", gender: "male" },
	{ x: 340, y: 140, name: "Maria", years: "1951 · 75", gender: "female" },
	{ x: 130, y: 250, name: "Piotr", years: "1974 · 52", gender: "male" },
	{ x: 270, y: 250, name: "Anna", years: "1976 · 50", gender: "female", selected: true },
	{ x: 440, y: 250, name: "Tomasz", years: "1979 · 47", gender: "male" },
	{ x: 200, y: 360, name: "Zofia", years: "2005 · 21", gender: "female" },
	{ x: 340, y: 360, name: "Kuba", years: "2009 · 17", gender: "male" },
];

const BIO_PATHS = [
	"M260 74 L260 140",
	"M400 74 L260 140",
	"M260 74 L120 140",
	"M400 74 L120 140",
	"M260 184 L330 250",
	"M400 184 L330 250",
	"M260 184 L500 250",
	"M400 184 L500 250",
	"M330 294 L260 360",
	"M190 294 L260 360",
	"M330 294 L400 360",
	"M190 294 L400 360",
];

const ARROWS = [
	"M256 134 L260 142 L264 134 Z",
	"M116 134 L120 142 L124 134 Z",
	"M326 244 L330 252 L334 244 Z",
	"M496 244 L500 252 L504 244 Z",
	"M256 354 L260 362 L264 354 Z",
	"M396 354 L400 362 L404 354 Z",
];

/** Rough text width at 11px, to lay the legend out for either language. */
const textWidth = (text: string) => text.length * 6.3;

export const HeroGraph = () => {
	const t = getT();
	const decades = t.landing.decades;
	const legend = [
		{ label: t.landing.lines.biological, stroke: "var(--bio)", width: 2.5 },
		{ label: t.landing.lines.married, stroke: "var(--inlaw)", width: 4, cap: true },
		{ label: t.landing.lines.church, stroke: "var(--church)", width: 2, dash: "2 5" },
	];
	let x = 0;
	const legendItems = legend.map((item) => {
		const at = x;
		x += 30 + textWidth(item.label) + 16;
		return { ...item, at };
	});
	return (
	<svg viewBox="0 0 640 460" role="img" aria-label={t.landing.hero.label}>
		<rect x="0" y="0" width="640" height="460" rx="10" style={{ fill: "var(--bg)" }} />
		<g style={{ fill: "var(--band)" }}>
			<rect x="0" y="10" width="640" height="100" rx="6" />
			<rect x="0" y="230" width="640" height="100" rx="6" />
		</g>
		<g fontSize="12" fontWeight="700" style={{ fill: "var(--ink3)" }}>
			<text x="14" y="30">{decades[0]}</text>
			<text x="14" y="140">{decades[1]}</text>
			<text x="14" y="250">{decades[2]}</text>
			<text x="14" y="360">{decades[3]}</text>
		</g>
		<g strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ stroke: "var(--bio)" }}>
			{BIO_PATHS.map((d) => (
				<path key={d} d={d} />
			))}
		</g>
		<g style={{ fill: "var(--bio)" }}>
			{ARROWS.map((d) => (
				<path key={d} d={d} />
			))}
		</g>
		<g strokeWidth="4" fill="none" strokeLinecap="round" style={{ stroke: "var(--inlaw)" }}>
			<path d="M320 52 L340 52" />
			<path d="M320 162 L340 162" />
			<path d="M250 272 L270 272" />
		</g>
		<path
			d="M500 294 C 480 330, 330 330, 300 360"
			strokeWidth="2"
			strokeDasharray="2 5"
			fill="none"
			style={{ stroke: "var(--church)" }}
		/>
		{PEOPLE.map((p) => {
			const fill = p.gender === "male" ? "var(--male-fill)" : "var(--female-fill)";
			const border = p.gender === "male" ? "var(--male-border)" : "var(--female-border)";
			return (
				<g key={p.name}>
					<rect
						x={p.x}
						y={p.y}
						width="120"
						height="44"
						rx="8"
						strokeWidth={p.selected ? 3 : 2}
						style={{ fill, stroke: p.selected ? "var(--accent)" : border }}
					/>
					<circle
						cx={p.x + 22}
						cy={p.y + 22}
						r="12"
						opacity={p.deceased ? 0.6 : 1}
						style={{ fill: border }}
					/>
					<text
						x={p.x + 40}
						y={p.y + 19}
						fontSize="11"
						fontWeight="700"
						style={{ fill: "var(--ink)" }}
					>
						{p.name}
					</text>
					<text x={p.x + 40} y={p.y + 33} fontSize="10" style={{ fill: "var(--ink2)" }}>
						{p.years}
					</text>
				</g>
			);
		})}
		<g fontSize="10" fontWeight="600" style={{ fill: "var(--ink2)" }}>
			<text x="326" y="45" textAnchor="middle">
				{t.landing.hero.married}
			</text>
			<text x="418" y="345">
				{t.landing.hero.godparent}
			</text>
		</g>
		<g transform="translate(14 420)" fontSize="11" style={{ fill: "var(--ink2)" }}>
			{legendItems.map((item) => (
				<g key={item.label}>
					<line
						x1={item.at}
						y1="8"
						x2={item.at + 24}
						y2="8"
						strokeWidth={item.width}
						strokeLinecap={item.cap ? "round" : undefined}
						strokeDasharray={item.dash}
						style={{ stroke: item.stroke }}
					/>
					<text x={item.at + 30} y="12">
						{item.label}
					</text>
				</g>
			))}
		</g>
	</svg>
	);
};
