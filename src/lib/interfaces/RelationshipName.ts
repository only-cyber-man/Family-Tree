import { RecordModel } from "pocketbase";

type RelationshipGroup = "BIOLOGICAL" | "IRRELEVANT" | "IN-LAW" | "CHURCH";

export interface RelationshipNameData {
	id: string;
	created: string;
	updated: string;

	name: string;
	group: RelationshipGroup;
}

export class RelationshipName {
	public readonly id: string;
	public readonly created: Date;
	public readonly updated: Date;

	public name: string;
	public group: RelationshipGroup;

	constructor(data: RelationshipNameData | RecordModel) {
		this.id = data.id;
		this.created = new Date(data.created);
		this.updated = new Date(data.updated);

		this.name = data.name;
		this.group = data.group;
	}

	public serialize(): RelationshipNameData {
		return {
			id: this.id,
			created: this.created.toISOString(),
			updated: this.updated.toISOString(),

			name: this.name,
			group: this.group,
		};
	}
}
