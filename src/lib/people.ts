import { formatDay, Node } from "./interfaces";
import { pb } from "./data";
import type { Dict } from "@/i18n";

export const initials = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

export const formatDate = (date: Date, t: Dict) =>
	date.toLocaleDateString(t.dateLocale, {
		day: "numeric",
		month: "short",
		year: "numeric",
	});

/** Value for an <input type="date">. */
export const toDateInput = (date: Date | null) =>
	!date || isNaN(date.getTime()) ? "" : formatDay(date);

export const isDeceased = (node: Node) => node.deathDate !== null;

/** "1948 · 78" or "1921 – †1998 · 77". */
export const yearsText = (node: Node) => {
	const born = node.birthDate.getFullYear();
	if (node.deathDate) {
		return `${born} – †${node.deathDate.getFullYear()} · ${node.age}`;
	}
	return `${born} · ${node.age}`;
};

/** "78 years old" / "77 at death"; Polish: "78 lat" / "zmarł w wieku 77 lat". */
export const ageText = (node: Node, t: Dict) =>
	t.person.age(node.age, node.gender, node.deathDate !== null);

export const genderColorVar = (node: Pick<Node, "gender">) =>
	node.gender === "male" ? "var(--male-border)" : "var(--female-border)";

/** Thumbnail URL for a node picture stored on the ft_nodes record. */
export const pictureUrl = (node: Node, thumb = "100x100") => {
	if (!node.pictureUrl) {
		return null;
	}
	const base = pb.baseURL.replace(/\/$/, "");
	return `${base}/api/files/ft_nodes/${node.id}/${encodeURIComponent(
		node.pictureUrl
	)}?thumb=${thumb}`;
};

export const sortByName = (a: Node, b: Node) => a.name.localeCompare(b.name);
