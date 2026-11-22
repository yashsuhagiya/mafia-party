import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
	discussionTimerMinutes: number;
	revealMode: 'pass' | 'qr';
	revealDeadRoles: boolean;

	setDiscussionTimer: (minutes: number) => void;
	setRevealMode: (mode: 'pass' | 'qr') => void;
	setRevealDeadRoles: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			discussionTimerMinutes: 5,
			revealMode: 'pass' as const,
			revealDeadRoles: true,

			setDiscussionTimer: (minutes) =>
				set({ discussionTimerMinutes: minutes }),
			setRevealMode: (mode) => set({ revealMode: mode }),
			setRevealDeadRoles: (v) => set({ revealDeadRoles: v }),
		}),
		{
			name: 'mafia-settings',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
