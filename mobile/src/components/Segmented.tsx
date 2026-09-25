import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { Text } from "./Text";

/** 44 pt track, 38 pt thumb. */
export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
	const t = useTheme();
	return (
		<View accessibilityRole="tablist" style={[styles.track, { backgroundColor: t.c.surface2 }]}>
			{options.map((o) => {
				const on = o.value === value;
				return (
					<Pressable
						key={o.value}
						accessibilityRole="tab"
						accessibilityState={{ selected: on }}
						onPress={() => onChange(o.value)}
						style={[styles.seg, on && [{ backgroundColor: t.c.surface }, t.shadow("sm")]]}
					>
						<Text size={14} weight={600} color={on ? t.c.ink : t.c.ink2}>
							{o.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

/** Pill filter tabs ("All", "Birthdays", ...): ink when on. */
export function PillTabs<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
	const t = useTheme();
	return (
		<View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
			{options.map((o) => {
				const on = o.value === value;
				return (
					<Pressable
						key={o.value}
						accessibilityRole="tab"
						accessibilityState={{ selected: on }}
						onPress={() => onChange(o.value)}
						style={[styles.pill, on ? { backgroundColor: t.c.ink } : { borderWidth: 1, borderColor: t.c.border }]}
					>
						<Text size={13} weight={600} color={on ? t.c.bg : t.c.ink}>
							{o.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	track: { flexDirection: "row", padding: 3, gap: 3, borderRadius: 12, height: 44 },
	seg: { flex: 1, height: 38, borderRadius: 9, alignItems: "center", justifyContent: "center" },
	pill: { height: 34, paddingHorizontal: 14, borderRadius: 999, alignItems: "center", justifyContent: "center" },
});
