import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNightActionRoles, type NightActionType } from '../data/roles';
import type { GameStackParamList } from '../navigation/types';
import { type NightAction, useGameStore } from '../store/gameStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { type NightResult, resolveNight } from '../utils/nightResolver';
import { playSound } from '../utils/sounds';
import { checkWinCondition } from '../utils/winCondition';

interface NightStep {
	roleId: string;
	roleName: string;
	icon: string;
	actionType: NightActionType;
	prompt: string;
	actorIds: string[]; // Players with this role who are alive
}

export default function NightPhaseScreen() {
	const navigation =
		useNavigation<NativeStackNavigationProp<GameStackParamList>>();
	const {
		players,
		round,
		addNightAction,
		clearNightActions,
		setPhase,
		eliminatePlayer,
		silencePlayer,
		clearSilence,
		endGame,
	} = useGameStore();

	const [stepIndex, setStepIndex] = useState(0);
	const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
	const [showResults, setShowResults] = useState(false);
	const [nightResult, setNightResult] = useState<NightResult | null>(null);

	const alivePlayers = players.filter((p) => p.alive);

	// Build night steps from alive players' roles
	const nightSteps = useMemo(() => {
		const steps: NightStep[] = [];
		const actionRoles = getNightActionRoles();

		for (const roleDef of actionRoles) {
			const actors = alivePlayers.filter((p) => p.role.id === roleDef.id);
			if (actors.length === 0 || !roleDef.nightAction) continue;

			const prompts: Record<NightActionType, string> = {
				kill: `${roleDef.name}, choose someone to eliminate.`,
				save: `${roleDef.name}, choose someone to protect tonight.`,
				investigate: `${roleDef.name}, choose someone to investigate.`,
				silence: `${roleDef.name}, choose someone to silence.`,
				guard: `${roleDef.name}, choose someone to guard with your life.`,
				vigilante_kill: `${roleDef.name}, choose your target. Choose wisely — friendly fire is possible.`,
				serial_kill: `${roleDef.name}, choose your victim.`,
			};

			steps.push({
				roleId: roleDef.id,
				roleName: roleDef.name,
				icon: roleDef.icon,
				actionType: roleDef.nightAction,
				prompt: prompts[roleDef.nightAction],
				actorIds: actors.map((a) => a.id),
			});
		}
		return steps;
	}, [alivePlayers]);

	const currentStep = nightSteps[stepIndex];
	const isLastStep = stepIndex >= nightSteps.length - 1;

	const handleSelectTarget = (targetId: string) => {
		playSound('target_select');
		setSelectedTarget(targetId === selectedTarget ? null : targetId);
	};

	const handleConfirm = () => {
		if (!selectedTarget || !currentStep) return;
		playSound('confirm');

		// Add night action
		const action: NightAction = {
			roleId: currentStep.roleId,
			actionType: currentStep.actionType,
			actorId: currentStep.actorIds[0],
			targetId: selectedTarget,
		};
		addNightAction(action);
		setSelectedTarget(null);

		if (isLastStep) {
			// Resolve all night actions
			const allActions = [
				...useGameStore.getState().nightActions,
				action,
			];
			const result = resolveNight(
				useGameStore.getState().players,
				allActions,
				round,
			);
			setNightResult(result);
			setShowResults(true);
		} else {
			setStepIndex(stepIndex + 1);
		}
	};

	const handleSkipRole = () => {
		if (isLastStep) {
			const currentState = useGameStore.getState();
			const result = resolveNight(
				currentState.players,
				currentState.nightActions,
				round,
			);
			setNightResult(result);
			setShowResults(true);
		} else {
			setStepIndex(stepIndex + 1);
		}
	};

	const handleProceedToDay = () => {
		if (!nightResult) return;

		// Clear silence from previous round
		clearSilence();

		// Apply eliminations
		for (const record of nightResult.eliminationRecords) {
			eliminatePlayer(record.playerId, record.method);
		}

		// Apply silence
		if (nightResult.silenced) {
			silencePlayer(nightResult.silenced);
		}

		// Check win condition
		const winState = checkWinCondition(useGameStore.getState().players);

		if (winState.gameOver) {
			playSound('victory');
			endGame(winState.winner ?? 'village', winState.message);
			navigation.replace('GameEnd');
		} else {
			playSound('day');
			clearNightActions();
			setPhase('day');
			navigation.replace('DayPhase');
		}
	};

	// Night results screen
	if (showResults && nightResult) {
		return (
			<SafeAreaView
				style={[styles.container, { backgroundColor: colors.night.bg }]}
			>
				<ScrollView contentContainerStyle={styles.resultsContent}>
					<Text style={styles.nightTitle}>NIGHT {round} RESULTS</Text>
					<Text style={styles.subtitle}>For God's eyes only</Text>

					{nightResult.details.map((detail: string) => (
						<View key={detail} style={styles.resultItem}>
							<Text style={styles.resultText}>{detail}</Text>
						</View>
					))}

					{nightResult.policeResult && (
						<View style={styles.policeBox}>
							<Text style={styles.policeLabel}>
								POLICE INVESTIGATION
							</Text>
							<Text style={styles.policeResult}>
								{
									players.find(
										(p) =>
											p.id ===
											nightResult.policeResult?.targetId,
									)?.name
								}
								:{' '}
								<Text
									style={{
										color: nightResult.policeResult.isMafia
											? colors.mafia.light
											: colors.village.light,
									}}
								>
									{nightResult.policeResult.isMafia
										? 'MAFIA'
										: 'NOT MAFIA'}
								</Text>
							</Text>
						</View>
					)}

					<TouchableOpacity
						style={styles.proceedBtn}
						onPress={handleProceedToDay}
						accessibilityLabel="Proceed to day phase"
						accessibilityRole="button"
					>
						<Text style={styles.proceedBtnText}>
							☀ PROCEED TO DAY
						</Text>
					</TouchableOpacity>
				</ScrollView>
			</SafeAreaView>
		);
	}

	// No night actions needed
	if (nightSteps.length === 0) {
		return (
			<SafeAreaView
				style={[styles.container, { backgroundColor: colors.night.bg }]}
			>
				<View style={styles.center}>
					<Text style={styles.nightTitle}>NIGHT {round}</Text>
					<Text style={styles.noActionsText}>
						No roles with night actions remain alive.
					</Text>
					<TouchableOpacity
						style={styles.proceedBtn}
						onPress={() => {
							clearSilence();
							setPhase('day');
							navigation.replace('DayPhase');
						}}
						accessibilityLabel="Proceed to day phase"
						accessibilityRole="button"
					>
						<Text style={styles.proceedBtnText}>
							☀ PROCEED TO DAY
						</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	// Night action step
	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.night.bg }]}
		>
			<ScrollView contentContainerStyle={styles.stepContent}>
				<Text style={styles.nightTitle}>NIGHT {round}</Text>
				<Text style={styles.stepCounter}>
					Step {stepIndex + 1} of {nightSteps.length}
				</Text>

				<View style={styles.roleHeader}>
					<Text style={styles.roleIcon}>{currentStep.icon}</Text>
					<Text style={styles.roleName}>{currentStep.roleName}</Text>
				</View>

				<Text style={styles.prompt}>{currentStep.prompt}</Text>

				{/* Target selection */}
				<Text style={styles.selectLabel}>SELECT TARGET</Text>
				<View style={styles.targetGrid}>
					{alivePlayers
						.filter((p) => {
							// Mafia can't target themselves, but Doctor/Bodyguard can self-protect
							const canSelfTarget =
								currentStep.actionType === 'save' ||
								currentStep.actionType === 'guard';
							if (
								currentStep.actorIds.includes(p.id) &&
								!canSelfTarget
							)
								return false;
							return true;
						})
						.map((player) => (
							<TouchableOpacity
								key={player.id}
								style={[
									styles.targetBtn,
									selectedTarget === player.id &&
										styles.targetBtnSelected,
								]}
								onPress={() => handleSelectTarget(player.id)}
								accessibilityLabel={`Select ${player.name}`}
								accessibilityRole="button"
							>
								<Text
									style={[
										styles.targetName,
										selectedTarget === player.id &&
											styles.targetNameSelected,
									]}
								>
									{player.name}
								</Text>
							</TouchableOpacity>
						))}
				</View>

				<View style={styles.actionRow}>
					<TouchableOpacity
						style={styles.skipBtn}
						onPress={handleSkipRole}
						accessibilityLabel="Skip this role's action"
						accessibilityRole="button"
					>
						<Text style={styles.skipBtnText}>SKIP</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.confirmBtn,
							!selectedTarget && styles.confirmBtnDisabled,
						]}
						onPress={handleConfirm}
						disabled={!selectedTarget}
						accessibilityLabel="Confirm target selection"
						accessibilityRole="button"
					>
						<Text style={styles.confirmBtnText}>CONFIRM</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	stepContent: {
		padding: 24,
		alignItems: 'center',
	},
	resultsContent: {
		padding: 24,
		alignItems: 'center',
	},
	nightTitle: {
		fontFamily: fonts.heading,
		fontSize: 33,
		color: colors.night.glow,
		letterSpacing: 3,
		marginTop: 20,
	},
	subtitle: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.night.text,
		marginTop: 4,
		marginBottom: 24,
	},
	stepCounter: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.muted,
		marginTop: 4,
		marginBottom: 24,
	},
	roleHeader: {
		alignItems: 'center',
		marginBottom: 16,
	},
	roleIcon: {
		fontSize: 49,
		marginBottom: 8,
	},
	roleName: {
		fontFamily: fonts.heading,
		fontSize: 25,
		color: colors.night.glow,
	},
	prompt: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.night.text,
		textAlign: 'center',
		lineHeight: 24,
		marginBottom: 24,
	},
	selectLabel: {
		fontFamily: fonts.heading,
		fontSize: 13,
		color: colors.gold.dark,
		letterSpacing: 2,
		marginBottom: 12,
		alignSelf: 'flex-start',
	},
	targetGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		width: '100%',
		marginBottom: 24,
	},
	targetBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.gold.muted,
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 12,
		minWidth: '45%',
		alignItems: 'center',
	},
	targetBtnSelected: {
		borderColor: colors.night.glow,
		backgroundColor: 'rgba(201,132,42,0.15)',
	},
	targetName: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.secondary,
	},
	targetNameSelected: {
		color: colors.night.glow,
		fontFamily: fonts.bodyBold,
	},
	actionRow: {
		flexDirection: 'row',
		gap: 16,
		width: '100%',
	},
	skipBtn: {
		flex: 1,
		backgroundColor: colors.bg.elevated,
		borderWidth: 1,
		borderColor: colors.text.muted,
		borderRadius: 10,
		padding: 16,
		alignItems: 'center',
	},
	skipBtnText: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.text.muted,
	},
	confirmBtn: {
		flex: 2,
		backgroundColor: colors.night.glow,
		borderRadius: 10,
		padding: 16,
		alignItems: 'center',
	},
	confirmBtnDisabled: {
		opacity: 0.4,
	},
	confirmBtnText: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.bg.primary,
	},
	resultItem: {
		backgroundColor: colors.bg.card,
		borderRadius: 10,
		padding: 16,
		width: '100%',
		marginBottom: 10,
	},
	resultText: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.text.primary,
		lineHeight: 24,
	},
	policeBox: {
		borderWidth: 1,
		borderColor: colors.village.primary,
		borderRadius: 10,
		padding: 16,
		width: '100%',
		marginTop: 8,
		marginBottom: 20,
	},
	policeLabel: {
		fontFamily: fonts.heading,
		fontSize: 12,
		color: colors.village.primary,
		letterSpacing: 2,
		marginBottom: 6,
	},
	policeResult: {
		fontFamily: fonts.bodyBold,
		fontSize: 19,
		color: colors.text.primary,
	},
	proceedBtn: {
		backgroundColor: colors.day.glow,
		borderRadius: 12,
		paddingHorizontal: 32,
		paddingVertical: 16,
		marginTop: 16,
	},
	proceedBtnText: {
		fontFamily: fonts.heading,
		fontSize: 17,
		color: colors.bg.primary,
		letterSpacing: 1,
	},
	noActionsText: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.night.text,
		textAlign: 'center',
		marginVertical: 24,
	},
});
