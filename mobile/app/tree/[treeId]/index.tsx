import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useSettings } from "../../../src/store/settings";

/** familytree://tree/<id>: make it the active tree and open the canvas. */
export default function TreeLink() {
	const { treeId } = useLocalSearchParams<{ treeId: string }>();
	const router = useRouter();
	const setActive = useSettings((s) => s.setActiveTree);
	useEffect(() => {
		if (treeId) setActive(treeId);
		// dismissTo returns to the existing tabs; a Redirect (replace) would stack a second tab navigator on iOS.
		router.dismissTo("/tree");
	}, [treeId, setActive, router]);
	return null;
}
