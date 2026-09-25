import { useLocalSearchParams, useRouter } from "expo-router";
import { Plus, Users } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button } from "../src/components/Button";
import { Badge } from "../src/components/Chip";
import { OfflineWriteHint, SaveFailed, saveErrorMessage } from "../src/components/Feedback";
import { useCanWrite } from "../src/hooks/useTreeData";
import { newRecordId } from "../src/lib/ids";
import { EmptyTreeIllustration } from "../src/components/Illustrations";
import { RouteSheet } from "../src/components/Sheet";
import { Text } from "../src/components/Text";
import { TextField } from "../src/components/TextField";
import { relativeTime } from "../src/lib/format";
import { haptics } from "../src/services/haptics";
import { useSettings } from "../src/store/settings";
import { toast } from "../src/store/toast";
import { useTrees, type TreeSummary } from "../src/store/trees";
import { useTheme } from "../src/theme/useTheme";
import { useT } from "../src/i18n";

/** Tree picker: owner / shared badge, create a new tree. Rename and delete stay on the web. */
export default function Trees() {
	const t = useTheme();
	const T = useT();
	const router = useRouter();
	const params = useLocalSearchParams<{ create?: string }>();
	const { items, status, refresh, create } = useTrees();
	const activeTreeId = useSettings((s) => s.activeTreeId);
	const setActive = useSettings((s) => s.setActiveTree);
	const [creating, setCreating] = useState(params.create === "1");
	const [name, setName] = useState("");
	const [busy, setBusy] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const canWrite = useCanWrite();
	// One id per new-tree entry: reused by "Try again" (a retry after a lost
	// response returns that same tree), replaced when "New tree" is reopened.
	const treeRecordId = useRef(newRecordId());
	const startNewTree = () => {
		treeRecordId.current = newRecordId();
		setName("");
		setSaveError(null);
		setCreating(true);
	};

	useEffect(() => {
		refresh();
	}, [refresh]);

	const choose = (id: string) => {
		haptics.select();
		setActive(id);
		router.back();
	};

	const submit = async () => {
		if (!name.trim()) return setSaveError(T.trees.giveName);
		if (!canWrite) return setSaveError(T.offline.write);
		setBusy(true);
		setSaveError(null);
		try {
			const tree = await create(name, treeRecordId.current);
			haptics.success();
			setActive(tree.id);
			toast(T.trees.created(tree.name), "success");
			router.back();
		} catch (e) {
			haptics.error();
			setSaveError(saveErrorMessage(e, T.save.theTree));
		} finally {
			setBusy(false);
		}
	};

	const newTree = creating ? (
		<View style={{ gap: 10 }}>
			<TextField inSheet label={T.trees.nameLabel} value={name} onChangeText={setName} placeholder={T.trees.namePlaceholder} autoFocus returnKeyType="done" onSubmitEditing={submit} />
			<OfflineWriteHint />
			{saveError ? <SaveFailed message={saveError} onRetry={submit} busy={busy || !canWrite} /> : null}
			<View style={{ flexDirection: "row", gap: 8 }}>
				<Button
					flex
					kind="secondary"
					label={T.common.cancel}
					onPress={() => {
						setCreating(false);
						setSaveError(null);
					}}
				/>
				<Button flex label={T.common.create} loading={busy} disabled={!name.trim() || !canWrite} onPress={submit} />
			</View>
		</View>
	) : (
		<Pressable onPress={startNewTree} accessibilityRole="button" style={[styles.newTree, { borderColor: t.c.borderStrong }]}>
			<Plus size={18} color={t.c.ink2} strokeWidth={2} />
			<Text size={15} weight={600} color={t.c.ink2}>
				{T.trees.newTree}
			</Text>
		</Pressable>
	);

	return (
		<RouteSheet
			snapPoints={["50%", "92%"]}
			header={
				<View style={styles.header}>
					<Text variant="display" accessibilityRole="header">
						{T.trees.title}
					</Text>
				</View>
			}
		>
			{items.length === 0 && status !== "loading" ? (
				<View style={{ alignItems: "center", gap: 14, paddingVertical: 12 }}>
					<EmptyTreeIllustration width={180} />
					<Text variant="title" center>
						{T.home.noTrees}
					</Text>
					<Text variant="body" color={t.c.ink2} center>
						{T.home.noTreesBody}
					</Text>
				</View>
			) : (
				items.map((i) => <TreeCard key={i.tree.id} item={i} active={i.tree.id === activeTreeId} onPress={() => choose(i.tree.id)} />)
			)}
			{newTree}
		</RouteSheet>
	);
}

function TreeCard({ item, active, onPress }: { item: TreeSummary; active: boolean; onPress: () => void }) {
	const t = useTheme();
	const T = useT();
	const viewers = item.tree.invited?.length ?? 0;
	const share = item.isOwner ? (viewers ? T.trees.viewers(viewers) : T.trees.onlyYou) : item.ownerEmail ? T.trees.by(item.ownerEmail) : T.common.sharedWithYou;
	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityState={{ selected: active }}
			style={({ pressed }) => [
				styles.card,
				{ backgroundColor: pressed ? t.c.surface2 : t.c.surface, borderColor: active ? t.c.accent : t.c.border },
				active && t.shadow("md"),
			]}
		>
			<View style={styles.cardTop}>
				<View style={{ flex: 1, gap: 3, minWidth: 0 }}>
					<Text serif size={20} weight={600} numberOfLines={1}>
						{item.tree.name}
					</Text>
					<Text variant="caption">
						{item.people == null ? "…" : T.trees.people(item.people)} · {T.trees.updated(relativeTime(item.tree.updated, new Date(), T))}
					</Text>
				</View>
				<Badge label={item.isOwner ? T.common.owner : T.common.sharedWithYou} tone={item.isOwner ? "accent" : "primary"} />
			</View>
			<View style={styles.cardBottom}>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
					<Users size={16} color={t.c.ink3} strokeWidth={1.75} />
					<Text variant="caption" numberOfLines={1} style={{ flexShrink: 1 }}>
						{share}
					</Text>
				</View>
				{active ? (
					<Text size={13} weight={700} color={t.c.accent}>
						{T.trees.active}
					</Text>
				) : null}
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	header: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
	card: { borderWidth: 1.5, borderRadius: 16, padding: 16, gap: 12 },
	cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
	cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
	newTree: { height: 52, borderWidth: 1.5, borderStyle: "dashed", borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
});
