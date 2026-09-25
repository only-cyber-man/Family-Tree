import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { buildIcs, icsFileName } from "../lib/ics";
import type { Person } from "../lib/types";

/** Deletes exported calendars from the cache (sign-out: they contain the tree's names and dates). */
export function deleteExportedIcs() {
	try {
		for (const entry of new Directory(Paths.cache).list()) {
			if (entry instanceof File && entry.name.endsWith(".ics")) entry.delete();
		}
	} catch {
		// best effort
	}
}

/** Writes the .ics for the visible people and opens the share sheet. */
export async function shareIcs(treeId: string, treeName: string, persons: Person[]): Promise<void> {
	const file = new File(Paths.cache, icsFileName(treeName));
	if (file.exists) file.delete();
	file.create();
	file.write(buildIcs(persons, { treeId }));
	if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing is not available on this device.");
	await Sharing.shareAsync(file.uri, { mimeType: "text/calendar", UTI: "public.calendar-event", dialogTitle: `${treeName} dates` });
}
