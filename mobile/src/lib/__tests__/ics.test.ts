import { buildIcs, escapeText, foldLine, icsFileName } from "../ics";
import { graph } from "./fixtures";

describe("ics", () => {
	const raw = buildIcs(graph.persons.filter((p) => ["stan", "anna"].includes(p.id)), {
		treeId: "t1",
		now: new Date(Date.UTC(2026, 8, 25, 12, 0, 0)),
	});

	it("produces a valid calendar with the web's events", () => {
		const ics = raw.replace(/\r\n /g, "");
		expect(raw.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
		expect(raw.endsWith("END:VCALENDAR\r\n")).toBe(true);
		expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
		expect(ics).toContain("SUMMARY:Anna Wiśniewska birthday");
		expect(ics).toContain("SUMMARY:Stanisław Kowalski Passing Away Anniversary");
		expect(ics).toContain("DESCRIPTION:Anniversary of Stanisław Kowalski's passing away occurs on this day");
		expect(ics).toContain("DTSTART;VALUE=DATE:19760522");
		expect(ics).toContain("DTSTART;VALUE=DATE:19981015");
		expect(ics).toContain("RRULE:FREQ=YEARLY");
		expect(ics).toContain("DTSTAMP:20260925T120000Z");
		expect(ics).toContain("URL:https://family-tree.cyber-man.pl/trees/t1");
		expect(ics).toContain("X-WR-CALNAME:Birthdays");
	});

	it("escapes and folds per RFC 5545", () => {
		const BS = String.fromCharCode(92);
		// Input: a , b ; c \ d <newline> e <CRLF> f
		const input = "a,b;c" + BS + "d\ne\r\nf";
		const expected = "a" + BS + ",b" + BS + ";c" + BS + BS + "d" + BS + "ne" + BS + "nf";
		expect(escapeText(input)).toBe(expected);
		expect(escapeText("Kowalski; Jan")).toBe(String.raw`Kowalski\; Jan`);
		expect(escapeText("Nowak, Anna")).toBe(String.raw`Nowak\, Anna`);
		expect(escapeText(";").length).toBe(2);
		const long = "DESCRIPTION:" + "ż".repeat(60);
		const folded = foldLine(long);
		for (const part of folded.split("\r\n")) expect(Buffer.byteLength(part, "utf8")).toBeLessThanOrEqual(75);
		expect(folded.replace(/\r\n /g, "")).toBe(long);
	});

	it("names the file after the tree", () => {
		expect(icsFileName("Nowak – Wiśniewski")).toBe("nowak-wisniewski-dates.ics");
	});
});
