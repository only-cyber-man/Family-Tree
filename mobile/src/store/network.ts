import NetInfo from "@react-native-community/netinfo";
import { create } from "zustand";

interface NetworkState {
	online: boolean;
}

export const useNetwork = create<NetworkState>()(() => ({ online: true }));

let started = false;
const listeners = new Set<() => void>();

/** Subscribes once to NetInfo; `onReconnect` callbacks fire on offline -> online. */
export function startNetworkWatch() {
	if (started) return;
	started = true;
	NetInfo.addEventListener((state) => {
		const online = state.isConnected !== false && state.isInternetReachable !== false;
		const was = useNetwork.getState().online;
		useNetwork.setState({ online });
		if (online && !was) listeners.forEach((fn) => fn());
	});
}

export function onReconnect(fn: () => void): () => void {
	listeners.add(fn);
	return () => listeners.delete(fn);
}
