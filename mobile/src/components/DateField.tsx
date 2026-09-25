import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatLong, fromJsDate, toJsDate } from "../lib/dates";
import type { CalendarDate } from "../lib/types";
import { useTheme } from "../theme/useTheme";
import { Button } from "./Button";
import { Text } from "./Text";
import { useT } from "../i18n";

/**
 * A pressable row that opens the native date picker: a spinner sheet on iOS,
 * the calendar dialog on Android.
 */
export function DateField({
	label,
	value,
	onChange,
	placeholder,
	error,
	minimumDate,
	maximumDate = new Date(),
}: {
	label: string;
	value: CalendarDate | null;
	onChange: (d: CalendarDate) => void;
	placeholder?: string;
	error?: string | null;
	minimumDate?: Date;
	maximumDate?: Date;
}) {
	const t = useTheme();
	const insets = useSafeAreaInsets();
	const [open, setOpen] = useState(false);
	const T = useT();
	const ph = placeholder ?? T.common.chooseDate;
	const [draft, setDraft] = useState<Date>(value ? toJsDate(value, 12) : new Date(1980, 0, 1, 12));

	const openPicker = () => {
		const initial = value ? toJsDate(value, 12) : new Date(1980, 0, 1, 12);
		if (Platform.OS === "android") {
			DateTimePickerAndroid.open({
				value: initial,
				mode: "date",
				minimumDate,
				maximumDate,
				onChange: (e: DateTimePickerEvent, d?: Date) => {
					if (e.type === "set" && d) onChange(fromJsDate(d));
				},
			});
		} else {
			setDraft(initial);
			setOpen(true);
		}
	};

	return (
		<View style={{ gap: 6 }}>
			<Text variant="label">{label}</Text>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={T.common.dateA11y(label, value ? formatLong(value, T) : ph)}
				onPress={openPicker}
				style={({ pressed }) => [
					styles.row,
					{ borderColor: error ? t.c.danger : t.c.border, borderWidth: error ? 1.5 : 1, backgroundColor: pressed ? t.c.surface2 : t.c.bg },
				]}
			>
				<Text size={16} color={value ? t.c.ink : t.c.placeholder}>
					{value ? formatLong(value, T) : ph}
				</Text>
				<View style={[styles.change, { backgroundColor: t.c.surface2 }]}>
					<Text size={14} weight={600}>
						{T.common.change}
					</Text>
				</View>
			</Pressable>
			{error ? (
				<Text size={13} color={t.c.danger}>
					{error}
				</Text>
			) : null}
			{Platform.OS === "ios" ? (
				<Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
					<Pressable style={[styles.scrim, { backgroundColor: t.c.overlay }]} onPress={() => setOpen(false)} accessibilityLabel={T.common.closeDatePicker} />
					<View style={[styles.sheet, { backgroundColor: t.c.surface, paddingBottom: insets.bottom + 12 }, t.shadow("lg")]}>
						<View style={styles.sheetHeader}>
							<Button kind="text" label={T.common.cancel} onPress={() => setOpen(false)} />
							<Text variant="serif">{label}</Text>
							<Button
								kind="text"
								label={T.common.done}
								onPress={() => {
									onChange(fromJsDate(draft));
									setOpen(false);
								}}
							/>
						</View>
						<DateTimePicker
							value={draft}
							mode="date"
							display="spinner"
							minimumDate={minimumDate}
							maximumDate={maximumDate}
							themeVariant={t.scheme}
							locale={T.locale}
							accentColor={t.c.accent}
							textColor={t.c.ink}
							onChange={(_e, d) => d && setDraft(d)}
						/>
					</View>
				</Modal>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	row: { height: 50, borderRadius: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	change: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
	scrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
	sheet: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8 },
	sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
});
