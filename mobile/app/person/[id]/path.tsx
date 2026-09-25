import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "../../../src/components/Avatar";
import { Button } from "../../../src/components/Button";
import { Notice } from "../../../src/components/Feedback";
import { Screen } from "../../../src/components/Screen";
import { Text } from "../../../src/components/Text";
import { useGraph, useMe, usePictures, useToday } from "../../../src/hooks/useTreeData";
import { yearsLabel, firstName, plural } from "../../../src/lib/format";
import { describeKinship, relationshipPath, stepLabel } from "../../../src/lib/path";
import { groupGlyph } from "../../../src/lib/relations";
import { useTheme } from "../../../src/theme/useTheme";

/** How are we related: the relationship in words with the path behind it. */
export default function PathScreen() {
	const t = useTheme();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const graph = useGraph();
	const me = useMe();
	const pictures = usePictures();
	const today = useToday();
	const target = graph?.byId[id];

	const back = (
		<Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
			<ChevronLeft size={20} color={t.c.ink2} strokeWidth={2.25} />
			<Text size={16} weight={600} color={t.c.ink2} numberOfLines={1}>
				{target?.name ?? "Back"}
			</Text>
		</Pressable>
	);

	if (!graph || !target) return <Screen>{back}</Screen>;

	if (!me) {
		return (
			<Screen contentStyle={{ gap: 18 }}>
				{back}
				<Text variant="title">Which one is you?</Text>
				<Text variant="body" color={t.c.ink2}>
					To say how {firstName(target.name)} is related to you, the app needs to know which person in this tree is you. You choose once; it is kept on this phone.
				</Text>
				<Button label="Choose who you are" onPress={() => router.push("/pick-me")} />
			</Screen>
		);
	}

	const path = relationshipPath(graph, me.id, target.id);
	if (!path) {
		return (
			<Screen contentStyle={{ gap: 18 }}>
				{back}
				<Text variant="title">Not connected to you yet</Text>
				<Text variant="body" color={t.c.ink2}>
					There is no chain of relationships between you and {target.name} in this tree. Adding a relationship would connect you.
				</Text>
				<Button kind="secondary" label={`Open ${firstName(target.name)}`} onPress={() => router.push({ pathname: "/person/[id]", params: { id: target.id } })} />
			</Screen>
		);
	}

	const kin = describeKinship(graph, path.steps);
	const people = [me.id, ...path.steps.map((s) => s.to)];
	const groupColor = (g: string) => (g === "BIOLOGICAL" ? t.c.bio : g === "IN-LAW" ? t.c.inlaw : g === "CHURCH" ? t.c.church : t.c.other);
	return (
		<Screen contentStyle={{ gap: 18 }}>
			{back}
			<View style={{ gap: 4 }}>
				<Text variant="title" accessibilityRole="header">
					{kin.title}
				</Text>
				{kin.term && kin.chain !== kin.phrase ? (
					<Text size={15} color={t.c.ink2}>
						{kin.chain.replace(/^your/, "Your")}.
					</Text>
				) : null}
				<Text size={15} color={t.c.ink2}>
					{plural(path.steps.length, "step")} through {plural(Math.max(0, path.steps.length - 1), "person", "people")}.{" "}
					{path.familyOnly ? "Shortest path using biological and marriage links only." : "Family links do not connect you, so other recorded links are used."}
				</Text>
			</View>
			<View style={[styles.card, { backgroundColor: t.c.surface, borderColor: t.c.border }]}>
				{people.map((pid, i) => {
					const p = graph.byId[pid];
					const step = path.steps[i];
					const prefix = describeKinship(graph, path.steps.slice(0, i));
					const sub = i === 0 ? yearsLabel(p, today) : i === people.length - 1 ? yearsLabel(p, today) : `${prefix.phrase} · ${yearsLabel(p, today)}`;
					const color = step ? groupColor(step.edge.group) : t.c.bio;
					return (
						<View key={pid} style={styles.stepRow}>
							<View style={{ width: 40, alignItems: "center" }}>
								<View style={{ marginTop: 12 }}>
									<Avatar name={p.name} gender={p.gender} size={40} uri={pictures[p.id]} deceased={!!p.death} ring={i === 0 || i === people.length - 1} />
								</View>
								{step ? <View style={{ flex: 1, width: 0, borderLeftWidth: 2.5, borderColor: color, minHeight: 22, marginVertical: 4 }} /> : null}
							</View>
							<View style={{ flex: 1, justifyContent: "center", paddingTop: 12, paddingBottom: 8 }}>
								<Text size={16} weight={600}>
									{i === 0 ? `You · ${p.name}` : p.name}
								</Text>
								<Text variant="caption">{sub}</Text>
								{step ? (
									<Text size={12} weight={700} color={color} style={{ marginTop: 10 }}>
										{groupGlyph(step.edge.group)} {stepLabel(graph, step)}
									</Text>
								) : null}
							</View>
						</View>
					);
				})}
			</View>
			<View style={{ flexDirection: "row", gap: 10 }}>
				<Button flex size="md" kind="secondary" label="Show on tree" onPress={() => router.navigate({ pathname: "/tree", params: { person: target.id } })} />
				<Button flex size="md" label={`Open ${firstName(target.name)}`} onPress={() => router.push({ pathname: "/person/[id]", params: { id: target.id } })} />
			</View>
			<Notice tone="neutral">
				{`“This is me” (${me.name}) is stored on this phone only, because the shared tree has no field for it yet. Change it in Settings.`}
			</Notice>
		</Screen>
	);
}

const styles = StyleSheet.create({
	back: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 },
	card: { borderWidth: 1, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 16 },
	stepRow: { flexDirection: "row", gap: 14, alignItems: "stretch" },
});
