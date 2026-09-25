import { Tabs } from "expo-router";
import { TabBar } from "../../src/components/TabBar";
import { useActiveTreeBootstrap } from "../../src/hooks/useActiveTree";

/** Five tabs; Add is a modal trigger, never a destination. */
export default function TabsLayout() {
	useActiveTreeBootstrap();
	return (
		<Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
			<Tabs.Screen name="index" />
			<Tabs.Screen name="tree" />
			<Tabs.Screen name="add" />
			<Tabs.Screen name="dates" />
			<Tabs.Screen name="settings" />
		</Tabs>
	);
}
