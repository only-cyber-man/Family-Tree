// Per-weight imports so only the weights we use are bundled.
import { Literata_400Regular } from "@expo-google-fonts/literata/400Regular";
import { Literata_400Regular_Italic } from "@expo-google-fonts/literata/400Regular_Italic";
import { Literata_600SemiBold } from "@expo-google-fonts/literata/600SemiBold";
import { Manrope_400Regular } from "@expo-google-fonts/manrope/400Regular";
import { Manrope_500Medium } from "@expo-google-fonts/manrope/500Medium";
import { Manrope_600SemiBold } from "@expo-google-fonts/manrope/600SemiBold";
import { Manrope_700Bold } from "@expo-google-fonts/manrope/700Bold";
import * as Notifications from "expo-notifications";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavThemeProvider, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useFonts } from "expo-font";
import { useEffect, useMemo, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { OfflineBanner } from "../src/components/Feedback";
import { ToastHost } from "../src/components/ToastHost";
import { useReminderSync } from "../src/hooks/useReminders";
import { ensureChannel } from "../src/services/notifications";
import { startNetworkWatch } from "../src/store/network";
import { useSession } from "../src/store/session";
import { useSettings } from "../src/store/settings";
import { useTrees } from "../src/store/trees";
import { shouldOpenReminder } from "../src/lib/session";
import { ThemeProvider, useTheme } from "../src/theme/useTheme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ duration: 220, fade: true });

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		Literata_400Regular,
		Literata_600SemiBold,
		Literata_400Regular_Italic,
		Manrope_400Regular,
		Manrope_500Medium,
		Manrope_600SemiBold,
		Manrope_700Bold,
	});
	const hydrated = useSettings((s) => s.hydrated);
	const ready = useSession((s) => s.ready);

	useEffect(() => {
		startNetworkWatch();
		ensureChannel().catch(() => undefined);
		useSession.getState().init();
	}, []);

	const loaded = (fontsLoaded || !!fontError) && hydrated && ready;
	useEffect(() => {
		if (loaded) SplashScreen.hideAsync().catch(() => undefined);
	}, [loaded]);

	if (!loaded) return null;
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider>
				<Root />
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}

const sheet = { presentation: "transparentModal", animation: "none", gestureEnabled: false, contentStyle: { backgroundColor: "transparent" } } as const;

function Root() {
	const t = useTheme();
	const router = useRouter();
	const signedIn = useSession((s) => !!s.user);
	const expired = useSession((s) => s.expired);
	const onboardingDone = useSettings((s) => s.onboardingDone);
	useReminderSync();

	useEffect(() => {
		SystemUI.setBackgroundColorAsync(t.c.bg).catch(() => undefined);
	}, [t]);

	// Tapping a reminder opens familytree://tree/<id>/person/<id>.
	const response = Notifications.useLastNotificationResponse();
	const handled = useRef<string | null>(null);
	useEffect(() => {
		const data = response?.notification.request.content.data as { treeId?: string; personId?: string; userId?: string } | undefined;
		const key = response ? `${response.notification.request.identifier}:${response.notification.date}` : null;
		if (signedIn && key && handled.current !== key && data?.treeId && data.personId) {
			handled.current = key;
			// Only reminders scheduled by this account, for a tree it can still see.
			const trees = useTrees.getState();
			const treeIds = trees.status === "ready" && !trees.offline ? trees.items.map((i) => i.tree.id) : null;
			if (!shouldOpenReminder(data, useSession.getState().user?.id, treeIds)) return;
			router.push({ pathname: "/tree/[treeId]/person/[personId]", params: { treeId: data.treeId, personId: data.personId } });
		}
	}, [response, signedIn, router]);

	const navTheme = useMemo(() => {
		const base = t.scheme === "dark" ? DarkTheme : DefaultTheme;
		return { ...base, colors: { ...base.colors, background: t.c.bg, card: t.c.surface, text: t.c.ink, border: t.c.border, primary: t.c.primary, notification: t.c.accent } };
	}, [t]);

	return (
		<NavThemeProvider value={navTheme}>
			<StatusBar style={t.scheme === "dark" ? "light" : "dark"} />
			<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.c.bg } }}>
				<Stack.Protected guard={!signedIn}>
					<Stack.Protected guard={!onboardingDone && !expired}>
						<Stack.Screen name="onboarding" />
					</Stack.Protected>
					<Stack.Screen name="(auth)" />
				</Stack.Protected>
				<Stack.Protected guard={signedIn}>
					<Stack.Screen name="(tabs)" />
					<Stack.Screen name="search" options={{ animation: "fade" }} />
					<Stack.Screen name="person/[id]/index" options={sheet} />
					<Stack.Screen name="person/[id]/path" />
					<Stack.Screen name="add-person" options={sheet} />
					<Stack.Screen name="add-relationship" options={sheet} />
					<Stack.Screen name="filters" options={sheet} />
					<Stack.Screen name="trees" options={sheet} />
					<Stack.Screen name="pick-me" options={sheet} />
					<Stack.Screen name="invited" />
					<Stack.Screen name="tree/[treeId]/index" options={{ animation: "none" }} />
					<Stack.Screen name="tree/[treeId]/person/[personId]" options={{ animation: "none" }} />
				</Stack.Protected>
			</Stack>
			<OfflineBanner message={signedIn ? undefined : "You're offline."} />
			<ToastHost />
		</NavThemeProvider>
	);
}
