import * as ics from "ics";
import { Node } from "./interfaces";

const dateArray = (date: Date): ics.DateArray => [
	date.getFullYear(),
	date.getMonth() + 1,
	date.getDate(),
];

/**
 * One .ics with a yearly birthday for each living person and a yearly
 * remembrance day for each person who has passed.
 */
export const buildCalendar = (nodes: Node[], url: string) => {
	const events: ics.EventAttributes[] = nodes.map((node) =>
		node.deathDate
			? {
					start: dateArray(node.deathDate),
					duration: { days: 1 },
					recurrenceRule: "FREQ=YEARLY",
					title: `† ${node.name}, remembrance`,
					description: `Anniversary of ${node.name}'s passing (born ${node.birthDate.getFullYear()}).`,
					url,
					calName: "Family Tree",
					busyStatus: "FREE",
			  }
			: {
					start: dateArray(node.birthDate),
					duration: { days: 1 },
					recurrenceRule: "FREQ=YEARLY",
					title: `${node.name}'s birthday`,
					description: `${node.name} was born in ${node.birthDate.getFullYear()}.`,
					url,
					calName: "Family Tree",
					busyStatus: "FREE",
			  }
	);
	const { error, value } = ics.createEvents(events);
	if (error || !value) {
		throw error ?? new Error("Could not build the calendar");
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
