import type { Person } from "./types";

// Diacritic-insensitive search that keeps a 1:1 index mapping to the original
// name, so the matched part can be highlighted ("Ann" in "Anna Wiśniewska").

const SPECIAL: Record<string, string> = { ł: "l", Ł: "l", ø: "o", Ø: "o", ß: "s", đ: "d", Đ: "d", æ: "a", Æ: "a", œ: "o", Œ: "o" };

export function foldChar(c: string): string {
	if (SPECIAL[c]) return SPECIAL[c];
	const base = c.normalize("NFD")[0] ?? c;
	return base.toLowerCase();
}

export function fold(s: string): string {
	return Array.from(s).map(foldChar).join("");
}

export interface SearchMatch {
	person: Person;
	/** [start, end) in the original name, by UTF-16 index. */
	range: [number, number];
}

export function searchPersons(persons: Person[], query: string, limit = 50): SearchMatch[] {
	const q = fold(query.trim());
	if (!q) return [];
	const results: (SearchMatch & { score: number })[] = [];
	for (const p of persons) {
		const chars = Array.from(p.name);
		const folded = chars.map(foldChar).join("");
		const idx = folded.indexOf(q);
		if (idx < 0) continue;
		// Map code point index back to UTF-16 index.
		const start = chars.slice(0, idx).join("").length;
		const end = start + chars.slice(idx, idx + Array.from(q).length).join("").length;
		const wordStart = idx === 0 || folded[idx - 1] === " " || folded[idx - 1] === "-";
		results.push({ person: p, range: [start, end], score: (idx === 0 ? 0 : wordStart ? 1 : 2) });
	}
	return results
		.sort((a, b) => a.score - b.score || a.person.name.localeCompare(b.person.name))
		.slice(0, limit)
		.map(({ person, range }) => ({ person, range }));
}
