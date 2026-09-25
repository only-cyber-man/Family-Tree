import { useRouter } from "expo-router";
import { ChevronDown, Link2, Search, UserPlus } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "../../src/components/Avatar";
import { Button } from "../../src/components/Button";
import { Skeleton, useDelayed } from "../../src/components/Feedback";
import { EmptyTreeIllustration } from "../../src/components/Illustrations";
import { SectionHeader } from "../../src/components/List";
import { EventRow } from "../../src/components/People";
import { Screen } from "../../src/components/Screen";
import { Text } from "../../src/components/Text";
import { useGraph, useIsOwner, usePictures, useToday } from "../../src/hooks/useTreeData";
import { upcomingEvents } from "../../src/lib/upcoming";
import { useSession } from "../../src/store/session";
import { useSettings } from "../../src/store/settings";
import { useTree } from "../../src/store/tree";
import { useTrees } from "../../src/store/trees";
import { useTheme } from "../../src/theme/useTheme";
import { useT } from "../../src/i18n";
import { useLayout } from "../../src/hooks/useLayout";
import { FORM_MAX, LIST_MAX } from "../../src/lib/responsive";
import { PersonSheetContent } from "../../src/components/PersonSheetContent";

/** Home opens on search and the upcoming list, not on a list of trees. */
export default function Home() {
	const t = useTheme();
	const T = useT();
	const router = useRouter();
	const user = useSession((s) => s.user);
	const treesStatus = useTrees((s) => s.status);
	const trees = useTrees((s) => s.items);
	const treesOffline = useTrees((s) => s.offline);
	const treesError = useTrees((s) => s.error);
	const activeTreeId = useSettings((s) => s.activeTreeId);
	const { full, status, error, errorKind, stale, load } = useTree();
	const graph = useGraph();
	const pictures = usePictures();
	const today = useToday();
	const owner = useIsOwner();
	const layout = useLayout();
	const [detailId, setDetailId] = useState<string | null>(null);
	const upcoming = useMemo(() => (graph ? upcomingEvents(graph.persons, today).slice(0, layout.isWide ? 8 : 3) : []), [graph, today, layout.isWide]);
	const loading = ((treesStatus === "loading" || treesStatus === "idle") && !trees.length) || (status === "loading" && !full);
	const showSkeleton = useDelayed(loading);

	const accountAvatar = (
		<Pressable onPress={() => router.navigate("/settings")} accessibilityRole="button" accessibilityLabel={T.common.settings}>
			<Avatar name={user?.name || user?.username || "?"} color={t.c.primary} size={36} />
		</Pressable>
	);

	if (loading) {
		return <Screen tabs>{showSkeleton ? <HomeSkeleton /> : null}</Screen>;
	}

	if (treesStatus === "error" && trees.length === 0) {
		return (
			<Screen tabs scroll={false} maxWidth={FORM_MAX} contentStyle={{ alignItems: "center", justifyContent: "center", gap: 16 }}>
				<Text variant="title" center>
					{treesOffline ? T.home.offline : T.home.couldntLoadTrees}
				</Text>
				<Text variant="body" color={t.c.ink2} center>
					{treesOffline ? T.home.connectFirstTime : treesError}
				</Text>
				<Button label={T.common.tryAgain} onPress={() => useTrees.getState().refresh()} />
			</Screen>
		);
	}

	if (treesStatus === "ready" && trees.length === 0 && !activeTreeId) {
		return (
			<Screen tabs scroll={false} maxWidth={FORM_MAX} contentStyle={{ alignItems: "center", justifyContent: "center", gap: 20 }}>
				<EmptyTreeIllustration width={200} />
				<View style={{ gap: 8 }}>
					<Text variant="title" center accessibilityRole="header">
						{T.home.noTrees}
					</Text>
					<Text variant="body" color={t.c.ink2} center style={{ lineHeight: 22 }}>
						{T.home.noTreesBody}
					</Text>
				</View>
				<Button label={T.home.createFirst} onPress={() => router.push({ pathname: "/trees", params: { create: "1" } })} />
			</Screen>
		);
	}

	if (status === "error" && !full) {
		return (
			<Screen tabs scroll={false} maxWidth={FORM_MAX} contentStyle={{ alignItems: "center", justifyContent: "center", gap: 16 }}>
				<Text variant="title" center>
					{errorKind === "notFound" ? T.home.treeUnavailable : errorKind === "network" ? T.home.offline : T.home.couldntOpen}
				</Text>
				<Text variant="body" color={t.c.ink2} center>
					{errorKind === "notFound"
						? T.home.treeUnavailableBody
						: errorKind === "network"
							? T.home.noCopy
							: error}
				</Text>
				<View style={{ flexDirection: "row", gap: 8 }}>
					<Button kind="secondary" label={T.home.chooseTree} onPress={() => router.push("/trees")} />
					{activeTreeId && errorKind !== "notFound" ? <Button label={T.common.tryAgain} onPress={() => load(activeTreeId)} /> : null}
				</View>
			</Screen>
		);
	}

	const empty = !!full && full.nodes.length === 0;
	const split = layout.isWide;
	// Wide tablets: tapping a date opens the person beside the list (master–detail).
	const openPerson = (id: string) => (split ? setDetailId(id) : router.push({ pathname: "/person/[id]", params: { id } }));

	const header = (
			<View style={styles.header}>
				<Pressable onPress={() => router.push("/trees")} style={styles.title} accessibilityRole="button" accessibilityHint={T.home.switchTree}>
					<Text variant="display" numberOfLines={1} style={{ flexShrink: 1 }} color={stale ? t.c.ink2 : t.c.ink}>
						{full?.tree.name ?? T.common.familyTree}
					</Text>
					<ChevronDown size={20} color={t.c.ink3} strokeWidth={2.5} style={{ marginTop: 6 }} />
				</Pressable>
				{accountAvatar}
			</View>
	);

	const searchField = (
			<Pressable
				onPress={() => router.push("/search")}
				disabled={empty}
				accessibilityRole="search"
				accessibilityLabel={T.home.lookingFor}
				style={[styles.search, { backgroundColor: t.c.surface, borderColor: t.c.border, opacity: empty ? 0.6 : 1 }]}
			>
				<Search size={20} color={t.c.ink3} strokeWidth={1.75} />
				<Text size={16} color={t.c.ink3}>
					{T.home.lookingFor}
				</Text>
			</Pressable>
	);

	const upcomingList = (
			<View style={{ gap: 10 }}>
				<SectionHeader title={T.home.upcoming} action={upcoming.length ? T.home.seeAll : undefined} onAction={() => router.navigate("/dates")} />
				{upcoming.length ? (
					upcoming.map((e) => (
						<View key={e.key} style={{ opacity: stale ? 0.6 : 1 }}>
							<EventRow card event={e} person={graph?.byId[e.personId]} uri={pictures[e.personId]} onPress={() => openPerson(e.personId)} />
						</View>
					))
				) : (
					<View style={[styles.emptyBox, { borderColor: t.c.borderStrong }]}>
						<Text size={15} weight={600} center>
							{T.home.noUpcoming}
						</Text>
						<Text variant="caption" center>
							{empty ? T.home.noUpcomingEmpty : T.home.noUpcomingYear}
						</Text>
					</View>
				)}
			</View>
	);

	const bottom = empty ? (
				<View style={styles.emptyTree}>
					<EmptyTreeIllustration width={160} />
					<View style={{ gap: 6 }}>
						<Text serif size={22} weight={600} center>
							{T.home.noOne}
						</Text>
						<Text size={14} color={t.c.ink2} center style={{ lineHeight: 21 }}>
							{owner ? T.home.addYourself : T.home.ownerAddedNoOne}
						</Text>
					</View>
					{owner ? <Button size="md" label={T.home.addFirst} onPress={() => router.push("/add-person")} /> : null}
				</View>
			) : owner ? (
				<View style={{ gap: 10 }}>
					<SectionHeader title={T.home.quick} />
					<View style={styles.quick}>
						<Pressable
							onPress={() => router.push("/add-person")}
							accessibilityRole="button"
							style={({ pressed }) => [styles.quickBtn, { backgroundColor: pressed ? t.c.primaryHover : t.c.primary }]}
						>
							<UserPlus size={22} color={t.c.onPrimary} strokeWidth={1.75} />
							<Text size={15} weight={700} color={t.c.onPrimary}>
								{T.home.addPerson}
							</Text>
						</Pressable>
						<Pressable
							onPress={() => router.push("/add-relationship")}
							accessibilityRole="button"
							style={({ pressed }) => [styles.quickBtn, { backgroundColor: pressed ? t.c.surface2 : t.c.surface, borderWidth: 1, borderColor: t.c.border }]}
						>
							<Link2 size={22} color={t.c.ink} strokeWidth={1.75} />
							<Text size={15} weight={700}>
								{T.home.linkTwo}
							</Text>
						</Pressable>
					</View>
				</View>
			) : null;

	if (split) {
		const detail = detailId && graph?.byId[detailId] ? (
			<View style={[styles.pane, { backgroundColor: t.c.surface, borderColor: t.c.border }]}>
				<PersonSheetContent
					personId={detailId}
					focusLabel={T.person.focusOnTree}
					onClose={() => setDetailId(null)}
					onSelect={setDetailId}
					onFocus={(pid) => router.navigate({ pathname: "/tree", params: { focus: pid } })}
				/>
			</View>
		) : (
			<View style={{ gap: 20 }}>
				<View style={[styles.pane, { backgroundColor: t.c.surface, borderColor: t.c.border, gap: 6 }]}>
					<Text variant="overline">{T.home.aboutTree}</Text>
					<Text variant="heading">{full?.tree.name}</Text>
					<Text variant="caption">
						{[graph ? T.trees.people(graph.persons.length) : null, owner ? T.common.owner : T.common.sharedWithYou].filter(Boolean).join(" · ")}
					</Text>
					<Text variant="small" style={{ marginTop: 6 }}>
						{T.home.detailHint}
					</Text>
				</View>
				{bottom}
			</View>
		);
		return (
			<Screen tabs onRefresh={activeTreeId ? () => load(activeTreeId, { silent: true }) : undefined}>
				{header}
				<View style={styles.split}>
					<View style={[styles.col, { maxWidth: 560 }]}>
						{searchField}
						{upcomingList}
					</View>
					<View style={styles.col}>{detail}</View>
				</View>
			</Screen>
		);
	}

	return (
		<Screen tabs maxWidth={LIST_MAX} onRefresh={activeTreeId ? () => load(activeTreeId, { silent: true }) : undefined}>
			{header}
			{searchField}
			{upcomingList}
			{bottom}
		</Screen>
	);
}

