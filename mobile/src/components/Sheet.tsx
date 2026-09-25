import BottomSheet, { BottomSheetBackdrop, BottomSheetFooter, BottomSheetScrollView, type BottomSheetBackdropProps, type BottomSheetFooterProps } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { motion } from "../theme/theme";
import { useTheme } from "../theme/useTheme";
import { Text } from "./Text";

export const sheetEasing = Easing.bezier(0.2, 0.8, 0.2, 1);
export const sheetOpenConfig = { duration: motion.slow, easing: sheetEasing };

export function useSheetStyles() {
	const t = useTheme();
	return useMemo(
		() => ({
			backgroundStyle: { backgroundColor: t.c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
			handleIndicatorStyle: { backgroundColor: t.c.borderStrong, width: 36, height: 5, borderRadius: 3 },
			style: t.shadow("lg"),
		}),
		[t],
	);
}

export function Backdrop(props: BottomSheetBackdropProps & { appearsOnIndex?: number; disappearsOnIndex?: number; onPress?: () => void }) {
	return (
		<BottomSheetBackdrop
			{...props}
			appearsOnIndex={props.appearsOnIndex ?? 0}
			disappearsOnIndex={props.disappearsOnIndex ?? -1}
			opacity={0.45}
			pressBehavior={props.onPress ? "none" : "close"}
			onPress={props.onPress}
		/>
	);
}

/**
 * A route presented as a bottom sheet (transparentModal): swipe down or tap
 * the scrim to dismiss, which pops the route.
 */
export function RouteSheet({
	snapPoints,
	children,
	scroll = true,
	header,
	footer,
	dynamic,
	onChange,
	footerHeight = 90,
}: {
	snapPoints?: (string | number)[];
	children: ReactNode;
	scroll?: boolean;
	header?: ReactNode;
	/** Pinned to the bottom of the sheet (e.g. the Filters apply button). */
	footer?: ReactNode;
	dynamic?: boolean;
	onChange?: (index: number) => void;
	footerHeight?: number;
}) {
	const router = useRouter();
	const ref = useRef<BottomSheet>(null);
	const insets = useSafeAreaInsets();
	const s = useSheetStyles();
	const closed = useRef(false);
	const onClose = useCallback(() => {
		if (closed.current) return;
		closed.current = true;
		if (router.canGoBack()) router.back();
	}, [router]);
	const renderBackdrop = useCallback((p: BottomSheetBackdropProps) => <Backdrop {...p} />, []);
	const renderFooter = useCallback(
		(p: BottomSheetFooterProps) => (
			<BottomSheetFooter {...p}>
				<View style={{ backgroundColor: s.backgroundStyle.backgroundColor, paddingBottom: insets.bottom }}>{footer}</View>
			</BottomSheetFooter>
		),
		[footer, insets.bottom, s.backgroundStyle.backgroundColor],
	);
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<BottomSheet
				ref={ref}
				index={0}
				snapPoints={dynamic ? undefined : snapPoints}
				enableDynamicSizing={!!dynamic}
				enablePanDownToClose
				onClose={onClose}
				animationConfigs={sheetOpenConfig}
				backdropComponent={renderBackdrop}
				keyboardBehavior="extend"
				keyboardBlurBehavior="restore"
				android_keyboardInputMode="adjustResize"
				topInset={insets.top}
				onChange={onChange}
				footerComponent={footer ? renderFooter : undefined}
				{...s}
			>
				{header}
				{scroll ? (
					<BottomSheetScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 + (footer ? footerHeight : 0), gap: 20 }}>
						{children}
					</BottomSheetScrollView>
				) : (
					children
				)}
			</BottomSheet>
		</GestureHandlerRootView>
	);
}

/** "Cancel · Title · Save" header used by the form sheets. */
export function SheetHeader({
	title,
	onCancel,
	action,
	onAction,
	actionDisabled,
	busy,
}: {
	title: string;
	onCancel: () => void;
	action?: string;
	onAction?: () => void;
	actionDisabled?: boolean;
	busy?: boolean;
}) {
	const t = useTheme();
	return (
		<View style={styles.header}>
			<Pressable onPress={onCancel} hitSlop={12} accessibilityRole="button" style={styles.side}>
				<Text size={16} weight={600} color={t.c.ink2}>
					Cancel
				</Text>
			</Pressable>
			<Text variant="serif" accessibilityRole="header" numberOfLines={1} style={{ flexShrink: 1 }}>
				{title}
			</Text>
			<Pressable
				onPress={actionDisabled || busy ? undefined : onAction}
				hitSlop={12}
				accessibilityRole="button"
				accessibilityState={{ disabled: !!actionDisabled, busy: !!busy }}
				style={[styles.side, { alignItems: "flex-end" }]}
			>
				{action ? (
					<Text size={16} weight={700} color={actionDisabled || busy ? t.c.ink3 : t.c.accent}>
						{busy ? "Saving…" : action}
					</Text>
				) : null}
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 8 },
	side: { minWidth: 64, minHeight: 44, justifyContent: "center" },
});
