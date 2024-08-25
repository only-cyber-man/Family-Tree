"use client";

import React, { createContext, useState, useContext } from "react";
import {
	CreateRelationshipData,
	Gender,
	Node,
	Relationship,
	RelationshipName,
	Tree,
} from "../interfaces";
import { getPocketbaseError, pb } from "..";

export interface FullTree {
	object: Tree;
	relationships: Relationship[];
	nodes: Node[];
	relationshipNames: RelationshipName[];
	femaleCount: number;
	maleCount: number;
}

type TreeContextType = {
	tree: FullTree | null;
	fetchTree: (id: string) => Promise<FullTree | void>;
	createNode: (data: FormData) => Promise<void>;
	editNode: (id: string, data: FormData) => Promise<Node | null>;
	createRelationship: (data: CreateRelationshipData) => Promise<void>;
	deleteNode: (id: string) => Promise<void>;
	deleteRelationship: (id: string) => Promise<void>;
	isLoading: boolean;
	error: string | null;

	filterOut: (options: {
		relationships: { relationShipNames: string[] };
		nodesAge: { minAge: number; maxAge: number };
		nodesGender: { genderToSee: Gender | "both" };
		nodesName: { name: string };
	}) => void;
	shouldUpdateRelationships: boolean;
	setShouldUpdateRelationships: (value: boolean) => void;

	selectedNode: Node | null;
	setSelectedNode: (node: Node | null) => void;
};

const TreeContext = createContext<TreeContextType | undefined>(undefined);

