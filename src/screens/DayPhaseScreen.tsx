import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { GameStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { playSound } from '../utils/sounds';
import { checkWinCondition } from '../utils/winCondition';

type DayStage = 'announcement' | 'discussion' | 'eliminate' | 'result';

export default function DayPhaseScreen() {
	const navigation =
		useNavigation<NativeStackNavigationProp<GameStackParamList>>();
	const {
		players,
		round,
		eliminationLog,
		eliminatePlayer,
		setPhase,
		nextRound,
		endGame,
	} = useGameStore();
	const { discussionTimerMinutes, revealDeadRoles } = useSettingsStore();

	const [stage, setStage] = useState<DayStage>('announcement');
	const [timeLeft, setTimeLeft] = useState(discussionTimerMinutes * 60);
	const [timerRunning, setTimerRunning] = useState(false);
	const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
	const alivePlayers = players.filter((p) => p.alive);
	const silencedPlayers = players.filter((p) => p.silenced && p.alive);

	// Find who died last night
	const lastNightDeaths = eliminationLog.filter(
		(e) =>
			e.round === round &&
			(e.method === 'mafia' ||
				e.method === 'serial_killer' ||
				e.method === 'vigilante'),
	);

	// Timer
	useEffect(() => {
		if (!timerRunning || timeLeft <= 0) return;

		const id = setTimeout(() => {
			setTimeLeft((t) => {
				if (t <= 1) {
					setTimerRunning(false);
					playSound('timer_warning');
					return 0;
				}
				if (t === 61) {
					playSound('timer_warning');
				}
				return t - 1;
			});
		}, 1000);

		return () => clearTimeout(id);
	}, [timerRunning, timeLeft]);

	const formatTime = (secs: number) => {
		const m = Math.floor(secs / 60);
		const s = secs % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	};

	const handleEliminate = () => {
		if (!selectedTarget) return;

		const target = players.find((p) => p.id === selectedTarget);
		if (!target) return;

		// Check if Jester wins
		if (target.role.id === 'jester') {
			Alert.alert(
				'JESTER WINS!',
				`${target.name} was the Jester! They win by being voted out! The game continues for remaining players.`,
			);
		}

		eliminatePlayer(selectedTarget, 'vote');
		playSound('eliminate');

		// Check win condition
		const winState = checkWinCondition(useGameStore.getState().players);

		if (winState.gameOver) {
			playSound('victory');
			endGame(winState.winner ?? 'village', winState.message);
			navigation.replace('GameEnd');
		} else {
			setStage('result');
		}
	};

	const handleProceedToNight = () => {
		playSound('night');
		nextRound();
		setPhase('night');
		navigation.replace('NightPhase');
	};

	const handleSkipToNight = () => {
		Alert.alert('Skip Elimination?', 'No one will be eliminated today.', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Skip',
				onPress: () => {
					nextRound();
					setPhase('night');
					navigation.replace('NightPhase');
				},
			},
		]);
	};

	// ── Announcement ──
	if (stage === 'announcement') {
		return (
			<SafeAreaView style={styles.container}>
				<ScrollView contentContainerStyle={styles.content}>
					<Text style={styles.dayTitle}>DAY {round}</Text>
					<Text style={styles.subtitle}>The town awakens...</Text>

					{lastNightDeaths.length === 0 ? (
						<View style={styles.announcementCard}>
							<Text style={styles.announcementText}>
								A peaceful night. No one was eliminated.
							</Text>
						</View>
					) : (
						lastNightDeaths.map((death) => {
							const player = players.find(
								(p) => p.id === death.playerId,
							);
							if (!player) return null;
							return (
								<View
									key={death.playerId}
									style={styles.deathCard}
								>
									<Text style={styles.deathName}>
										{player.name}
									</Text>
									<Text style={styles.deathMethod}>
										was found dead this morning.
									</Text>
									{revealDeadRoles && (
										<Text style={styles.deathRole}>
											They were: {player.role.icon}{' '}
											{player.role.name}
										</Text>
									)}
								</View>
							);
						})
					)}

					{silencedPlayers.length > 0 && (
						<View style={styles.silenceCard}>
							<Text style={styles.silenceText}>
								{silencedPlayers.map((p) => p.name).join(', ')}{' '}
								cannot speak today.
							</Text>
						</View>
					)}

					<TouchableOpacity
						style={styles.continueBtn}
						onPress={() => {
							setStage('discussion');
							setTimerRunning(true);
						}}
						accessibilityLabel="Begin discussion"
						accessibilityRole="button"
					>
						<Text style={styles.continueBtnText}>
							BEGIN DISCUSSION
						</Text>
					</TouchableOpacity>
				</ScrollView>
			</SafeAreaView>
		);
	}

	// ── Discussion ──
	if (stage === 'discussion') {
		const isWarning = timeLeft <= 60 && timeLeft > 0;
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.content}>
					<Text style={styles.dayTitle}>DISCUSSION</Text>

					<View
						style={[
							styles.timerBox,
							isWarning && styles.timerWarning,
						]}
					>
						<Text
							style={[
								styles.timerText,
								isWarning && styles.timerTextWarning,
							]}
						>
							{formatTime(timeLeft)}
						</Text>
					</View>

					<View style={styles.timerControls}>
						<TouchableOpacity
							style={styles.timerBtn}
							onPress={() => setTimerRunning(!timerRunning)}
							accessibilityLabel={
								timerRunning ? 'Pause timer' : 'Resume timer'
							}
							accessibilityRole="button"
						>
							<Text style={styles.timerBtnText}>
								{timerRunning ? 'PAUSE' : 'RESUME'}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.timerBtn}
							onPress={() => {
								setTimeLeft(discussionTimerMinutes * 60);
								setTimerRunning(false);
							}}
							accessibilityLabel="Reset timer"
							accessibilityRole="button"
						>
							<Text style={styles.timerBtnText}>RESET</Text>
						</TouchableOpacity>
					</View>

					<Text style={styles.aliveCount}>
						{alivePlayers.length} players alive
					</Text>

					<TouchableOpacity
						style={styles.eliminateActionBtn}
						onPress={() => {
							setTimerRunning(false);
							setStage('eliminate');
						}}
						accessibilityLabel="Eliminate someone"
						accessibilityRole="button"
					>
						<Text style={styles.eliminateActionBtnText}>
							ELIMINATE SOMEONE
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.skipBtn}
						onPress={handleSkipToNight}
					>
						<Text style={styles.skipBtnText}>
							Skip to Night (No Elimination)
						</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	// ── Eliminate (God picks who the town voted out) ──
	if (stage === 'eliminate') {
		return (
			<SafeAreaView style={styles.container}>
				<ScrollView contentContainerStyle={styles.content}>
					<Text style={styles.dayTitle}>ELIMINATION</Text>
					<Text style={styles.subtitle}>
						Who did the town vote to eliminate?
					</Text>

					<View style={styles.playerGrid}>
						{alivePlayers.map((player) => (
							<TouchableOpacity
								key={player.id}
								style={[
									styles.targetBtn,
									selectedTarget === player.id &&
										styles.targetBtnSelected,
								]}
								onPress={() => {
									playSound('target_select');
									setSelectedTarget(
										selectedTarget === player.id
											? null
											: player.id,
									);
								}}
								accessibilityLabel={`Vote to eliminate ${player.name}`}
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
							style={styles.backBtn}
							onPress={() => {
								setSelectedTarget(null);
								setStage('discussion');
							}}
						>
							<Text style={styles.backBtnText}>BACK</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.confirmEliminateBtn,
								!selectedTarget &&
									styles.confirmEliminateBtnDisabled,
							]}
							onPress={handleEliminate}
							disabled={!selectedTarget}
							accessibilityLabel="Confirm elimination"
							accessibilityRole="button"
						>
							<Text style={styles.confirmEliminateBtnText}>
								ELIMINATE
							</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						style={styles.skipBtn}
						onPress={handleSkipToNight}
					>
						<Text style={styles.skipBtnText}>No Elimination</Text>
					</TouchableOpacity>
				</ScrollView>
			</SafeAreaView>
		);
	}

	// ── Result ──
	const lastElimination = eliminationLog[eliminationLog.length - 1];
	const eliminatedPlayer = lastElimination
		? players.find((p) => p.id === lastElimination.playerId)
		: null;

	return (
		<SafeAreaView style={styles.container}>
			<View style={[styles.content, styles.centerContent]}>
				{eliminatedPlayer && (
					<>
						<Text style={styles.eliminatedName}>
							{eliminatedPlayer.name}
						</Text>
						<Text style={styles.eliminatedText}>
							has been eliminated by the town.
						</Text>
						{revealDeadRoles && (
							<Text style={styles.eliminatedRole}>
								They were: {eliminatedPlayer.role.icon}{' '}
								{eliminatedPlayer.role.name}
							</Text>
						)}
					</>
				)}

				<Text style={styles.aliveCount}>
					{alivePlayers.length} players remain
				</Text>

				<TouchableOpacity
					style={styles.nightBtn}
					onPress={handleProceedToNight}
					accessibilityLabel="Proceed to night phase"
					accessibilityRole="button"
				>
					<Text style={styles.nightBtnText}>PROCEED TO NIGHT</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bg.primary,
	},
	content: {
		flex: 1,
		padding: 24,
		alignItems: 'center',
	},
	centerContent: {
		justifyContent: 'center',
	},
	dayTitle: {
		fontFamily: fonts.heading,
		fontSize: 33,
		color: colors.day.glow,
		letterSpacing: 2,
		marginTop: 20,
	},
	subtitle: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.secondary,
		marginTop: 4,
		marginBottom: 24,
	},
	announcementCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.village.primary,
		borderRadius: 16,
		padding: 24,
		alignItems: 'center',
		width: '100%',
		marginBottom: 20,
	},
	announcementText: {
		fontFamily: fonts.body,
		fontSize: 19,
		color: colors.text.primary,
		textAlign: 'center',
	},
	deathCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.mafia.primary,
		borderRadius: 16,
		padding: 24,
		alignItems: 'center',
		width: '100%',
		marginBottom: 12,
	},
	deathName: {
		fontFamily: fonts.heading,
		fontSize: 25,
		color: colors.mafia.light,
	},
	deathMethod: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.text.secondary,
		marginTop: 4,
	},
	deathRole: {
		fontFamily: fonts.bodyBold,
		fontSize: 17,
		color: colors.text.primary,
		marginTop: 8,
	},
	silenceCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.gold.dark,
		borderRadius: 10,
		padding: 16,
		width: '100%',
		marginBottom: 16,
	},
	silenceText: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.gold.primary,
		textAlign: 'center',
	},
	continueBtn: {
		backgroundColor: colors.day.glow,
		borderRadius: 12,
		paddingHorizontal: 32,
		paddingVertical: 16,
		marginTop: 8,
	},
	continueBtnText: {
		fontFamily: fonts.heading,
		fontSize: 17,
		color: colors.bg.primary,
		letterSpacing: 1,
	},
	timerBox: {
		backgroundColor: colors.bg.card,
		borderWidth: 2,
		borderColor: colors.gold.primary,
		borderRadius: 20,
		paddingHorizontal: 48,
		paddingVertical: 24,
		marginVertical: 32,
	},
	timerWarning: {
		borderColor: colors.danger,
	},
	timerText: {
		fontFamily: fonts.heading,
		fontSize: 57,
		color: colors.gold.primary,
	},
	timerTextWarning: {
		color: colors.danger,
	},
	timerControls: {
		flexDirection: 'row',
		gap: 16,
		marginBottom: 32,
	},
	timerBtn: {
		backgroundColor: colors.bg.elevated,
		borderWidth: 1,
		borderColor: colors.gold.dark,
		borderRadius: 8,
		paddingHorizontal: 24,
		paddingVertical: 12,
	},
	timerBtnText: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.gold.primary,
	},
	aliveCount: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.text.secondary,
		marginBottom: 24,
	},
	eliminateActionBtn: {
		backgroundColor: colors.mafia.primary,
		borderWidth: 2,
		borderColor: colors.gold.primary,
		borderRadius: 12,
		paddingHorizontal: 32,
		paddingVertical: 16,
	},
	eliminateActionBtnText: {
		fontFamily: fonts.heading,
		fontSize: 17,
		color: colors.gold.primary,
		letterSpacing: 1,
	},
	skipBtn: {
		marginTop: 16,
		padding: 12,
	},
	skipBtnText: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.muted,
		textDecorationLine: 'underline',
	},
	playerGrid: {
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
		paddingVertical: 14,
		minWidth: '45%',
		flex: 1,
		alignItems: 'center',
	},
	targetBtnSelected: {
		borderColor: colors.mafia.light,
		backgroundColor: colors.mafia.bg,
	},
	targetName: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.text.primary,
	},
	targetNameSelected: {
		color: colors.mafia.light,
		fontFamily: fonts.bodyBold,
	},
	actionRow: {
		flexDirection: 'row',
		gap: 12,
		width: '100%',
	},
	backBtn: {
		flex: 1,
		backgroundColor: colors.bg.elevated,
		borderWidth: 1,
		borderColor: colors.text.muted,
		borderRadius: 10,
		padding: 16,
		alignItems: 'center',
	},
	backBtnText: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.text.muted,
	},
	confirmEliminateBtn: {
		flex: 2,
		backgroundColor: colors.mafia.primary,
		borderRadius: 10,
		padding: 16,
		alignItems: 'center',
	},
	confirmEliminateBtnDisabled: {
		opacity: 0.4,
	},
	confirmEliminateBtnText: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.gold.primary,
	},
	eliminatedName: {
		fontFamily: fonts.heading,
		fontSize: 29,
		color: colors.mafia.light,
	},
	eliminatedText: {
		fontFamily: fonts.body,
		fontSize: 19,
		color: colors.text.secondary,
		marginTop: 8,
		marginBottom: 8,
	},
	eliminatedRole: {
		fontFamily: fonts.bodyBold,
		fontSize: 19,
		color: colors.text.primary,
		marginBottom: 24,
	},
	nightBtn: {
		backgroundColor: colors.night.bg,
		borderWidth: 2,
		borderColor: colors.night.glow,
		borderRadius: 12,
		paddingHorizontal: 32,
		paddingVertical: 16,
		marginTop: 16,
	},
	nightBtnText: {
		fontFamily: fonts.heading,
		fontSize: 19,
		color: colors.night.glow,
		letterSpacing: 1,
	},
});
