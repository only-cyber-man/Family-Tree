import BottomSheet, { BottomSheetScrollView, type BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowUp, ChevronDown, Crosshair, Funnel, Maximize, Search, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionSheetIOS, Alert, BackHandler, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Legend } from "../../src/canvas/Legend";
import { TreeCanvas, type CanvasHandle } from "../../src/canvas/TreeCanvas";
import { Button, IconButton } from "../../src/components/Button";
import { FilterChip } from "../../src/components/Chip";
import { useDelayed } from "../../src/components/Feedback";
import { EmptyTreeIllustration } from "../../src/components/Illustrations";
import { PersonSheetContent } from "../../src/components/PersonSheetContent";
import { Backdrop, sheetOpenConfig, useSheetStyles } from "../../src/components/Sheet";
import { Text } from "../../src/components/Text";
import { useCanWrite, useIsOwner, useMeInfo, usePictures, useToday, useVisibility } from "../../src/hooks/useTreeData";
import { errorMessage } from "../../src/lib/errors";
import { clearChip, DEFAULT_FILTERS, filterChips } from "../../src/lib/filters";
import { firstName } from "../../src/lib/format";
import { relativesOf } from "../../src/lib/relations";
import { useNetwork } from "../../src/store/network";
import { toast } from "../../src/store/toast";
import { useTree } from "../../src/store/tree";
import { tokens } from "../../src/theme/tokens";
import { useTheme } from "../../src/theme/useTheme";
import { useT } from "../../src/i18n";
import { useSession } from "../../src/store/session";
import { pickHomePerson } from "../../src/lib/bands";
import { useLayout } from "../../src/hooks/useLayout";
import { PathView } from "../../src/components/PathView";
import { personPanelMode } from "../../src/lib/responsive";

