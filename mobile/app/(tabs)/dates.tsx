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
import { useT } from "../../src/i18n";
import { useLayout } from "../../src/hooks/useLayout";
import { LIST_MAX } from "../../src/lib/responsive";
import { PersonSheetContent } from "../../src/components/PersonSheetContent";

/** The web's .ics export becomes a live list plus opt-in local reminders. */
export default function Dates() {
	const t = useTheme();
	const T = useT();
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
	const layout = useLayout();
	const [detailId, setDetailId] = useState<string | null>(null);

	const events = useMemo(() => (graph ? upcomingEvents(graph.persons, today).filter((e) => kind === "all" || e.kind === kind) : []), [graph, today, kind]);
	const months = useMemo(() => groupByMonth(events, today, T), [events, today, T]);

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

	const list = (
		<>
			<View style={styles.header}>
				<Text variant="display" accessibilityRole="header">
					{T.dates.title}
				</Text>
				<Button
					kind="secondary"
					size="sm"
					style={{ height: 36, paddingHorizontal: 12, borderRadius: 10 }}
					icon={<Download size={14} color={t.c.ink} strokeWidth={2} />}
					label={T.dates.exportIcs}
					loading={exporting}
					disabled={!full}
					onPress={exportIcs}
				/>
			</View>
			<PillTabs
				value={kind}
				onChange={setKind}
				options={[
					{ value: "all", label: T.dates.all },
					{ value: "birthday", label: T.dates.birthdays },
					{ value: "remembrance", label: T.dates.remembrance },
				]}
			/>
			{!reminders.enabled ? (
				<Notice
					title={T.dates.quietReminder}
					icon={<Bell size={18} color={t.c.accent} strokeWidth={1.75} />}
					actions={<Button size="sm" label={T.dates.turnOn} onPress={enableReminders} style={{ height: 40 }} />}
				>
					{T.dates.localOnly}
				</Notice>
			) : null}
			{months.length === 0 ? (
				<View style={[styles.empty, { borderColor: t.c.borderStrong }]}>
					<Text size={15} weight={600} center>
						{T.dates.none}
					</Text>
					<Text variant="caption" center>
						{T.dates.noneBody}
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
									onPress={() => (layout.isWide ? setDetailId(e.personId) : router.push({ pathname: "/person/[id]", params: { id: e.personId } }))}
									highlighted={layout.isWide && detailId === e.personId}
								/>
							))}
						</Card>
					</View>
				))
			)}
			<Text variant="caption" style={{ lineHeight: 19 }}>
				{T.dates.footnote}
			</Text>
		</>
	);

	// Wide tablets: the list beside the selected person's details (master–detail).
	if (layout.isWide) {
		return (
			<Screen tabs>
				<View style={styles.split}>
					<View style={[styles.col, { maxWidth: 600 }]}>{list}</View>
					<View style={styles.col}>
						<View style={[styles.pane, { backgroundColor: t.c.surface, borderColor: t.c.border }]}>
							{detailId && graph?.byId[detailId] ? (
								<PersonSheetContent
									personId={detailId}
									focusLabel={T.person.focusOnTree}
									onClose={() => setDetailId(null)}
									onSelect={setDetailId}
									onFocus={(pid) => router.navigate({ pathname: "/tree", params: { focus: pid } })}
								/>
							) : (
								<Text variant="caption" center style={{ paddingVertical: 40 }}>
									{T.dates.detailHint}
								</Text>
							)}
						</View>
					</View>
				</View>
			</Screen>
		);
	}

	return (
		<Screen tabs maxWidth={LIST_MAX} contentStyle={{ gap: 18 }}>
			{list}
		</Screen>
	);
}

const styles = StyleSheet.create({
	header: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
	split: { flexDirection: "row", gap: 24, alignItems: "flex-start" },
	col: { flex: 1, gap: 18, minWidth: 0 },
	pane: { borderWidth: 1, borderRadius: 16, padding: 20 },
	empty: { padding: 24, borderWidth: 1, borderStyle: "dashed", borderRadius: 14, gap: 6 },
});
