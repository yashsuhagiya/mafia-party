import { ROLES, type RoleDefinition } from '../data/roles';

/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 */
function shuffle<T>(array: T[]): T[] {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

/**
 * Given a role configuration (roleId -> count), builds and shuffles
 * an array of role definitions to assign to players.
 */
export function allocateRoles(
	roleConfig: Record<string, number>,
	playerNames: string[],
): { name: string; role: RoleDefinition }[] {
	// Build the role pool
	const rolePool: RoleDefinition[] = [];
	for (const [roleId, count] of Object.entries(roleConfig)) {
		const role = ROLES[roleId];
		if (!role) continue;
		for (let i = 0; i < count; i++) {
			rolePool.push(role);
		}
	}

	if (rolePool.length !== playerNames.length) {
		throw new Error(
			`Role count (${rolePool.length}) doesn't match player count (${playerNames.length})`,
		);
	}

	// Shuffle roles and assign
	const shuffled = shuffle(rolePool);
	return playerNames.map((name, i) => ({
		name,
		role: shuffled[i],
	}));
}

/**
 * Auto-balance roles for a given player count.
 * Ensures 25-35% mafia, at least 1 police and 1 doctor.
 */
export function autoBalanceRoles(playerCount: number): Record<string, number> {
	// For 5-6 players, cap mafia at 1 to keep the game balanced
	const mafiaCount =
		playerCount <= 6 ? 1 : Math.max(2, Math.round(playerCount * 0.3));
	const villageCount = playerCount - mafiaCount;

	const roles: Record<string, number> = {};

	// Mafia team
	if (mafiaCount >= 3) {
		roles.godfather = 1;
		roles.silencer = 1;
		roles.mafia = mafiaCount - 2;
	} else if (mafiaCount >= 2) {
		roles.mafia = 1;
		roles.silencer = 1;
	} else {
		roles.mafia = 1;
	}

	// Village team — always include police and doctor
	roles.police = 1;
	roles.doctor = 1;
	const remainingVillage = villageCount - 2;
	roles.villager = Math.max(0, remainingVillage);

	return roles;
}
