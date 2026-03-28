import { create } from 'zustand';
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

	// Night phase tracking
	currentNightStep: number;

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
	resetReveal: () => void;

	// Night
	addNightAction: (action: NightAction) => void;
	clearNightActions: () => void;
	setCurrentNightStep: (step: number) => void;

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

export const useGameStore = create<GameState>((set, _get) => ({
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
	currentNightStep: 0,

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
			roleConfig: { ...s.roleConfig, [roleId]: Math.max(0, count) },
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
			currentNightStep: 0,
		}),

	setPhase: (phase) => set({ phase }),
	nextRound: () => set((s) => ({ round: s.round + 1 })),

	nextReveal: () => set((s) => ({ revealIndex: s.revealIndex + 1 })),
	resetReveal: () => set({ revealIndex: 0 }),

	addNightAction: (action) =>
		set((s) => ({ nightActions: [...s.nightActions, action] })),
	clearNightActions: () => set({ nightActions: [] }),
	setCurrentNightStep: (step) => set({ currentNightStep: step }),

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
			currentNightStep: 0,
		}),
}));
