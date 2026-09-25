import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Light on select, Medium on long-press menu, Success on save / focus
// complete, Error on failed save. Android error falls back to the
// platform "reject" haptic.

const safe = (p: Promise<void>) => p.catch(() => undefined);

export const haptics = {
	select: () => safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
	longPress: () => safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
	success: () => safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
	error: () =>
		Platform.OS === "android"
			? safe(Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Reject))
			: safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
