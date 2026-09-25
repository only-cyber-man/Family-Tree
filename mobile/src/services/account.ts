import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { bumpEpoch } from "../store/epoch";
import { useSettings } from "../store/settings";
import { TREE_CACHE_PREFIX, useTree } from "../store/tree";
import { useTrees } from "../store/trees";
import { deleteExportedIcs } from "./exportIcs";
import { cancelReminders } from "./notifications";

/**
 * Removes everything the previous account left on this device: scheduled
 * and already delivered reminders (and the reminders opt-in), cached trees,
 * the active tree and "This is me" choices. Used on sign-out,
 * on "Use a different account" and when a different user signs in.
 */
export async function wipeAccountData(): Promise<void> {
	// First: invalidates every in-flight load, refresh and reminder-scheduling
	// loop that started for the previous account.
	bumpEpoch();
	await cancelReminders().catch(() => undefined);
	// Delivered reminders would deep-link the next user into this account's tree.
	await Notifications.dismissAllNotificationsAsync().catch(() => undefined);
	useTree.getState().clear();
	useTrees.getState().reset();
	const s = useSettings.getState();
	s.setActiveTree(null);
	s.clearAccount();
	try {
		const keys = await AsyncStorage.getAllKeys();
		await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(TREE_CACHE_PREFIX) || k === "ft.trees"));
	} catch {
		// ignore
	}
	deleteExportedIcs();
}
