import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetwork } from "../store/network";
import { useTheme } from "../theme/useTheme";
import { useLayout } from "../hooks/useLayout";

/** Scrollable screen with the title in content (no large-title nav bar). */
export function Screen({
	children,
	tabs,
	scroll = true,
	refreshing,
	onRefresh,
	contentStyle,
	maxWidth,
}: {
	children: ReactNode;
	/** Leaves room for the tab bar. */
	tabs?: boolean;
	scroll?: boolean;
	refreshing?: boolean;
	onRefresh?: () => void;
	contentStyle?: StyleProp<ViewStyle>;
	/** Tablets: centre the content at this width instead of stretching it edge to edge. */
	maxWidth?: number;
}) {
	const t = useTheme();
	const insets = useSafeAreaInsets();
	const online = useNetwork((s) => s.online);
	const top = insets.top + (online ? 18 : 50);
	const layout = useLayout();
	const bottom = (tabs ? layout.bottomBar || insets.bottom : insets.bottom) + 40;
	const capped: StyleProp<ViewStyle> = maxWidth && layout.isTablet ? { width: "100%", maxWidth, alignSelf: "center" } : null;
	if (!scroll) {
		return (
			<View style={[styles.fill, { backgroundColor: t.c.bg }]}>
				<View style={[styles.fill, { paddingTop: top, paddingBottom: bottom, paddingHorizontal: layout.isTablet ? 32 : 20 }, capped, contentStyle]}>{children}</View>
			</View>
		);
	}
	return (
		<View style={[styles.fill, { backgroundColor: t.c.bg }]}>
		<ScrollView
			style={styles.fill}
			contentContainerStyle={[{ paddingTop: top, paddingBottom: bottom, paddingHorizontal: layout.isTablet ? 32 : 20, gap: 20 }, capped, contentStyle]}
			keyboardShouldPersistTaps="handled"
			refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={t.c.primary} colors={[t.c.primary]} /> : undefined}
		>
			{children}
		</ScrollView>
		{/* Scrolled content would otherwise run under the status bar text. Left out with pull-to-refresh, whose spinner sits in that band. */}
		{onRefresh ? null : <View pointerEvents="none" style={[styles.statusScrim, { height: insets.top, backgroundColor: t.c.bg }]} />}
		</View>
	);
}

const styles = StyleSheet.create({
	fill: { flex: 1 },
	statusScrim: { position: "absolute", top: 0, left: 0, right: 0 },
});
