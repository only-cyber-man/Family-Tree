import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { useT } from "../i18n";
import { aspectRatio, pickAd, type Ad } from "../lib/ads";
import { fetchAds, reportImpression } from "../services/ads";
import { useNetwork } from "../store/network";
import { useTheme } from "../theme/useTheme";
import { SectionHeader } from "./List";
import { Text } from "./Text";

/**
 * One house ad for a placement ("home", "settings"): the creative at its own
 * aspect ratio under a "Sponsored" header, opening the store page on tap.
 * Renders nothing while loading, offline, or when nothing is scheduled.
 */
export function AdBanner({ placement }: { placement: string }) {
	const t = useTheme();
	const T = useT();
	const online = useNetwork((s) => s.online);
	const [ad, setAd] = useState<Ad | null>(null);

	useEffect(() => {
		if (!online) return;
		let alive = true;
		fetchAds(placement)
			.then((ads) => {
				if (!alive) return;
				const chosen = pickAd(ads);
				setAd(chosen);
				if (chosen) reportImpression(chosen.id);
			})
			.catch(() => {
				if (alive) setAd(null);
			});
		return () => {
			alive = false;
		};
	}, [placement, online]);

	if (!ad) return null;
	return (
		<View style={styles.wrap}>
			<SectionHeader title={T.ads.sponsored} />
			<Pressable
				onPress={() => Linking.openURL(ad.clickUrl).catch(() => undefined)}
				accessibilityRole="link"
				accessibilityLabel={T.ads.open(ad.title || T.ads.sponsored)}
				style={({ pressed }) => [styles.slot, { aspectRatio: aspectRatio(ad), borderColor: t.c.border, backgroundColor: t.c.surface2, opacity: pressed ? 0.85 : 1 }]}
			>
				<Image source={{ uri: ad.mediaUrl }} style={styles.fill} contentFit="cover" transition={150} accessible={false} />
				<View style={[styles.tag, { backgroundColor: t.c.surface }]}>
					<Text size={11} weight={700} color={t.c.ink3} style={{ lineHeight: 14 }}>
						{T.ads.tag}
					</Text>
				</View>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 10 },
	slot: { width: "100%", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
	fill: { width: "100%", height: "100%" },
	tag: { position: "absolute", top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, opacity: 0.9 },
});
