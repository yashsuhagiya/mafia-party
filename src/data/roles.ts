export type Team = 'mafia' | 'village' | 'neutral';

export type NightActionType =
	| 'kill'
	| 'save'
	| 'investigate'
	| 'silence'
	| 'guard'
	| 'vigilante_kill'
	| 'serial_kill';

export interface RoleDefinition {
	id: string;
	name: string;
	team: Team;
	icon: string; // Emoji icon for the role
	description: string;
	nightAction?: NightActionType;
	nightOrder: number; // Order in which this role acts at night (lower = earlier)
	passiveAbility?: string;
	playerTip: string;
	godTip: string;
}

export const ROLES: Record<string, RoleDefinition> = {
	// ── Mafia Team ──
	godfather: {
		id: 'godfather',
		name: 'Godfather',
		team: 'mafia',
		icon: '🎩',
		description: 'The leader of the mafia. Appears innocent to the Police.',
		nightAction: 'kill',
		nightOrder: 1,
		passiveAbility:
			'Immune to Police investigation — always appears as Village.',
		playerTip:
			'You are the boss. Coordinate kills with your team. The Police cannot detect you.',
		godTip: 'If Police investigates the Godfather, tell them the result is "Village/Innocent".',
	},
	mafia: {
		id: 'mafia',
		name: 'Mafia',
		team: 'mafia',
		icon: '🔪',
		description:
			'A member of the mafia. Works with the team to eliminate villagers at night.',
		nightAction: 'kill',
		nightOrder: 1,
		playerTip:
			'Discuss with your team during the night to choose a target. Blend in during the day.',
		godTip: 'All mafia members wake together and collectively choose one target to eliminate.',
	},
	silencer: {
		id: 'silencer',
		name: 'Silencer',
		team: 'mafia',
		icon: '🤐',
		description:
			'A mafia member who can silence a player, preventing them from speaking during the next day.',
		nightAction: 'silence',
		nightOrder: 2,
		playerTip:
			'Choose wisely who to silence. Silencing the Police or a vocal villager can swing the game.',
		godTip: 'After mafia kill, ask the Silencer to choose someone to silence. That player cannot speak next day phase.',
	},

	// ── Village Team ──
	villager: {
		id: 'villager',
		name: 'Villager',
		team: 'village',
		icon: '🏘️',
		description:
			'An ordinary townsperson. Uses observation and deduction to find the mafia.',
		nightOrder: 99,
		playerTip:
			'Pay attention to behavior and voting patterns. Your vote during the day is your weapon.',
		godTip: 'Villagers have no night action. They sleep through the night.',
	},
	police: {
		id: 'police',
		name: 'Police',
		team: 'village',
		icon: '🔍',
		description:
			'The town investigator. Can check one player each night to learn their alignment.',
		nightAction: 'investigate',
		nightOrder: 5,
		playerTip:
			'Investigate suspicious players at night. Share your findings carefully — revealing yourself makes you a target.',
		godTip: 'Police points at a player. Reveal if they are Mafia or Village. Remember: Godfather appears as Village.',
	},
	doctor: {
		id: 'doctor',
		name: 'Doctor',
		team: 'village',
		icon: '💊',
		description:
			'The town healer. Can protect one player from elimination each night.',
		nightAction: 'save',
		nightOrder: 3,
		playerTip:
			'Protect who you think the mafia will target. You can protect yourself, but use this sparingly.',
		godTip: 'Doctor chooses one player to protect. If mafia targeted the same player, no one dies tonight.',
	},
	bodyguard: {
		id: 'bodyguard',
		name: 'Bodyguard',
		team: 'village',
		icon: '🛡️',
		description: 'A protector who dies in place of their guarded target.',
		nightAction: 'guard',
		nightOrder: 4,
		playerTip:
			'Choose someone important to guard. If they are attacked, you will die instead of them.',
		godTip: 'Bodyguard picks a target. If that target is attacked, the Bodyguard dies instead. The target survives.',
	},
	vigilante: {
		id: 'vigilante',
		name: 'Vigilante',
		team: 'village',
		icon: '⚔️',
		description:
			'A village member who takes justice into their own hands. Can kill one player at night.',
		nightAction: 'vigilante_kill',
		nightOrder: 6,
		playerTip:
			'You can kill at night, but choose carefully — killing a fellow villager hurts your team!',
		godTip: 'Vigilante chooses a target to kill. This kill is separate from the mafia kill. Friendly fire is possible.',
	},
	mayor: {
		id: 'mayor',
		name: 'Mayor',
		team: 'village',
		icon: '👑',
		description:
			'The elected leader of the town. Their vote counts double during day eliminations.',
		nightOrder: 99,
		passiveAbility: 'Vote counts as 2 during day elimination votes.',
		playerTip:
			'Your vote is powerful. Use it wisely and consider revealing yourself to rally the town — but beware of becoming a target.',
		godTip: 'Mayor has no night action. During day votes, count their vote as 2. Track this carefully.',
	},

	// ── Neutral ──
	jester: {
		id: 'jester',
		name: 'Jester',
		team: 'neutral',
		icon: '🃏',
		description:
			'A wildcard who wins by getting voted out during the day. Loves chaos.',
		nightOrder: 99,
		passiveAbility:
			'Wins the game if eliminated by town vote (not by mafia or vigilante).',
		playerTip:
			'Act suspicious! Get the town to vote you out. If you succeed, you win regardless of who else wins.',
		godTip: 'If the Jester is voted out during the day, announce that the Jester wins. The game may continue for remaining players.',
	},
	serialKiller: {
		id: 'serialKiller',
		name: 'Serial Killer',
		team: 'neutral',
		icon: '🗡️',
		description:
			'An independent killer who acts alone at night. Wins by being the last one standing.',
		nightAction: 'serial_kill',
		nightOrder: 7,
		passiveAbility: 'Appears as Village to the Police.',
		playerTip:
			'You work alone. Kill everyone — mafia and village alike. The Police cannot detect you.',
		godTip: 'Serial Killer picks a target independently of mafia. If Police investigates, result is "Village". SK wins if last alive.',
	},
	survivor: {
		id: 'survivor',
		name: 'Survivor',
		team: 'neutral',
		icon: '🏃',
		description:
			'Just wants to live. Wins if alive when the game ends, regardless of which team wins.',
		nightOrder: 99,
		playerTip:
			'Stay under the radar. Avoid drawing attention. You win as long as you survive to the end.',
		godTip: 'Survivor has no night action. They win alongside whichever team wins, as long as they are alive.',
	},
};

