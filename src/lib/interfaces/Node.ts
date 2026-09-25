import { RecordModel } from "pocketbase";
import { Tree, TreeData } from "./Tree";

export type Gender = "male" | "female";

/**
 * Birth and death dates are calendar days, stored by PocketBase as UTC
 * midnight ("1950-05-03 00:00:00.000Z"). Reading them as an instant would show
 * the previous day west of UTC, so the day part is taken as a local date.
 */
export const parseDay = (value: string): Date => {
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
	return match ? new Date(+match[1], +match[2] - 1, +match[3]) : new Date(value);
};

/** Inverse of parseDay: "YYYY-MM-DD" for the local calendar day. */
export const formatDay = (date: Date): string => {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export interface NodeData {
	id: string;
	created: string;
	updated: string;

	name: string;
	birthDate: string;
	deathDate?: string;
	picture?: string;
	tree: string;
	gender: Gender;
	/** Free-text note; PocketBase returns "" when empty. */
	note?: string;
	/** ft_users id of the account this person is ("" when not linked). */
	user?: string;

	expand?: {
		tree?: TreeData;
	};
}

export class Node {
	public readonly id: string;
	public readonly created: Date;
	public readonly updated: Date;

	public name: string;
	public birthDate: Date;
	public deathDate: Date | null;
	public pictureUrl?: string;
	public treeId: string;
	public gender: Gender;
	public note: string;
	public userId: string | null;

	public tree?: Tree;


	get age(): number {
		const deathDate = this.deathDate || new Date();
		const fullYearAge = deathDate.getFullYear() - this.birthDate.getFullYear();
		const monthAge = deathDate.getMonth() - this.birthDate.getMonth();
		const dayAge = deathDate.getDate() - this.birthDate.getDate();
		return (
			fullYearAge - (monthAge < 0 || (monthAge === 0 && dayAge < 0) ? 1 : 0)
		);
	}


	constructor(data: NodeData | RecordModel) {
		this.id = data.id;
		this.created = new Date(data.created);
		this.updated = new Date(data.updated);

		this.name = data.name;
		this.birthDate = parseDay(data.birthDate);
		this.deathDate = data.deathDate ? parseDay(data.deathDate) : null;
		this.pictureUrl = data.picture;
		this.treeId = data.tree;
		this.gender = data.gender;
		this.note = data.note ?? "";
		this.userId = data.user || null;

		if (data.expand) {
			if (data.expand.tree) {
				this.tree = new Tree(data.expand.tree);
			}
		}
	}


	public serialize(): NodeData {
		return {
			id: this.id,
			created: this.created.toISOString(),
			updated: this.updated.toISOString(),

			name: this.name,
			birthDate: formatDay(this.birthDate),
			deathDate: this.deathDate ? formatDay(this.deathDate) : undefined,
			picture: this.pictureUrl,
			tree: this.treeId,
			gender: this.gender,
			note: this.note,
			user: this.userId ?? "",

			expand: {
				tree: this.tree?.serialize(),
			},
		};
	}
}
