import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { initials } from "../lib/format";
import type { Gender } from "../lib/types";
import { useTheme } from "../theme/useTheme";
import { Text } from "./Text";

/**
 * Circle with the person's photo, or initials on the gender border colour.
 * Deceased people are shown muted (the design's 60% saturation; expo-image
 * has no saturation filter, so a neutral veil approximates it).
 */
export function Avatar({
	name,
	gender,
	size = 40,
	uri,
	deceased,
	ring,
	color,
}: {
	name: string;
	gender?: Gender;
	size?: number;
	uri?: string;
	deceased?: boolean;
	/** Copper selection ring. */
	ring?: boolean;
	/** Override background (e.g. primary for the account avatar). */
	color?: string;
}) {
	const t = useTheme();
	const bg = color ?? (gender ? t.node[gender].border : t.c.primary);
	const fg = color ? t.c.onPrimary : t.c.onAvatar;
	return (
		<View
			accessibilityLabel={name}
			style={[
				styles.circle,
				{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
				ring && { borderWidth: 3, borderColor: t.c.accent },
				deceased && { opacity: 0.85 },
			]}
		>
			{uri ? (
				<Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" transition={150} recyclingKey={uri} />
			) : (
				<Text size={Math.max(8, Math.round(size * 0.32))} weight={700} color={fg} style={{ lineHeight: Math.round(size * 0.42) }} allowFontScaling={false}>
					{initials(name)}
				</Text>
			)}
			{deceased ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: size / 2, backgroundColor: t.scheme === "dark" ? "rgba(18,23,20,0.35)" : "rgba(237,230,216,0.4)" }]} /> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	circle: { alignItems: "center", justifyContent: "center", overflow: "hidden", flex: 0 },
});
