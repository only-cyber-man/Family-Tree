import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useTheme } from "../theme/useTheme";
import { useT } from "../i18n";

const THUMB = 28;

/** Two-thumb slider for the age range. */
export function RangeSlider({
	min,
	max,
	low,
	high,
	step = 1,
	onChange,
	accessibilityLabel,
}: {
	min: number;
	max: number;
	low: number;
	high: number;
	step?: number;
	onChange: (low: number, high: number) => void;
	accessibilityLabel?: string;
}) {
	const t = useTheme();
	const T = useT();
	const [width, setWidth] = useState(0);
	// Gestures are created once; everything they read lives in this ref so a
	// re-render mid-drag does not re-attach the detector.
	const live = useRef({ low, high, width, min, max, step, onChange });
	useEffect(() => {
		live.current = { low, high, width, min, max, step, onChange };
	});
	const track = Math.max(1, width - THUMB);
	const toX = (v: number) => ((v - min) / (max - min)) * track;

	const gestures = useMemo(() => {
		const make = (which: "low" | "high") => {
			let startX = 0;
			return Gesture.Pan()
				.runOnJS(true)
				.activeOffsetX([-4, 4])
				.failOffsetY([-12, 12])
				.hitSlop({ top: 10, bottom: 10, left: 10, right: 10 })
				.onBegin(() => {
					const L = live.current;
					const tr = Math.max(1, L.width - THUMB);
					startX = ((L[which] - L.min) / (L.max - L.min)) * tr;
				})
				.onChange((e) => {
					const L = live.current;
					const tr = Math.max(1, L.width - THUMB);
					const x = Math.min(tr, Math.max(0, startX + e.translationX));
					const v = Math.round((L.min + (x / tr) * (L.max - L.min)) / L.step) * L.step;
					if (which === "low") L.onChange(Math.min(v, L.high), L.high);
					else L.onChange(L.low, Math.max(v, L.low));
				});
		};
		return { low: make("low"), high: make("high") };
	}, []);

	const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
	const lx = toX(low);
	const hx = toX(high);
	return (
		<View
			onLayout={onLayout}
			style={styles.wrap}
			accessible
			accessibilityRole="adjustable"
			accessibilityLabel={accessibilityLabel}
			accessibilityValue={{ text: T.common.range(low, String(high)) }}
			accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
			onAccessibilityAction={(e) => {
				if (e.nativeEvent.actionName === "increment") onChange(low, Math.min(max, high + 5));
				else onChange(low, Math.max(low, high - 5));
			}}
		>
			<View style={[styles.rail, { backgroundColor: t.c.surface2, left: THUMB / 2, right: THUMB / 2 }]} />
			<View style={[styles.rail, { backgroundColor: t.c.primary, left: lx + THUMB / 2, width: Math.max(0, hx - lx) }]} />
			<GestureDetector gesture={gestures.low}>
				<View style={[styles.thumb, { left: lx, backgroundColor: t.c.surface, borderColor: t.c.primary }, t.shadow("md")]} />
			</GestureDetector>
			<GestureDetector gesture={gestures.high}>
				<View style={[styles.thumb, { left: hx, backgroundColor: t.c.surface, borderColor: t.c.primary }, t.shadow("md")]} />
			</GestureDetector>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { height: 36, justifyContent: "center" },
	rail: { position: "absolute", height: 4, borderRadius: 2 },
	thumb: { position: "absolute", width: THUMB, height: THUMB, borderRadius: THUMB / 2, borderWidth: 2 },
});
