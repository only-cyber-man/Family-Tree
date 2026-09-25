import { addDays, daysBetween, formatDayMonth, nextOccurrence, toJsDate } from "./dates";
import { en, type Dict } from "../i18n/en";
import { firstName } from "./format";
import type { CalendarDate, Gender, Person } from "./types";

export type DateKind = "birthday" | "remembrance";

export interface DateEvent {
	key: string;
	kind: DateKind;
	personId: string;
	name: string;
	gender: Gender;
	date: CalendarDate;
	daysUntil: number;
	/** Age they turn (birthday) or years since death (remembrance). */
	years: number;
	isRound: boolean;
}

/** Round ages get a second reminder: 18, and every 5 years from 50. */
export function isRoundAge(age: number): boolean {
	return age === 18 || (age >= 50 && age % 5 === 0);
}

/**
 * Birthdays of the living and remembrance days of the deceased within
 * `horizonDays` from today (today included), nearest first.
 */
export function upcomingEvents(persons: Person[], today: CalendarDate, horizonDays = 366): DateEvent[] {
	const out: DateEvent[] = [];
	for (const p of persons) {
		if (p.birth && !p.death) {
			const date = nextOccurrence(p.birth, today);
			const daysUntil = daysBetween(today, date);
			const years = date.year - p.birth.year;
			if (daysUntil <= horizonDays && years > 0) {
				out.push({ key: `b:${p.id}:${date.year}`, kind: "birthday", personId: p.id, name: p.name, gender: p.gender, date, daysUntil, years, isRound: isRoundAge(years) });
			}
		}
		if (p.death) {
			const date = nextOccurrence(p.death, today);
			const daysUntil = daysBetween(today, date);
			const years = date.year - p.death.year;
			if (daysUntil <= horizonDays && years > 0) {
				out.push({ key: `r:${p.id}:${date.year}`, kind: "remembrance", personId: p.id, name: p.name, gender: p.gender, date, daysUntil, years, isRound: false });
			}
		}
	}
	return out.sort((a, b) => a.daysUntil - b.daysUntil || a.name.localeCompare(b.name));
}

/** "Maria turns 75", "† Stanisław, 28 years" */
export function eventTitle(e: DateEvent, L: Dict = en): string {
	const first = firstName(e.name);
	return e.kind === "birthday" ? L.events.birthdayTitle(first, e.years) : L.events.remembranceTitle(first, e.years);
}

/** "Birthday · in 8 days · round age", "Remembrance · 15 Oct" */
export function eventSubtitle(e: DateEvent, L: Dict = en): string {
	const label = e.kind === "birthday" ? L.events.birthday : L.events.remembrance;
	const when =
		e.daysUntil === 0 ? L.time.today : e.daysUntil === 1 ? L.time.tomorrow : e.daysUntil <= 14 ? L.time.inDays(e.daysUntil) : formatDayMonth(e.date, L);
	return [label, when, e.isRound ? L.events.roundAge : null].filter(Boolean).join(" · ");
}

export interface MonthGroup {
	key: string;
	label: string;
	events: DateEvent[];
}

export function groupByMonth(events: DateEvent[], today: CalendarDate, L: Dict = en): MonthGroup[] {
	const groups: MonthGroup[] = [];
	for (const e of events) {
		const key = `${e.date.year}-${e.date.month}`;
		let g = groups[groups.length - 1];
		if (!g || g.key !== key) {
			const label = L.dateNames.monthsNom[e.date.month - 1] + (e.date.year !== today.year ? ` ${e.date.year}` : "");
			g = { key, label, events: [] };
			groups.push(g);
		}
		g.events.push(e);
	}
	return groups;
}

export interface ReminderPrefs {
	birthdays: boolean;
	remembrance: boolean;
	roundEarly: boolean;
}

export interface PlannedReminder {
	/** Stable id: event key + variant. */
	id: string;
	eventKey: string;
	personId: string;
	fireAt: Date;
	title: string;
	body: string;
}

export const REMINDER_HOUR = 9;
export const MAX_SCHEDULED = 60;

/**
 * Local reminders per the hand-off: birthdays 09:00 the day before,
 * remembrance 09:00 on the day, round ages a second reminder 7 days before.
 * Nearest first, capped at 60 (iOS keeps at most 64).
 */
export function planReminders(events: DateEvent[], prefs: ReminderPrefs, now: Date, cap = MAX_SCHEDULED, L: Dict = en): PlannedReminder[] {
	const E = L.events;
	const out: PlannedReminder[] = [];
	for (const e of events) {
		const first = firstName(e.name);
		if (e.kind === "birthday" && prefs.birthdays) {
			out.push({
				id: `${e.key}:eve`,
				eventKey: e.key,
				personId: e.personId,
				fireAt: toJsDate(addDays(e.date, -1), REMINDER_HOUR),
				title: E.reminderEve(first, e.years),
				body: e.isRound ? E.reminderEveRoundBody(first) : `${e.name} · ${formatDayMonth(e.date, L)}`,
			});
			if (e.isRound && prefs.roundEarly) {
				out.push({
					id: `${e.key}:week`,
					eventKey: e.key,
					personId: e.personId,
					fireAt: toJsDate(addDays(e.date, -7), REMINDER_HOUR),
					title: E.reminderWeek(first, e.years),
					body: E.reminderWeekBody(formatDayMonth(e.date, L)),
				});
			}
		}
		if (e.kind === "remembrance" && prefs.remembrance) {
			out.push({
				id: `${e.key}:day`,
				eventKey: e.key,
				personId: e.personId,
				fireAt: toJsDate(e.date, REMINDER_HOUR),
				title: E.reminderRemembrance(e.name, e.years),
				body: E.reminderRemembranceBody(formatDayMonth(e.date, L)),
			});
		}
	}
	return out
		.filter((r) => r.fireAt.getTime() > now.getTime())
		.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime())
		.slice(0, cap);
}
