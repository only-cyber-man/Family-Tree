import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetwork } from "../store/network";
import { TAB_BAR_HEIGHT } from "../theme/theme";
import { useTheme } from "../theme/useTheme";

/** Scrollable screen with the title in content (no large-title nav bar). */
export function Screen({
	children,
	tabs,
	scroll = true,
	refreshing,
	onRefresh,
	contentStyle,
}: {
	children: ReactNode;
	/** Leaves room for the tab bar. */
	tabs?: boolean;
	scroll?: boolean;
	refreshing?: boolean;
	onRefresh?: () => void;
	contentStyle?: StyleProp<ViewStyle>;
}) {
	const t = useTheme();
	const insets = useSafeAreaInsets();
	const online = useNetwork((s) => s.online);
	const top = insets.top + (online ? 18 : 50);
	const bottom = (tabs ? TAB_BAR_HEIGHT + insets.bottom : insets.bottom) + 40;
	if (!scroll) {
		return <View style={[styles.fill, { backgroundColor: t.c.bg, paddingTop: top, paddingBottom: bottom, paddingHorizontal: 20 }, contentStyle]}>{children}</View>;
	}
	return (
		<ScrollView
			style={[styles.fill, { backgroundColor: t.c.bg }]}
			contentContainerStyle={[{ paddingTop: top, paddingBottom: bottom, paddingHorizontal: 20, gap: 20 }, contentStyle]}
			keyboardShouldPersistTaps="handled"
			refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={t.c.primary} colors={[t.c.primary]} /> : undefined}
		>
			{children}
		</ScrollView>
	);
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
