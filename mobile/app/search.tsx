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

/** Place a face: search a name, see how you are related. */
export default function Search() {
	const t = useTheme();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const graph = useGraph();
	const me = useMe();
	const pictures = usePictures();
	const today = useToday();
	const [q, setQ] = useState("");
	const results = useMemo(() => (graph ? searchPersons(graph.persons, q) : []), [graph, q]);

	const relation = (id: string): string => {
		if (!graph || !me) return "";
		if (id === me.id) return "you";
		const p = relationshipPath(graph, me.id, id);
		return p ? describeKinship(graph, p.steps).phrase : "not connected to you yet";
	};

	return (
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.c.bg }}>
			<View style={[styles.top, { paddingTop: insets.top + 12 }]}>
				<TextField
					round={false}
					containerStyle={{ flex: 1 }}
					autoFocus
					value={q}
					onChangeText={setQ}
					placeholder="Who are you looking for?"
					autoCorrect={false}
					autoCapitalize="words"
					returnKeyType="search"
					accessibilityLabel="Search people"
					leading={<SearchIcon size={20} color={t.c.ink3} strokeWidth={1.75} />}
				/>
				<Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={{ minHeight: 44, justifyContent: "center" }}>
					<Text size={16} weight={600} color={t.c.accent}>
						Cancel
					</Text>
				</Pressable>
			</View>
			<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24, gap: 14 }}>
				{!me && graph && graph.persons.length ? (
					<Notice
						actions={
							<Pressable onPress={() => router.push("/pick-me")} accessibilityRole="button">
								<Text size={13} weight={700} color={t.c.accent}>
									Choose who you are
								</Text>
							</Pressable>
						}
					>
						Tell the app which person is you to see how everyone is related to you. The choice stays on this phone.
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
								subtitle={[yearsLabel(item.person, today), relation(item.person.id)].filter(Boolean).join(" · ")}
								onPress={() => router.push({ pathname: "/person/[id]", params: { id: item.person.id } })}
							/>
						))}
					</Card>
				) : q.trim() ? (
					<Text variant="caption" center style={{ paddingTop: 24 }}>
						No one called “{q.trim()}” in this tree.
					</Text>
				) : null}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	top: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingBottom: 14 },
});
