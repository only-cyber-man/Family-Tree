import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../src/components/Button";
import { GraphIllustration, Mark } from "../src/components/Illustrations";
import { Text } from "../src/components/Text";
import { requestPermission } from "../src/services/notifications";
import { useSettings } from "../src/store/settings";
import { useTheme } from "../src/theme/useTheme";
import { useT } from "../src/i18n";
import { QuickPrefs } from "../src/components/Preferences";
import { useLayout } from "../src/hooks/useLayout";
import { FORM_MAX, sideBySideHero } from "../src/lib/responsive";

/** Two screens: the value, then the one permission that matters. */
export default function Onboarding() {
	const t = useTheme();
	const T = useT();
	const layout = useLayout();
	const hero = sideBySideHero(layout.width, layout.height);
	const cap = layout.isTablet ? ({ width: "100%", maxWidth: FORM_MAX, alignSelf: "center" } as const) : null;
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const [page, setPage] = useState(0);
	const finish = useSettings((s) => s.finishOnboarding);
	const setReminders = useSettings((s) => s.setReminders);
	const [busy, setBusy] = useState(false);

	const toSignUp = () => {
		finish();
		router.replace("/sign-up");
	};

	return (
		<View style={[styles.fill, { backgroundColor: t.c.bg, paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
			<View style={{ paddingTop: 8 }}>
				<QuickPrefs />
			</View>
			{/* Tablets: centred content; roomy landscape puts the art beside the text. */}
			<View style={hero ? styles.heroRow : { flex: 1 }}>
			<Animated.View key={page} entering={FadeIn.duration(220)} style={hero ? styles.heroArt : styles.art}>
				{page === 0 ? <GraphIllustration width={layout.isTablet ? 380 : 300} /> : <NotificationPreview />}
			</Animated.View>
			<View style={[styles.bottom, cap, hero && { flex: 1, justifyContent: "center" }]}>
				<View style={{ gap: 10 }}>
					<Text variant="display" accessibilityRole="header">
						{page === 0 ? T.onboarding.title1 : T.onboarding.title2}
					</Text>
					<Text variant="bodyLg" color={t.c.ink2}>
						{page === 0
							? T.onboarding.body1
							: T.onboarding.body2}
					</Text>
				</View>
				<View style={styles.dots} accessibilityLabel={T.onboarding.page(page + 1, 2)}>
					<View style={[styles.dot, { width: page === 0 ? 20 : 6, backgroundColor: page === 0 ? t.c.primary : t.c.borderStrong }]} />
					<View style={[styles.dot, { width: page === 1 ? 20 : 6, backgroundColor: page === 1 ? t.c.primary : t.c.borderStrong }]} />
				</View>
				{page === 0 ? (
					<>
						<Button label={T.common.continue} onPress={() => setPage(1)} />
						<Button
							kind="text"
							label={T.onboarding.haveAccount}
							style={{ alignSelf: "center" }}
							onPress={() => {
								finish();
								router.replace("/sign-in");
							}}
						/>
					</>
				) : (
					<>
						<Button
							label={T.onboarding.turnOnReminders}
							loading={busy}
							onPress={async () => {
								setBusy(true);
								const ok = await requestPermission().catch(() => false);
								setReminders({ enabled: ok });
								setBusy(false);
								toSignUp();
							}}
						/>
						<Button kind="text" label={T.onboarding.notNow} style={{ alignSelf: "center" }} onPress={toSignUp} />
					</>
				)}
			</View>
			</View>
		</View>
	);
}

function NotificationPreview() {
	const t = useTheme();
	const T = useT();
	const card = (title: string, when: string, body?: string, dim?: boolean) => (
		<View style={[styles.note, { backgroundColor: t.c.surface, borderColor: t.c.border, opacity: dim ? 0.7 : 1 }, !dim && t.shadow("md")]}>
			<View style={[styles.appIcon, { backgroundColor: t.c.primary }]}>
				<Mark size={26} color="#F5F0E6" bottom="#E0955E" />
			</View>
			<View style={{ flex: 1 }}>
				<View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
					<Text size={12} weight={700}>
						{T.common.familyTree}
					</Text>
					<Text size={12} color={t.c.ink3}>
						{when}
					</Text>
				</View>
				<Text size={14} weight={600}>
					{title}
				</Text>
				{body ? (
					<Text size={13} color={t.c.ink2}>
						{body}
					</Text>
				) : null}
			</View>
		</View>
	);
	return (
		<View style={{ width: 300, gap: 10 }}>
			{card(T.onboarding.previewTitle1, T.onboarding.previewWhen1, T.onboarding.previewBody1)}
			{card(T.onboarding.previewTitle2, T.onboarding.previewWhen2, undefined, true)}
		</View>
	);
}


const styles = StyleSheet.create({
	fill: { flex: 1, paddingHorizontal: 24 },
	heroRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 48 },
	heroArt: { flex: 1, alignItems: "center", justifyContent: "center" },
	art: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40 },
	bottom: { gap: 20 },
	dots: { flexDirection: "row", gap: 6, justifyContent: "center" },
	dot: { height: 6, borderRadius: 3 },
	note: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
	appIcon: { width: 36, height: 36, borderRadius: 9, alignItems: "center", justifyContent: "center" },
});
