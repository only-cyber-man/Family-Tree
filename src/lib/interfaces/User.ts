export interface UserData {
	id: string;
	username: string;
	email: string;
	name: string;
	avatar?: string;
	created: string;
	updated: string;
}

export class User {
	public readonly id: string;
	public readonly created: Date;
	public readonly updated: Date;
	public username: string;
	public email: string;
	public name: string;
	public avatar?: string;

	constructor(data: UserData) {
		this.id = data.id;
		this.created = new Date(data.created);
		this.updated = new Date(data.updated);
		this.username = data.username;
		this.email = data.email;
		this.name = data.name;
		this.avatar = data.avatar;
	}

	public serialize(): UserData {
		return {
			id: this.id,
			username: this.username,
			email: this.email,
			name: this.name,
			avatar: this.avatar,
			created: this.created.toISOString(),
			updated: this.updated.toISOString(),
		};
	}
}
