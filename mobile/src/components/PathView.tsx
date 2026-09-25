import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useGraph, useMeInfo, usePictures, useToday } from "../hooks/useTreeData";
import { useT } from "../i18n";
import { capitalize, firstName, yearsLabel } from "../lib/format";
import { describeKinship, relationshipPath, stepLabel } from "../lib/path";
import { groupGlyph } from "../lib/relations";
import { useTheme } from "../theme/useTheme";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { Notice } from "./Feedback";
import { Text } from "./Text";

/**
 * How are we related: the relationship in words with the path behind it.
 * Used as a full screen on phones and inside the Tree tab's side panel on tablets.
 */
export function PathView({
	targetId,
	onBack,
	onOpen,
	onShowOnTree,
}: {
	targetId: string;
	onBack: () => void;
	onOpen: (id: string) => void;
	onShowOnTree: (id: string) => void;
}) {
	const t = useTheme();
	const T = useT();
	const router = useRouter();
	const graph = useGraph();
	const meInfo = useMeInfo();
	const me = meInfo.person;
	const pictures = usePictures();
	const today = useToday();
	const target = graph?.byId[targetId];

	const back = (
		<Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel={T.common.back}>
			<ChevronLeft size={20} color={t.c.ink2} strokeWidth={2.25} />
			<Text size={16} weight={600} color={t.c.ink2} numberOfLines={1}>
				{target?.name ?? T.common.back}
			</Text>
		</Pressable>
	);

	if (!graph || !target) return <View>{back}</View>;

	if (!me) {
		return (
			<View style={{ gap: 18 }}>
				{back}
				<Text variant="title">{T.path.whichIsYou}</Text>
				<Text variant="body" color={t.c.ink2}>
					{T.path.needMe(firstName(target.name))}
				</Text>
				<Button label={T.path.chooseWho} onPress={() => router.push("/pick-me")} />
			</View>
		);
	}

	const path = relationshipPath(graph, me.id, target.id);
	if (!path) {
		return (
			<View style={{ gap: 18 }}>
				{back}
				<Text variant="title">{T.path.notConnected}</Text>
				<Text variant="body" color={t.c.ink2}>
					{T.path.notConnectedBody(target.name)}
				</Text>
				<Button kind="secondary" label={T.path.open(firstName(target.name))} onPress={() => onOpen(target.id)} />
			</View>
		);
	}

	const kin = describeKinship(graph, path.steps, T);
	const people = [me.id, ...path.steps.map((s) => s.to)];
	const groupColor = (g: string) => (g === "BIOLOGICAL" ? t.c.bio : g === "IN-LAW" ? t.c.inlaw : g === "CHURCH" ? t.c.church : t.c.other);
	return (
		<View style={{ gap: 18 }}>
			{back}
			<View style={{ gap: 4 }}>
				<Text variant="title" accessibilityRole="header">
					{kin.title}
				</Text>
				{kin.term && kin.chain !== kin.phrase ? (
					<Text size={15} color={t.c.ink2}>
						{capitalize(kin.chain)}.
					</Text>
				) : null}
				<Text size={15} color={t.c.ink2}>
					{T.path.stepsThrough(path.steps.length, Math.max(0, path.steps.length - 1))} {path.familyOnly ? T.path.familyOnly : T.path.anyLinks}
				</Text>
			</View>
			<View style={[styles.card, { backgroundColor: t.c.surface, borderColor: t.c.border }]}>
				{people.map((pid, i) => {
					const p = graph.byId[pid];
					const step = path.steps[i];
					const prefix = describeKinship(graph, path.steps.slice(0, i), T);
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
									{i === 0 ? T.path.youName(p.name) : p.name}
								</Text>
								<Text variant="caption">{sub}</Text>
								{step ? (
									<Text size={12} weight={700} color={color} style={{ marginTop: 10 }}>
										{groupGlyph(step.edge.group)} {stepLabel(graph, step, T)}
									</Text>
								) : null}
							</View>
						</View>
					);
				})}
			</View>
			<View style={{ flexDirection: "row", gap: 10 }}>
				<Button flex size="md" kind="secondary" label={T.path.showOnTree} onPress={() => onShowOnTree(target.id)} />
				<Button flex size="md" label={T.path.open(firstName(target.name))} onPress={() => onOpen(target.id)} />
			</View>
			{meInfo.source === "device" ? <Notice tone="neutral">{T.path.meNote(me.name)}</Notice> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	back: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 },
	card: { borderWidth: 1, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 16 },
	stepRow: { flexDirection: "row", gap: 14, alignItems: "stretch" },
});
