"use client";

import { Node } from "./Node";

export const NodeElement = ({ node }: { node: Node }) => {
	return (
		<div
			style={{
				border: "1px solid black",
				padding: "10px",
				margin: "10px",
				display: "inline-block",
				borderRadius: "5px",
			}}
		>
			<h1>{node.name}</h1>
			{node.birthDate && (
				<p>
					{node.birthDate.toLocaleDateString()} -{" "}
					{node.deathDate?.toLocaleDateString() || "Present"} ({node.age} years)
				</p>
			)}
		</div>
	);
};