export default function TreeTab() {
	const t = useTheme();
	const T = useT();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{ person?: string; focus?: string }>();
	const online = useNetwork((s) => s.online);
	const { full, status, filters, setFilters, removeNode } = useTree();
	const { graph, visible } = useVisibility();
	const pictures = usePictures();
	const canWrite = useCanWrite();
	const meInfo = useMeInfo();
	const homeId = useMemo(() => (visible ? pickHomePerson(visible.persons, visible.edges, meInfo.person?.id)?.id ?? null : null), [visible, meInfo.person?.id]);
	const myUserId = useSession((s) => s.user?.id);
	const today = useToday();
	const owner = useIsOwner();
	const canvas = useRef<CanvasHandle>(null);
	const sheet = useRef<BottomSheet>(null);
	const sheetStyles = useSheetStyles();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [focusId, setFocusId] = useState<string | null>(null);
	const [sheetIndex, setSheetIndex] = useState(-1);
	const [away, setAway] = useState(false);
	const showSpinner = useDelayed(status === "loading" && !full);
	const chips = filterChips(filters, T);
	const layout = useLayout();
	const showPanel = personPanelMode(layout.width) === "panel";
	// Bottom tab bar on phones; nothing at the bottom with the tablet rail.
	const bottomInset = layout.bottomBar || insets.bottom;
	const [panelMode, setPanelMode] = useState<"person" | "path">("person");
	useEffect(() => setPanelMode("person"), [selectedId]);
	const topOffset = insets.top + (online ? 8 : 40);

	// Deep links / other screens: ?person=<id> selects, ?focus=<id> focuses.
	useEffect(() => {
		if (params.person && graph?.byId[params.person]) {
			setSelectedId(params.person);
			canvas.current?.centerOn(params.person);
			router.setParams({ person: undefined });
		}
		if (params.focus && graph?.byId[params.focus]) {
			setSelectedId(params.focus);
			setFocusId(params.focus);
			router.setParams({ focus: undefined });
		}
	}, [params.person, params.focus, graph, router]);

	// Drop selection / focus when the person disappears (deleted, filtered out).
	useEffect(() => {
		if (selectedId && !visible?.personIds.has(selectedId)) setSelectedId(null);
		if (focusId && !visible?.personIds.has(focusId)) setFocusId(null);
	}, [visible, selectedId, focusId]);

	useEffect(() => {
		if (selectedId) {
			if (sheetIndex < 0) sheet.current?.snapToIndex(0);
		} else sheet.current?.close();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedId]);

	// Android back: close the top-most thing on the canvas first.
	useEffect(() => {
		if (!selectedId && !focusId) return;
		const sub = BackHandler.addEventListener("hardwareBackPress", () => {
			if (sheetIndex > 0) sheet.current?.snapToIndex(0);
			else if (focusId) setFocusId(null);
			else setSelectedId(null);
			return true;
		});
		return () => sub.remove();
	}, [selectedId, focusId, sheetIndex]);

	const focus = useCallback((id: string) => {
		sheet.current?.snapToIndex(0);
		setSelectedId(id);
		setFocusId(id);
	}, []);

	const nodeMenu = useCallback(
		(id: string) => {
			const p = graph?.byId[id];
			if (!p || !owner || !full) return;
			if (!canWrite) {
				toast(T.offline.write, "info");
				return;
			}
			const treeId = full.tree.id;
			const edit = () => router.push({ pathname: "/add-person", params: { id } });
			const link = () => router.push({ pathname: "/add-relationship", params: { from: id } });
			const remove = () =>
				Alert.alert(T.tree.removeTitle(p.name), T.tree.removeBody, [
					{ text: T.common.cancel, style: "cancel" },
					{
						text: T.common.remove,
						style: "destructive",
						onPress: () => removeNode(id, treeId).then(() => toast(T.tree.removed(p.name), "success"), (e) => toast(errorMessage(e, T), "error")),
					},
				]);
			if (Platform.OS === "ios") {
				ActionSheetIOS.showActionSheetWithOptions(
					{ title: p.name, options: [T.common.edit, T.tree.addRelationship, T.common.remove, T.common.cancel], destructiveButtonIndex: 2, cancelButtonIndex: 3, tintColor: t.c.accent },
					(i) => [edit, link, remove][i]?.(),
				);
			} else {
				Alert.alert(p.name, undefined, [
					{ text: T.common.edit, onPress: edit },
					{ text: T.tree.addRelationship, onPress: link },
					{ text: T.common.remove, style: "destructive", onPress: remove },
				]);
			}
		},
		[graph, owner, full, canWrite, router, removeNode, t.c.accent, T],
	);

	const focusPerson = focusId ? graph?.byId[focusId] : null;
	const focusRel = useMemo(() => (graph && focusId && visible ? relativesOf(graph, focusId, visible.edges) : null), [graph, focusId, visible]);
	const upTo = focusRel?.parents.filter((p) => visible?.personIds.has(p.id)).sort((a, b) => (a.gender === b.gender ? 0 : a.gender === "male" ? -1 : 1))[0];
	const focusParts = focusRel
		? [focusRel.parents.length ? T.tree.parents : null, focusRel.partners.length ? (focusRel.partners.length > 1 ? T.tree.partners : T.tree.partner) : null, focusRel.children.length ? T.tree.children : null].filter(Boolean).join(", ")
		: "";

	const renderBackdrop = useCallback((p: BottomSheetBackdropProps) => <Backdrop {...p} appearsOnIndex={1} disappearsOnIndex={0} onPress={() => sheet.current?.snapToIndex(0)} />, []);

	if (!full || !graph || !visible) {
		return (
			<View style={[styles.center, { backgroundColor: t.c.canvasBg, paddingBottom: bottomInset }]}>
				{showSpinner ? <Text variant="caption">{T.tree.loading}</Text> : null}
				{status === "error" ? <Button kind="secondary" label={T.home.chooseTree} onPress={() => router.push("/trees")} /> : null}
			</View>
		);
	}

	if (graph.persons.length === 0) {
		return (
			<View style={[styles.center, { backgroundColor: t.c.canvasBg, paddingBottom: bottomInset, gap: 16, paddingHorizontal: 32 }]}>
				<EmptyTreeIllustration width={180} />
				<Text serif size={22} weight={600} center>
					{T.home.noOne}
				</Text>
				<Text size={14} color={t.c.ink2} center>
					{owner ? T.home.addYourself : T.home.ownerAddedNoOne}
				</Text>
				{owner ? <Button size="md" label={T.home.addFirst} onPress={() => router.push("/add-person")} /> : null}
			</View>
		);
	}

	const selectInPanel = (id: string) => {
		setPanelMode("person");
		setSelectedId(id);
		canvas.current?.centerOn(id);
	};

	return (
		<View style={{ flex: 1, flexDirection: showPanel ? "row" : "column", backgroundColor: t.c.canvasBg }}>
			<View style={{ flex: 1 }}>
			<TreeCanvas
				ref={canvas}
				graph={graph}
				visible={visible}
				pictures={pictures}
				today={today}
				selectedId={selectedId}
				onSelect={(id) => {
					if (focusId && !id) return;
					setSelectedId(id);
				}}
				onLongPress={owner ? nodeMenu : undefined}
				focusId={focusId}
				onRequestFocus={focus}
				insets={{ top: topOffset + 60 + (chips.length ? 40 : 0), bottom: bottomInset + 70 }}
				treeKey={full.tree.id}
				onAwayChange={setAway}
				homeId={homeId}
			/>

			{/* Header */}
			<View pointerEvents="box-none" style={[styles.top, { top: topOffset }]}>
				{focusPerson ? (
					<Animated.View entering={FadeInUp.duration(200)} exiting={FadeOutUp.duration(150)} style={styles.row}>
						<View style={[styles.focusPill, { backgroundColor: t.c.ink }, t.shadow("md")]}>
							<Crosshair size={16} color={t.c.bg} strokeWidth={2} />
							<Text size={13} weight={600} color={t.c.bg} numberOfLines={1} style={{ flexShrink: 1 }}>
								{T.tree.focusedOn(firstName(focusPerson.name))}
								{focusParts ? ` · ${focusParts}` : ""}
							</Text>
						</View>
						<IconButton label={T.tree.exitFocus} onPress={() => setFocusId(null)} icon={<X size={16} color={t.c.ink} strokeWidth={2} />} />
					</Animated.View>
				) : (
					<>
						<View style={styles.row}>
							<Pressable
								onPress={() => router.push("/trees")}
								accessibilityRole="button"
								accessibilityHint={T.home.switchTree}
								style={[styles.namePill, { backgroundColor: t.c.surface, borderColor: t.c.border }, t.shadow("md")]}
							>
								<Text size={14} weight={600} numberOfLines={1} style={{ flexShrink: 1 }}>
									{full.tree.name}
								</Text>
								<ChevronDown size={16} color={t.c.ink3} strokeWidth={2.5} />
							</Pressable>
							<View style={{ flexDirection: "row", gap: 8 }}>
								<IconButton label={T.tree.search} onPress={() => router.push("/search")} icon={<Search size={18} color={t.c.ink} strokeWidth={1.75} />} />
								<IconButton
									label={chips.length ? T.tree.filtersActive(chips.length) : T.tree.filters}
									variant={chips.length ? "primary" : "surface"}
									badge={chips.length || undefined}
									onPress={() => router.push("/filters")}
									icon={<Funnel size={18} color={chips.length ? t.c.onPrimary : t.c.ink} strokeWidth={1.75} />}
								/>
							</View>
						</View>
						{chips.length ? (
							<View style={styles.chips}>
								{chips.map((c) => (
									<FilterChip key={c.key} label={c.label} onRemove={() => setFilters(clearChip(filters, c.key))} />
								))}
							</View>
						) : null}
					</>
				)}
			</View>

			{/* Bottom overlays */}
			{focusPerson ? (
				<View pointerEvents="box-none" style={[styles.bottomRow, { bottom: bottomInset + 20 }]}>
					{upTo ? (
						<Button
							flex
							size="sm"
							kind="secondary"
							style={t.shadow("md")}
							icon={<ArrowUp size={16} color={t.c.ink} strokeWidth={2} />}
							label={T.tree.goUpTo(firstName(upTo.name))}
							onPress={() => {
								setSelectedId(upTo.id);
								setFocusId(upTo.id);
							}}
						/>
					) : null}
					<Button flex size="sm" kind="secondary" style={t.shadow("md")} label={T.tree.exitFocus} onPress={() => setFocusId(null)} />
				</View>
			) : (
				<>
					<View pointerEvents="box-none" style={[styles.legend, { bottom: bottomInset + 20 }]}>
						<Legend edges={visible.edges} showYou={!!myUserId && visible.persons.some((p) => p.userId === myUserId)} />
					</View>
					<View pointerEvents="box-none" style={[styles.reset, { bottom: bottomInset + 20 }]}>
						{away ? (
							<Button
								size="sm"
								kind="secondary"
								style={[{ height: 44, paddingHorizontal: 14 }, t.shadow("md")]}
								icon={<Maximize size={16} color={t.c.ink} strokeWidth={2} />}
								label={T.tree.resetView}
								onPress={() => canvas.current?.resetView()}
							/>
						) : (
							<IconButton label={T.tree.fitAll} size={44} onPress={() => canvas.current?.resetView()} icon={<Maximize size={18} color={t.c.ink} strokeWidth={2} />} />
						)}
					</View>
				</>
			)}

			{visible.persons.length === 0 ? (
				<View pointerEvents="box-none" style={[styles.center, StyleSheet.absoluteFill]}>
					<View style={[styles.noMatch, { backgroundColor: t.c.surface, borderColor: t.c.border }, t.shadow("md")]}>
						<Text size={15} weight={600} center>
							{T.tree.allFiltered}
						</Text>
						<Button kind="text" label={T.tree.clearFilters} onPress={() => setFilters(DEFAULT_FILTERS)} />
					</View>
				</View>
			) : null}
			</View>

			{showPanel ? (
				// Wide tablets: a persistent details panel beside the full-bleed canvas.
				<View
					style={[
						styles.panel,
						{ width: layout.panel, backgroundColor: t.c.surface, borderLeftColor: t.c.border, paddingTop: insets.top + 8, paddingRight: insets.right },
					]}
				>
					<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}>
						{selectedId ? (
							panelMode === "path" ? (
								<PathView targetId={selectedId} onBack={() => setPanelMode("person")} onOpen={selectInPanel} onShowOnTree={selectInPanel} />
							) : (
								<Animated.View key={selectedId} entering={FadeIn.duration(150)}>
									<PersonSheetContent
										personId={selectedId}
										onClose={() => setSelectedId(null)}
										onSelect={(id) => {
											setSelectedId(id);
											if (focusId) setFocusId(id);
											else canvas.current?.centerOn(id);
										}}
										onFocus={focus}
										onRelate={() => setPanelMode("path")}
									/>
								</Animated.View>
							)
						) : (
							<View style={styles.panelEmpty}>
								<EmptyTreeIllustration width={160} />
								<Text size={15} color={t.c.ink2} center>
									{T.tree.panelHint}
								</Text>
							</View>
						)}
					</ScrollView>
				</View>
			) : (
			<BottomSheet
				ref={sheet}
				index={-1}
				snapPoints={tokens.mobile.sheetSnapPoints.person as unknown as string[]}
				enableDynamicSizing={false}
				enablePanDownToClose
				bottomInset={bottomInset}
				topInset={insets.top}
				animationConfigs={sheetOpenConfig}
				backdropComponent={renderBackdrop}
				onChange={(i) => {
					setSheetIndex(i);
					if (i === -1) setSelectedId(null);
				}}
				{...sheetStyles}
			>
				<BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6 }}>
					{selectedId ? (
						<Animated.View key={selectedId} entering={FadeIn.duration(150)}>
						<PersonSheetContent
							personId={selectedId}
							collapsed={sheetIndex === 0}
							onClose={() => {
								sheet.current?.close();
								setSelectedId(null);
							}}
							onSelect={(id) => {
								setSelectedId(id);
								if (focusId) setFocusId(id);
								else canvas.current?.centerOn(id);
							}}
							onFocus={focus}
						/>
						</Animated.View>
					) : null}
				</BottomSheetScrollView>
			</BottomSheet>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: "center", justifyContent: "center" },
	panel: { borderLeftWidth: 1 },
	panelEmpty: { alignItems: "center", gap: 16, paddingTop: 80, paddingHorizontal: 12 },
	top: { position: "absolute", left: 16, right: 16, gap: 10 },
	row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
	namePill: { height: 40, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
	focusPill: { height: 40, paddingHorizontal: 14, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
	chips: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
	bottomRow: { position: "absolute", left: 16, right: 16, flexDirection: "row", gap: 8 },
	legend: { position: "absolute", left: 16 },
	reset: { position: "absolute", right: 16 },
	noMatch: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 4 },
});
