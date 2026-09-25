import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Button } from "../src/components/Button";
import { Chip } from "../src/components/Chip";
import { RangeSlider } from "../src/components/RangeSlider";
import { Segmented } from "../src/components/Segmented";
import { RouteSheet } from "../src/components/Sheet";
import { Text } from "../src/components/Text";
import { TextField } from "../src/components/TextField";
import { useGraph, useToday } from "../src/hooks/useTreeData";
import { AGE_MAX, applyFilters, DEFAULT_FILTERS, type Filters } from "../src/lib/filters";
import { GROUP_ORDER, groupGlyph, humanizeName } from "../src/lib/relations";
import type { Gender } from "../src/lib/types";
import { useTree } from "../src/store/tree";
import { tokens } from "../src/theme/tokens";
import { useTheme } from "../src/theme/useTheme";

/** Same filters as the web: hide relationship types, age range, gender, exclude names. */
export default function FiltersSheet() {
	const t = useTheme();
	const router = useRouter();
	const current = useTree((s) => s.filters);
	const setFilters = useTree((s) => s.setFilters);
	const full = useTree((s) => s.full);
	const graph = useGraph();
	const today = useToday();
	const [draft, setDraft] = useState<Filters>(current);
	const shown = useMemo(() => (graph ? applyFilters(graph.persons, graph.edges, draft, today).persons.length : 0), [graph, draft, today]);
	const types = useMemo(
		() => [...(full?.relationshipNames ?? [])].sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.name.localeCompare(b.name)),
		[full],
	);
	const glyphColor = (g: string) => (g === "BIOLOGICAL" ? t.c.bio : g === "IN-LAW" ? t.c.inlaw : g === "CHURCH" ? t.c.church : t.c.other);

	const apply = () => {
		setFilters(draft);
		router.back();
	};

	return (
		<RouteSheet
			snapPoints={tokens.mobile.sheetSnapPoints.filters as unknown as string[]}
			header={
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 }}>
					<Text variant="heading" accessibilityRole="header">
						Filters
					</Text>
					<Pressable onPress={() => setDraft(DEFAULT_FILTERS)} hitSlop={10} accessibilityRole="button">
						<Text size={15} weight={700} color={t.c.accent}>
							Clear all
						</Text>
					</Pressable>
				</View>
			}
			footer={
				<View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: t.c.border }}>
					<Button label={`Show ${shown} of ${graph?.persons.length ?? 0} people`} onPress={apply} />
				</View>
			}
		>
			<View style={{ gap: 10 }}>
				<Text size={13} weight={700}>
					Hide relationship types
				</Text>
				<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
					{types.map((rt) => {
						const hidden = draft.hiddenRelationshipNames.includes(rt.name);
						return (
							<Chip
								key={rt.id}
								hidden={hidden}
								glyph={groupGlyph(rt.group)}
								glyphColor={glyphColor(rt.group)}
								label={humanizeName(rt.name)}
								accessibilityLabel={`${humanizeName(rt.name)}, ${hidden ? "hidden" : "shown"}`}
								onPress={() =>
									setDraft((d) => ({
										...d,
										hiddenRelationshipNames: hidden ? d.hiddenRelationshipNames.filter((n) => n !== rt.name) : [...d.hiddenRelationshipNames, rt.name],
									}))
								}
							/>
						);
					})}
				</View>
			</View>
			<View style={{ gap: 10 }}>
				<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
					<Text size={13} weight={700}>
						Age
					</Text>
					<Text size={13} weight={600} color={t.c.ink2}>
						{draft.minAge} – {draft.maxAge >= AGE_MAX ? `${AGE_MAX}+` : draft.maxAge}
					</Text>
				</View>
				<RangeSlider min={0} max={AGE_MAX} low={draft.minAge} high={draft.maxAge} onChange={(lo, hi) => setDraft((d) => ({ ...d, minAge: lo, maxAge: hi }))} accessibilityLabel="Age range" />
			</View>
			<View style={{ gap: 10 }}>
				<Text size={13} weight={700}>
					Gender
				</Text>
				<Segmented<Gender | "both">
					value={draft.gender}
					onChange={(gender) => setDraft((d) => ({ ...d, gender }))}
					options={[
						{ value: "both", label: "Everyone" },
						{ value: "male", label: "Men" },
						{ value: "female", label: "Women" },
					]}
				/>
			</View>
			<TextField
				inSheet
				label="Exclude by name"
				hint="Separate several names with commas."
				value={draft.excludeNames}
				onChangeText={(excludeNames) => setDraft((d) => ({ ...d, excludeNames }))}
				placeholder="Nowak, Roman"
				autoCorrect={false}
			/>
		</RouteSheet>
	);
}
