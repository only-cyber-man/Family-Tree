import { Info, Lock, WifiOff } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { errorMessage, isNetworkError } from "../lib/errors";
import { useNetwork } from "../store/network";
import { useTheme } from "../theme/useTheme";
import { Text } from "./Text";
import { getT, useT } from "../i18n";

/** Inline notice: permission denied, proposal, hint. */
export function Notice({ children, title, tone = "accent", icon, actions }: { children?: ReactNode; title?: string; tone?: "accent" | "neutral"; icon?: ReactNode; actions?: ReactNode }) {
	const t = useTheme();
	return (
		<View style={[styles.notice, { backgroundColor: tone === "accent" ? t.c.accentSoft : t.c.surface2 }]}>
			<View style={{ marginTop: 1 }}>{icon ?? (tone === "accent" ? <Info size={18} color={t.c.accent} strokeWidth={2} /> : <Lock size={18} color={t.c.ink2} strokeWidth={1.75} />)}</View>
			<View style={{ flex: 1, gap: 6 }}>
				{title ? (
					<Text size={14} weight={700}>
						{title}
					</Text>
				) : null}
				{typeof children === "string" ? (
					<Text size={13} color={tone === "accent" ? t.c.ink2 : t.c.ink2} style={{ lineHeight: 19 }}>
						{children}
					</Text>
				) : (
					children
				)}
				{actions ? <View style={{ flexDirection: "row", gap: 8, paddingTop: 4, flexWrap: "wrap" }}>{actions}</View> : null}
			</View>
		</View>
	);
}

/** Only true after `ms`, so fast loads never flash a skeleton. */
export function useDelayed(active: boolean, ms = 300): boolean {
	const [shown, setShown] = useState(false);
	useEffect(() => {
		if (!active) return setShown(false);
		const id = setTimeout(() => setShown(true), ms);
		return () => clearTimeout(id);
	}, [active, ms]);
	return shown;
}

/** Skeleton block pulsing 0.4 -> 0.8 opacity, 1.2 s loop. */
export function Skeleton({ width, height, radius = 4, style }: { width?: DimensionValue; height: number; radius?: number; style?: StyleProp<ViewStyle> }) {
	const t = useTheme();
	const o = useSharedValue(0.4);
	useEffect(() => {
		o.value = withRepeat(withTiming(0.8, { duration: 600 }), -1, true);
	}, [o]);
	const anim = useAnimatedStyle(() => ({ opacity: o.value }));
	return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: t.c.skeleton }, anim, style]} />;
}

/** "You're offline" strip under the status bar. */
export function OfflineBanner({ message }: { message?: string }) {
	const t = useTheme();
	const T = useT();
	const insets = useSafeAreaInsets();
	const online = useNetwork((s) => s.online);
	if (online) return null;
	return (
		<View accessibilityRole="alert" style={[styles.offline, { top: insets.top, backgroundColor: t.c.ink }]}>
			<WifiOff size={14} color={t.c.bg} strokeWidth={2} />
			<Text size={13} weight={600} color={t.c.bg} numberOfLines={1}>
				{message ?? T.offline.banner}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	notice: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, alignItems: "flex-start" },
	offline: { position: "absolute", left: 0, right: 0, height: 32, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", zIndex: 50, paddingHorizontal: 12 },
});

/** Inline hint shown next to disabled write controls while offline. */
export function OfflineWriteHint() {
	const t = useTheme();
	const T = useT();
	const online = useNetwork((s) => s.online);
	if (online) return null;
	return (
		<View accessibilityRole="alert" style={[styles.notice, { backgroundColor: t.c.surface2, alignItems: "center", padding: 12 }]}>
			<WifiOff size={16} color={t.c.ink2} strokeWidth={2} />
			<Text size={13} color={t.c.ink2} style={{ flex: 1 }}>
				{T.offline.write}
			</Text>
		</View>
	);
}

/** The design's "save failed" state: inline error with "Try again"; the form keeps its input. */
export function SaveFailed({ message, onRetry, busy }: { message: string; onRetry: () => void; busy?: boolean }) {
	const t = useTheme();
	const T = useT();
	return (
		<View accessibilityRole="alert" style={[styles.notice, { backgroundColor: t.c.dangerSoft }]}>
			<View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.c.danger, marginTop: 6 }} />
			<View style={{ flex: 1, gap: 8 }}>
				<Text size={13} color={t.c.ink} style={{ lineHeight: 19 }}>
					{message}
				</Text>
				<Pressable
					onPress={busy ? undefined : onRetry}
					accessibilityRole="button"
					style={{ alignSelf: "flex-start", height: 34, paddingHorizontal: 12, borderRadius: 999, backgroundColor: t.c.ink, justifyContent: "center", opacity: busy ? 0.45 : 1 }}
				>
					<Text size={13} weight={600} color={t.c.bg}>
						{busy ? T.common.saving : T.common.tryAgain}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}

/** Message for a failed write: offline vs. the server's reason. */
export function saveErrorMessage(e: unknown, what: string): string {
	const T = getT();
	return isNetworkError(e) ? T.save.failedOffline(what) : T.save.failed(what, errorMessage(e, T));
}