function HomeSkeleton() {
	const t = useTheme();
	const T = useT();
	return (
		<View style={{ gap: 20 }} accessibilityLabel={T.common.loading}>
			<View style={styles.header}>
				<Skeleton width={200} height={32} radius={8} />
				<Skeleton width={36} height={36} radius={18} />
			</View>
			<Skeleton height={50} radius={14} />
			<Skeleton width={90} height={14} />
			{[70, 55, 65].map((w, i) => (
				<View key={i} style={[styles.skelRow, { backgroundColor: t.c.surface, borderColor: t.c.border }]}>
					<Skeleton width={40} height={40} radius={8} />
					<Skeleton width={36} height={36} radius={18} />
					<View style={{ flex: 1, gap: 8 }}>
						<Skeleton width={`${w}%`} height={14} />
						<Skeleton width={`${w - 30}%`} height={12} />
					</View>
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
	title: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
	search: { height: 50, borderRadius: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 },
	emptyBox: { padding: 24, borderWidth: 1, borderStyle: "dashed", borderRadius: 14, gap: 6 },
	emptyTree: { alignItems: "center", gap: 16, paddingVertical: 20 },
	quick: { flexDirection: "row", gap: 10 },
	quickBtn: { flex: 1, height: 64, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
	split: { flexDirection: "row", gap: 24, alignItems: "flex-start" },
	col: { flex: 1, gap: 20, minWidth: 0 },
	pane: { borderWidth: 1, borderRadius: 16, padding: 20 },
	skelRow: { height: 68, borderRadius: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14 },
});
