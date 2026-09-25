import { useEffect } from "react";
import { AppState } from "react-native";
import { ensureSession, REFRESH_ON_FOREGROUND_S } from "../lib/pb";
import { onReconnect } from "../store/network";
import { useSettings } from "../store/settings";
import { useTree } from "../store/tree";
import { useTrees } from "../store/trees";

/** Loads the tree list, picks an active tree and keeps it (and the session) fresh. */
export function useActiveTreeBootstrap() {
	const activeTreeId = useSettings((s) => s.activeTreeId);

	useEffect(() => {
		useTrees
			.getState()
			.refresh()
			.then((items) => {
				const { activeTreeId: cur, setActiveTree } = useSettings.getState();
				const { status, offline } = useTrees.getState();
				if (items.length && (!cur || !items.some((i) => i.tree.id === cur))) setActiveTree(items[0].tree.id);
				else if (!items.length && status === "ready" && !offline) setActiveTree(null);
			});
	}, []);

	useEffect(() => {
		if (activeTreeId) useTree.getState().load(activeTreeId);
		else useTree.getState().clear();
	}, [activeTreeId]);

	useEffect(() => {
		const sub = AppState.addEventListener("change", async (state) => {
			if (state !== "active") return;
			// The token may have expired while the app was in the background.
			if (!(await ensureSession(REFRESH_ON_FOREGROUND_S))) return;
			const id = useSettings.getState().activeTreeId;
			if (id) useTree.getState().load(id, { silent: true });
		});
		const off = onReconnect(async () => {
			if (!(await ensureSession(REFRESH_ON_FOREGROUND_S))) return;
			const id = useSettings.getState().activeTreeId;
			if (id) useTree.getState().load(id, { silent: true });
			useTrees.getState().refresh();
		});
		return () => {
			sub.remove();
			off();
		};
	}, []);
}
