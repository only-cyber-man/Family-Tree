import { useCallback, useEffect, useMemo } from "react";
import { Linking } from "react-native";
import { cancelReminders, planFor, requestPermission, scheduleReminders } from "../services/notifications";
import { epochGuard } from "../store/epoch";
import { useSession } from "../store/session";
import { useSettings } from "../store/settings";
import { toast } from "../store/toast";
import { useTree } from "../store/tree";

/** Opt in: asks for permission (only here, never at launch) and turns reminders on. */
export function useEnableReminders() {
	const setReminders = useSettings((s) => s.setReminders);
	return useCallback(async (): Promise<boolean> => {
		const ok = await requestPermission().catch(() => false);
		if (ok) {
			setReminders({ enabled: true });
			toast("Reminders are on. They stay on this phone.", "success");
		} else {
			setReminders({ enabled: false });
			toast("Notifications are off for Family Tree.", "error", { label: "Settings", onPress: () => Linking.openSettings() });
		}
		return ok;
	}, [setReminders]);
}

/** Re-schedules local reminders whenever the tree or the preferences change. */
export function useReminderSync() {
	const full = useTree((s) => s.full);
	const reminders = useSettings((s) => s.reminders);
	const userId = useSession((s) => s.user?.id);
	useEffect(() => {
		const valid = epochGuard();
		const id = setTimeout(() => {
			if (!reminders.enabled || !full || !userId) {
				if (!reminders.enabled) cancelReminders().catch(() => undefined);
				return;
			}
			// Stops (and cancels again) if the account changes mid-loop. Reminder
			// ids are deterministic, so an overlapping newer run simply overwrites.
			scheduleReminders(full, reminders, userId, valid).catch(() => undefined);
		}, 800);
		return () => clearTimeout(id);
	}, [full, reminders, userId]);
}

/** Event keys that have a reminder in the current (capped) plan. */
export function useScheduledEventKeys(): Set<string> {
	const full = useTree((s) => s.full);
	const reminders = useSettings((s) => s.reminders);
	return useMemo(() => {
		if (!full || !reminders.enabled) return new Set<string>();
		return new Set(planFor(full, reminders).map((r) => r.eventKey));
	}, [full, reminders]);
}
