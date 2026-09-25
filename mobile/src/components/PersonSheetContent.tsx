import { useRouter } from "expo-router";
import { CalendarDays, Focus, Lock, Trash } from "lucide-react-native";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useEnableReminders } from "../hooks/useReminders";
import { useCanWrite, useGraph, useIsOwner, useMe, usePictures, useToday } from "../hooks/useTreeData";
import { ageInfo, formatDayMonth, formatShort } from "../lib/dates";
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
import { useT } from "../i18n";
import { useAccountEmail } from "../hooks/useAccounts";
import { useSession } from "../store/session";
import { Badge } from "./Chip";

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
	focusLabel,
	onRelate,
}: {
	personId: string;
	onClose: () => void;
	onSelect: (id: string) => void;
	onFocus: (id: string) => void;
	collapsed?: boolean;
	focusLabel?: string;
	/** Tablets: show "How are we related" in the side panel instead of a new screen. */
	onRelate?: (id: string) => void;
}) {
	const t = useTheme();
	const T = useT();
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
	const myUserId = useSession((s) => s.user?.id);
	const linkedEmail = useAccountEmail(graph?.byId[personId]?.userId);

	const person = graph?.byId[personId];
	if (!graph || !person || !full) {
		return (
			<View style={{ padding: 20, gap: 12 }}>
				<Text variant="bodyLg">{T.person.gone}</Text>
				<Button kind="secondary" label={T.common.close} onPress={onClose} />
			</View>
		);
	}

	const info = ageInfo(person.birth, person.death, today);
	const genderWord = person.gender === "male" ? T.common.male : T.common.female;
	const ageLine = info ? (info.deceased ? T.person.ageDeceased(genderWord, info.age, info.wouldBe) : T.person.ageAlive(genderWord, info.age)) : genderWord;
	const dates = [person.birth ? `★ ${formatShort(person.birth, T)}` : null, person.death ? `† ${formatShort(person.death, T)}` : null].filter(Boolean).join("   ");
	const next = upcomingEvents([person], today, 60)[0];
	const groups = sheetGroups(graph, personId, graph.edges, T);

	const confirmRemovePerson = () => {
		Alert.alert(T.tree.removeTitle(person.name), T.tree.removeBody, [
			{ text: T.common.cancel, style: "cancel" },
			{
				text: T.common.remove,
				style: "destructive",
				onPress: async () => {
					try {
						await removeNode(person.id, full.tree.id);
						haptics.success();
						toast(T.person.removedFromTree(person.name), "success");
						onClose();
					} catch (e) {
						haptics.error();
						toast(T.person.couldntRemove(person.name, errorMessage(e, T)), "error");
					}
				},
			},
		]);
	};

	const rowMenu = (row: SheetRow) => {
		if (!owner || !canWrite) return;
		haptics.longPress();
		Alert.alert(`${row.person.name}`, `${row.role}`, [
			{ text: T.person.open, onPress: () => onSelect(row.person.id) },
			{
				text: T.person.removeRelationship,
				style: "destructive",
				onPress: async () => {
					try {
						await removeRelationship(row.edge.id, full.tree.id);
						toast(T.person.relationshipRemoved, "success");
					} catch (e) {
						toast(errorMessage(e), "error");
					}
				},
			},
			{ text: T.common.cancel, style: "cancel" },
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
						{isMe ? ` · ${T.person.you}` : ""}
					</Text>
					{dates ? (
						<Text size={14} color={t.c.ink2}>
							{dates}
						</Text>
					) : null}
					{person.userId ? (
						<View style={{ paddingTop: 4 }}>
							<Badge
								tone={person.userId === myUserId ? "accent" : "primary"}
								label={person.userId === myUserId ? T.person.thisIsYou : linkedEmail ? T.person.linkedTo(linkedEmail) : T.person.linkedToAccount}
							/>
						</View>
					) : null}
				</View>
				<IconButton label={T.common.close} variant="soft" size={36} onPress={onClose} icon={<X size={14} color={t.c.ink3} strokeWidth={2.5} />} />
			</View>

			<View style={styles.actions}>
				<Button flex size="sm" label={focusLabel ?? T.person.focus} icon={<Focus size={16} color={t.c.onPrimary} strokeWidth={2} />} onPress={() => onFocus(person.id)} />
				{!isMe ? (
					<Button
						flex
						size="sm"
						kind="ghost"
						label={T.person.howRelated}
						onPress={() => (onRelate ? onRelate(person.id) : router.push({ pathname: "/person/[id]/path", params: { id: person.id } }))}
					/>
				) : null}
			</View>

			{person.note ? (
				<View style={{ gap: 4 }}>
					<Text variant="overline">{T.person.note}</Text>
					<Text size={15} style={{ lineHeight: 22 }} selectable>
						{person.note}
					</Text>
				</View>
			) : null}

			{next ? (
				<View style={[styles.notice, { backgroundColor: t.c.accentSoft }]}>
					<CalendarDays size={18} color={t.c.accent} strokeWidth={1.75} />
					<Text size={13} style={{ flex: 1 }}>
						{next.kind === "birthday" ? T.person.turns(next.years) : T.person.remembranceDay} {inDays(next.daysUntil, T)} · {formatDayMonth(next.date, T)}
					</Text>
					{!remindersOn ? (
						<Pressable onPress={() => enableReminders()} hitSlop={10} accessibilityRole="button">
							<Text size={13} weight={700} color={t.c.accent}>
								{T.person.remindMe}
							</Text>
						</Pressable>
					) : null}
				</View>
			) : null}

			{groups.length === 0 ? (
				<Text variant="caption">{owner ? T.person.noRelationshipsOwner : T.person.noRelationships}</Text>
			) : (
				(collapsed ? groups.slice(0, 1) : groups).map((g) => (
					<View key={g.group} style={{ gap: 2 }}>
						<Text size={12} weight={700} color={groupColor(t, g.group)} style={styles.groupLabel}>
							{groupGlyph(g.group)} {groupLabel(g.group, T)}
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
					{T.person.dragUp}
				</Text>
			) : owner ? (
				<View style={{ gap: 10 }}>
				<OfflineWriteHint />
				<View style={styles.actions}>
					<Button flex kind="ghost" size="md" label={T.common.edit} disabled={!canWrite} onPress={() => router.push({ pathname: "/add-person", params: { id: person.id } })} />
					<Button flex kind="ghost" size="md" label={T.tree.addRelationship} disabled={!canWrite} onPress={() => router.push({ pathname: "/add-relationship", params: { from: person.id } })} />
					<IconButton label={T.person.removeA11y(person.name)} variant="plain" size={48} onPress={canWrite ? confirmRemovePerson : undefined} icon={<Trash size={18} color={t.c.danger} strokeWidth={1.75} />} style={{ borderWidth: 1, borderColor: t.c.border, borderRadius: 12, opacity: canWrite ? 1 : 0.45 }} />
				</View>
				</View>
			) : (
				<View style={[styles.notice, { backgroundColor: t.c.surface2 }]}>
					<Lock size={18} color={t.c.ink2} strokeWidth={1.75} />
					<Text size={13} color={t.c.ink2} style={{ flex: 1 }}>
						{T.person.sharedBy(ownerEmail)}
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
