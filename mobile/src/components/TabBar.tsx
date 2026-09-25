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
import { useT } from "../i18n";
import { useLayout } from "../hooks/useLayout";
import { RAIL_WIDTH } from "../lib/responsive";

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

const ICONS = { index: House, tree: Network, dates: CalendarDays, settings: SlidersHorizontal } as const;
const LABEL_KEYS = { index: "home", tree: "tree", dates: "dates", settings: "settings" } as const;

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
	const T = useT();
	const hasTree = useTree((s) => !!s.full);
	const layout = useLayout();
	if (layout.nav === "rail") return <NavRail state={state} navigation={navigation} />;
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
							accessibilityLabel={find ? T.tabs.findPerson : T.tabs.addPerson}
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
								{find ? T.tabs.find : T.tabs.add}
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
						accessibilityLabel={T.tabs[LABEL_KEYS[key]]}
						android_ripple={Platform.OS === "android" ? { color: t.c.ripple, borderless: true, radius: 36 } : undefined}
						onPress={() => {
							const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
							if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
						}}
						style={styles.tab}
					>
						<Icon size={26} color={color} strokeWidth={focused ? 2.25 : 1.75} />
						<Text size={11} weight={focused ? 700 : 600} color={color} allowFontScaling={false}>
							{T.tabs[LABEL_KEYS[key]]}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

/**
 * Tablets: a left navigation rail. The Add action (Find for viewers) is a
 * prominent primary button at the top; destinations below with a soft pill
 * behind the active icon.
 */
function NavRail({ state, navigation }: Pick<BottomTabBarProps, "state" | "navigation">) {
	const t = useTheme();
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const owner = useIsOwner();
	const T = useT();
	const hasTree = useTree((s) => !!s.full);
	const find = !owner && hasTree;
	return (
		<View
			accessibilityRole="tablist"
			style={[
				styles.rail,
				{ width: RAIL_WIDTH + insets.left, paddingLeft: insets.left, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 12, backgroundColor: t.c.surface, borderRightColor: t.c.border },
			]}
		>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={find ? T.tabs.findPerson : T.tabs.addPerson}
				onPress={() => {
					haptics.select();
					router.push(find ? "/search" : "/add-person");
				}}
				style={styles.railItem}
			>
				<View style={[styles.railAdd, { backgroundColor: t.c.primary }, t.shadow("md")]}>
					{find ? <Search size={24} color={t.c.onPrimary} strokeWidth={2.25} /> : <Plus size={26} color={t.c.onPrimary} strokeWidth={2.25} />}
				</View>
				<Text size={12} weight={700} color={t.c.ink2} allowFontScaling={false}>
					{find ? T.tabs.find : T.tabs.add}
				</Text>
			</Pressable>
			<View style={{ height: 20 }} />
			{state.routes.map((route, i) => {
				if (route.name === "add") return null;
				const key = route.name as keyof typeof ICONS;
				const Icon = ICONS[key];
				if (!Icon) return null;
				const focused = state.index === i;
				const color = focused ? t.c.primary : t.c.ink3;
				return (
					<Pressable
						key={route.key}
						accessibilityRole="tab"
						accessibilityState={{ selected: focused }}
						accessibilityLabel={T.tabs[LABEL_KEYS[key]]}
						onPress={() => {
							const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
							if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
						}}
						style={styles.railItem}
					>
						<View style={[styles.railPill, focused && { backgroundColor: t.c.primarySoft }]}>
							<Icon size={24} color={color} strokeWidth={focused ? 2.25 : 1.75} />
						</View>
						<Text size={12} weight={focused ? 700 : 600} color={color} allowFontScaling={false}>
							{T.tabs[LABEL_KEYS[key]]}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	rail: { height: "100%", borderRightWidth: 1, alignItems: "center", gap: 8 },
	railItem: { width: RAIL_WIDTH, alignItems: "center", gap: 4, paddingVertical: 4 },
	railAdd: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
	railPill: { width: 56, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
	bar: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", borderTopWidth: 1, paddingTop: 6, paddingHorizontal: 8, justifyContent: "space-around" },
	tab: { width: 64, alignItems: "center", gap: 3 },
	raised: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginTop: -18 },
});
