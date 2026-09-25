import { Node } from "@/lib";
import { genderColorVar, initials, isDeceased, pictureUrl } from "@/lib/people";

export const PersonAvatar = ({
	node,
	size,
	fontSize,
}: {
	node: Node;
	size: number;
	fontSize?: number;
}) => {
	const url = pictureUrl(node, size > 48 ? "200x200" : "100x100");
	return (
		<div
			className="avatar"
			aria-hidden
			style={{
				width: size,
				height: size,
				background: genderColorVar(node),
				backgroundImage: url ? `url("${url}")` : undefined,
				backgroundSize: "cover",
				backgroundPosition: "center",
				fontSize: fontSize ?? Math.round(size / 3),
				filter: isDeceased(node) ? "saturate(0.4) opacity(0.85)" : undefined,
			}}
		>
			{url ? null : initials(node.name)}
		</div>
	);
};