export const ROLE_LIST = Object.values(ROLES);

export const getRolesByTeam = (team: Team) =>
	ROLE_LIST.filter((r) => r.team === team);

export const getNightActionRoles = () =>
	ROLE_LIST.filter((r) => r.nightAction).sort(
		(a, b) => a.nightOrder - b.nightOrder,
	);

// Default role configs for different player counts
export const PRESETS: Record<
	string,
	{ name: string; roles: Record<string, number> }
> = {
	classic8: {
		name: 'Classic (8 players)',
		roles: { mafia: 2, villager: 3, police: 1, doctor: 1, silencer: 1 },
	},
	extended10: {
		name: 'Extended (10 players)',
		roles: {
			godfather: 1,
			mafia: 1,
			silencer: 1,
			villager: 3,
			police: 1,
			doctor: 1,
			bodyguard: 1,
			jester: 1,
		},
	},
	bigGame12: {
		name: 'Big Game (12 players)',
		roles: {
			godfather: 1,
			mafia: 2,
			silencer: 1,
			villager: 3,
			police: 1,
			doctor: 1,
			vigilante: 1,
			mayor: 1,
			serialKiller: 1,
		},
	},
	chaos15: {
		name: 'Chaos (15 players)',
		roles: {
			godfather: 1,
			mafia: 2,
			silencer: 1,
			villager: 4,
			police: 1,
			doctor: 1,
			bodyguard: 1,
			vigilante: 1,
			mayor: 1,
			jester: 1,
			serialKiller: 1,
		},
	},
};
