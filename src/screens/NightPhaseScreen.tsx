import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import {
	getNightActionRoles,
	type NightActionType,
	type RoleDefinition,
} from '../data/roles';
import type { GameStackParamList } from '../navigation/types';
import { type NightAction, useGameStore } from '../store/gameStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { type NightResult, resolveNight } from '../utils/nightResolver';
import { checkWinCondition } from '../utils/winCondition';

interface NightStep {
	roleId: string;
	roleName: string;
	icon: RoleDefinition['icon'];
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
		removeNightAction,
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

	// A restored night restarts at step 1, so drop any stale actions.
	useEffect(() => {
		clearNightActions();
	}, [clearNightActions]);

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
				vigilante_kill: `${roleDef.name}, choose your target. Choose wisely, friendly fire is possible.`,
				serial_kill: `${roleDef.name}, choose your victim.`,
			};

			// Godfather and Mafia share the 'kill' action and the resolver only
			// uses the first one, so ask God once for both.
			const existing = steps.find(
				(step) => step.actionType === roleDef.nightAction,
			);
			if (existing) {
				existing.actorIds.push(...actors.map((a) => a.id));
				existing.roleName = 'Mafia';
				existing.prompt = 'Mafia, choose someone to eliminate.';
				continue;
			}

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
		setSelectedTarget(targetId === selectedTarget ? null : targetId);
	};

	const resolveAndShow = () => {
		const state = useGameStore.getState();
		const result = resolveNight(state.players, state.nightActions, round);
		setNightResult(result);
		setShowResults(true);
	};

	const handleConfirm = () => {
		if (!selectedTarget || !currentStep) return;

		// Add night action (replaces any earlier action for this role)
		const action: NightAction = {
			roleId: currentStep.roleId,
			actionType: currentStep.actionType,
			actorId: currentStep.actorIds[0],
			targetId: selectedTarget,
		};
		addNightAction(action);
		setSelectedTarget(null);

		if (isLastStep) {
			resolveAndShow();
		} else {
			setStepIndex(stepIndex + 1);
		}
	};

	const handleSkipRole = () => {
		if (isLastStep) {
			resolveAndShow();
		} else {
			setStepIndex(stepIndex + 1);
		}
	};

	const handleBack = () => {
		const target = showResults ? currentStep : nightSteps[stepIndex - 1];
		if (target) removeNightAction(target.roleId);
		setSelectedTarget(null);
		if (showResults) {
			setShowResults(false);
			setNightResult(null);
		} else {
			setStepIndex(stepIndex - 1);
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
			endGame(winState.winner ?? 'village', winState.message);
			navigation.replace('GameEnd');
		} else {
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
					<Text style={styles.nightTitle}>Night {round} results</Text>
					<Text style={styles.subtitle}>For God's eyes only</Text>

					{nightResult.details.map((detail: string) => (
						<View key={detail} style={styles.resultItem}>
							<Text style={styles.resultText}>{detail}</Text>
						</View>
					))}

					{nightResult.policeResult && (
						<View style={styles.policeBox}>
							<Text style={styles.policeLabel}>
								Police investigation
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
										? 'Mafia'
										: 'Not mafia'}
								</Text>
							</Text>
						</View>
					)}

					<View style={styles.actionRow}>
						<Button
							label="Back"
							variant="secondary"
							onPress={handleBack}
							style={{ flex: 1 }}
						/>
						<Button
							label="Proceed to day"
							onPress={handleProceedToDay}
							style={{ flex: 2 }}
						/>
					</View>
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
					<Text style={styles.nightTitle}>Night {round}</Text>
					<Text style={styles.noActionsText}>
						No roles with night actions remain alive.
					</Text>
					<Button
						label="Proceed to day"
						onPress={() => {
							clearSilence();
							setPhase('day');
							navigation.replace('DayPhase');
						}}
					/>
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
				<Text style={styles.nightTitle}>Night {round}</Text>
				<Text style={styles.stepCounter}>
					Step {stepIndex + 1} of {nightSteps.length}
				</Text>

				<View style={styles.roleHeader}>
					<View style={styles.roleIcon}>
						<Ionicons
							name={currentStep.icon}
							size={40}
							color={colors.night.text}
						/>
					</View>
					<Text style={styles.roleName}>{currentStep.roleName}</Text>
				</View>

				<Text style={styles.prompt}>{currentStep.prompt}</Text>

				{/* Target selection */}
				<Text style={styles.selectLabel}>Select target</Text>
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
					{stepIndex > 0 && (
						<Button
							label="Back"
							variant="secondary"
							onPress={handleBack}
							style={{ flex: 1 }}
						/>
					)}
					<Button
						label="Skip"
						variant="secondary"
						onPress={handleSkipRole}
						accessibilityLabel="Skip this role's action"
						style={{ flex: 1 }}
					/>
					<Button
						label="Confirm"
						onPress={handleConfirm}
						disabled={!selectedTarget}
						accessibilityLabel="Confirm target selection"
						style={{ flex: 2 }}
					/>
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
		fontSize: 32,
		color: colors.night.glow,
		marginTop: 20,
	},
	subtitle: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.night.text,
		marginTop: 4,
		marginBottom: 24,
	},
	stepCounter: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.muted,
		marginTop: 4,
		marginBottom: 24,
	},
	roleHeader: {
		alignItems: 'center',
		marginBottom: 16,
	},
	roleIcon: {
		marginBottom: 8,
	},
	roleName: {
		fontFamily: fonts.heading,
		fontSize: 24,
		color: colors.text.primary,
	},
	prompt: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.night.text,
		textAlign: 'center',
		lineHeight: 24,
		marginBottom: 24,
	},
	selectLabel: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 14,
		color: colors.text.secondary,
		marginBottom: 12,
		alignSelf: 'flex-start',
	},
	targetGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
		width: '100%',
		marginBottom: 24,
	},
	targetBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 12,
		minWidth: '45%',
		alignItems: 'center',
	},
	targetBtnSelected: {
		borderColor: colors.accent.primary,
		backgroundColor: colors.accent.muted,
	},
	targetName: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.secondary,
	},
	targetNameSelected: {
		color: colors.text.primary,
		fontFamily: fonts.bodySemiBold,
	},
	actionRow: {
		flexDirection: 'row',
		gap: 16,
		width: '100%',
	},
	resultItem: {
		backgroundColor: colors.bg.card,
		borderRadius: 10,
		padding: 16,
		width: '100%',
		marginBottom: 12,
	},
	resultText: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.primary,
		lineHeight: 24,
	},
	policeBox: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		padding: 16,
		width: '100%',
		marginTop: 8,
		marginBottom: 20,
	},
	policeLabel: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 12,
		color: colors.text.secondary,
		marginBottom: 8,
	},
	policeResult: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 20,
		color: colors.text.primary,
	},
	noActionsText: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.night.text,
		textAlign: 'center',
		marginVertical: 24,
	},
});
