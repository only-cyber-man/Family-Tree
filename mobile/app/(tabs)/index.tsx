import { useRouter } from "expo-router";
import { ChevronDown, Link2, Search, UserPlus } from "lucide-react-native";
import { useMemo } from "react";
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

/** Home opens on search and the upcoming list, not on a list of trees. */
export default function Home() {
	const t = useTheme();
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
	const upcoming = useMemo(() => (graph ? upcomingEvents(graph.persons, today).slice(0, 3) : []), [graph, today]);
	const loading = ((treesStatus === "loading" || treesStatus === "idle") && !trees.length) || (status === "loading" && !full);
	const showSkeleton = useDelayed(loading);

	const accountAvatar = (
		<Pressable onPress={() => router.navigate("/settings")} accessibilityRole="button" accessibilityLabel="Settings">
			<Avatar name={user?.name || user?.username || "?"} color={t.c.primary} size={36} />
		</Pressable>
	);

	if (loading) {
		return <Screen tabs>{showSkeleton ? <HomeSkeleton /> : null}</Screen>;
	}

	if (treesStatus === "error" && trees.length === 0) {
		return (
			<Screen tabs scroll={false} contentStyle={{ alignItems: "center", justifyContent: "center", gap: 16 }}>
				<Text variant="title" center>
					{treesOffline ? "You're offline" : "Couldn't load your trees"}
				</Text>
				<Text variant="body" color={t.c.ink2} center>
					{treesOffline ? "Connect to the internet to see your trees for the first time." : treesError}
				</Text>
				<Button label="Try again" onPress={() => useTrees.getState().refresh()} />
			</Screen>
		);
	}

	if (treesStatus === "ready" && trees.length === 0 && !activeTreeId) {
		return (
			<Screen tabs scroll={false} contentStyle={{ alignItems: "center", justifyContent: "center", gap: 20 }}>
				<EmptyTreeIllustration width={200} />
				<View style={{ gap: 8 }}>
					<Text variant="title" center accessibilityRole="header">
						No trees yet
					</Text>
					<Text variant="body" color={t.c.ink2} center style={{ lineHeight: 22 }}>
						Start with yourself and your parents. Invitations from relatives show up here on their own.
					</Text>
				</View>
				<Button label="Create your first tree" onPress={() => router.push({ pathname: "/trees", params: { create: "1" } })} />
			</Screen>
		);
	}

	if (status === "error" && !full) {
		return (
			<Screen tabs scroll={false} contentStyle={{ alignItems: "center", justifyContent: "center", gap: 16 }}>
				<Text variant="title" center>
					{errorKind === "notFound" ? "This tree is not available" : errorKind === "network" ? "You're offline" : "Couldn't open this tree"}
				</Text>
				<Text variant="body" color={t.c.ink2} center>
					{errorKind === "notFound"
						? "It may have been deleted, or its owner stopped sharing it with you."
						: errorKind === "network"
							? "There is no copy of this tree on this phone yet. Connect and try again."
							: error}
				</Text>
				<View style={{ flexDirection: "row", gap: 8 }}>
					<Button kind="secondary" label="Choose a tree" onPress={() => router.push("/trees")} />
					{activeTreeId && errorKind !== "notFound" ? <Button label="Try again" onPress={() => load(activeTreeId)} /> : null}
				</View>
			</Screen>
		);
	}

	const empty = !!full && full.nodes.length === 0;
	return (
		<Screen tabs onRefresh={activeTreeId ? () => load(activeTreeId, { silent: true }) : undefined}>
			<View style={styles.header}>
				<Pressable onPress={() => router.push("/trees")} style={styles.title} accessibilityRole="button" accessibilityHint="Switch tree">
					<Text variant="display" numberOfLines={1} style={{ flexShrink: 1 }} color={stale ? t.c.ink2 : t.c.ink}>
						{full?.tree.name ?? "Family Tree"}
					</Text>
					<ChevronDown size={20} color={t.c.ink3} strokeWidth={2.5} style={{ marginTop: 6 }} />
				</Pressable>
				{accountAvatar}
			</View>

			<Pressable
				onPress={() => router.push("/search")}
				disabled={empty}
				accessibilityRole="search"
				accessibilityLabel="Who are you looking for?"
				style={[styles.search, { backgroundColor: t.c.surface, borderColor: t.c.border, opacity: empty ? 0.6 : 1 }]}
			>
				<Search size={20} color={t.c.ink3} strokeWidth={1.75} />
				<Text size={16} color={t.c.ink3}>
					Who are you looking for?
				</Text>
			</Pressable>

			<View style={{ gap: 10 }}>
				<SectionHeader title="Upcoming" action={upcoming.length ? "See all" : undefined} onAction={() => router.navigate("/dates")} />
				{upcoming.length ? (
					upcoming.map((e) => (
						<View key={e.key} style={{ opacity: stale ? 0.6 : 1 }}>
							<EventRow card event={e} person={graph?.byId[e.personId]} uri={pictures[e.personId]} onPress={() => router.push({ pathname: "/person/[id]", params: { id: e.personId } })} />
						</View>
					))
				) : (
					<View style={[styles.emptyBox, { borderColor: t.c.borderStrong }]}>
						<Text size={15} weight={600} center>
							No upcoming dates
						</Text>
						<Text variant="caption" center>
							{empty ? "Birthdays and remembrance days appear here once there are people in the tree." : "Nothing in the next twelve months."}
						</Text>
					</View>
				)}
			</View>

			{empty ? (
				<View style={styles.emptyTree}>
					<EmptyTreeIllustration width={160} />
					<View style={{ gap: 6 }}>
						<Text serif size={22} weight={600} center>
							No one here yet
						</Text>
						<Text size={14} color={t.c.ink2} center style={{ lineHeight: 21 }}>
							{owner ? "Add yourself first. Everyone else connects to someone already in the tree." : "The owner has not added anyone yet."}
						</Text>
					</View>
					{owner ? <Button size="md" label="Add the first person" onPress={() => router.push("/add-person")} /> : null}
				</View>
			) : owner ? (
				<View style={{ gap: 10 }}>
					<SectionHeader title="Quick" />
					<View style={styles.quick}>
						<Pressable
							onPress={() => router.push("/add-person")}
							accessibilityRole="button"
							style={({ pressed }) => [styles.quickBtn, { backgroundColor: pressed ? t.c.primaryHover : t.c.primary }]}
						>
							<UserPlus size={22} color={t.c.onPrimary} strokeWidth={1.75} />
							<Text size={15} weight={700} color={t.c.onPrimary}>
								Add person
							</Text>
						</Pressable>
						<Pressable
							onPress={() => router.push("/add-relationship")}
							accessibilityRole="button"
							style={({ pressed }) => [styles.quickBtn, { backgroundColor: pressed ? t.c.surface2 : t.c.surface, borderWidth: 1, borderColor: t.c.border }]}
						>
							<Link2 size={22} color={t.c.ink} strokeWidth={1.75} />
							<Text size={15} weight={700}>
								Link two people
							</Text>
						</Pressable>
					</View>
				</View>
			) : null}
		</Screen>
	);
}

function HomeSkeleton() {
	const t = useTheme();
	return (
		<View style={{ gap: 20 }} accessibilityLabel="Loading">
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
	skelRow: { height: 68, borderRadius: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14 },
});
