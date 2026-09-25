import { X } from "lucide-react-native";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "../theme/useTheme";
import { Text } from "./Text";
import { useT } from "../i18n";

/** 36 pt pill; selected = copper border on accent-soft; hidden = struck through. */
export function Chip({
	label,
	glyph,
	glyphColor,
	selected,
	hidden,
	onPress,
	height = 36,
	style,
	accessibilityLabel,
}: {
	label: string;
	glyph?: string;
	glyphColor?: string;
	selected?: boolean;
	hidden?: boolean;
	onPress?: () => void;
	height?: number;
	style?: StyleProp<ViewStyle>;
	accessibilityLabel?: string;
}) {
	const t = useTheme();
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ selected: !!selected }}
			accessibilityLabel={accessibilityLabel ?? label}
			onPress={onPress}
			style={({ pressed }) => [
				styles.chip,
				{
					height,
					borderWidth: selected ? 2 : 1,
					borderColor: selected ? t.c.accent : hidden ? t.c.border : t.c.borderStrong,
					backgroundColor: selected ? t.c.accentSoft : hidden ? t.c.surface2 : pressed ? t.c.surface2 : "transparent",
					paddingHorizontal: selected ? 13 : 14,
				},
				style,
			]}
		>
			{glyph ? (
				<Text size={13} weight={600} color={glyphColor}>
					{glyph}
				</Text>
			) : null}
			<Text size={13} weight={600} color={hidden ? t.c.ink3 : t.c.ink} style={hidden ? { textDecorationLine: "line-through" } : undefined}>
				{label}
			</Text>
		</Pressable>
	);
}

/** 30 pt removable chip floating on the canvas. */
export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
	const t = useTheme();
	const T = useT();
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={T.common.removeFilter(label)}
			onPress={onRemove}
			style={[styles.filter, { backgroundColor: t.c.surface, borderColor: t.c.border }, t.shadow("md")]}
		>
			<Text size={12} weight={600}>
				{label}
			</Text>
			<View style={[styles.x, { backgroundColor: t.c.surface2 }]}>
				<X size={10} color={t.c.ink} strokeWidth={2.5} />
			</View>
		</Pressable>
	);
}

/** Owner / Shared with you. */
export function Badge({ label, tone }: { label: string; tone: "accent" | "primary" }) {
	const t = useTheme();
	return (
		<View style={[styles.badge, { backgroundColor: tone === "accent" ? t.c.accentSoft : t.c.primarySoft }]}>
			<Text size={12} weight={700} color={tone === "accent" ? t.c.accent : t.c.primary} numberOfLines={1}>
				{label}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	chip: { borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 6 },
	filter: { height: 30, paddingLeft: 12, paddingRight: 8, borderRadius: 999, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 6 },
	x: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
	badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: "flex-start" },
});
