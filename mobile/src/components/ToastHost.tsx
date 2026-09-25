import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeInDown, FadeOutDown, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "../store/toast";
import { useTheme } from "../theme/useTheme";
import { Text } from "./Text";
import { useLayout } from "../hooks/useLayout";

/** Bottom toast above the tab bar: one at a time, swipe to dismiss. */
export function ToastHost({ bottomOffset }: { bottomOffset?: number }) {
	const t = useTheme();
	const insets = useSafeAreaInsets();
	const current = useToast((s) => s.current);
	const layout = useLayout();
	const dismiss = useToast((s) => s.dismiss);
	const x = useSharedValue(0);

	useEffect(() => {
		x.value = 0;
		if (!current) return;
		const id = setTimeout(() => dismiss(current.id), current.duration);
		return () => clearTimeout(id);
	}, [current, dismiss, x]);

	const pan = Gesture.Pan()
		.activeOffsetX([-10, 10])
		.onChange((e) => {
			x.value = e.translationX;
		})
		.onEnd((e) => {
			if (Math.abs(e.translationX) > 80 || Math.abs(e.velocityX) > 800) {
				x.value = withTiming(Math.sign(e.translationX) * 500, { duration: 150 });
				if (current) runOnJS(dismiss)(current.id);
			} else x.value = withTiming(0, { duration: 150 });
		});
	const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }], opacity: 1 - Math.min(1, Math.abs(x.value) / 300) }));

	if (!current) return null;
	const dot = current.tone === "error" ? "#E07B71" : current.tone === "success" ? "#6FB08A" : t.c.accent;
	return (
		<View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { justifyContent: "flex-end" }]}>
			<GestureDetector gesture={pan}>
				<Animated.View
					key={current.id}
					entering={FadeInDown.duration(220)}
					exiting={FadeOutDown.duration(150)}
					accessibilityRole="alert"
					accessibilityLiveRegion="polite"
					style={[
						styles.toast,
						{ backgroundColor: t.c.ink, marginBottom: (bottomOffset ?? (layout.bottomBar || insets.bottom)) + 16 },
						layout.isTablet && { width: "100%", maxWidth: 520, alignSelf: "center" },
						t.shadow("lg"),
						style,
					]}
				>
					<View style={[styles.dot, { backgroundColor: dot }]} />
					<Text size={14} weight={500} color={t.c.bg} style={{ flex: 1 }}>
						{current.message}
					</Text>
					{current.action ? (
						<Pressable
							accessibilityRole="button"
							onPress={() => {
								current.action?.onPress();
								dismiss(current.id);
							}}
							style={styles.action}
						>
							<Text size={13} weight={700} color={t.c.bg}>
								{current.action.label}
							</Text>
						</Pressable>
					) : null}
				</Animated.View>
			</GestureDetector>
		</View>
	);
}

const styles = StyleSheet.create({
	toast: { marginHorizontal: 16, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 },
	dot: { width: 8, height: 8, borderRadius: 4 },
	action: { height: 30, paddingHorizontal: 10, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.14)", justifyContent: "center" },
});
