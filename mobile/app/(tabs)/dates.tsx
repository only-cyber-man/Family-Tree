import { useRouter } from "expo-router";
import { Bell, Download } from "lucide-react-native";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "../../src/components/Button";
import { Notice } from "../../src/components/Feedback";
import { Card, SectionHeader } from "../../src/components/List";
import { EventRow } from "../../src/components/People";
import { Screen } from "../../src/components/Screen";
import { PillTabs } from "../../src/components/Segmented";
import { Text } from "../../src/components/Text";
import { useEnableReminders, useScheduledEventKeys } from "../../src/hooks/useReminders";
import { usePictures, useToday, useVisibility } from "../../src/hooks/useTreeData";
import { errorMessage } from "../../src/lib/errors";
import { groupByMonth, upcomingEvents, type DateKind } from "../../src/lib/upcoming";
import { shareIcs } from "../../src/services/exportIcs";
import { useSettings } from "../../src/store/settings";
import { toast } from "../../src/store/toast";
import { useTree } from "../../src/store/tree";
import { useTheme } from "../../src/theme/useTheme";

/** The web's .ics export becomes a live list plus opt-in local reminders. */
export default function Dates() {
	const t = useTheme();
	const router = useRouter();
	const full = useTree((s) => s.full);
	const { graph, visible } = useVisibility();
	const pictures = usePictures();
	const today = useToday();
	const reminders = useSettings((s) => s.reminders);
	const enableReminders = useEnableReminders();
	const scheduled = useScheduledEventKeys();
	const [kind, setKind] = useState<"all" | DateKind>("all");
	const [exporting, setExporting] = useState(false);

	const events = useMemo(() => (graph ? upcomingEvents(graph.persons, today).filter((e) => kind === "all" || e.kind === kind) : []), [graph, today, kind]);
	const months = useMemo(() => groupByMonth(events, today), [events, today]);

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

	return (
		<Screen tabs contentStyle={{ gap: 18 }}>
			<View style={styles.header}>
				<Text variant="display" accessibilityRole="header">
					Dates
				</Text>
				<Button
					kind="secondary"
					size="sm"
					style={{ height: 36, paddingHorizontal: 12, borderRadius: 10 }}
					icon={<Download size={14} color={t.c.ink} strokeWidth={2} />}
					label="Export .ics"
					loading={exporting}
					disabled={!full}
					onPress={exportIcs}
				/>
			</View>
			<PillTabs
				value={kind}
				onChange={setKind}
				options={[
					{ value: "all", label: "All" },
					{ value: "birthday", label: "Birthdays" },
					{ value: "remembrance", label: "Remembrance" },
				]}
			/>
			{!reminders.enabled ? (
				<Notice
					title="Get a quiet reminder the day before"
					icon={<Bell size={18} color={t.c.accent} strokeWidth={1.75} />}
					actions={<Button size="sm" label="Turn on reminders" onPress={enableReminders} style={{ height: 40 }} />}
				>
					Reminders are scheduled on this phone from the dates in the tree. Nothing is sent to a server.
				</Notice>
			) : null}
			{months.length === 0 ? (
				<View style={[styles.empty, { borderColor: t.c.borderStrong }]}>
					<Text size={15} weight={600} center>
						No upcoming dates
					</Text>
					<Text variant="caption" center>
						Birthdays and remembrance days appear here once there are people in the tree.
					</Text>
				</View>
			) : (
				months.map((m) => (
					<View key={m.key} style={{ gap: 8 }}>
						<SectionHeader title={m.label} />
						<Card>
							{m.events.map((e) => (
								<EventRow
									key={e.key}
									event={e}
									person={graph?.byId[e.personId]}
									uri={pictures[e.personId]}
									bell={scheduled.has(e.key)}
									onPress={() => router.push({ pathname: "/person/[id]", params: { id: e.personId } })}
								/>
							))}
						</Card>
					</View>
				))
			)}
			<Text variant="caption" style={{ lineHeight: 19 }}>
				Bell = local reminder scheduled for 9:00 the day before (remembrance days: on the day). Round ages (18, 50, 55, 60…) can get a second reminder a week
				ahead. The export includes the people currently visible on the tree.
			</Text>
		</Screen>
	);
}

const styles = StyleSheet.create({
	header: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
	empty: { padding: 24, borderWidth: 1, borderStyle: "dashed", borderRadius: 14, gap: 6 },
});
