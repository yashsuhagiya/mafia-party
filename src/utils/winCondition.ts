import type { Team } from '../data/roles';
import type { Player } from '../store/gameStore';

export interface WinState {
	gameOver: boolean;
	winner: Team | null;
	message: string;
}

/**
 * Check win conditions after any elimination.
 *
 * Win conditions:
 * - Mafia wins: mafia alive >= village alive (and no SK)
 * - Village wins: all mafia dead (and no SK)
 * - Serial Killer wins: SK is last alive (or only SK + 1 other)
 * - Jester wins: if voted out during day (handled separately)
 * - Survivor wins: if alive when game ends (co-wins with any team)
 */
export function checkWinCondition(players: Player[]): WinState {
	const alive = players.filter((p) => p.alive);
	const mafiaAlive = alive.filter((p) => p.role.team === 'mafia').length;
	const villageAlive = alive.filter((p) => p.role.team === 'village').length;
	const skAlive = alive.filter((p) => p.role.id === 'serialKiller').length;
	const neutralAlive = alive.filter(
		(p) => p.role.team === 'neutral' && p.role.id !== 'serialKiller',
	).length;

	// Serial Killer wins if they're the only non-neutral alive
	if (skAlive > 0 && mafiaAlive === 0 && villageAlive === 0) {
		return {
			gameOver: true,
			winner: 'neutral',
			message: 'The Serial Killer wins! Everyone else is dead.',
		};
	}

	// If SK is alive with just one other person
	if (skAlive > 0 && mafiaAlive + villageAlive <= 1) {
		return {
			gameOver: true,
			winner: 'neutral',
			message: 'The Serial Killer wins! Too few remain to stop them.',
		};
	}

	// Village wins: all mafia eliminated (SK must also be dead)
	if (mafiaAlive === 0 && skAlive === 0) {
		return {
			gameOver: true,
			winner: 'village',
			message: 'The Village wins! All threats have been eliminated.',
		};
	}

	// Mafia wins: mafia >= village (non-mafia)
	if (mafiaAlive >= villageAlive + neutralAlive && skAlive === 0) {
		return {
			gameOver: true,
			winner: 'mafia',
			message: 'The Mafia wins! They now control the town.',
		};
	}

	// Game continues
	return {
		gameOver: false,
		winner: null,
		message: `Game in progress — Mafia: ${mafiaAlive}, Village: ${villageAlive}${skAlive ? `, SK: ${skAlive}` : ''}`,
	};
}
