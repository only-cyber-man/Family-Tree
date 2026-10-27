import { Check, Languages, Moon, Sun, SunMoon } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LANGS, LANGUAGE_NAMES, resolveLang, useT, type LanguagePreference } from "../i18n";
import { useSettings } from "../store/settings";
import type { ThemePreference } from "../theme/theme";
import { useTheme } from "../theme/useTheme";
import { Chip } from "./Chip";
import { Card } from "./List";
import { Segmented } from "./Segmented";
import { Text } from "./Text";

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
			<View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={T.prefs.language}>
				<Chip label={T.prefs.languageSystem} selected={language === "system"} onPress={() => setLanguage("system")} />
				{LANGS.map((code) => (
					<Chip key={code} label={LANGUAGE_NAMES[code]} selected={language === code} onPress={() => setLanguage(code)} />
				))}
			</View>
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
	const [menu, setMenu] = useState(false);
	const current = resolveLang(language);
	const nextTheme = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
	const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : SunMoon;
	const themeName = theme === "light" ? T.prefs.light : theme === "dark" ? T.prefs.dark : T.prefs.system;
	return (
		<View style={styles.row}>
			<Pressable
				onPress={() => setMenu(true)}
				accessibilityRole="button"
				accessibilityLabel={`${T.prefs.language}: ${LANGUAGE_NAMES[current]}`}
				accessibilityHint={T.prefs.chooseLanguage}
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
			<LanguageMenu
				visible={menu}
				value={language}
				onChange={(l) => {
					setLanguage(l);
					setMenu(false);
				}}
				onClose={() => setMenu(false)}
			/>
		</View>
	);
}

/** A centred list of the languages (System first), each written in itself. */
function LanguageMenu({
	visible,
	value,
	onChange,
	onClose,
}: {
	visible: boolean;
	value: LanguagePreference;
	onChange: (l: LanguagePreference) => void;
	onClose: () => void;
}) {
	const t = useTheme();
	const T = useT();
	const options: { value: LanguagePreference; label: string }[] = [
		{ value: "system", label: T.prefs.languageSystem },
		...LANGS.map((code) => ({ value: code, label: LANGUAGE_NAMES[code] })),
	];
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<Pressable style={[styles.scrim, { backgroundColor: t.c.overlay }]} onPress={onClose} accessibilityLabel={T.common.close} />
			<View style={styles.center} pointerEvents="box-none">
				<View style={[styles.menu, { backgroundColor: t.c.surface }, t.shadow("lg")]} accessibilityRole="radiogroup" accessibilityLabel={T.prefs.language}>
					<Text variant="serif" style={styles.menuTitle}>
						{T.prefs.language}
					</Text>
					<ScrollView style={styles.menuList}>
						{options.map((o) => {
							const on = o.value === value;
							return (
								<Pressable
									key={o.value}
									onPress={() => onChange(o.value)}
									accessibilityRole="radio"
									accessibilityState={{ selected: on, checked: on }}
									style={({ pressed }) => [styles.option, { backgroundColor: on ? t.c.accentSoft : pressed ? t.c.surface2 : "transparent" }]}
								>
									<Text size={16} weight={on ? 700 : 500}>
										{o.label}
									</Text>
									{on ? <Check size={18} color={t.c.accent} strokeWidth={2.25} /> : null}
								</Pressable>
							);
						})}
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
	pill: { height: 36, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 6 },
	chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
	scrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
	center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
	menu: { width: "100%", maxWidth: 360, borderRadius: 20, paddingVertical: 12 },
	menuTitle: { paddingHorizontal: 20, paddingBottom: 8 },
	menuList: { maxHeight: 440 },
	option: { minHeight: 48, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
});
