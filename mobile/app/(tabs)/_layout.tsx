import { Tabs } from "expo-router";
import { TabBar } from "../../src/components/TabBar";
import { useActiveTreeBootstrap } from "../../src/hooks/useActiveTree";
import { useLayout } from "../../src/hooks/useLayout";

/** Five tabs; Add is a modal trigger, never a destination. */
export default function TabsLayout() {
	useActiveTreeBootstrap();
	const layout = useLayout();
	return (
		<Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, tabBarPosition: layout.nav === "rail" ? "left" : "bottom" }}>
			<Tabs.Screen name="index" />
			<Tabs.Screen name="tree" />
			<Tabs.Screen name="add" />
			<Tabs.Screen name="dates" />
			<Tabs.Screen name="settings" />
		</Tabs>
	);
}
