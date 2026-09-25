import type { ReactNode } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "../theme/useTheme";
import { Text } from "./Text";

type Kind = "primary" | "secondary" | "destructive" | "danger" | "text" | "ghost";

export interface ButtonProps {
	label: string;
	onPress?: () => void;
	kind?: Kind;
	/** 52 primary, 48 secondary, 44 inline. */
	size?: "lg" | "md" | "sm";
	icon?: ReactNode;
	loading?: boolean;
	loadingLabel?: string;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
	flex?: boolean;
	accessibilityHint?: string;
}

export function Button({ label, onPress, kind = "primary", size, icon, loading, loadingLabel, disabled, style, flex, accessibilityHint }: ButtonProps) {
	const t = useTheme();
	const h = size === "lg" ? 52 : size === "md" ? 48 : size === "sm" ? 44 : kind === "primary" || kind === "danger" ? 52 : kind === "text" ? 44 : 48;
	const filled = kind === "primary" || kind === "danger";
	const fg =
		kind === "primary" ? t.c.onPrimary : kind === "danger" ? t.c.onAccent : kind === "destructive" ? t.c.danger : kind === "text" ? t.c.accent : t.c.ink;
	const bg = kind === "primary" ? t.c.primary : kind === "danger" ? t.c.danger : kind === "secondary" || kind === "destructive" ? t.c.surface : "transparent";
	const pressedBg = kind === "primary" ? t.c.primaryHover : kind === "danger" ? t.c.danger : kind === "secondary" || kind === "destructive" ? t.c.surface2 : t.c.pressed;
	const inactive = disabled || loading;
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={label}
			accessibilityHint={accessibilityHint}
			accessibilityState={{ disabled: !!disabled, busy: !!loading }}
			onPress={inactive ? undefined : onPress}
			android_ripple={Platform.OS === "android" && !inactive ? { color: t.c.ripple } : undefined}
			style={({ pressed }) => [
				styles.base,
				{
					height: h,
					paddingHorizontal: kind === "text" ? 12 : h >= 52 ? 22 : 18,
					backgroundColor: pressed && !inactive ? pressedBg : bg,
					borderWidth: kind === "secondary" || kind === "destructive" || kind === "ghost" ? 1 : 0,
					borderColor: t.c.border,
					opacity: disabled ? 0.45 : kind === "danger" && pressed ? 0.85 : 1,
				},
				flex && { flex: 1 },
				style,
			]}
		>
			{loading ? <ActivityIndicator color={fg} size="small" /> : icon ? <View>{icon}</View> : null}
			<Text weight={filled || kind === "text" ? 700 : 600} size={h >= 52 ? 16 : 15} color={fg} numberOfLines={1}>
				{loading && loadingLabel ? loadingLabel : label}
			</Text>
		</Pressable>
	);
}

/** Round or square icon-only button with a 44 pt minimum target. */
export function IconButton({
	icon,
	onPress,
	label,
	size = 40,
	variant = "surface",
	style,
	badge,
}: {
	icon: ReactNode;
	onPress?: () => void;
	label: string;
	size?: number;
	variant?: "surface" | "primary" | "plain" | "soft";
	style?: StyleProp<ViewStyle>;
	badge?: number;
}) {
	const t = useTheme();
	const bg = variant === "primary" ? t.c.primary : variant === "surface" ? t.c.surface : variant === "soft" ? t.c.surface2 : "transparent";
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={label}
			onPress={onPress}
			hitSlop={Math.max(0, (44 - size) / 2)}
			android_ripple={{ color: t.c.ripple, borderless: variant === "plain" }}
			style={({ pressed }) => [
				{
					width: size,
					height: size,
					borderRadius: variant === "soft" ? size / 2 : 12,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: pressed && variant !== "primary" ? t.c.surface2 : bg,
					borderWidth: variant === "surface" ? 1 : 0,
					borderColor: t.c.border,
				},
				variant === "surface" || variant === "primary" ? t.shadow("md") : null,
				style,
			]}
		>
			{icon}
			{badge ? (
				<View style={[styles.badge, { backgroundColor: t.c.accent }]}>
					<Text size={11} weight={700} color={t.c.onAccent} style={{ lineHeight: 14 }}>
						{badge}
					</Text>
				</View>
			) : null}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	base: { borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, overflow: "hidden" },
	badge: { position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, borderRadius: 999, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
});
