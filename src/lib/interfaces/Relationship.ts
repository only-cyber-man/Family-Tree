import { RecordModel } from "pocketbase";
import { Node, NodeData } from "./Node";
import { RelationshipName, RelationshipNameData } from "./RelationshipName";
import { Edge } from "vis-network/esnext";

export interface RelationshipData {
	id: string;
	created: string;
	updated: string;

	sourceNode: string;
	targetNode: string;
	relationshipName: string;
	tree: string;

	expand?: {
		sourceNode?: NodeData;
		targetNode?: NodeData;
		relationshipName?: RelationshipNameData;
		tree?: RelationshipData;
	};
}

export type CreateRelationshipData = Omit<
	RelationshipData,
	"id" | "created" | "updated"
>;

export class Relationship {
	public readonly id: string;
	public readonly created: Date;
	public readonly updated: Date;

	public sourceNodeId: string;
	public targetNodeId: string;
	public relationshipId: string;
	public treeId: string;

	public sourceNode?: Node;
	public targetNode?: Node;
	public relationshipName?: RelationshipName;
	public tree?: Relationship;

	public isVisible: boolean = true;

	get isBidirectional(): boolean {
		return this.relationshipName?.isBidirectional ?? false;
	}

	visualization(): Edge {
		let label = this.relationshipName?.name;
		if (label && this.isBidirectional) {
			label = label.replaceAll("_TO", "").replaceAll("IS_", "");
		}

		return {
			from: this.sourceNodeId,
			to: this.targetNodeId,
			width: RelationshipName.groupToLabel(this.relationshipName?.group).width,
			color: RelationshipName.groupToLabel(this.relationshipName?.group).color,
			font: {
				size: RelationshipName.groupToLabel(this.relationshipName?.group)
					.fontSize,
			},
			label,
			arrows: {
				to: {
					enabled: !this.isBidirectional,
				},
			},
		};
	}

	constructor(data: RelationshipData | RecordModel) {
		this.id = data.id;
		this.created = new Date(data.created);
		this.updated = new Date(data.updated);

		this.sourceNodeId = data.sourceNode;
		this.targetNodeId = data.targetNode;
		this.relationshipId = data.relationshipName;
		this.treeId = data.tree;

		if (data.expand) {
			if (data.expand.sourceNode) {
				this.sourceNode = new Node(data.expand.sourceNode);
			}
			if (data.expand.targetNode) {
				this.targetNode = new Node(data.expand.targetNode);
			}
			if (data.expand.relationshipName) {
				this.relationshipName = new RelationshipName(
					data.expand.relationshipName
				);
			}
			if (data.expand.tree) {
				this.tree = new Relationship(data.expand.tree);
			}
		}
	}

	public setVisible(visible: boolean): void {
		this.isVisible = visible;
	}

	public serialize(): RelationshipData {
		return {
			id: this.id,
			created: this.created.toISOString(),
			updated: this.updated.toISOString(),

			sourceNode: this.sourceNodeId,
			targetNode: this.targetNodeId,
			relationshipName: this.relationshipId,
			tree: this.treeId,

			expand: {
				sourceNode: this.sourceNode?.serialize(),
				targetNode: this.targetNode?.serialize(),
				relationshipName: this.relationshipName?.serialize(),
				tree: this.tree?.serialize(),
			},
		};
	}
}
