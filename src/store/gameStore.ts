import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { NightActionType, RoleDefinition, Team } from '../data/roles';

export type GamePhase = 'setup' | 'reveal' | 'night' | 'day' | 'ended';

export interface Player {
	id: string;
	name: string;
	role: RoleDefinition;
	alive: boolean;
	silenced: boolean;
}

export interface NightAction {
	roleId: string;
	actionType: NightActionType;
	actorId: string;
	targetId: string;
}

export interface EliminationRecord {
	round: number;
	playerId: string;
	method: 'mafia' | 'vote' | 'vigilante' | 'serial_killer';
}

interface GameState {
	// Game state
	players: Player[];
	phase: GamePhase;
	round: number;
	nightActions: NightAction[];
	eliminationLog: EliminationRecord[];
	winner: Team | null;
	winMessage: string;

	// Setup state
	playerNames: string[];
	roleConfig: Record<string, number>;

	// Reveal tracking
	revealIndex: number;

	// Actions
	setPlayerNames: (names: string[]) => void;
	addPlayerName: (name: string) => void;
	removePlayerName: (index: number) => void;
	setRoleConfig: (config: Record<string, number>) => void;
	updateRoleCount: (roleId: string, count: number) => void;

	startGame: (players: Player[]) => void;
	setPhase: (phase: GamePhase) => void;
	nextRound: () => void;

	// Reveal
	nextReveal: () => void;

	// Night
	addNightAction: (action: NightAction) => void;
	removeNightAction: (roleId: string) => void;
	clearNightActions: () => void;

	// Day
	eliminatePlayer: (
		playerId: string,
		method: EliminationRecord['method'],
	) => void;
	silencePlayer: (playerId: string) => void;
	clearSilence: () => void;

	// Game end
	endGame: (winner: Team, message: string) => void;
	resetGame: () => void;
}

// ponytail: only store data is restored. Screen-local state (night step, day stage, timer) is not: a restored night restarts at step 1 (NightPhaseScreen clears nightActions on mount), a restored day restarts at the announcement unless today's vote already happened. Players embed their full role definition, so bump version if Player/RoleDefinition changes shape.
export const useGameStore = create<GameState>()(
	persist(
		(set) => ({
			players: [],
			phase: 'setup',
			round: 0,
			nightActions: [],
			eliminationLog: [],
			winner: null,
			winMessage: '',

			playerNames: [],
			roleConfig: {},

			revealIndex: 0,

			setPlayerNames: (names) => set({ playerNames: names }),
			addPlayerName: (name) =>
				set((s) => ({ playerNames: [...s.playerNames, name] })),
			removePlayerName: (index) =>
				set((s) => ({
					playerNames: s.playerNames.filter((_, i) => i !== index),
				})),
			setRoleConfig: (config) => set({ roleConfig: config }),
			updateRoleCount: (roleId, count) =>
				set((s) => ({
					roleConfig: {
						...s.roleConfig,
						[roleId]: Math.max(0, count),
					},
				})),

			startGame: (players) =>
				set({
					players,
					phase: 'reveal',
					round: 1,
					nightActions: [],
					eliminationLog: [],
					winner: null,
					winMessage: '',
					revealIndex: 0,
				}),

			setPhase: (phase) => set({ phase }),
			nextRound: () => set((s) => ({ round: s.round + 1 })),

			nextReveal: () => set((s) => ({ revealIndex: s.revealIndex + 1 })),

			addNightAction: (action) =>
				set((s) => ({
					nightActions: [
						...s.nightActions.filter(
							(a) => a.roleId !== action.roleId,
						),
						action,
					],
				})),
			removeNightAction: (roleId) =>
				set((s) => ({
					nightActions: s.nightActions.filter(
						(a) => a.roleId !== roleId,
					),
				})),
			clearNightActions: () => set({ nightActions: [] }),

			eliminatePlayer: (playerId, method) =>
				set((s) => ({
					players: s.players.map((p) =>
						p.id === playerId ? { ...p, alive: false } : p,
					),
					eliminationLog: [
						...s.eliminationLog,
						{ round: s.round, playerId, method },
					],
				})),

			silencePlayer: (playerId) =>
				set((s) => ({
					players: s.players.map((p) =>
						p.id === playerId ? { ...p, silenced: true } : p,
					),
				})),

			clearSilence: () =>
				set((s) => ({
					players: s.players.map((p) => ({ ...p, silenced: false })),
				})),

			endGame: (winner, message) =>
				set({ phase: 'ended', winner, winMessage: message }),

			resetGame: () =>
				set({
					players: [],
					phase: 'setup',
					round: 0,
					nightActions: [],
					eliminationLog: [],
					winner: null,
					winMessage: '',
					playerNames: [],
					roleConfig: {},
					revealIndex: 0,
				}),
		}),
		{
			name: 'mafia-game',
			version: 1,
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
