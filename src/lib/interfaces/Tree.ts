import { RecordModel } from "pocketbase";
import { User, UserData } from "./User";

export interface TreeData {
	id: string;
	created: string;
	updated: string;

	name: string;
	creator: string;
	invited: string[];

	expand?: {
		creator?: UserData;
		invited?: UserData[];
	};
}

export class Tree {
	public readonly id: string;
	public readonly created: Date;
	public readonly updated: Date;

	public name: string;
	public creatorId: string;
	public invitedIds: string[];

	public creator?: User;
	public invited?: User[];

	constructor(data: TreeData | RecordModel) {
		this.id = data.id;
		this.created = new Date(data.created);
		this.updated = new Date(data.updated);

		this.name = data.name;
		this.creatorId = data.creator;
		this.invitedIds = data.invited;

		if (data.expand) {
			if (data.expand.creator) {
				this.creator = new User(data.expand.creator);
			}
			if (data.expand.invited) {
				this.invited = JSON.parse(data.expand.invited);
			}
		}
	}

	public serialize(): TreeData {
		return {
			id: this.id,
			created: this.created.toISOString(),
			updated: this.updated.toISOString(),

			name: this.name,
			creator: this.creatorId,
			invited: this.invitedIds,

			expand: {
				creator: this.creator?.serialize(),
				invited: this.invited?.map((user) => user.serialize()),
			},
		};
	}
}
