import { RecordModel } from "pocketbase";
import { Tree, TreeData } from "./Tree";
import { Color, Node as VisualizationNode } from "vis-network/esnext";

export type Gender = "male" | "female";

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

	visualization(y: number, x: number): VisualizationNode {
		const color: Color = {
			background: this.gender === "male" ? "#4A90E2" : "#FFB6C1",
			border: this.gender === "male" ? "#2C6EAA" : "#FF6F91",
			highlight: {
				background: this.gender === "male" ? "#357ABD" : "#FF85A1",
				border: this.gender === "male" ? "#25537B" : "#FF4F75",
			},
			hover: {
				background: this.gender === "male" ? "#73B2FF" : "#FFD1DC",
				border: this.gender === "male" ? "#4A90E2" : "#FF85A1",
			},
		};
		return {
			id: this.id,
			color,
			borderWidth: this.age / 10,
			borderWidthSelected: this.age / 9,
			title: this.name,
			fixed: {
				y: true,
			},
			y,
			x,
			label:
				this.name +
				"\n\n" +
				(this.age ? this.age + " years old" : "") +
				"\n" +
				(this.birthDate ? `★ ${this.birthDate.toLocaleDateString()}` : "") +
				"\n" +
				(this.deathDate ? `† ${this.deathDate.toLocaleDateString()}` : ""),
		};
	}

	constructor(data: NodeData | RecordModel) {
		this.id = data.id;
		this.created = new Date(data.created);
		this.updated = new Date(data.updated);

		this.name = data.name;
		this.birthDate = new Date(data.birthDate);
		this.deathDate = data.deathDate ? new Date(data.deathDate) : null;
		this.pictureUrl = data.picture;
		this.treeId = data.tree;
		this.gender = data.gender;

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
			birthDate: this.birthDate.toISOString(),
			deathDate: this.deathDate?.toISOString(),
			picture: this.pictureUrl,
			tree: this.treeId,
			gender: this.gender,

			expand: {
				tree: this.tree?.serialize(),
			},
		};
	}
}
