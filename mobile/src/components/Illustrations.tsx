import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { useTheme } from "../theme/useTheme";
import { useT } from "../i18n";

/** The brand mark (logo/mark-color.svg). */
export function Mark({ size = 32, color, bottom }: { size?: number; color?: string; bottom?: string }) {
	const t = useTheme();
	const T = useT();
	const c = color ?? t.c.primary;
	return (
		<Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel={T.common.familyTree}>
			<G fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
				<Path d="M32 46V33M32 33L16 17M32 33L48 17" />
			</G>
			<Circle cx={16} cy={16} r={8} fill={c} />
			<Circle cx={48} cy={16} r={8} fill={c} />
			<Circle cx={32} cy={50} r={8} fill={bottom ?? t.c.accent} />
		</Svg>
	);
}

/** Onboarding 1: parents, a selected child, a dashed placeholder. */
export function GraphIllustration({ width = 300 }: { width?: number }) {
	const t = useTheme();
	return (
		<Svg width={width} height={(width * 260) / 300} viewBox="0 0 300 260">
			<Rect x={0} y={0} width={300} height={70} rx={8} fill={t.c.band} />
			<Rect x={0} y={140} width={300} height={70} rx={8} fill={t.c.band} />
			<G stroke={t.c.bio} strokeWidth={2.5} fill="none">
				<Path d="M110 60 L150 130 M190 60 L150 130 M150 200 L150 240" />
			</G>
			<Path d="M118 40 L182 40" stroke={t.c.inlaw} strokeWidth={4} strokeLinecap="round" />
			<Rect x={60} y={20} width={60} height={40} rx={8} fill={t.node.male.fill} stroke={t.node.male.border} strokeWidth={2} />
			<Rect x={180} y={20} width={60} height={40} rx={8} fill={t.node.female.fill} stroke={t.node.female.border} strokeWidth={2} />
			<Rect x={120} y={130} width={60} height={40} rx={8} fill={t.node.female.fill} stroke={t.c.accent} strokeWidth={3} />
			<Rect x={120} y={230} width={60} height={30} rx={8} fill={t.node.male.fill} stroke={t.node.male.border} strokeWidth={2} strokeDasharray="4 3" />
		</Svg>
	);
}

/** Empty states: a card with dashed children. */
export function EmptyTreeIllustration({ width = 200 }: { width?: number }) {
	const t = useTheme();
	return (
		<Svg width={width} height={(width * 150) / 240} viewBox="0 0 240 150">
			<G stroke={t.c.borderStrong} strokeWidth={2} strokeDasharray="6 5" fill="none">
				<Path d="M120 44 L70 104M120 44 L170 104" />
			</G>
			<Rect x={86} y={16} width={68} height={30} rx={7} fill={t.c.surface} stroke={t.c.border} strokeWidth={2} />
			<Rect x={36} y={104} width={68} height={30} rx={7} fill={t.c.surface} stroke={t.c.border} strokeWidth={2} strokeDasharray="5 4" />
			<Rect x={136} y={104} width={68} height={30} rx={7} fill={t.c.surface} stroke={t.c.border} strokeWidth={2} strokeDasharray="5 4" />
			<Circle cx={104} cy={31} r={7} fill={t.c.accent} />
			<Rect x={116} y={26} width={30} height={4} rx={2} fill={t.c.border} />
		</Svg>
	);
}
