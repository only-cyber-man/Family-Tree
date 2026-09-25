import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useSettings } from "../../../../src/store/settings";

/** familytree://tree/<id>/person/<id>: active tree, canvas, person sheet open. */
export default function PersonLink() {
	const { treeId, personId } = useLocalSearchParams<{ treeId: string; personId: string }>();
	const setActive = useSettings((s) => s.setActiveTree);
	const [done, setDone] = useState(false);
	useEffect(() => {
		if (treeId) setActive(treeId);
		setDone(true);
	}, [treeId, setActive]);
	if (!done) return null;
	return <Redirect href={{ pathname: "/tree", params: { person: personId } }} />;
}
