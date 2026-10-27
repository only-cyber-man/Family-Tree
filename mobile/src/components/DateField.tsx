import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { clampDate, EARLIEST_DATE, formatLong, fromJsDate, occurrenceInYear, parseYear, todayDate, toJsDate } from "../lib/dates";
import { fromAndroidPickerDate, toAndroidPickerDate } from "../lib/julian";
import type { CalendarDate } from "../lib/types";
import { fonts } from "../theme/theme";
import { useTheme } from "../theme/useTheme";
import { Button } from "./Button";
import { Text } from "./Text";
import { useT } from "../i18n";

/** Where the picker starts while no date is chosen. */
const DEFAULT_DRAFT: CalendarDate = { year: 1980, month: 1, day: 1 };

/**
 * A pressable row that opens the native date picker: a spinner sheet on iOS,
 * the calendar dialog on Android. Any day from year 1 can be picked, since
 * family trees reach centuries back: a new date opens the Android dialog on
 * its year grid, and the iOS sheet has a field that jumps to a typed year.
 */
export function DateField({
	label,
	value,
	onChange,
	placeholder,
	error,
	minimumDate = EARLIEST_DATE,
	maximumDate,
}: {
	label: string;
	value: CalendarDate | null;
	onChange: (d: CalendarDate) => void;
	placeholder?: string;
	error?: string | null;
	minimumDate?: CalendarDate;
	/** Defaults to today. */
	maximumDate?: CalendarDate;
}) {
	const t = useTheme();
	const insets = useSafeAreaInsets();
	const [open, setOpen] = useState(false);
	const T = useT();
	const ph = placeholder ?? T.common.chooseDate;
	const max = maximumDate ?? todayDate();
	const [draft, setDraft] = useState<CalendarDate>(value ?? DEFAULT_DRAFT);
	const [yearText, setYearText] = useState("");

	const pick = (d: CalendarDate) => onChange(clampDate(d, minimumDate, max));

	const openPicker = () => {
		const initial = clampDate(value ?? DEFAULT_DRAFT, minimumDate, max);
		if (Platform.OS === "android") {
			DateTimePickerAndroid.open({
				// The dialog labels days before 1582 in the Julian calendar (see lib/julian.ts).
				value: toAndroidPickerDate(initial),
				mode: "date",
				minimumDate: toAndroidPickerDate(minimumDate),
				maximumDate: toAndroidPickerDate(max),
				// The year is the first thing to choose for a new date, and 1750 is then as close as 1980.
				startOnYearSelection: !value,
				onChange: (e: DateTimePickerEvent, d?: Date) => {
					if (e.type === "set" && d) pick(fromAndroidPickerDate(d));
				},
			});
		} else {
			setDraft(initial);
			setYearText(String(initial.year));
			setOpen(true);
		}
	};

	/** The draft moved to the typed year, when that is a year the field allows. */
	const withTypedYear = (text: string, d: CalendarDate): CalendarDate => {
		const year = parseYear(text, minimumDate.year, max.year);
		return year === null ? d : clampDate(occurrenceInYear(d, year), minimumDate, max);
	};
	const jumpToYear = (text: string) => setDraft((d) => withTypedYear(text, d));
	// A complete year the field cannot use (2099, 0000) is shown as an error; a partial one is just being typed.
	const yearRejected = yearText.length === 4 && parseYear(yearText, minimumDate.year, max.year) === null;

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
					{/* Padding lifts the sheet above the keyboard while a year is typed. */}
					<KeyboardAvoidingView behavior="padding" style={styles.modal}>
						<Pressable style={[styles.scrim, { backgroundColor: t.c.overlay }]} onPress={() => setOpen(false)} accessibilityLabel={T.common.closeDatePicker} />
						<View style={[styles.sheet, { backgroundColor: t.c.surface, paddingBottom: insets.bottom + 12 }, t.shadow("lg")]}>
							<View style={styles.sheetHeader}>
								<Button kind="text" label={T.common.cancel} onPress={() => setOpen(false)} />
								<Text variant="serif">{label}</Text>
								<Button
									kind="text"
									label={T.common.done}
									onPress={() => {
										// A year still in the field counts, even before the keyboard is dismissed.
										pick(withTypedYear(yearText, draft));
										setOpen(false);
									}}
								/>
							</View>
							<View style={styles.yearRow}>
								<Text variant="label">{T.common.year}</Text>
								<TextInput
									value={yearText}
									onChangeText={(v) => {
										setYearText(v);
										if (v.length === 4) jumpToYear(v);
									}}
									onEndEditing={() => jumpToYear(yearText)}
									keyboardType="number-pad"
									maxLength={4}
									accessibilityLabel={T.common.year}
									accessibilityHint={T.common.yearHint}
									placeholder={T.common.yearExample}
									placeholderTextColor={t.c.placeholder}
									maxFontSizeMultiplier={1.35}
									style={[
										styles.yearInput,
										{ borderColor: yearRejected ? t.c.danger : t.c.border, borderWidth: yearRejected ? 1.5 : 1, backgroundColor: t.c.bg, color: t.c.ink, fontFamily: fonts.body[400] },
									]}
								/>
							</View>
							<DateTimePicker
								value={toJsDate(draft, 12)}
								mode="date"
								display="spinner"
								// The iOS spinner keeps its intrinsic width; without this it sits at the left edge.
								style={styles.picker}
								minimumDate={toJsDate(minimumDate)}
								maximumDate={toJsDate(max, 23, 59)}
								themeVariant={t.scheme}
								locale={T.locale}
								accentColor={t.c.accent}
								textColor={t.c.ink}
								onChange={(_e, d) => {
									if (!d) return;
									const picked = fromJsDate(d);
									setDraft(picked);
									setYearText(String(picked.year));
								}}
							/>
						</View>
					</KeyboardAvoidingView>
				</Modal>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	row: { height: 50, borderRadius: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	change: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
	modal: { flex: 1, justifyContent: "flex-end" },
	scrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
	sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8 },
	sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
	yearRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingHorizontal: 20, paddingVertical: 6 },
	yearInput: { width: 108, height: 44, borderRadius: 12, paddingHorizontal: 12, fontSize: 16, textAlign: "center" },
	picker: { alignSelf: "center" },
});
