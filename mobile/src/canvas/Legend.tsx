import { StyleSheet, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import { Text } from "../components/Text";
import { edgeStyle } from "../lib/edges";
import { emphasisFor } from "../lib/relations";
import type { Edge, RelationshipGroup } from "../lib/types";
import { useTheme } from "../theme/useTheme";
import { useT } from "../i18n";

interface Entry {
	key: string;
	label: string;
	group: RelationshipGroup;
	name: string;
}

/** Line samples for the relationship kinds actually on screen (max 4). */
export function Legend({ edges, showYou }: { edges: Edge[]; showYou?: boolean }) {
	const t = useTheme();
	const T = useT();
	const entries: Entry[] = [];
	const seen = new Set<string>();
	const add = (key: string, label: string, e: Edge) => {
		if (seen.has(key)) return;
		seen.add(key);
		entries.push({ key, label, group: e.group, name: e.name });
	};
	for (const e of edges) {
		const emph = emphasisFor(e.name);
		if (e.group === "BIOLOGICAL") add("bio", T.tree.legendBio, e);
		else if (e.group === "IN-LAW" && emph === "strong") add("married", T.tree.legendMarried, e);
		else if (e.group === "IN-LAW" && emph === "weak") add("weak", T.tree.legendLivesWith, e);
		else if (e.group === "IN-LAW") add("inlaw", T.tree.legendInLaw, e);
		else if (e.group === "CHURCH") add("church", T.tree.legendChurch, e);
		else add("other", T.tree.legendOther, e);
	}
	if (!entries.length && !showYou) return null;
	return (
		<View style={[styles.box, { backgroundColor: t.c.surface, borderColor: t.c.border }, t.shadow("md")]} accessibilityLabel={`${T.tree.legend}: ${entries.map((e) => e.label).join(", ")}`}>
			{showYou ? (
				<View style={styles.item}>
					<View style={{ width: 14, height: 10, borderRadius: 3, borderWidth: 2, borderColor: t.c.primary }} />
					<Text size={11} weight={600} allowFontScaling={false}>
						{T.tree.legendYou}
					</Text>
				</View>
			) : null}
			{entries.slice(0, showYou ? 3 : 4).map((e) => {
				const st = edgeStyle({ group: e.group, name: e.name, bidirectional: true }, t.scheme, "full", false);
				return (
					<View key={e.key} style={styles.item}>
						<Svg width={14} height={6}>
							<Line x1={1} y1={3} x2={13} y2={3} stroke={st.color} strokeWidth={Math.min(st.width, 4)} strokeDasharray={st.dash?.map((d) => d / 2)} strokeLinecap="round" />
						</Svg>
						<Text size={11} weight={600} allowFontScaling={false}>
							{e.label}
						</Text>
					</View>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	box: { flexDirection: "row", gap: 10, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
	item: { flexDirection: "row", alignItems: "center", gap: 5 },
});
