import { useRouter } from "expo-router";
import { CalendarDays, Focus, Lock, Trash } from "lucide-react-native";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useEnableReminders } from "../hooks/useReminders";
import { useCanWrite, useGraph, useIsOwner, useMe, usePictures, useToday } from "../hooks/useTreeData";
import { ageInfo, formatShort } from "../lib/dates";
import { errorMessage } from "../lib/errors";
import { inDays } from "../lib/format";
import { groupGlyph, groupLabel, sheetGroups, type SheetRow } from "../lib/relations";
import { upcomingEvents } from "../lib/upcoming";
import { haptics } from "../services/haptics";
import { useSettings } from "../store/settings";
import { toast } from "../store/toast";
import { useTree } from "../store/tree";
import { useTrees } from "../store/trees";
import { useTheme } from "../theme/useTheme";
import { Avatar } from "./Avatar";
import { OfflineWriteHint } from "./Feedback";
import { Button, IconButton } from "./Button";
import { PersonRow } from "./People";
import { Text } from "./Text";
import { X } from "lucide-react-native";

/**
 * Person details: header, Focus / How are we related, next date, direct
 * relationships grouped by type, owner actions. Viewers get the same content
 * with every edit control removed and a "Shared with you" row.
 */
export function PersonSheetContent({
	personId,
	onClose,
	onSelect,
	onFocus,
	collapsed,
	focusLabel = "Focus",
}: {
	personId: string;
	onClose: () => void;
	onSelect: (id: string) => void;
	onFocus: (id: string) => void;
	collapsed?: boolean;
	focusLabel?: string;
}) {
	const t = useTheme();
	const router = useRouter();
	const graph = useGraph();
	const pictures = usePictures();
	const today = useToday();
	const owner = useIsOwner();
	const me = useMe();
	const full = useTree((s) => s.full);
	const removeNode = useTree((s) => s.removeNode);
	const removeRelationship = useTree((s) => s.removeRelationship);
	const canWrite = useCanWrite();
	const remindersOn = useSettings((s) => s.reminders.enabled);
	const enableReminders = useEnableReminders();
	const ownerEmail = useTrees((s) => s.items.find((i) => i.tree.id === full?.tree.id)?.ownerEmail);

	const person = graph?.byId[personId];
	if (!graph || !person || !full) {
		return (
			<View style={{ padding: 20, gap: 12 }}>
				<Text variant="bodyLg">This person is no longer in the tree.</Text>
				<Button kind="secondary" label="Close" onPress={onClose} />
			</View>
		);
	}

	const info = ageInfo(person.birth, person.death, today);
	const genderWord = person.gender === "male" ? "Male" : "Female";
	const ageLine = info
		? info.deceased
			? `${genderWord} · ${info.age} at death${info.wouldBe ? ` · would be ${info.wouldBe}` : ""}`
			: `${genderWord} · ${info.age} ${info.age === 1 ? "year" : "years"} old`
		: genderWord;
	const dates = [person.birth ? `★ ${formatShort(person.birth)}` : null, person.death ? `† ${formatShort(person.death)}` : null].filter(Boolean).join("   ");
	const next = upcomingEvents([person], today, 60)[0];
	const groups = sheetGroups(graph, personId);

	const confirmRemovePerson = () => {
		Alert.alert(`Remove ${person.name}?`, "Their relationships are removed too. This cannot be undone.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Remove",
				style: "destructive",
				onPress: async () => {
					try {
						await removeNode(person.id, full.tree.id);
						haptics.success();
						toast(`${person.name} removed from the tree`, "success");
						onClose();
					} catch (e) {
						haptics.error();
						toast(`Couldn't remove ${person.name}. ${errorMessage(e)}`, "error");
					}
				},
			},
		]);
	};

	const rowMenu = (row: SheetRow) => {
		if (!owner || !canWrite) return;
		haptics.longPress();
		Alert.alert(`${row.person.name}`, `${row.role}`, [
			{ text: "Open", onPress: () => onSelect(row.person.id) },
			{
				text: "Remove relationship",
				style: "destructive",
				onPress: async () => {
					try {
						await removeRelationship(row.edge.id, full.tree.id);
						toast("Relationship removed", "success");
					} catch (e) {
						toast(errorMessage(e), "error");
					}
				},
			},
			{ text: "Cancel", style: "cancel" },
		]);
	};

	const isMe = me?.id === person.id;
	return (
		<View style={{ gap: 16, paddingBottom: 24 }}>
			<View style={styles.head}>
				<Avatar name={person.name} gender={person.gender} size={collapsed ? 64 : 72} uri={pictures[person.id]} deceased={!!person.death} />
				<View style={{ flex: 1, gap: 3 }}>
					<Text variant="sheetTitle" accessibilityRole="header">
						{person.name}
					</Text>
					<Text size={14} color={t.c.ink2}>
						{ageLine}
						{isMe ? " · you" : ""}
					</Text>
					{dates ? (
						<Text size={14} color={t.c.ink2}>
							{dates}
						</Text>
					) : null}
				</View>
				<IconButton label="Close" variant="soft" size={36} onPress={onClose} icon={<X size={14} color={t.c.ink3} strokeWidth={2.5} />} />
			</View>

			<View style={styles.actions}>
				<Button flex size="sm" label={focusLabel} icon={<Focus size={16} color={t.c.onPrimary} strokeWidth={2} />} onPress={() => onFocus(person.id)} />
				{!isMe ? (
					<Button
						flex
						size="sm"
						kind="ghost"
						label="How are we related?"
						onPress={() => router.push({ pathname: "/person/[id]/path", params: { id: person.id } })}
					/>
				) : null}
			</View>

			{next ? (
				<View style={[styles.notice, { backgroundColor: t.c.accentSoft }]}>
					<CalendarDays size={18} color={t.c.accent} strokeWidth={1.75} />
					<Text size={13} style={{ flex: 1 }}>
						{next.kind === "birthday" ? `Turns ${next.years}` : "Remembrance day"} {inDays(next.daysUntil)} · {next.date.day}{" "}
						{["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][next.date.month - 1]}
					</Text>
					{!remindersOn ? (
						<Pressable onPress={() => enableReminders()} hitSlop={10} accessibilityRole="button">
							<Text size={13} weight={700} color={t.c.accent}>
								Remind me
							</Text>
						</Pressable>
					) : null}
				</View>
			) : null}

			{groups.length === 0 ? (
				<Text variant="caption">{owner ? "No relationships yet. Add one to connect them to the tree." : "No relationships yet."}</Text>
			) : (
				(collapsed ? groups.slice(0, 1) : groups).map((g) => (
					<View key={g.group} style={{ gap: 2 }}>
						<Text size={12} weight={700} color={groupColor(t, g.group)} style={styles.groupLabel}>
							{groupGlyph(g.group)} {groupLabel(g.group)}
						</Text>
						{(collapsed ? g.rows.slice(0, 1) : g.rows).map((row) => (
							<View key={row.edge.id} style={{ marginHorizontal: -14, borderBottomWidth: collapsed ? 0 : 1, borderBottomColor: t.c.border }}>
								<PersonRow
									compact
									person={row.person}
									today={today}
									uri={pictures[row.person.id]}
									subtitle={
										row.person.birth ? `${row.role} · ${row.person.birth.year}${row.person.death ? ` – †${row.person.death.year}` : ""}` : row.role
									}
									onPress={() => onSelect(row.person.id)}
									onLongPress={owner ? () => rowMenu(row) : undefined}
								/>
							</View>
						))}
					</View>
				))
			)}

			{collapsed ? (
				<Text variant="small" center>
					Drag up for all relationships
				</Text>
			) : owner ? (
				<View style={{ gap: 10 }}>
				<OfflineWriteHint />
				<View style={styles.actions}>
					<Button flex kind="ghost" size="md" label="Edit" disabled={!canWrite} onPress={() => router.push({ pathname: "/add-person", params: { id: person.id } })} />
					<Button flex kind="ghost" size="md" label="Add relationship" disabled={!canWrite} onPress={() => router.push({ pathname: "/add-relationship", params: { from: person.id } })} />
					<IconButton label={`Remove ${person.name}`} variant="plain" size={48} onPress={canWrite ? confirmRemovePerson : undefined} icon={<Trash size={18} color={t.c.danger} strokeWidth={1.75} />} style={{ borderWidth: 1, borderColor: t.c.border, borderRadius: 12, opacity: canWrite ? 1 : 0.45 }} />
				</View>
				</View>
			) : (
				<View style={[styles.notice, { backgroundColor: t.c.surface2 }]}>
					<Lock size={18} color={t.c.ink2} strokeWidth={1.75} />
					<Text size={13} color={t.c.ink2} style={{ flex: 1 }}>
						Shared with you{ownerEmail ? ` by ${ownerEmail}` : ""}. Only the owner can edit.
					</Text>
				</View>
			)}
		</View>
	);
}

function groupColor(t: ReturnType<typeof useTheme>, group: string): string {
	return group === "BIOLOGICAL" ? t.c.bio : group === "IN-LAW" ? t.c.inlaw : group === "CHURCH" ? t.c.church : t.c.other;
}

const styles = StyleSheet.create({
	head: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
	actions: { flexDirection: "row", gap: 8 },
	notice: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
	groupLabel: { textTransform: "uppercase", letterSpacing: 0.72, paddingBottom: 4 },
});
