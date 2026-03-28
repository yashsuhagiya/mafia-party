import { useNavigation } from '@react-navigation/native';
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
			? 'MAFIA WINS'
			: winner === 'village'
				? 'VILLAGE WINS'
				: 'NEUTRAL WINS';

	const winnerIcon =
		winner === 'mafia' ? '🔪' : winner === 'village' ? '🏘️' : '🃏';

	const handleNewGame = () => {
		// Save to history
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

		resetGame();
		navigation.navigate('Setup');
	};

	const handlePlayAgain = () => {
		// Save and restart with same players
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

		// Keep player names but reset everything else
		const names = players.map((p) => p.name);
		resetGame();
		useGameStore.getState().setPlayerNames(names);
		navigation.navigate('Setup');
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.gameOver}>GAME OVER</Text>

				<View style={[styles.winnerCard, { borderColor: tc.primary }]}>
					<Text style={styles.winnerIcon}>{winnerIcon}</Text>
					<Text style={[styles.winnerText, { color: tc.primary }]}>
						{winnerLabel}
					</Text>
					<Text style={styles.winMessage}>{winMessage}</Text>
					<Text style={styles.roundCount}>After {round} rounds</Text>
				</View>

				{/* All players with roles revealed */}
				<Text style={styles.sectionTitle}>FINAL ROSTER</Text>
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
							<Text style={styles.playerIcon}>
								{player.role.icon}
							</Text>
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
							<Text style={styles.statusIcon}>
								{player.alive ? '✓' : '💀'}
							</Text>
						</View>
					);
				})}

				<View style={styles.actions}>
					<TouchableOpacity
						style={styles.playAgainBtn}
						onPress={handlePlayAgain}
						accessibilityLabel="Play again with same players"
						accessibilityRole="button"
					>
						<Text style={styles.playAgainText}>
							PLAY AGAIN (SAME PLAYERS)
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.newGameBtn}
						onPress={handleNewGame}
						accessibilityLabel="Start new game"
						accessibilityRole="button"
					>
						<Text style={styles.newGameText}>NEW GAME</Text>
					</TouchableOpacity>
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
		fontSize: 37,
		color: colors.gold.primary,
		letterSpacing: 4,
		marginTop: 20,
		marginBottom: 24,
	},
	winnerCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 2,
		borderRadius: 20,
		padding: 32,
		alignItems: 'center',
		width: '100%',
		marginBottom: 32,
	},
	winnerIcon: {
		fontSize: 65,
		marginBottom: 16,
	},
	winnerText: {
		fontFamily: fonts.heading,
		fontSize: 29,
		letterSpacing: 2,
	},
	winMessage: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.text.secondary,
		textAlign: 'center',
		marginTop: 8,
		lineHeight: 24,
	},
	roundCount: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.muted,
		marginTop: 8,
	},
	sectionTitle: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.gold.primary,
		letterSpacing: 2,
		alignSelf: 'flex-start',
		marginBottom: 12,
	},
	playerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.bg.card,
		borderRadius: 10,
		padding: 14,
		width: '100%',
		marginBottom: 8,
	},
	playerRowDead: {
		opacity: 0.5,
	},
	playerIcon: {
		fontSize: 25,
		marginRight: 12,
	},
	playerInfo: {
		flex: 1,
	},
	playerName: {
		fontFamily: fonts.bodyBold,
		fontSize: 17,
		color: colors.text.primary,
	},
	playerNameDead: {
		textDecorationLine: 'line-through',
	},
	playerRole: {
		fontFamily: fonts.body,
		fontSize: 14,
		marginTop: 2,
	},
	statusIcon: {
		fontSize: 21,
	},
	actions: {
		width: '100%',
		gap: 12,
		marginTop: 24,
		marginBottom: 40,
	},
	playAgainBtn: {
		backgroundColor: colors.gold.dark,
		borderRadius: 12,
		padding: 16,
		alignItems: 'center',
	},
	playAgainText: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.bg.primary,
		letterSpacing: 1,
	},
	newGameBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.gold.dark,
		borderRadius: 12,
		padding: 16,
		alignItems: 'center',
	},
	newGameText: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.gold.primary,
		letterSpacing: 1,
	},
});
