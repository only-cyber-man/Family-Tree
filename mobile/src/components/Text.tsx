import { Text as RNText, type TextProps, type TextStyle } from "react-native";
import { fonts, type BodyWeight } from "../theme/theme";
import { useTheme } from "../theme/useTheme";

type Variant = "display" | "title" | "sheetTitle" | "heading" | "serif" | "body" | "bodyLg" | "label" | "caption" | "overline" | "small";

const VARIANTS: Record<Variant, { serif?: boolean; size: number; weight: BodyWeight | 400 | 600; line?: number; tone?: "ink" | "ink2" | "ink3"; extra?: TextStyle }> = {
	display: { serif: true, size: 30, weight: 600, line: 34, extra: { letterSpacing: -0.3 } },
	title: { serif: true, size: 26, weight: 600, line: 31 },
	sheetTitle: { serif: true, size: 24, weight: 600, line: 28 },
	heading: { serif: true, size: 22, weight: 600, line: 27 },
	serif: { serif: true, size: 18, weight: 600, line: 24 },
	body: { size: 15, weight: 400, line: 21 },
	bodyLg: { size: 16, weight: 400, line: 24 },
	label: { size: 13, weight: 600, tone: "ink2" },
	caption: { size: 13, weight: 400, line: 18, tone: "ink3" },
	overline: { size: 13, weight: 700, tone: "ink3", extra: { textTransform: "uppercase", letterSpacing: 0.78 } },
	small: { size: 12, weight: 400, line: 17, tone: "ink3" },
};

export interface AppTextProps extends TextProps {
	variant?: Variant;
	weight?: BodyWeight;
	size?: number;
	color?: string;
	serif?: boolean;
	center?: boolean;
}

/** Text with the brand fonts. Dynamic Type is allowed up to 1.35x. */
export function Text({ variant = "body", weight, size, color, serif, center, style, ...rest }: AppTextProps) {
	const t = useTheme();
	const v = VARIANTS[variant];
	const isSerif = serif ?? v.serif ?? false;
	const w = weight ?? v.weight;
	const family = isSerif ? (w >= 600 ? fonts.heading[600] : fonts.heading[400]) : fonts.body[(w as BodyWeight) in fonts.body ? (w as BodyWeight) : 400];
	const fontSize = size ?? v.size;
	return (
		<RNText
			maxFontSizeMultiplier={1.35}
			style={[
				{
					fontFamily: family,
					fontSize,
					lineHeight: size ? Math.round(size * 1.35) : v.line,
					color: color ?? t.c[v.tone ?? "ink"],
					textAlign: center ? "center" : undefined,
				},
				v.extra,
				style,
			]}
			{...rest}
		/>
	);
}
