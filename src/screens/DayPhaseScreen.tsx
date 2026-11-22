import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import type { GameStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { confirm, notify } from '../utils/confirm';
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

	// If today's vote already happened (restored game), resume at the result.
	const [stage, setStage] = useState<DayStage>(() =>
		eliminationLog.some((e) => e.round === round && e.method === 'vote')
			? 'result'
			: 'announcement',
	);
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
					return 0;
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

		confirm(
			`Eliminate ${target.name}?`,
			'This cannot be undone.',
			'Eliminate',
			() => {
				// Check if Jester wins
				if (target.role.id === 'jester') {
					notify(
						'Jester wins',
						`${target.name} was the Jester and wins by being voted out. The game continues for the remaining players.`,
					);
				}

				eliminatePlayer(target.id, 'vote');

				// Check win condition
				const winState = checkWinCondition(
					useGameStore.getState().players,
				);

				if (winState.gameOver) {
					endGame(winState.winner ?? 'village', winState.message);
					navigation.replace('GameEnd');
				} else {
					setStage('result');
				}
			},
			true,
		);
	};

	const handleProceedToNight = () => {
		nextRound();
		setPhase('night');
		navigation.replace('NightPhase');
	};

	const handleSkipToNight = () => {
		confirm(
			'Skip elimination?',
			'No one will be eliminated today.',
			'Skip',
			handleProceedToNight,
		);
	};

	// ── Announcement ──
	if (stage === 'announcement') {
		return (
			<SafeAreaView style={styles.container}>
				<ScrollView contentContainerStyle={styles.content}>
					<Text style={styles.dayTitle}>Day {round}</Text>
					<Text style={styles.subtitle}>The town awakens.</Text>

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
											They were: {player.role.name}
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

					<Button
						label="Begin discussion"
						onPress={() => {
							setStage('discussion');
							setTimerRunning(true);
						}}
					/>
				</ScrollView>
			</SafeAreaView>
		);
	}

	// ── Discussion ──
	if (stage === 'discussion') {
		const isWarning = timeLeft <= 60;
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.content}>
					<Text style={styles.dayTitle}>Discussion</Text>

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
						<Button
							label={timerRunning ? 'Pause' : 'Resume'}
							variant="secondary"
							onPress={() => setTimerRunning(!timerRunning)}
							accessibilityLabel={
								timerRunning ? 'Pause timer' : 'Resume timer'
							}
						/>
						<Button
							label="Reset"
							variant="secondary"
							onPress={() => {
								setTimeLeft(discussionTimerMinutes * 60);
								setTimerRunning(false);
							}}
							accessibilityLabel="Reset timer"
						/>
					</View>

					<Text style={styles.aliveCount}>
						{alivePlayers.length} players alive
					</Text>

					<Button
						label="Call the vote"
						onPress={() => {
							setTimerRunning(false);
							setStage('eliminate');
						}}
					/>
				</View>
			</SafeAreaView>
		);
	}

	// ── Eliminate (God picks who the town voted out) ──
	if (stage === 'eliminate') {
		return (
			<SafeAreaView style={styles.container}>
				<ScrollView contentContainerStyle={styles.content}>
					<Text style={styles.dayTitle}>Elimination</Text>
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
						<Button
							label="Back"
							variant="secondary"
							onPress={() => {
								setSelectedTarget(null);
								setStage('discussion');
							}}
							style={{ flex: 1 }}
						/>
						<Button
							label="Eliminate"
							variant="destructive"
							onPress={handleEliminate}
							disabled={!selectedTarget}
							accessibilityLabel="Confirm elimination"
							style={{ flex: 2 }}
						/>
					</View>

					<Button
						label="No elimination"
						variant="secondary"
						onPress={handleSkipToNight}
						style={styles.noElimination}
					/>
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
								They were: {eliminatedPlayer.role.name}
							</Text>
						)}
					</>
				)}

				<Text style={styles.aliveCount}>
					{alivePlayers.length} players remain
				</Text>

				<Button
					label="Proceed to night"
					onPress={handleProceedToNight}
				/>
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
		fontSize: 32,
		color: colors.text.primary,
		marginTop: 20,
	},
	subtitle: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
		marginTop: 4,
		marginBottom: 24,
	},
	announcementCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
		padding: 24,
		alignItems: 'center',
		width: '100%',
		marginBottom: 20,
	},
	announcementText: {
		fontFamily: fonts.body,
		fontSize: 20,
		color: colors.text.primary,
		textAlign: 'center',
	},
	deathCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
		padding: 24,
		alignItems: 'center',
		width: '100%',
		marginBottom: 12,
	},
	deathName: {
		fontFamily: fonts.heading,
		fontSize: 24,
		color: colors.text.primary,
	},
	deathMethod: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.secondary,
		marginTop: 4,
	},
	deathRole: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 16,
		color: colors.text.primary,
		marginTop: 8,
	},
	silenceCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		padding: 16,
		width: '100%',
		marginBottom: 16,
	},
	silenceText: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.primary,
		textAlign: 'center',
	},
	timerBox: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
		paddingHorizontal: 48,
		paddingVertical: 24,
		marginVertical: 32,
	},
	timerWarning: {
		borderColor: colors.danger,
	},
	timerText: {
		fontFamily: fonts.heading,
		fontSize: 56,
		color: colors.text.primary,
		fontVariant: ['tabular-nums'],
	},
	timerTextWarning: {
		color: colors.danger,
	},
	timerControls: {
		flexDirection: 'row',
		gap: 16,
		marginBottom: 32,
	},
	aliveCount: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.secondary,
		marginBottom: 24,
	},
	noElimination: {
		marginTop: 16,
		alignSelf: 'stretch',
	},
	playerGrid: {
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
		flex: 1,
		alignItems: 'center',
	},
	targetBtnSelected: {
		borderColor: colors.accent.primary,
		backgroundColor: colors.accent.muted,
	},
	targetName: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.primary,
	},
	targetNameSelected: {
		color: colors.text.primary,
		fontFamily: fonts.bodySemiBold,
	},
	actionRow: {
		flexDirection: 'row',
		gap: 12,
		width: '100%',
	},
	eliminatedName: {
		fontFamily: fonts.heading,
		fontSize: 32,
		color: colors.text.primary,
	},
	eliminatedText: {
		fontFamily: fonts.body,
		fontSize: 20,
		color: colors.text.secondary,
		marginTop: 8,
		marginBottom: 8,
	},
	eliminatedRole: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 20,
		color: colors.text.primary,
		marginBottom: 24,
	},
});
