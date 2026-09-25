import { create } from "zustand";
import * as api from "../lib/api";
import { errorMessage, isNetworkError } from "../lib/errors";
import { loadAuth, onUnauthorized, pb } from "../lib/pb";
import type { UserRecord } from "../lib/types";
import { getT } from "../i18n";
import { deleteOwnAccount } from "../lib/account";
import { wipeAccountData } from "../services/account";
import { useSettings } from "./settings";

interface SessionState {
	ready: boolean;
	user: UserRecord | null;
	/** The stored session was rejected; show "Please sign in again". */
	expired: boolean;
	init: () => Promise<void>;
	signIn: (login: string, password: string) => Promise<void>;
	signUp: (input: api.SignUpInput) => Promise<void>;
	signOut: () => Promise<void>;
	/** Deletes the account on the server (like the web), then signs out and wipes the device. Throws on failure. */
	deleteAccount: () => Promise<void>;
	markExpired: () => void;
	forgetExpired: () => Promise<void>;
}

/** After a successful sign-in: drop another account's data from this device. */
async function adopt(user: UserRecord) {
	const settings = useSettings.getState();
	if (settings.accountId && settings.accountId !== user.id) await wipeAccountData();
	useSettings.getState().setAccountId(user.id);
}

export const useSession = create<SessionState>()((set, get) => ({
	ready: false,
	user: null,
	expired: false,
	init: async () => {
		await loadAuth();
		onUnauthorized(() => get().markExpired());
		const token = pb.authStore.token;
		if (!token) return set({ ready: true, user: null });
		if (!pb.authStore.isValid) {
			// Token present but past its expiry.
			pb.authStore.clear();
			return set({ ready: true, user: null, expired: !!useSettings.getState().lastLogin });
		}
		const current = api.currentUser();
		if (current && !useSettings.getState().accountId) useSettings.getState().setAccountId(current.id);
		set({ ready: true, user: current });
		try {
			const user = await api.refreshAuth();
			set({ user });
		} catch (e) {
			if (!isNetworkError(e)) get().markExpired();
		}
	},
	signIn: async (login, password) => {
		const user = await api.signIn(login.trim(), password);
		await adopt(user);
		useSettings.getState().setLastLogin(user.username || login.trim());
		set({ user, expired: false });
	},
	signUp: async (input) => {
		const user = await api.signUp(input);
		await adopt(user);
		useSettings.getState().setLastLogin(user.username);
		set({ user, expired: false });
	},
	signOut: async () => {
		// Token first: nothing that runs during the wipe (a trees refresh, a
		// reload) can fetch or re-save the old account's data.
		pb.authStore.clear();
		set({ user: null, expired: false });
		await wipeAccountData();
	},
	deleteAccount: async () => {
		const user = get().user;
		if (!user) throw new Error(getT().errors.notSignedIn);
		await deleteOwnAccount(pb, user.id);
		pb.authStore.clear();
		set({ user: null, expired: false });
		await wipeAccountData();
	},
	markExpired: () => {
		if (!get().user) return;
		pb.authStore.clear();
		set({ user: null, expired: !!useSettings.getState().lastLogin });
	},
	forgetExpired: async () => {
		await wipeAccountData();
		set({ expired: false });
	},
}));

export { errorMessage };
