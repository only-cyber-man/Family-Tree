import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ThemePreference } from "../theme/theme";

export interface ReminderSettings {
	/** Opt-in: nothing is scheduled until the user turns reminders on. */
	enabled: boolean;
	birthdays: boolean;
	remembrance: boolean;
	roundEarly: boolean;
}

interface SettingsState {
	hydrated: boolean;
	theme: ThemePreference;
	/** "system" follows the device language (Polish or English). Device-wide, kept across accounts. */
	language: "system" | "en" | "pl";
	onboardingDone: boolean;
	activeTreeId: string | null;
	/**
	 * "This is me", per tree. The design proposes ft_trees.meNode; until that
	 * exists the choice is made once and kept on this device.
	 */
	meByTree: Record<string, string>;
	reminders: ReminderSettings;
	/** Remembered for the "Please sign in again" screen. */
	lastLogin: string | null;
	/** The account whose data (caches, choices) is on this device. */
	accountId: string | null;
	setAccountId: (id: string | null) => void;
	/** Forget per-account choices: reminders opt-in, "This is me", last login. */
	clearAccount: () => void;
	setTheme: (t: ThemePreference) => void;
	setLanguage: (l: "system" | "en" | "pl") => void;
	finishOnboarding: () => void;
	setActiveTree: (id: string | null) => void;
	setMe: (treeId: string, nodeId: string | null) => void;
	setReminders: (patch: Partial<ReminderSettings>) => void;
	setLastLogin: (login: string | null) => void;
}

export const useSettings = create<SettingsState>()(
	persist(
		(set) => ({
			hydrated: false,
			theme: "system",
			language: "system",
			onboardingDone: false,
			activeTreeId: null,
			meByTree: {},
			reminders: { enabled: false, birthdays: true, remembrance: true, roundEarly: false },
			lastLogin: null,
			accountId: null,
			setAccountId: (accountId) => set({ accountId }),
			clearAccount: () =>
				set((s) => ({
					accountId: null,
					lastLogin: null,
					meByTree: {},
					reminders: { ...s.reminders, enabled: false },
				})),
			setTheme: (theme) => set({ theme }),
			setLanguage: (language) => set({ language }),
			finishOnboarding: () => set({ onboardingDone: true }),
			setActiveTree: (activeTreeId) => set({ activeTreeId }),
			setMe: (treeId, nodeId) =>
				set((s) => {
					const meByTree = { ...s.meByTree };
					if (nodeId) meByTree[treeId] = nodeId;
					else delete meByTree[treeId];
					return { meByTree };
				}),
			setReminders: (patch) => set((s) => ({ reminders: { ...s.reminders, ...patch } })),
			setLastLogin: (lastLogin) => set({ lastLogin }),
		}),
		{
			name: "ft.settings",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: ({ hydrated: _h, ...rest }) => rest,
			onRehydrateStorage: () => () => useSettings.setState({ hydrated: true }),
		},
	),
);
