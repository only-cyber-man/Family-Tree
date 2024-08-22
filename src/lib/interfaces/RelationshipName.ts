import { RecordModel } from "pocketbase";

type RelationshipGroup = "BIOLOGICAL" | "IRRELEVANT" | "IN-LAW" | "CHURCH";

export interface RelationshipNameData {
	id: string;
	created: string;
	updated: string;

	name: string;
	group: RelationshipGroup;
	isBidirectional: boolean;
}

export class RelationshipName {
	static groupToLabel(group?: RelationshipGroup): {
		color: string;
		fontSize: number;
		width: number;
	} {
		switch (group) {
			case "BIOLOGICAL":
				return {
					color: "green",
					fontSize: 10,
					width: 8,
				};
			case "IRRELEVANT":
				return {
					color: "gray",
					fontSize: 6,
					width: 2,
				};
			case "IN-LAW":
				return {
					color: "darkGreen",
					fontSize: 12,
					width: 12,
				};
			case "CHURCH":
				return {
					color: "gold",
					fontSize: 14,
					width: 14,
				};
			default:
				throw new Error(`Unknown group: ${group}`);
		}
	}

	public readonly id: string;
	public readonly created: Date;
	public readonly updated: Date;

	public name: string;
	public group: RelationshipGroup;
	public isBidirectional: boolean;

	constructor(data: RelationshipNameData | RecordModel) {
		this.id = data.id;
		this.created = new Date(data.created);
		this.updated = new Date(data.updated);

		this.name = data.name;
		this.group = data.group;
		this.isBidirectional = data.isBidirectional;
	}

	public serialize(): RelationshipNameData {
		return {
			id: this.id,
			created: this.created.toISOString(),
			updated: this.updated.toISOString(),

			name: this.name,
			group: this.group,
			isBidirectional: this.isBidirectional,
		};
	}
}
