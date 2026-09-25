import { Check, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { yearsLabel } from "../lib/format";
import { searchPersons } from "../lib/search";
import type { CalendarDate, Person } from "../lib/types";
import { useTheme } from "../theme/useTheme";
import { Avatar } from "./Avatar";
import { Row } from "./List";
import { Text } from "./Text";
import { TextField } from "./TextField";
import { useT } from "../i18n";

/** Search field with a short result list; selection is highlighted in copper. */
export function PersonPicker({
	persons,
	value,
	onChange,
	today,
	pictures,
	exclude,
	placeholder,
	inSheet,
	limit = 6,
	label,
}: {
	persons: Person[];
	value: string | null;
	onChange: (id: string) => void;
	today: CalendarDate;
	pictures?: Record<string, string>;
	exclude?: string[];
	placeholder?: string;
	inSheet?: boolean;
	limit?: number;
	label?: string;
}) {
	const t = useTheme();
	const T = useT();
	const [q, setQ] = useState("");
	const pool = useMemo(() => persons.filter((p) => !exclude?.includes(p.id)), [persons, exclude]);
	const results = useMemo(() => {
		if (q.trim()) return searchPersons(pool, q, limit).map((m) => m.person);
		const sel = pool.find((p) => p.id === value);
		const rest = [...pool].sort((a, b) => a.name.localeCompare(b.name)).filter((p) => p.id !== value);
		return (sel ? [sel, ...rest] : rest).slice(0, limit);
	}, [pool, q, value, limit]);
	return (
		<View style={{ gap: 8 }}>
			<TextField
				label={label}
				inSheet={inSheet}
				value={q}
				onChangeText={setQ}
				placeholder={placeholder ?? T.common.searchByName}
				autoCorrect={false}
				autoCapitalize="words"
				returnKeyType="search"
				leading={<Search size={18} color={t.c.ink3} strokeWidth={1.75} />}
			/>
			<View style={{ borderWidth: 1, borderColor: t.c.border, borderRadius: 12, overflow: "hidden" }}>
				{results.length === 0 ? (
					<View style={{ padding: 14 }}>
						<Text variant="caption">{pool.length ? T.common.noOneCalled(q.trim()) : T.common.noOneToChoose}</Text>
					</View>
				) : (
					results.map((p, i) => {
						const on = p.id === value;
						return (
							<Row
								key={p.id}
								minHeight={48}
								onPress={() => onChange(p.id)}
								highlighted={on}
								accessibilityLabel={`${p.name}${on ? `, ${T.common.selected}` : ""}`}
								style={i > 0 ? { borderTopWidth: 1, borderTopColor: t.c.border } : undefined}
								leading={<Avatar name={p.name} gender={p.gender} size={32} uri={pictures?.[p.id]} deceased={!!p.death} />}
								title={p.name}
								subtitle={yearsLabel(p, today)}
								trailing={on ? <Check size={18} color={t.c.accent} strokeWidth={2.5} /> : null}
							/>
						);
					})
				)}
			</View>
		</View>
	);
}
