import { RecordModel } from "pocketbase";
import type { Node as VisualizationNode } from "@neo4j-nvl/base";
import { Tree, TreeData } from "./Tree";
import { NodeElement } from "./NodeElement";

export interface NodeData {
	id: string;
	created: string;
	updated: string;

	name: string;
	birthDate?: string;
	deathDate?: string;
	picture?: string;
	tree: string;

	expand?: {
		tree?: TreeData;
	};
}

export class Node {
	public readonly id: string;
	public readonly created: Date;
	public readonly updated: Date;

	public name: string;
	public birthDate: Date | null;
	public deathDate: Date | null;
	public pictureUrl?: string;
	public treeId: string;

	public tree?: Tree;

	get age(): number | null {
		if (!this.birthDate) {
			return null;
		}
		const deathDate = this.deathDate || new Date();
		const fullYearAge = deathDate.getFullYear() - this.birthDate.getFullYear();
		const monthAge = deathDate.getMonth() - this.birthDate.getMonth();
		const dayAge = deathDate.getDate() - this.birthDate.getDate();
		return (
			fullYearAge - (monthAge < 0 || (monthAge === 0 && dayAge < 0) ? 1 : 0)
		);
	}

	get visualization(): VisualizationNode {
		const html = document.createElement("div");
		html.innerText = this.name;
		return {
			id: this.id,
			// html: NodeElement({
			// 	node: this,
			// }) as unknown as HTMLElement,
			html,
		};
	}

	constructor(data: NodeData | RecordModel) {
		this.id = data.id;
		this.created = new Date(data.created);
		this.updated = new Date(data.updated);

		this.name = data.name;
		this.birthDate = data.birthDate ? new Date(data.birthDate) : null;
		this.deathDate = data.deathDate ? new Date(data.deathDate) : null;
		this.pictureUrl = data.picture;
		this.treeId = data.tree;

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
			birthDate: this.birthDate?.toISOString(),
			deathDate: this.deathDate?.toISOString(),
			picture: this.pictureUrl,
			tree: this.treeId,

			expand: {
				tree: this.tree?.serialize(),
			},
		};
	}
}
