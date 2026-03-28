import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Team } from '../data/roles';

export interface GameRecord {
	id: string;
	date: string;
	players: { name: string; role: string; team: Team; survived: boolean }[];
	rounds: number;
	winner: Team;
}

interface HistoryState {
	games: GameRecord[];
	addGame: (game: GameRecord) => void;
	clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
	persist(
		(set) => ({
			games: [],
			addGame: (game) => set((s) => ({ games: [game, ...s.games] })),
			clearHistory: () => set({ games: [] }),
		}),
		{
			name: 'mafia-history',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
