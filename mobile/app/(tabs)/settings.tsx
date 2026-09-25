import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Share } from "lucide-react-native";
import { useState } from "react";
import { Alert, View } from "react-native";
import { Avatar } from "../../src/components/Avatar";
import { Button } from "../../src/components/Button";
import { Card, Row, SectionHeader, SwitchRow, ValueRow } from "../../src/components/List";
import { Screen } from "../../src/components/Screen";
import { Segmented } from "../../src/components/Segmented";
import { Text } from "../../src/components/Text";
import { useEnableReminders } from "../../src/hooks/useReminders";
import { useIsOwner, useMe, useVisibility } from "../../src/hooks/useTreeData";
import { errorMessage } from "../../src/lib/errors";
import { WEB_ORIGIN } from "../../src/lib/ics";
import { shareIcs } from "../../src/services/exportIcs";
import { useSession } from "../../src/store/session";
import { useSettings, type ReminderSettings } from "../../src/store/settings";
import { toast } from "../../src/store/toast";
import { useTree } from "../../src/store/tree";
import type { ThemePreference } from "../../src/theme/theme";
import { useTheme } from "../../src/theme/useTheme";

export default function Settings() {
	const t = useTheme();
	const router = useRouter();
	const user = useSession((s) => s.user);
	const signOut = useSession((s) => s.signOut);
	const theme = useSettings((s) => s.theme);
	const setTheme = useSettings((s) => s.setTheme);
	const reminders = useSettings((s) => s.reminders);
	const setReminders = useSettings((s) => s.setReminders);
	const enableReminders = useEnableReminders();
	const full = useTree((s) => s.full);
	const { visible } = useVisibility();
	const owner = useIsOwner();
	const me = useMe();
	const [exporting, setExporting] = useState(false);

	const toggle = (key: keyof Omit<ReminderSettings, "enabled">) => async (on: boolean) => {
		if (on && !reminders.enabled) {
			const ok = await enableReminders();
			if (!ok) return;
		}
		setReminders({ [key]: on });
	};

	const exportIcs = async () => {
		if (!full || !visible) return;
		setExporting(true);
		try {
			await shareIcs(full.tree.id, full.tree.name, visible.persons);
		} catch (e) {
			toast(errorMessage(e), "error");
		} finally {
			setExporting(false);
		}
	};

	const confirmSignOut = () =>
		Alert.alert(
			"Sign out?",
			"Reminders are removed and the copies of your trees are deleted from this phone.",
			[
			{ text: "Cancel", style: "cancel" },
			{
				text: "Sign out",
				style: "destructive",
				onPress: () => {
					signOut();
				},
			},
			],
		);

	const account = () =>
		Alert.alert(user?.name || user?.username || "Account", "Password changes and account deletion are done on the website.", [
			{ text: "Open website", onPress: () => WebBrowser.openBrowserAsync(WEB_ORIGIN) },
			{ text: "Close", style: "cancel" },
		]);

	return (
		<Screen tabs contentStyle={{ gap: 18 }}>
			<Text variant="display" accessibilityRole="header">
				Settings
			</Text>
			<Card>
				<Row
					onPress={account}
					chevron
					leading={<Avatar name={user?.name || user?.username || "?"} color={t.c.primary} size={48} />}
					title={
						<Text size={16} weight={600}>
							{user?.name || user?.username}
						</Text>
					}
					subtitle={`${user?.username ?? ""}${user?.email ? ` · ${user.email}` : ""}`}
				/>
			</Card>

			<View style={{ gap: 8 }}>
				<SectionHeader title="Appearance" />
				<Card padded>
					<Text size={15} weight={600}>
						Theme
					</Text>
					<Segmented<ThemePreference>
						value={theme}
						onChange={setTheme}
						options={[
							{ value: "system", label: "System" },
							{ value: "light", label: "Light" },
							{ value: "dark", label: "Dark" },
						]}
					/>
				</Card>
			</View>

			<View style={{ gap: 8 }}>
				<SectionHeader title="Reminders" />
				<Card>
					<SwitchRow title="Birthdays" subtitle="Day before, 9:00" value={reminders.enabled && reminders.birthdays} onChange={toggle("birthdays")} />
					<SwitchRow title="Remembrance days" subtitle="On the day, 9:00" value={reminders.enabled && reminders.remembrance} onChange={toggle("remembrance")} />
					<SwitchRow title="Round birthdays a week early" subtitle="18, 50, 55, 60, 65, 70…" value={reminders.enabled && reminders.roundEarly} onChange={toggle("roundEarly")} />
				</Card>
				<Text variant="small">Scheduled on this phone for the active tree. Nothing is sent to a server.</Text>
			</View>

			{full ? (
				<View style={{ gap: 8 }}>
					<SectionHeader title={full.tree.name} />
					<Card>
						{owner ? (
							<ValueRow
								title="Who can see this tree"
								value={full.tree.invited.length ? `${full.tree.invited.length} viewer${full.tree.invited.length === 1 ? "" : "s"}` : "Only you"}
								onPress={() => router.push("/invited")}
							/>
						) : null}
						<ValueRow
							title={exporting ? "Preparing…" : "Export to calendar (.ics)"}
							onPress={exportIcs}
							icon={<Share size={18} color={t.c.ink3} strokeWidth={1.75} />}
						/>
						<ValueRow title="This is me" value={me?.name ?? "Not set"} onPress={() => router.push("/pick-me")} />
						<ValueRow title="Switch tree" onPress={() => router.push("/trees")} />
					</Card>
				</View>
			) : null}

			<Button kind="destructive" size="md" label="Sign out" onPress={confirmSignOut} style={{ height: 50 }} />
			<Text variant="small" center>
				Family Tree {Constants.expoConfig?.version ?? "1.0"} · Created by tomek7667 · family-tree@cyber-man.pl
			</Text>
		</Screen>
	);
}
