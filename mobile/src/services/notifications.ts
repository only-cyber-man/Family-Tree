import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { todayDate } from "../lib/dates";
import { getT } from "../i18n";
import { buildGraph } from "../lib/graph";
import { createLatestRunner } from "../lib/serial";
import type { FullTree } from "../lib/types";
import { planReminders, upcomingEvents, type PlannedReminder, type ReminderPrefs } from "../lib/upcoming";

// Local reminders only: there is no notification backend. Everything is
// scheduled on-device from the birth and death dates in the tree.

export const CHANNEL_ID = "reminders";
const KIND = "ft-reminder";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

export async function ensureChannel() {
	if (Platform.OS !== "android") return;
	await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
		name: getT().toastsReminders.channel,
		importance: Notifications.AndroidImportance.DEFAULT,
		lightColor: "#2F5D46",
	});
}

export async function hasPermission(): Promise<boolean> {
	const s = await Notifications.getPermissionsAsync();
	return s.granted || s.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

/** Asks only when the user opts in (onboarding 2 or the first "Remind me"). */
export async function requestPermission(): Promise<boolean> {
	await ensureChannel();
	if (await hasPermission()) return true;
	const s = await Notifications.requestPermissionsAsync();
	return s.granted;
}

export function planFor(full: FullTree, prefs: ReminderPrefs, now = new Date()): PlannedReminder[] {
	const g = buildGraph(full);
	// Reminder texts are written in the app language at scheduling time; a
	// language change re-schedules (see useReminderSync).
	return planReminders(upcomingEvents(g.persons, todayDate(now)), prefs, now, undefined, getT());
}

export function deepLink(treeId: string, personId: string) {
	return `familytree://tree/${treeId}/person/${personId}`;
}

export async function cancelReminders() {
	const scheduled = await Notifications.getAllScheduledNotificationsAsync();
	await Promise.all(
		scheduled.filter((n) => n.content.data?.kind === KIND).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
	);
}

const runLatest = createLatestRunner();

/**
 * Replaces all scheduled reminders with the plan for this tree. Runs are
 * serialized and a newer call supersedes an older one (e.g. switching from
 * tree A to tree B), so an older run never keeps scheduling after it.
 * `isCurrent` is the account epoch: when it flips, the run cancels everything.
 */
export function scheduleReminders(full: FullTree, prefs: ReminderPrefs, userId: string, isCurrent: () => boolean = () => true): Promise<number> {
	return runLatest((isLatest) => scheduleNow(full, prefs, userId, isCurrent, isLatest), 0);
}

async function scheduleNow(full: FullTree, prefs: ReminderPrefs, userId: string, isCurrent: () => boolean, isLatest: () => boolean): Promise<number> {
	await cancelReminders();
	if (!isCurrent() || !isLatest() || !(await hasPermission())) return 0;
	await ensureChannel();
	const plan = planFor(full, prefs);
	let n = 0;
	for (const r of plan) {
		// Stop as soon as the account changed (sign-out / switch) or a newer run was requested.
		if (!isCurrent() || !isLatest()) break;
		await Notifications.scheduleNotificationAsync({
			identifier: r.id,
			content: {
				title: r.title,
				body: r.body,
				// userId: a tap is only honoured for the account that scheduled it.
				data: { kind: KIND, url: deepLink(full.tree.id, r.personId), treeId: full.tree.id, personId: r.personId, userId },
			},
			trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.fireAt, channelId: CHANNEL_ID },
		});
		n++;
	}
	// A wipe may have cancelled before our last schedule call landed: cancel again.
	if (!isCurrent()) {
		await cancelReminders();
		return 0;
	}
	return n;
}
