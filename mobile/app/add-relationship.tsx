import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "../src/components/Avatar";
import { Chip } from "../src/components/Chip";
import { Notice, OfflineWriteHint, SaveFailed, saveErrorMessage } from "../src/components/Feedback";
import { PersonPicker } from "../src/components/PersonPicker";
import { RouteSheet, SheetHeader } from "../src/components/Sheet";
import { Text } from "../src/components/Text";
import { useCanWrite, useGraph, useIsOwner, usePictures, useToday } from "../src/hooks/useTreeData";
import { yearsLabel } from "../src/lib/format";
import { GROUP_ORDER, groupGlyph, isDuplicateRelationship, relationChipLabel, typeSentence } from "../src/lib/relations";
import { haptics } from "../src/services/haptics";
import { newRecordId } from "../src/lib/ids";
import { toast } from "../src/store/toast";
import { useTree } from "../src/store/tree";
import { tokens } from "../src/theme/tokens";
import { useTheme } from "../src/theme/useTheme";
import { useT } from "../src/i18n";

const COMMON = ["IS_MOTHER_OF", "IS_FATHER_OF", "IS_MARRIED_TO", "LIVES_WITH", "IS_GODPARENT_OF"];

/** Searchable From / To pickers and the relationship type as chips. */
export default function AddRelationship() {
	const t = useTheme();
	const T = useT();
	const router = useRouter();
	const params = useLocalSearchParams<{ from?: string; to?: string }>();
	const full = useTree((s) => s.full);
	const addRelationship = useTree((s) => s.addRelationship);
	const graph = useGraph();
	const canWrite = useCanWrite();
	// Bound when the form opens.
	// The tree this form writes to: bound as soon as it is known (also when it
	// finishes loading after the form opened), so switching trees mid-form
	// cannot redirect the write.
	const boundTree = useRef<string | null>(full?.tree.id ?? null);
	if (!boundTree.current && full) boundTree.current = full.tree.id;
	// One client record id per chosen (from, to, type): "Try again" reuses it, so a
	// retry after a lost response cannot duplicate; a different choice is a
	// different relationship and gets its own id.
	const idsByChoice = useRef(new Map<string, string>()).current;
	const idFor = (key: string) => {
		if (!idsByChoice.has(key)) idsByChoice.set(key, newRecordId());
		return idsByChoice.get(key)!;
	};
	const [saveError, setSaveError] = useState<string | null>(null);
	const pictures = usePictures();
	const today = useToday();
	const owner = useIsOwner();
	const [from, setFrom] = useState<string | null>(params.from ?? null);
	const [to, setTo] = useState<string | null>(params.to ?? null);
	const [type, setType] = useState<string | null>(null);
	const [pickFrom, setPickFrom] = useState(!params.from);
	const [more, setMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const close = () => (router.canGoBack() ? router.back() : router.replace("/"));

	const types = useMemo(() => {
		const all = [...(full?.relationshipNames ?? [])].sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.name.localeCompare(b.name));
		const common = COMMON.map((n) => all.find((x) => x.name === n)).filter((x): x is NonNullable<typeof x> => !!x);
		const top = common.length >= 3 ? common : all.slice(0, 5);
		return { all, top };
	}, [full]);

	const save = async () => {
		if (!from || !to || !type) return setError(T.addRel.chooseBoth);
		if (from === to) return setError(T.addRel.different);
		const id = idFor(`${from}|${to}|${type}`);
		// A retry of an attempt that did reach the server finds its own record here, not a duplicate.
		if (full && isDuplicateRelationship(full.relationships.filter((r) => r.id !== id), full.relationshipNames, { sourceNode: from, targetNode: to, relationshipName: type }))
			return setError(T.addRel.duplicate);
		const treeId = boundTree.current ?? useTree.getState().full?.tree.id ?? null;
		if (!treeId) {
			haptics.error();
			setSaveError(T.save.noTree);
			return;
		}
		setError(null);
		setSaveError(null);
		setBusy(true);
		try {
			await addRelationship({ id, sourceNode: from, targetNode: to, relationshipName: type, tree: treeId });
			haptics.success();
			toast(T.addRel.added, "success");
			close();
		} catch (e) {
			// Save failed: the form stays open with the choices intact.
			haptics.error();
			setSaveError(saveErrorMessage(e, T.save.theRelationship));
		} finally {
			setBusy(false);
		}
	};

	if (!full || !graph || !owner) {
		return (
			<RouteSheet snapPoints={["92%"]} header={<SheetHeader title={T.addRel.title} onCancel={close} />}>
				<Notice tone="neutral">{T.addRel.viewerOnly}</Notice>
			</RouteSheet>
		);
	}

	const fromP = from ? graph.byId[from] : undefined;
	const toP = to ? graph.byId[to] : undefined;
	const typeRec = types.all.find((x) => x.id === type);
	const shown = more ? types.all : types.top;
	const glyphColor = (g: string) => (g === "BIOLOGICAL" ? t.c.bio : g === "IN-LAW" ? t.c.inlaw : g === "CHURCH" ? t.c.church : t.c.other);

	return (
		<RouteSheet
			snapPoints={tokens.mobile.sheetSnapPoints.addPerson as unknown as string[]}
			header={<SheetHeader title={T.addRel.title} onCancel={close} action={T.common.add} onAction={save} busy={busy} actionDisabled={!from || !to || !type || !canWrite} />}
		>
			<OfflineWriteHint />
			{saveError ? <SaveFailed message={saveError} onRetry={save} busy={busy || !canWrite} /> : null}
			<View style={[styles.sentence, { backgroundColor: t.c.surface2 }]} accessibilityLiveRegion="polite">
				<Text serif size={17} style={{ lineHeight: 24 }}>
					<Text serif size={17} weight={600}>
						{fromP?.name ?? "…"}
					</Text>{" "}
					{typeRec ? typeSentence(typeRec.name, fromP?.gender ?? "female", T) : T.addRel.isRelatedTo}
					{T.lang === "pl" ? ": " : " "}
					<Text serif size={17} weight={600}>
						{toP?.name ?? "…"}
					</Text>
					.
				</Text>
			</View>

			<View style={{ gap: 6 }}>
				<Text variant="label">{T.addRel.from}</Text>
				{fromP && !pickFrom ? (
					<View style={[styles.selected, { borderColor: t.c.border, backgroundColor: t.c.bg }]}>
						<Avatar name={fromP.name} gender={fromP.gender} size={36} uri={pictures[fromP.id]} deceased={!!fromP.death} />
						<View style={{ flex: 1 }}>
							<Text size={15} weight={600}>
								{fromP.name}
							</Text>
							<Text size={12} color={t.c.ink3}>
								{yearsLabel(fromP, today)}
							</Text>
						</View>
						<Pressable onPress={() => setPickFrom(true)} hitSlop={10} accessibilityRole="button" accessibilityLabel={T.addRel.changeFrom}>
							<Text size={13} weight={600} color={t.c.accent}>
								{T.common.change}
							</Text>
						</Pressable>
					</View>
				) : (
					<PersonPicker
						inSheet
						persons={graph.persons}
						value={from}
						onChange={(id) => {
							setFrom(id);
							setPickFrom(false);
						}}
						today={today}
						pictures={pictures}
						exclude={to ? [to] : undefined}
						limit={4}
					/>
				)}
			</View>

			<View style={{ gap: 8 }}>
				<Text variant="label">{T.addRel.relation}</Text>
				<View style={styles.chips}>
					{shown.map((rt) => (
						<Chip
							key={rt.id}
							height={38}
							selected={type === rt.id}
							glyph={groupGlyph(rt.group)}
							glyphColor={glyphColor(rt.group)}
							label={relationChipLabel(rt.name, rt.isBidirectional, T)}
							onPress={() => setType(rt.id)}
						/>
					))}
					{types.all.length > types.top.length ? <Chip height={38} label={more ? T.addRel.fewer : T.addRel.more} onPress={() => setMore((m) => !m)} /> : null}
				</View>
			</View>

			<View style={{ gap: 6 }}>
				<Text variant="label">{T.addRel.to}</Text>
				<PersonPicker inSheet persons={graph.persons} value={to} onChange={setTo} today={today} pictures={pictures} exclude={from ? [from] : undefined} limit={5} />
			</View>

			{error ? (
				<Text size={13} color={t.c.danger}>
					{error}
				</Text>
			) : null}
		</RouteSheet>
	);
}

const styles = StyleSheet.create({
	sentence: { padding: 14, borderRadius: 12 },
	selected: { height: 56, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 12 },
	chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
