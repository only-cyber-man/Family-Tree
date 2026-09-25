import { ChevronRight } from "lucide-react-native";
import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Switch, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "../theme/useTheme";
import { Text } from "./Text";

/** Grouped surface card, radius 16, 1 px separators between rows. */
export function Card({ children, style, padded }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
	const t = useTheme();
	const items = Children.toArray(children).filter(isValidElement);
	return (
		<View style={[styles.card, { backgroundColor: t.c.surface, borderColor: t.c.border }, padded && { padding: 14, gap: 10 }, style]}>
			{padded
				? children
				: items.map((child, i) => (
						<Fragment key={i}>
							{i > 0 ? <View style={{ height: StyleSheet.hairlineWidth * 2, backgroundColor: t.c.border }} /> : null}
							{child}
						</Fragment>
					))}
		</View>
	);
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
	const t = useTheme();
	return (
		<View style={styles.section}>
			<Text variant="overline" accessibilityRole="header">
				{title}
			</Text>
			{action ? (
				<Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
					<Text size={14} weight={600} color={t.c.accent}>
						{action}
					</Text>
				</Pressable>
			) : null}
		</View>
	);
}

export interface RowProps {
	title: ReactNode;
	subtitle?: ReactNode;
	leading?: ReactNode;
	trailing?: ReactNode;
	chevron?: boolean;
	onPress?: () => void;
	onLongPress?: () => void;
	minHeight?: number;
	accessibilityLabel?: string;
	highlighted?: boolean;
	style?: StyleProp<ViewStyle>;
}

/** 60 pt list row (48 compact), 16 pt inset. */
export function Row({ title, subtitle, leading, trailing, chevron, onPress, onLongPress, minHeight = 60, accessibilityLabel, highlighted, style }: RowProps) {
	const t = useTheme();
	const content = (
		<>
			{leading}
			<View style={{ flex: 1, minWidth: 0, gap: 2 }}>
				{typeof title === "string" ? (
					<Text size={15} weight={600} numberOfLines={1}>
						{title}
					</Text>
				) : (
					title
				)}
				{subtitle ? (
					typeof subtitle === "string" ? (
						<Text variant="caption" numberOfLines={2}>
							{subtitle}
						</Text>
					) : (
						subtitle
					)
				) : null}
			</View>
			{trailing}
			{chevron ? <ChevronRight size={16} color={t.c.ink3} strokeWidth={2} /> : null}
		</>
	);
	if (!onPress && !onLongPress) return <View style={[styles.row, { minHeight }, highlighted && { backgroundColor: t.c.accentSoft }, style]}>{content}</View>;
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			onPress={onPress}
			onLongPress={onLongPress}
			delayLongPress={400}
			android_ripple={Platform.OS === "android" ? { color: t.c.ripple } : undefined}
			style={({ pressed }) => [styles.row, { minHeight }, highlighted && { backgroundColor: t.c.accentSoft }, pressed && Platform.OS === "ios" && { backgroundColor: t.c.surface2 }, style]}
		>
			{content}
		</Pressable>
	);
}

export function SwitchRow({ title, subtitle, value, onChange, disabled }: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
	const t = useTheme();
	return (
		<Row
			minHeight={52}
			title={title}
			subtitle={subtitle}
			trailing={
				<Switch
					accessibilityLabel={title}
					value={value}
					onValueChange={onChange}
					disabled={disabled}
					trackColor={{ false: t.c.surface2, true: t.c.primary }}
					thumbColor={Platform.OS === "android" ? t.c.surface : undefined}
					ios_backgroundColor={t.c.surface2}
				/>
			}
		/>
	);
}

export function ValueRow({ title, value, onPress, icon, danger }: { title: string; value?: string; onPress?: () => void; icon?: ReactNode; danger?: boolean }) {
	const t = useTheme();
	return (
		<Row
			minHeight={52}
			onPress={onPress}
			title={
				<Text size={15} weight={600} color={danger ? t.c.danger : t.c.ink}>
					{title}
				</Text>
			}
			trailing={
				<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
					{value ? (
						<Text size={13} weight={500} color={t.c.ink3} numberOfLines={1} style={{ maxWidth: 180 }}>
							{value}
						</Text>
					) : null}
					{icon ?? (onPress ? <ChevronRight size={16} color={t.c.ink3} strokeWidth={2} /> : null)}
				</View>
			}
		/>
	);
}

const styles = StyleSheet.create({
	card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
	section: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
	row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
});
