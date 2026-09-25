import type { Person } from "./types";

// Mirrors the web ExportVisibleButton + calendar route (which use the `ics`
// package): for every visible person a yearly all-day "<name> birthday", and
// for every visible person with a death date a yearly "<name> Passing Away
// Anniversary". Written by hand to avoid a Node-only dependency in the app.

export const WEB_ORIGIN = "https://family-tree.cyber-man.pl";

export interface IcsOptions {
	treeId: string;
	now?: Date;
	/** Same as the web: the tree page URL. */
	url?: string;
}

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

export function escapeText(s: string): string {
	// RFC 5545 §3.3.11 TEXT: backslash first, then ; and , get a backslash, newlines become \n.
	const BS = String.fromCharCode(92);
	return s
		.split(BS)
		.join(BS + BS)
		.split(";")
		.join(BS + ";")
		.split(",")
		.join(BS + ",")
		.replace(/\r\n|\r|\n/g, BS + "n");
}

/** Folds a content line at 75 octets (RFC 5545 §3.1), never splitting a UTF-8 sequence. */
export function foldLine(line: string): string {
	const out: string[] = [];
	let cur = "";
	let bytes = 0;
	for (const ch of line) {
		const b = utf8Length(ch);
		const limit = out.length === 0 ? 75 : 74;
		if (bytes + b > limit) {
			out.push(cur);
			cur = "";
			bytes = 0;
		}
		cur += ch;
		bytes += b;
	}
	out.push(cur);
	return out.join("\r\n ");
}

function utf8Length(ch: string): number {
	const c = ch.codePointAt(0) ?? 0;
	return c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
}

function stamp(d: Date): string {
	return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

interface IcsEvent {
	uid: string;
	title: string;
	description: string;
	start: { year: number; month: number; day: number };
}

export function buildEvents(persons: Person[]): IcsEvent[] {
	const birthdays: IcsEvent[] = persons
		.filter((p) => p.birth)
		.map((p) => ({
			uid: `${p.id}-birthday@family-tree.cyber-man.pl`,
			title: p.name + " birthday",
			description: "Birthday of " + p.name + " occurs on this day",
			start: p.birth!,
		}));
	const deaths: IcsEvent[] = persons
		.filter((p) => p.death)
		.map((p) => ({
			uid: `${p.id}-passing@family-tree.cyber-man.pl`,
			title: p.name + " Passing Away Anniversary",
			description: "Anniversary of " + p.name + "'s passing away occurs on this day",
			start: p.death!,
		}));
	return [...birthdays, ...deaths];
}

export function buildIcs(persons: Person[], opts: IcsOptions): string {
	const now = opts.now ?? new Date();
	const url = opts.url ?? `${WEB_ORIGIN}/trees/${opts.treeId}`;
	const lines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"CALSCALE:GREGORIAN",
		"PRODID:-//cyber-man.pl//Family Tree mobile//EN",
		"METHOD:PUBLISH",
		"X-WR-CALNAME:Birthdays",
		"X-PUBLISHED-TTL:PT1H",
	];
	for (const e of buildEvents(persons)) {
		lines.push(
			"BEGIN:VEVENT",
			`UID:${e.uid}`,
			`SUMMARY:${escapeText(e.title)}`,
			`DTSTAMP:${stamp(now)}`,
			`DTSTART;VALUE=DATE:${pad(e.start.year, 4)}${pad(e.start.month)}${pad(e.start.day)}`,
			"RRULE:FREQ=YEARLY",
			`URL:${url}`,
			`DESCRIPTION:${escapeText(e.description)}`,
			"X-MICROSOFT-CDO-BUSYSTATUS:FREE",
			"DURATION:P1D",
			"END:VEVENT",
		);
	}
	lines.push("END:VCALENDAR");
	return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function icsFileName(treeName: string): string {
	const base = treeName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-zA-Z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.toLowerCase();
	return `${base || "family-tree"}-dates.ics`;
}
