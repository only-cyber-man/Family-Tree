import { useRouter, type Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { CalendarDays, House, Network, Plus, Search, SlidersHorizontal } from "lucide-react-native";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsOwner } from "../hooks/useTreeData";
import { haptics } from "../services/haptics";
import { useTree } from "../store/tree";
import { TAB_BAR_HEIGHT } from "../theme/theme";
import { useTheme } from "../theme/useTheme";
import { Text } from "./Text";

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

const ICONS = { index: House, tree: Network, dates: CalendarDays, settings: SlidersHorizontal } as const;
const LABELS = { index: "Home", tree: "Tree", dates: "Dates", settings: "Settings" } as const;

/**
 * 56 pt + safe area, surface with a 1 px top border. The centre Add tab is a
 * raised primary circle that opens Add person and is never "selected"; for
 * read-only viewers it becomes Find.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
	const t = useTheme();
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const owner = useIsOwner();
	const hasTree = useTree((s) => !!s.full);
	return (
		<View style={[styles.bar, { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom, backgroundColor: t.c.surface, borderTopColor: t.c.border }]}>
			{state.routes.map((route, i) => {
				const focused = state.index === i;
				if (route.name === "add") {
					const find = !owner && hasTree;
					return (
						<Pressable
							key={route.key}
							accessibilityRole="button"
							accessibilityLabel={find ? "Find a person" : "Add person"}
							onPress={() => {
								haptics.select();
								router.push(find ? "/search" : "/add-person");
							}}
							style={styles.tab}
						>
							<View style={[styles.raised, { backgroundColor: t.c.primary }, t.shadow("md")]}>
								{find ? <Search size={24} color={t.c.onPrimary} strokeWidth={2.25} /> : <Plus size={26} color={t.c.onPrimary} strokeWidth={2.25} />}
							</View>
							<Text size={11} weight={600} color={t.c.ink2} allowFontScaling={false}>
								{find ? "Find" : "Add"}
							</Text>
						</Pressable>
					);
				}
				const key = route.name as keyof typeof ICONS;
				const Icon = ICONS[key];
				if (!Icon) return null;
				const color = focused ? t.c.primary : t.c.ink3;
				return (
					<Pressable
						key={route.key}
						accessibilityRole="tab"
						accessibilityState={{ selected: focused }}
						accessibilityLabel={LABELS[key]}
						android_ripple={Platform.OS === "android" ? { color: t.c.ripple, borderless: true, radius: 36 } : undefined}
						onPress={() => {
							const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
							if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
						}}
						style={styles.tab}
					>
						<Icon size={26} color={color} strokeWidth={focused ? 2.25 : 1.75} />
						<Text size={11} weight={focused ? 700 : 600} color={color} allowFontScaling={false}>
							{LABELS[key]}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	bar: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", borderTopWidth: 1, paddingTop: 6, paddingHorizontal: 8, justifyContent: "space-around" },
	tab: { width: 64, alignItems: "center", gap: 3 },
	raised: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginTop: -18 },
});