export const TreeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [tree, setTree] = useState<FullTree | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [shouldUpdateRelationships, setShouldUpdateRelationships] =
		useState(false);
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);

	const fetchTree = async (id: string): Promise<FullTree | void> => {
		try {
			setIsLoading(true);
			pb.autoCancellation(false);
			const treeRecord = await pb.collection("ft_trees").getOne(id);
			const tree = new Tree(treeRecord);
			const relationshipsRecords = await pb
				.collection("ft_relationships")
				.getFullList({
					expand: "relationshipName",
					filter: `tree.id = "${id}"`,
				});
			const relationships = relationshipsRecords.map(
				(relationshipRecord) => new Relationship(relationshipRecord)
			);
			const nodesRecords = await pb.collection("ft_nodes").getFullList({
				filter: `tree.id = "${id}"`,
			});
			const nodes = nodesRecords.map((nodeRecord) => new Node(nodeRecord));
			const relationshipsNamesRecords = await pb
				.collection("ft_relationships_names")
				.getFullList({
					sort: "name",
				});
			const relationshipNames = relationshipsNamesRecords.map(
				(relationshipNameRecord) => new RelationshipName(relationshipNameRecord)
			);
			const [femaleCount, maleCount] = nodes.reduce(
				(previous, { gender }) => {
					if (gender === "female") {
						return [previous[0] + 1, previous[1]];
					} else {
						return [previous[0], previous[1] + 1];
					}
				},
				[0, 0]
			);

			const newTree: FullTree = {
				object: tree,
				relationships,
				nodes,
				relationshipNames,
				maleCount,
				femaleCount,
			};
			setTree(newTree);
			setSelectedNode(null);
			setError(null);
			return newTree;
		} catch (error: any) {
			setError(getPocketbaseError(error));
		} finally {
			setIsLoading(false);
		}
	};

	const createNode = async (data: FormData) => {
		if (!tree) {
			return;
		}
		const record = await pb.collection("ft_nodes").create(data);
		const node = new Node(record);
		const toAddFemale = node.gender === "female" ? 1 : 0;
		const toAddMale = node.gender === "male" ? 1 : 0;
		setTree({
			nodes: [...tree.nodes, node],
			object: tree.object,
			relationshipNames: tree.relationshipNames,
			relationships: tree.relationships,
			femaleCount: tree.femaleCount + toAddFemale,
			maleCount: tree.maleCount + toAddMale,
		});
	};

	const editNode = async (id: string, data: FormData): Promise<Node | null> => {
		if (!tree) {
			return null;
		}
		const record = await pb.collection("ft_nodes").update(id, data);
		const node = new Node(record);
		const previous = tree.nodes.find((n) => n.id === id);
		const toAddFemale =
			previous?.gender === record.gender
				? 0
				: record.gender === "female"
				? 1
				: -1;
		const toAddMale =
			previous?.gender === record.gender
				? 0
				: record.gender === "male"
				? 1
				: -1;
		const nodes = tree.nodes.map((n) => (n.id === id ? node : n));
		setTree({
			nodes,
			object: tree.object,
			relationshipNames: tree.relationshipNames,
			relationships: tree.relationships,
			femaleCount: tree.femaleCount + toAddFemale,
			maleCount: tree.maleCount + toAddMale,
		});
		return node;
	};

	const createRelationship = async (data: CreateRelationshipData) => {
		if (!tree) {
			return;
		}
		const relationshipRecord = await pb
			.collection("ft_relationships")
			.create(data);
		const record = await pb
			.collection("ft_relationships")
			.getOne(relationshipRecord.id, {
				expand: "relationshipName",
			});
		const relationship = new Relationship(record);
		setTree({
			nodes: tree.nodes,
			object: tree.object,
			relationshipNames: tree.relationshipNames,
			relationships: [...tree.relationships, relationship],
			femaleCount: tree.femaleCount,
			maleCount: tree.maleCount,
		});
	};

	const deleteNode = async (id: string) => {
		if (!tree) {
			return;
		}
		await pb.collection("ft_nodes").delete(id);
		const nodes = tree.nodes.filter((node) => node.id !== id);
		const [femaleCount, maleCount] = nodes.reduce(
			(previous, { gender }) => {
				if (gender === "female") {
					return [previous[0] + 1, previous[1]];
				} else {
					return [previous[0], previous[1] + 1];
				}
			},
			[0, 0]
		);
		setTree({
			nodes,
			object: tree.object,
			relationshipNames: tree.relationshipNames,
			relationships: tree.relationships,
			femaleCount,
			maleCount,
		});
	};

	const deleteRelationship = async (id: string) => {
		if (!tree) {
			return;
		}
		await pb.collection("ft_relationships").delete(id);
		const relationships = tree.relationships.filter(
			(relationship) => relationship.id !== id
		);
		setTree({
			nodes: tree.nodes,
			object: tree.object,
			relationshipNames: tree.relationshipNames,
			relationships,
			femaleCount: tree.femaleCount,
			maleCount: tree.maleCount,
		});
	};

	const filterOut = (options: {
		relationships: { relationShipNames: string[] };
		nodesAge: { minAge: number; maxAge: number };
		nodesGender: {
			genderToSee: Gender | "both";
		};
		nodesName: { name: string };
	}) => {
		if (!tree) {
			return;
		}
		tree.relationships.forEach((relationship) => {
			let isVisible = true;
			if (
				options.relationships.relationShipNames.includes(
					relationship.relationshipName?.name ?? ""
				)
			) {
				isVisible = false;
			}
			relationship.setVisible(isVisible);
		});
		tree.nodes.forEach((node) => {
			let isVisible = true;
			if (node.age < options.nodesAge.minAge) {
				isVisible = false;
			}
			if (node.age > options.nodesAge.maxAge) {
				isVisible = false;
			}
			if (
				options.nodesGender.genderToSee !== "both" &&
				options.nodesGender.genderToSee !== node.gender
			) {
				isVisible = false;
			}
			const filtersNames = options.nodesName.name
				.split(",")
				.map((name) => name.trim().toLowerCase())
				.filter((name) => name.length > 0);
			if (
				filtersNames.length > 0 &&
				filtersNames.some((filterName) =>
					node.name.includes(filterName.toLowerCase())
				)
			) {
				isVisible = false;
			}
			node.setVisible(isVisible);
		});
	};

	return (
		<TreeContext.Provider
			value={{
				tree,
				fetchTree,
				createNode,
				editNode,
				createRelationship,
				deleteNode,
				deleteRelationship,
				isLoading,
				error,

				filterOut,
				shouldUpdateRelationships,
				setShouldUpdateRelationships,

				selectedNode,
				setSelectedNode,
			}}
		>
			{children}
		</TreeContext.Provider>
	);
};

export const useTree = () => {
	const context = useContext(TreeContext);
	if (!context) {
		throw new Error("useTree must be used within an TreeProvider");
	}
	return context;
};
