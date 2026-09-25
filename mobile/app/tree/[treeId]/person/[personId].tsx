import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useSettings } from "../../../../src/store/settings";

/** familytree://tree/<id>/person/<id>: active tree, canvas, person sheet open. */
export default function PersonLink() {
	const { treeId, personId } = useLocalSearchParams<{ treeId: string; personId: string }>();
	const router = useRouter();
	const setActive = useSettings((s) => s.setActiveTree);
	useEffect(() => {
		if (treeId) setActive(treeId);
		// dismissTo returns to the existing tabs; a Redirect (replace) would stack a second tab navigator on iOS.
		router.dismissTo({ pathname: "/tree", params: { person: personId } });
	}, [treeId, personId, setActive, router]);
	return null;
}
