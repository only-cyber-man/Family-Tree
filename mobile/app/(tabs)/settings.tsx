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
import { useTheme } from "../../src/theme/useTheme";
import { useT } from "../../src/i18n";
import { PreferencesCard } from "../../src/components/Preferences";
import { READING_MAX } from "../../src/lib/responsive";

export default function Settings() {
	const t = useTheme();
	const T = useT();
	const router = useRouter();
	const user = useSession((s) => s.user);
	const signOut = useSession((s) => s.signOut);
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
			toast(errorMessage(e, T), "error");
		} finally {
			setExporting(false);
		}
	};

	const confirmSignOut = () =>
		Alert.alert(
			T.settings.signOutTitle,
			T.settings.signOutBody,
			[
			{ text: T.common.cancel, style: "cancel" },
			{
				text: T.settings.signOut,
				style: "destructive",
				onPress: () => {
					signOut();
				},
			},
			],
		);

	const account = () =>
		Alert.alert(user?.name || user?.username || T.settings.account, T.settings.accountBody, [
			{ text: T.settings.openWebsite, onPress: () => WebBrowser.openBrowserAsync(WEB_ORIGIN) },
			{ text: T.common.close, style: "cancel" },
		]);

	return (
		<Screen tabs maxWidth={READING_MAX} contentStyle={{ gap: 18 }}>
			<Text variant="display" accessibilityRole="header">
				{T.settings.title}
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
				<SectionHeader title={T.prefs.appearance} />
				<PreferencesCard />
			</View>

			<View style={{ gap: 8 }}>
				<SectionHeader title={T.settings.reminders} />
				<Card>
					<SwitchRow title={T.settings.birthdays} subtitle={T.settings.dayBefore} value={reminders.enabled && reminders.birthdays} onChange={toggle("birthdays")} />
					<SwitchRow title={T.settings.remembranceDays} subtitle={T.settings.onTheDay} value={reminders.enabled && reminders.remembrance} onChange={toggle("remembrance")} />
					<SwitchRow title={T.settings.roundEarly} subtitle={T.settings.roundAges} value={reminders.enabled && reminders.roundEarly} onChange={toggle("roundEarly")} />
				</Card>
				<Text variant="small">{T.settings.remindersNote}</Text>
			</View>

			{full ? (
				<View style={{ gap: 8 }}>
					<SectionHeader title={full.tree.name} />
					<Card>
						{owner ? (
							<ValueRow
								title={T.settings.whoCanSee}
								value={full.tree.invited.length ? T.settings.viewers(full.tree.invited.length) : T.settings.onlyYou}
								onPress={() => router.push("/invited")}
							/>
						) : null}
						<ValueRow
							title={exporting ? T.settings.preparing : T.settings.exportIcs}
							onPress={exportIcs}
							icon={<Share size={18} color={t.c.ink3} strokeWidth={1.75} />}
						/>
						<ValueRow title={T.settings.thisIsMe} value={me?.name ?? T.settings.notSet} onPress={() => router.push("/pick-me")} />
						<ValueRow title={T.settings.switchTree} onPress={() => router.push("/trees")} />
					</Card>
				</View>
			) : null}

			<View style={{ gap: 8 }}>
				<SectionHeader title={T.settings.about} />
				<Card>
					<ValueRow title={T.settings.privacy} onPress={() => WebBrowser.openBrowserAsync(`${WEB_ORIGIN}/privacy`)} />
				</Card>
			</View>

			<Button kind="destructive" size="md" label={T.settings.signOut} onPress={confirmSignOut} style={{ height: 50 }} />
			<Button
				kind="destructive"
				size="md"
				label={T.settings.deleteAccount}
				style={{ height: 50, borderColor: "transparent" }}
				onPress={() =>
					Alert.alert(
						T.settings.deleteTitle,
						T.settings.deleteBody,
						[
							{ text: T.common.cancel, style: "cancel" },
							{ text: T.common.continue, style: "destructive", onPress: () => router.push("/delete-account") },
						],
					)
				}
			/>
			<Text variant="small" center>
				{T.settings.footer(Constants.expoConfig?.version ?? "1.0")}
			</Text>
		</Screen>
	);
}
