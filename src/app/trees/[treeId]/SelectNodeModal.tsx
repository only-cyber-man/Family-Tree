"use client";

import { Node } from "@/lib";
import { FullTree, useTree } from "@/lib/hooks/useTree";
import { useState } from "react";
import { EditNodeButton } from "./EditNodeButton";

const capitalizeFirstLetter = (string: string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

const getNodeById = (tree: FullTree, id?: string) => {
	return tree.nodes.find((node) => node.id === id);
};

const getGrandParents = (
	nodeId: string,
	tree: FullTree,
	grandLevel = 1
): Node[] => {
	const parents = relatives.getParents(nodeId, tree);
	if (grandLevel > 1) {
		const next: Node[] = [];
		if (parents[0]) {
			next.push(...getGrandParents(parents[0].id, tree, grandLevel - 1));
		}
		if (parents[1]) {
			next.push(...getGrandParents(parents[1].id, tree, grandLevel - 1));
		}
		return next;
	} else {
		return parents;
	}
};

const relatives = {
	getParents: (nodeId: string, tree: FullTree): Node[] => {
		const motherRelationship = tree.relationships.find(
			(r) =>
				r.targetNodeId === nodeId && r.relationshipName?.name === "IS_MOTHER_OF"
		);
		const fatherRelationship = tree.relationships.find(
			(r) =>
				r.targetNodeId === nodeId && r.relationshipName?.name === "IS_FATHER_OF"
		);

		// The below is marked `as any` because `yarn build` thinks that the array returned is (Node | undefined)[] instead of Node[] (which it is duh)
		return [
			getNodeById(tree, motherRelationship?.sourceNodeId),
			getNodeById(tree, fatherRelationship?.sourceNodeId),
		].filter((n) => n !== undefined) as any;
	},
	getGrandParents,
	getSiblings: (nodeId: string, tree: FullTree): Node[] => {
		const parents = relatives.getParents(nodeId, tree);
		const siblings: Node[] = [];
		parents.forEach((parent) => {
			const parentRelationships = tree.relationships.filter(
				(r) =>
					r.sourceNodeId === parent.id &&
					(r.relationshipName?.name === "IS_MOTHER_OF" ||
						r.relationshipName?.name === "IS_FATHER_OF")
			);
			parentRelationships.forEach((relationship) => {
				if (relationship.targetNodeId !== nodeId) {
					const sibling = getNodeById(tree, relationship.targetNodeId);
					if (sibling && !siblings.find((s) => s.id === sibling.id)) {
						siblings.push(sibling);
					}
				}
			});
		});
		return siblings;
	},
	getSpouse: (nodeId: string, tree: FullTree): Node | null => {
		const spouseRelationship = tree.relationships.find(
			(r) =>
				(r.sourceNodeId === nodeId || r.targetNodeId === nodeId) &&
				r.relationshipName?.name === "IS_MARRIED_TO"
		);
		if (!spouseRelationship) {
			return null;
		}
		const spouseId =
			spouseRelationship.sourceNodeId === nodeId
				? spouseRelationship.targetNodeId
				: spouseRelationship.sourceNodeId;
		return getNodeById(tree, spouseId) ?? null;
	},
	getAuntsAndUncles: (nodeId: string, tree: FullTree): Node[] => {
		const parents = relatives.getParents(nodeId, tree);
		const auntsAndUncles: Node[] = [];
		parents.forEach((parent) => {
			const parentSiblings = relatives.getSiblings(parent.id, tree);
			parentSiblings.forEach((sibling) => {
				const spouse = relatives.getSpouse(sibling.id, tree);
				if (spouse) {
					auntsAndUncles.push(...[sibling, spouse]);
				} else {
					auntsAndUncles.push(...[sibling]);
				}
			});
		});
		return auntsAndUncles;
	},
	getChildren: (nodeId: string, tree: FullTree): Node[] => {
		const children: Node[] = [];
		const childrenRelationships = tree.relationships.filter(
			(r) =>
				r.sourceNodeId === nodeId &&
				(r.relationshipName?.name === "IS_MOTHER_OF" ||
					r.relationshipName?.name === "IS_FATHER_OF")
		);
		childrenRelationships.forEach((relationship) => {
			const child = getNodeById(tree, relationship.targetNodeId);
			if (child) {
				children.push(child);
			}
		});
		return children;
	},
	getGrandChildren: (
		nodeId: string,
		tree: FullTree,
		grandLevel = 1
	): Node[] => {
		const children = relatives.getChildren(nodeId, tree);
		if (grandLevel > 1) {
			const next: Node[] = [];
			children.forEach((child) => {
				next.push(
					...relatives.getGrandChildren(child.id, tree, grandLevel - 1)
				);
			});
			return next;
		} else {
			return children;
		}
	},
};

const displayNode = (node: Node) => {
	return `${node.name} (${node.age}${node.deathDate !== null ? " †" : ""})`;
};

export const SelectNodeModal = () => {
	const { selectedNode: node, setSelectedNode, tree } = useTree();
	const [showRelatives, setShowRelatives] = useState(false);
	const isOpen = node !== null;

	if (!node || !tree) {
		return null;
	}

	const parents = relatives.getParents(node.id, tree);
	let i = 2;
	let grandParentsLevels = [getGrandParents(node.id, tree, i++)];
	while (grandParentsLevels[grandParentsLevels.length - 1].length > 0) {
		const grandParents = getGrandParents(node.id, tree, i++);
		grandParentsLevels.push(grandParents);
	}
	grandParentsLevels = grandParentsLevels.filter((gp) => gp.length > 0);
	const siblings = relatives.getSiblings(node.id, tree);
	const auntAndUncles = relatives.getAuntsAndUncles(node.id, tree);
	const _children = relatives.getChildren(node.id, tree);
	i = 2;
	let grandChildrenLevels = [relatives.getGrandChildren(node.id, tree, i++)];
	while (grandChildrenLevels[grandChildrenLevels.length - 1].length > 0) {
		const grandChildren = relatives.getGrandChildren(node.id, tree, i++);
		grandChildrenLevels.push(grandChildren);
	}
	grandChildrenLevels = grandChildrenLevels.filter((gc) => gc.length > 0);

	return (
		<div className={`modal ${isOpen && "is-active"}`}>
			<div
				className="modal-background"
				onClick={() => setSelectedNode(null)}
			></div>

			<div className="modal-content box content">
				<h1>
					{node.name} {node.gender === "male" ? "♂" : "♀"}
				</h1>
				<div>{node.age} years old</div>
				<div>{`★ ${node.birthDate.toLocaleDateString()}`}</div>
				{node.deathDate ? (
					<div>{`† ${node.deathDate.toLocaleDateString()}`}</div>
				) : null}

				{showRelatives ? (
					<>
						<hr />
						{parents.length > 0 && (
							<p>
								Parents: <b>{parents.map(displayNode).join(", ")}</b>
							</p>
						)}
						{siblings.length > 0 && (
							<p>
								Siblings: <b>{siblings.map(displayNode).join(", ")}</b>
							</p>
						)}
						{auntAndUncles.length > 0 && (
							<p>
								Aunts and Uncles:{" "}
								<b>{auntAndUncles.map(displayNode).join(", ")}</b>
							</p>
						)}
						{grandParentsLevels.map((gp, i) => (
							<div key={`grandparent-${i}`}>
								{capitalizeFirstLetter(
									`${Array.from({ length: i })
										.map(() => "great-")
										.join("")}grandparent${gp.length > 1 ? "s" : ""}:`
								)}{" "}
								<b>{gp.map(displayNode).join(", ")}</b>
							</div>
						))}
						{_children.length > 0 && (
							<p>
								Children: <b>{_children.map(displayNode).join(", ")}</b>
							</p>
						)}
						{grandChildrenLevels.map((gc, i) => (
							<div key={`grandchildren-${i}`}>
								{capitalizeFirstLetter(
									`${Array.from({ length: i })
										.map(() => "great-")
										.join("")}grandchildren:`
								)}{" "}
								<b>{gc.map(displayNode).join(", ")}</b>
							</div>
						))}
					</>
				) : null}
				<hr />
				<div
					style={{
						flexDirection: "row",
						display: "flex",
						justifyContent: "space-between",
					}}
				>
					{tree.isCreator ? <EditNodeButton node={node} /> : null}
					<button
						className="button"
						onClick={() => setShowRelatives(!showRelatives)}
					>
						{showRelatives ? "Hide" : "Show"} relatives
					</button>
				</div>
			</div>

			<button
				className="modal-close is-large"
				aria-label="close"
				onClick={() => setSelectedNode(null)}
			></button>
		</div>
	);
};
