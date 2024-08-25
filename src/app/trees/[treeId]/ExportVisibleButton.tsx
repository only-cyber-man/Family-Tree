"use client";

import * as ics from "ics";
import { useTree } from "@/lib/hooks/useTree";

export const ExportVisibleButton = () => {
	const { tree } = useTree();

	if (!tree) {
		return null;
	}

	const getLink = () => {
		const birthDayEvents: ics.EventAttributes[] = tree.nodes
			.filter((n) => n.isVisible)
			.map((node) => ({
				duration: { days: 1 },
				start: [
					node.birthDate.getFullYear(),
					node.birthDate.getMonth() + 1,
					node.birthDate.getDate(),
				],
				recurrenceRule: "FREQ=YEARLY",
				title: node.name + " birthday",
				description: "Birthday of " + node.name + " occurs on this day",
				url: window.location.href,
				calName: "Birthdays",
				busyStatus: "FREE",
			}));
		const deathDayEvents: ics.EventAttributes[] = tree.nodes
			.filter((n) => n.isVisible && n.deathDate !== null)
			.map((node) => ({
				duration: { days: 1 },
				start: [
					node.deathDate!.getFullYear(),
					node.deathDate!.getMonth() + 1,
					node.deathDate!.getDate(),
				],
				recurrenceRule: "FREQ=YEARLY",
				title: node.name + " Passing Away Anniversary",
				description:
					"Anniversary of " + node.name + "'s passing away occurs on this day",
				url: window.location.href,
				calName: "Passing Away Anniversaries",
				busyStatus: "FREE",
			}));

		return (
			`/trees/${tree.object.id}/calendar?data=` +
			Buffer.from(
				JSON.stringify([...birthDayEvents, ...deathDayEvents])
			).toString("base64")
		);
	};

	return (
		<a
			className="button is-warning"
			style={{ marginBottom: "1rem", marginRight: "1rem" }}
			href={getLink()}
		>
			Export Visible
		</a>
	);
};
