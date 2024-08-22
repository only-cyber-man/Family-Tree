"use client";

import React, { createContext, useState, useContext } from "react";
import {
	CreateRelationshipData,
	Node,
	Relationship,
	RelationshipName,
	Tree,
} from "../interfaces";
import { getPocketbaseError, pb } from "..";

interface FullTree {
	object: Tree;
	relationships: Relationship[];
	nodes: Node[];
	relationshipNames: RelationshipName[];
}

type TreeContextType = {
	tree: FullTree | null;
	fetchTree: (id: string) => Promise<void>;
	createNode: (data: FormData) => Promise<void>;
	createRelationship: (data: CreateRelationshipData) => Promise<void>;
	deleteNode: (id: string) => Promise<void>;
	deleteRelationship: (id: string) => Promise<void>;
	isLoading: boolean;
	error: string | null;
};

const TreeContext = createContext<TreeContextType | undefined>(undefined);

export const TreeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [tree, setTree] = useState<FullTree | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchTree = async (id: string) => {
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
			setTree({
				nodes,
				object: tree,
				relationshipNames,
				relationships,
			});
			setError(null);
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
		setTree({
			nodes: [...tree.nodes, node],
			object: tree.object,
			relationshipNames: tree.relationshipNames,
			relationships: tree.relationships,
		});
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
		});
	};

	const deleteNode = async (id: string) => {
		if (!tree) {
			return;
		}
		await pb.collection("ft_nodes").delete(id);
		const nodes = tree.nodes.filter((node) => node.id !== id);
		setTree({
			nodes,
			object: tree.object,
			relationshipNames: tree.relationshipNames,
			relationships: tree.relationships,
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
		});
	};

	return (
		<TreeContext.Provider
			value={{
				tree,
				fetchTree,
				createNode,
				createRelationship,
				deleteNode,
				deleteRelationship,
				isLoading,
				error,
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
