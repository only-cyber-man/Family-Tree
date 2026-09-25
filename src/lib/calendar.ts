import * as ics from "ics";
import { Node } from "./interfaces";
import type { Dict } from "@/i18n";

const dateArray = (date: Date): ics.DateArray => [
	date.getFullYear(),
	date.getMonth() + 1,
	date.getDate(),
];

/**
 * One .ics with a yearly birthday for each living person and a yearly
 * remembrance day for each person who has passed, in the UI language.
 */
export const buildCalendar = (nodes: Node[], url: string, t: Dict) => {
	const events: ics.EventAttributes[] = nodes.map((node) =>
		node.deathDate
			? {
					start: dateArray(node.deathDate),
					duration: { days: 1 },
					recurrenceRule: "FREQ=YEARLY",
					title: t.calendar.remembranceTitle(node.name),
					description: t.calendar.remembranceDescription(node.name, node.birthDate.getFullYear()),
					url,
					calName: t.calendar.calName,
					busyStatus: "FREE",
			  }
			: {
					start: dateArray(node.birthDate),
					duration: { days: 1 },
					recurrenceRule: "FREQ=YEARLY",
					title: t.calendar.birthdayTitle(node.name),
					description: t.calendar.birthdayDescription(
						node.name,
						node.birthDate.getFullYear(),
						node.gender
					),
					url,
					calName: t.calendar.calName,
					busyStatus: "FREE",
			  }
	);
	const { error, value } = ics.createEvents(events);
	if (error || !value) {
		throw error ?? new Error(t.tree.calendarFailed);
	}
	return value;
};

export const slugify = (text: string) =>
	text
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/ł/g, "l")
		.replace(/Ł/g, "L")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "") || "family-tree";

export const downloadText = (filename: string, text: string, type: string) => {
	const blob = new Blob([text], { type });
	const href = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = href;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(href), 1000);
};
