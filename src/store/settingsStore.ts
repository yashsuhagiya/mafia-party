import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
	soundEnabled: boolean;
	hapticEnabled: boolean;
	discussionTimerMinutes: number;
	revealMode: 'pass' | 'qr';
	revealDeadRoles: boolean;
	ambientMusicEnabled: boolean;
	volume: number;

	setSoundEnabled: (v: boolean) => void;
	setHapticEnabled: (v: boolean) => void;
	setDiscussionTimer: (minutes: number) => void;
	setRevealMode: (mode: 'pass' | 'qr') => void;
	setRevealDeadRoles: (v: boolean) => void;
	setAmbientMusic: (v: boolean) => void;
	setVolume: (v: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			soundEnabled: true,
			hapticEnabled: true,
			discussionTimerMinutes: 5,
			revealMode: 'pass' as const,
			revealDeadRoles: true,
			ambientMusicEnabled: false,
			volume: 0.7,

			setSoundEnabled: (v) => set({ soundEnabled: v }),
			setHapticEnabled: (v) => set({ hapticEnabled: v }),
			setDiscussionTimer: (minutes) =>
				set({ discussionTimerMinutes: minutes }),
			setRevealMode: (mode) => set({ revealMode: mode }),
			setRevealDeadRoles: (v) => set({ revealDeadRoles: v }),
			setAmbientMusic: (v) => set({ ambientMusicEnabled: v }),
			setVolume: (v) => set({ volume: v }),
		}),
		{
			name: 'mafia-settings',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
