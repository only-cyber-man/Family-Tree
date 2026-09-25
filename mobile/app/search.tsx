import { useRouter } from "expo-router";
import { Search as SearchIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Notice } from "../src/components/Feedback";
import { Card } from "../src/components/List";
import { PersonRow } from "../src/components/People";
import { Text } from "../src/components/Text";
import { TextField } from "../src/components/TextField";
import { useGraph, useMe, usePictures, useToday } from "../src/hooks/useTreeData";
import { yearsLabel } from "../src/lib/format";
import { describeKinship, relationshipPath } from "../src/lib/path";
import { searchPersons } from "../src/lib/search";
import { useTheme } from "../src/theme/useTheme";
import { useT } from "../src/i18n";
import { useLayout } from "../src/hooks/useLayout";
import { LIST_MAX } from "../src/lib/responsive";

/** Place a face: search a name, see how you are related. */
export default function Search() {
	const t = useTheme();
	const T = useT();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const graph = useGraph();
	const me = useMe();
	const pictures = usePictures();
	const today = useToday();
	const [q, setQ] = useState("");
	const layout = useLayout();
	// Tablets: a centred list, not edge-to-edge rows.
	const capped = layout.isTablet ? ({ width: "100%", maxWidth: LIST_MAX, alignSelf: "center" } as const) : null;
	const results = useMemo(() => (graph ? searchPersons(graph.persons, q) : []), [graph, q]);

	const relation = (id: string): string => {
		if (!graph || !me) return "";
		if (id === me.id) return T.kin.you;
		const p = relationshipPath(graph, me.id, id);
		return p ? describeKinship(graph, p.steps, T).phrase : T.path.notConnectedShort;
	};

	return (
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.c.bg }}>
			<View style={[styles.top, { paddingTop: insets.top + 12 }, capped]}>
				<TextField
					round={false}
					containerStyle={{ flex: 1 }}
					autoFocus
					value={q}
					onChangeText={setQ}
					placeholder={T.search.placeholder}
					autoCorrect={false}
					autoCapitalize="words"
					returnKeyType="search"
					accessibilityLabel={T.search.a11y}
					leading={<SearchIcon size={20} color={t.c.ink3} strokeWidth={1.75} />}
				/>
				<Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={{ minHeight: 44, justifyContent: "center" }}>
					<Text size={16} weight={600} color={t.c.accent}>
						{T.common.cancel}
					</Text>
				</Pressable>
			</View>
			<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24, gap: 14 }, capped]}>
				{!me && graph && graph.persons.length ? (
					<Notice
						actions={
							<Pressable onPress={() => router.push("/pick-me")} accessibilityRole="button">
								<Text size={13} weight={700} color={t.c.accent}>
									{T.search.chooseWho}
								</Text>
							</Pressable>
						}
					>
						{T.search.chooseWhoBody}
					</Notice>
				) : null}
				{results.length ? (
					<Card>
						{results.map((item) => (
							<PersonRow
								key={item.person.id}
								person={item.person}
								today={today}
								uri={pictures[item.person.id]}
								highlight={item.range}
								subtitle={[yearsLabel(item.person, today), relation(item.person.id), item.noteSnippet].filter(Boolean).join(" · ")}
								onPress={() => router.push({ pathname: "/person/[id]", params: { id: item.person.id } })}
							/>
						))}
					</Card>
				) : q.trim() ? (
					<Text variant="caption" center style={{ paddingTop: 24 }}>
						{T.search.noOne(q.trim())}
					</Text>
				) : null}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	top: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingBottom: 14 },
});
