import type {
	EliminationRecord,
	NightAction,
	Player,
} from '../store/gameStore';

export interface NightResult {
	eliminated: string[]; // Player IDs who died
	saved: string[]; // Player IDs who were saved
	silenced: string | null; // Player ID who was silenced
	policeResult: { targetId: string; isMafia: boolean } | null;
	bodyguardDied: string | null; // Bodyguard ID if they died protecting
	details: string[]; // Narrative descriptions for God
	eliminationRecords: EliminationRecord[];
}

/**
 * Resolves all night actions and determines outcomes.
 * Processing order: Mafia kill → Doctor save → Bodyguard → Serial Killer → Vigilante → Police → Silencer
 */
export function resolveNight(
	players: Player[],
	actions: NightAction[],
	round: number,
): NightResult {
	const result: NightResult = {
		eliminated: [],
		saved: [],
		silenced: null,
		policeResult: null,
		bodyguardDied: null,
		details: [],
		eliminationRecords: [],
	};

	const getPlayer = (id: string) => players.find((p) => p.id === id);
	const getAction = (type: string) =>
		actions.find((a) => a.actionType === type);

	// 1. Mafia kill
	const mafiaKill = getAction('kill');
	const mafiaTargetId = mafiaKill?.targetId;
	let mafiaTargetSaved = false;

	// 2. Doctor save
	const doctorSave = getAction('save');
	if (doctorSave && mafiaTargetId && doctorSave.targetId === mafiaTargetId) {
		mafiaTargetSaved = true;
		result.saved.push(mafiaTargetId);
		const savedPlayer = getPlayer(mafiaTargetId);
		result.details.push(`Doctor saved ${savedPlayer?.name || 'unknown'}!`);
	}

	// 3. Bodyguard
	const bodyguardAction = getAction('guard');
	if (
		bodyguardAction &&
		mafiaTargetId &&
		bodyguardAction.targetId === mafiaTargetId &&
		!mafiaTargetSaved
	) {
		// Bodyguard dies instead
		const bodyguard = getPlayer(bodyguardAction.actorId);
		if (bodyguard) {
			result.bodyguardDied = bodyguard.id;
			result.eliminated.push(bodyguard.id);
			result.eliminationRecords.push({
				round,
				playerId: bodyguard.id,
				method: 'mafia',
			});
			result.details.push(
				`${bodyguard.name} (Bodyguard) died protecting ${getPlayer(mafiaTargetId)?.name}!`,
			);
			mafiaTargetSaved = true; // Target was saved by bodyguard's sacrifice
			result.saved.push(mafiaTargetId);
		}
	}

	// Resolve mafia kill if not saved
	if (mafiaTargetId && !mafiaTargetSaved) {
		result.eliminated.push(mafiaTargetId);
		result.eliminationRecords.push({
			round,
			playerId: mafiaTargetId,
			method: 'mafia',
		});
		const target = getPlayer(mafiaTargetId);
		result.details.push(
			`${target?.name || 'Unknown'} was killed by the Mafia.`,
		);
	}

	// 4. Serial Killer
	const skKill = getAction('serial_kill');
	if (skKill) {
		const skTarget = skKill.targetId;
		// Doctor can also save from SK
		if (doctorSave && doctorSave.targetId === skTarget) {
			result.saved.push(skTarget);
			result.details.push(
				`Doctor saved ${getPlayer(skTarget)?.name} from the Serial Killer!`,
			);
		} else if (!result.eliminated.includes(skTarget)) {
			result.eliminated.push(skTarget);
			result.eliminationRecords.push({
				round,
				playerId: skTarget,
				method: 'serial_killer',
			});
			result.details.push(
				`${getPlayer(skTarget)?.name} was killed by the Serial Killer.`,
			);
		}
	}

	// 5. Vigilante
	const vigKill = getAction('vigilante_kill');
	if (vigKill) {
		const vigTarget = vigKill.targetId;
		// Doctor can save from vigilante
		if (doctorSave && doctorSave.targetId === vigTarget) {
			result.saved.push(vigTarget);
			result.details.push(
				`Doctor saved ${getPlayer(vigTarget)?.name} from the Vigilante!`,
			);
		} else if (!result.eliminated.includes(vigTarget)) {
			result.eliminated.push(vigTarget);
			result.eliminationRecords.push({
				round,
				playerId: vigTarget,
				method: 'vigilante',
			});
			result.details.push(
				`${getPlayer(vigTarget)?.name} was killed by the Vigilante.`,
			);
		}
	}

	// 6. Police investigation
	const policeAction = getAction('investigate');
	if (policeAction) {
		const target = getPlayer(policeAction.targetId);
		if (target) {
			// Godfather and Serial Killer appear as village
			const appearsInnocent =
				target.role.id === 'godfather' ||
				target.role.id === 'serialKiller';
			const isMafia = target.role.team === 'mafia' && !appearsInnocent;
			result.policeResult = { targetId: target.id, isMafia };
			result.details.push(
				`Police investigated ${target.name}: ${isMafia ? 'MAFIA' : 'Not Mafia'}`,
			);
		}
	}

	// 7. Silencer
	const silenceAction = getAction('silence');
	if (silenceAction) {
		result.silenced = silenceAction.targetId;
		const target = getPlayer(silenceAction.targetId);
		result.details.push(
			`${target?.name} has been silenced for the next day.`,
		);
	}

	if (result.eliminated.length === 0 && result.details.length === 0) {
		result.details.push('A peaceful night. No one was harmed.');
	}

	return result;
}
