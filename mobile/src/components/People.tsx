import { Bell, ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { dayOfWeek } from "../lib/dates";
import { yearsLabel } from "../lib/format";
import type { CalendarDate, Person } from "../lib/types";
import { eventSubtitle, eventTitle, type DateEvent } from "../lib/upcoming";
import { useTheme } from "../theme/useTheme";
import { Avatar } from "./Avatar";
import { Row } from "./List";
import { Text } from "./Text";
import { useT } from "../i18n";

export function PersonRow({
	person,
	today,
	subtitle,
	uri,
	onPress,
	onLongPress,
	highlight,
	selected,
	trailing,
	compact,
}: {
	person: Person;
	today: CalendarDate;
	subtitle?: string;
	uri?: string;
	onPress?: () => void;
	onLongPress?: () => void;
	/** [start, end) of the name to mark. */
	highlight?: [number, number];
	selected?: boolean;
	trailing?: React.ReactNode;
	compact?: boolean;
}) {
	const t = useTheme();
	const name = highlight ? (
		<Text size={16} weight={600} numberOfLines={1}>
			{person.name.slice(0, highlight[0])}
			<Text size={16} weight={600} style={{ backgroundColor: t.c.accentSoft }}>
				{person.name.slice(highlight[0], highlight[1])}
			</Text>
			{person.name.slice(highlight[1])}
		</Text>
	) : (
		<Text size={15} weight={600} numberOfLines={1}>
			{person.name}
		</Text>
	);
	return (
		<Row
			minHeight={compact ? 48 : 60}
			onPress={onPress}
			onLongPress={onLongPress}
			highlighted={selected}
			accessibilityLabel={`${person.name}, ${subtitle ?? yearsLabel(person, today)}`}
			leading={<Avatar name={person.name} gender={person.gender} size={compact ? 32 : 40} uri={uri} deceased={!!person.death} />}
			title={name}
			subtitle={subtitle ?? yearsLabel(person, today)}
			trailing={trailing}
			chevron={!!onPress && !trailing}
		/>
	);
}

/** Day-of-week over the day number, coloured by kind. */
export function DateBlock({ date, kind }: { date: CalendarDate; kind: DateEvent["kind"] }) {
	const t = useTheme();
	const T = useT();
	return (
		<View style={{ width: 44, alignItems: "center" }}>
			<Text size={11} weight={700} color={kind === "birthday" ? t.c.accent : t.c.church} style={{ textTransform: "uppercase" }} allowFontScaling={false}>
				{T.dateNames.weekdaysShort[dayOfWeek(date)]}
			</Text>
			<Text serif size={22} weight={600} style={{ lineHeight: 25 }} allowFontScaling={false}>
				{date.day}
			</Text>
		</View>
	);
}

/** Upcoming card (Home) or grouped row (Dates, with a bell). */
export function EventRow({
	event,
	person,
	uri,
	onPress,
	bell,
	card,
	highlighted,
}: {
	event: DateEvent;
	person?: Person;
	uri?: string;
	onPress?: () => void;
	/** Reminder state: undefined hides the bell. */
	bell?: boolean;
	card?: boolean;
	/** Selected in a master–detail list. */
	highlighted?: boolean;
}) {
	const t = useTheme();
	const T = useT();
	const content = (
		<>
			<DateBlock date={event.date} kind={event.kind} />
			{card ? <View style={{ width: 1, height: 36, backgroundColor: t.c.border }} /> : null}
			<Avatar name={event.name} gender={event.gender} size={36} uri={uri} deceased={!!person?.death} />
			<View style={{ flex: 1, minWidth: 0, gap: 2 }}>
				<Text size={15} weight={600} numberOfLines={1}>
					{eventTitle(event, T)}
				</Text>
				<Text variant="caption" numberOfLines={1}>
					{eventSubtitle(event, T)}
				</Text>
			</View>
			{bell === undefined ? (
				<ChevronRight size={16} color={t.c.ink3} strokeWidth={2} />
			) : (
				<Bell size={20} color={bell ? t.c.primary : t.c.borderStrong} strokeWidth={1.75} accessibilityLabel={bell ? T.common.reminderScheduled : T.common.noReminder} />
			)}
		</>
	);
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${eventTitle(event, T)}, ${eventSubtitle(event, T)}`}
			onPress={onPress}
			android_ripple={{ color: t.c.ripple }}
			style={({ pressed }) => [
				styles.event,
				card ? { backgroundColor: pressed ? t.c.surface2 : t.c.surface, borderRadius: 14, borderWidth: 1, borderColor: t.c.border } : { minHeight: 64, backgroundColor: highlighted ? t.c.accentSoft : pressed ? t.c.surface2 : "transparent" },
			]}
		>
			{content}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	event: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
});
