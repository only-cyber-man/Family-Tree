import { Languages, Moon, Sun, SunMoon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { resolveLang, useT, type LanguagePreference } from "../i18n";
import { useSettings } from "../store/settings";
import type { ThemePreference } from "../theme/theme";
import { useTheme } from "../theme/useTheme";
import { Card } from "./List";
import { Segmented } from "./Segmented";
import { Text } from "./Text";

// Language names are shown in their own language on purpose.
const LANGUAGE_NAMES = { en: "English", pl: "Polski" } as const;

/** Settings → Appearance: language and theme, applied app-wide immediately. */
export function PreferencesCard() {
	const T = useT();
	const language = useSettings((s) => s.language);
	const setLanguage = useSettings((s) => s.setLanguage);
	const theme = useSettings((s) => s.theme);
	const setTheme = useSettings((s) => s.setTheme);
	return (
		<Card padded>
			<Text size={15} weight={600}>
				{T.prefs.language}
			</Text>
			<Segmented<LanguagePreference>
				value={language}
				onChange={setLanguage}
				options={[
					{ value: "system", label: T.prefs.languageSystem },
					{ value: "en", label: LANGUAGE_NAMES.en },
					{ value: "pl", label: LANGUAGE_NAMES.pl },
				]}
			/>
			<Text size={15} weight={600} style={{ marginTop: 6 }}>
				{T.prefs.theme}
			</Text>
			<Segmented<ThemePreference>
				value={theme}
				onChange={setTheme}
				options={[
					{ value: "system", label: T.prefs.system },
					{ value: "light", label: T.prefs.light },
					{ value: "dark", label: T.prefs.dark },
				]}
			/>
		</Card>
	);
}

const THEME_CYCLE: ThemePreference[] = ["system", "light", "dark"];

/** Compact language + theme switch for screens before sign-in. */
export function QuickPrefs() {
	const t = useTheme();
	const T = useT();
	const language = useSettings((s) => s.language);
	const setLanguage = useSettings((s) => s.setLanguage);
	const theme = useSettings((s) => s.theme);
	const setTheme = useSettings((s) => s.setTheme);
	const current = resolveLang(language);
	const next = current === "pl" ? "en" : "pl";
	const nextTheme = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
	const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : SunMoon;
	const themeName = theme === "light" ? T.prefs.light : theme === "dark" ? T.prefs.dark : T.prefs.system;
	return (
		<View style={styles.row}>
			<Pressable
				onPress={() => setLanguage(next)}
				accessibilityRole="button"
				accessibilityLabel={`${T.prefs.language}: ${LANGUAGE_NAMES[current]}`}
				accessibilityHint={LANGUAGE_NAMES[next]}
				hitSlop={6}
				style={[styles.pill, { borderColor: t.c.border, backgroundColor: t.c.surface }]}
			>
				<Languages size={16} color={t.c.ink2} strokeWidth={1.75} />
				<Text size={13} weight={700} color={t.c.ink2}>
					{current.toUpperCase()}
				</Text>
			</Pressable>
			<Pressable
				onPress={() => setTheme(nextTheme)}
				accessibilityRole="button"
				accessibilityLabel={`${T.prefs.theme}: ${themeName}`}
				hitSlop={6}
				style={[styles.pill, { borderColor: t.c.border, backgroundColor: t.c.surface }]}
			>
				<ThemeIcon size={16} color={t.c.ink2} strokeWidth={1.75} />
				<Text size={13} weight={600} color={t.c.ink2}>
					{themeName}
				</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
	pill: { height: 36, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 6 },
});
