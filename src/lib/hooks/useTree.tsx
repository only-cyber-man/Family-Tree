"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import {
	CreateRelationshipData,
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
	isCreator: boolean;
}

type TreeContextType = {
	tree: FullTree | null;
	fetchTree: (id: string) => Promise<FullTree | void>;
	createNode: (data: FormData) => Promise<Node | null>;
	editNode: (id: string, data: FormData) => Promise<Node | null>;
	createRelationship: (data: CreateRelationshipData) => Promise<Relationship | null>;
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
	// Only the most recent request may write state; an older, slower one for a
	// tree the user already left is dropped.
	const latestRequest = useRef(0);

	const fetchTree = useCallback(async (id: string): Promise<FullTree | void> => {
		const request = ++latestRequest.current;
		const isStale = () => request !== latestRequest.current;
		try {
			setIsLoading(true);
			pb.autoCancellation(false);
			const [treeRecord, relationshipRecords, nodeRecords, nameRecords] =
				await Promise.all([
					pb.collection("ft_trees").getOne(id),
					pb.collection("ft_relationships").getFullList({
						expand: "relationshipName",
						filter: pb.filter("tree.id = {:id}", { id }),
					}),
					pb.collection("ft_nodes").getFullList({
						filter: pb.filter("tree.id = {:id}", { id }),
					}),
					pb.collection("ft_relationships_names").getFullList({
						sort: "name",
					}),
				]);
			if (isStale()) {
				return;
			}
			const object = new Tree(treeRecord);
			const newTree: FullTree = {
				object,
				relationships: relationshipRecords.map((r) => new Relationship(r)),
				nodes: nodeRecords.map((n) => new Node(n)),
				relationshipNames: nameRecords.map((n) => new RelationshipName(n)),
				isCreator: object.creatorId === pb.authStore.record?.id,
			};
			setTree(newTree);
			setError(null);
			return newTree;
		} catch (error: any) {
			if (!isStale()) {
				setError(getPocketbaseError(error));
			}
		} finally {
			if (!isStale()) {
				setIsLoading(false);
			}
		}
	}, []);

	const createNode = async (data: FormData) => {
		if (!tree) {
			return null;
		}
		const node = new Node(await pb.collection("ft_nodes").create(data));
		setTree((current) =>
			current ? { ...current, nodes: [...current.nodes, node] } : current
		);
		return node;
	};

	const editNode = async (id: string, data: FormData) => {
		if (!tree) {
			return null;
		}
		const node = new Node(await pb.collection("ft_nodes").update(id, data));
		setTree((current) =>
			current
				? { ...current, nodes: current.nodes.map((n) => (n.id === id ? node : n)) }
				: current
		);
		return node;
	};

	const createRelationship = async (data: CreateRelationshipData) => {
		if (!tree) {
			return null;
		}
		const created = await pb.collection("ft_relationships").create(data);
		const relationship = new Relationship(
			await pb.collection("ft_relationships").getOne(created.id, {
				expand: "relationshipName",
			})
		);
		setTree((current) =>
			current
				? { ...current, relationships: [...current.relationships, relationship] }
				: current
		);
		return relationship;
	};

	const deleteNode = async (id: string) => {
		if (!tree) {
			return;
		}
		const attached = tree.relationships.filter(
			(r) => r.sourceNodeId === id || r.targetNodeId === id
		);
		// The person goes first: if that fails nothing has changed. Their
		// relationships are cleaned up afterwards; any that fail to delete are
		// orphans pointing at a missing node, which no view can show.
		await pb.collection("ft_nodes").delete(id);
		setTree((current) =>
			current
				? {
						...current,
						nodes: current.nodes.filter((n) => n.id !== id),
						relationships: current.relationships.filter(
							(r) => r.sourceNodeId !== id && r.targetNodeId !== id
						),
				  }
				: current
		);
		await Promise.allSettled(
			attached.map((r) => pb.collection("ft_relationships").delete(r.id))
		);
	};

	const deleteRelationship = async (id: string) => {
		if (!tree) {
			return;
		}
		await pb.collection("ft_relationships").delete(id);
		setTree((current) =>
			current
				? {
						...current,
						relationships: current.relationships.filter((r) => r.id !== id),
				  }
				: current
		);
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
