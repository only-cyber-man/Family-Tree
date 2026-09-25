import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useSettings } from "../../../src/store/settings";

/** familytree://tree/<id>: make it the active tree and open the canvas. */
export default function TreeLink() {
	const { treeId } = useLocalSearchParams<{ treeId: string }>();
	const setActive = useSettings((s) => s.setActiveTree);
	const [done, setDone] = useState(false);
	useEffect(() => {
		if (treeId) setActive(treeId);
		setDone(true);
	}, [treeId, setActive]);
	if (!done) return null;
	return <Redirect href="/tree" />;
}
