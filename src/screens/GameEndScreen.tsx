import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { ROLES } from '../data/roles';
import type { GameEndNavigationProp } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { useHistoryStore } from '../store/historyStore';
import { colors, teamColor } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function GameEndScreen() {
	const navigation = useNavigation<GameEndNavigationProp>();
	const { players, winner, winMessage, round, resetGame } = useGameStore();
	const { addGame } = useHistoryStore();

	// Victory sound is played by the calling screen (NightPhaseScreen / DayPhaseScreen)
	// before navigating here, so no need to play it again.

	const tc = winner ? teamColor(winner) : colors.village;
	const winnerLabel =
		winner === 'mafia'
			? 'Mafia wins'
			: winner === 'village'
				? 'Village wins'
				: 'Neutral wins';

	const winnerIcon =
		ROLES[
			winner === 'mafia'
				? 'mafia'
				: winner === 'village'
					? 'villager'
					: 'jester'
		].icon;

	const saveGame = () => {
		addGame({
			id: Date.now().toString(),
			date: new Date().toISOString(),
			players: players.map((p) => ({
				name: p.name,
				role: p.role.name,
				team: p.role.team,
				survived: p.alive,
			})),
			rounds: round,
			winner: winner ?? 'village',
		});
	};

	const handleNewGame = () => {
		saveGame();
		resetGame();
		navigation.navigate('Setup');
	};

	const handlePlayAgain = () => {
		saveGame();

		// Keep player names but reset everything else
		const names = players.map((p) => p.name);
		resetGame();
		useGameStore.getState().setPlayerNames(names);
		navigation.navigate('Setup');
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.gameOver}>Game over</Text>

				<View style={[styles.winnerCard, { borderColor: tc.primary }]}>
					<View style={styles.winnerIcon}>
						<Ionicons
							name={winnerIcon}
							size={56}
							color={tc.primary}
						/>
					</View>
					<Text style={[styles.winnerText, { color: tc.primary }]}>
						{winnerLabel}
					</Text>
					<Text style={styles.winMessage}>{winMessage}</Text>
					<Text style={styles.roundCount}>After {round} rounds</Text>
				</View>

				{/* All players with roles revealed */}
				<Text style={styles.sectionTitle}>Final roster</Text>
				{players.map((player) => {
					const ptc = teamColor(player.role.team);
					return (
						<View
							key={player.id}
							style={[
								styles.playerRow,
								!player.alive && styles.playerRowDead,
							]}
						>
							<View style={styles.playerIcon}>
								<Ionicons
									name={player.role.icon}
									size={24}
									color={ptc.primary}
								/>
							</View>
							<View style={styles.playerInfo}>
								<Text
									style={[
										styles.playerName,
										!player.alive && styles.playerNameDead,
									]}
								>
									{player.name}
								</Text>
								<Text
									style={[
										styles.playerRole,
										{ color: ptc.primary },
									]}
								>
									{player.role.name}
								</Text>
							</View>
							<Ionicons
								name={player.alive ? 'checkmark' : 'close'}
								size={20}
								color={
									player.alive
										? colors.success
										: colors.text.muted
								}
							/>
						</View>
					);
				})}

				<View style={styles.actions}>
					<Button
						label="Play again (same players)"
						onPress={handlePlayAgain}
						accessibilityLabel="Play again with same players"
					/>
					<Button
						label="New game"
						variant="secondary"
						onPress={handleNewGame}
						accessibilityLabel="Start new game"
					/>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bg.primary,
	},
	content: {
		padding: 24,
		alignItems: 'center',
	},
	gameOver: {
		fontFamily: fonts.heading,
		fontSize: 40,
		color: colors.text.primary,
		marginTop: 20,
		marginBottom: 24,
	},
	winnerCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderRadius: 14,
		padding: 32,
		alignItems: 'center',
		width: '100%',
		marginBottom: 32,
	},
	winnerIcon: {
		marginBottom: 16,
	},
	winnerText: {
		fontFamily: fonts.heading,
		fontSize: 32,
	},
	winMessage: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.secondary,
		textAlign: 'center',
		marginTop: 8,
		lineHeight: 24,
	},
	roundCount: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.muted,
		marginTop: 8,
	},
	sectionTitle: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 14,
		color: colors.text.secondary,
		alignSelf: 'flex-start',
		marginBottom: 12,
	},
	playerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.bg.card,
		borderRadius: 10,
		padding: 12,
		width: '100%',
		marginBottom: 8,
	},
	playerRowDead: {
		opacity: 0.5,
	},
	playerIcon: {
		width: 24,
		marginRight: 12,
	},
	playerInfo: {
		flex: 1,
	},
	playerName: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 16,
		color: colors.text.primary,
	},
	playerNameDead: {
		textDecorationLine: 'line-through',
	},
	playerRole: {
		fontFamily: fonts.body,
		fontSize: 14,
		marginTop: 4,
	},
	actions: {
		width: '100%',
		gap: 12,
		marginTop: 24,
		marginBottom: 40,
	},
});
