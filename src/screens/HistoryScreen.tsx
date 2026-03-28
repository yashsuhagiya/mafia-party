import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore } from '../store/historyStore';
import { colors, teamColor } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function HistoryScreen() {
	const { games, clearHistory } = useHistoryStore();

	// Stats
	const totalGames = games.length;
	const mafiaWins = games.filter((g) => g.winner === 'mafia').length;
	const villageWins = games.filter((g) => g.winner === 'village').length;
	const _neutralWins = games.filter((g) => g.winner === 'neutral').length;

	// Player stats
	const playerStats: Record<
		string,
		{ games: number; wins: number; survived: number }
	> = {};
	for (const game of games) {
		for (const player of game.players) {
			if (!playerStats[player.name]) {
				playerStats[player.name] = { games: 0, wins: 0, survived: 0 };
			}
			playerStats[player.name].games++;
			if (player.survived) playerStats[player.name].survived++;
			if (player.team === game.winner) playerStats[player.name].wins++;
		}
	}

	const topPlayers = Object.entries(playerStats)
		.sort(([, a], [, b]) => b.wins - a.wins)
		.slice(0, 5);

	const handleClear = () => {
		Alert.alert('Clear History', 'Delete all game records?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Clear', style: 'destructive', onPress: clearHistory },
		]);
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.title}>GAME HISTORY</Text>

				{totalGames === 0 ? (
					<View style={styles.emptyState}>
						<Text style={styles.emptyIcon}>📜</Text>
						<Text style={styles.emptyText}>
							No games played yet. Start your first game!
						</Text>
					</View>
				) : (
					<>
						{/* Overall stats */}
						<View style={styles.statsGrid}>
							<View style={styles.statBox}>
								<Text style={styles.statValue}>
									{totalGames}
								</Text>
								<Text style={styles.statLabel}>GAMES</Text>
							</View>
							<View
								style={[
									styles.statBox,
									{ borderColor: colors.mafia.primary },
								]}
							>
								<Text
									style={[
										styles.statValue,
										{ color: colors.mafia.light },
									]}
								>
									{mafiaWins}
								</Text>
								<Text style={styles.statLabel}>MAFIA WINS</Text>
							</View>
							<View
								style={[
									styles.statBox,
									{ borderColor: colors.village.primary },
								]}
							>
								<Text
									style={[
										styles.statValue,
										{ color: colors.village.light },
									]}
								>
									{villageWins}
								</Text>
								<Text style={styles.statLabel}>
									VILLAGE WINS
								</Text>
							</View>
						</View>

						{/* Leaderboard */}
						{topPlayers.length > 0 && (
							<>
								<Text style={styles.sectionTitle}>
									HALL OF FAME
								</Text>
								{topPlayers.map(([name, stats], i) => (
									<View key={name} style={styles.leaderRow}>
										<Text style={styles.leaderRank}>
											#{i + 1}
										</Text>
										<View style={styles.leaderInfo}>
											<Text style={styles.leaderName}>
												{name}
											</Text>
											<Text style={styles.leaderStats}>
												{stats.wins}W / {stats.games}G —{' '}
												{stats.survived} survived
											</Text>
										</View>
										<Text style={styles.leaderWinRate}>
											{Math.round(
												(stats.wins / stats.games) *
													100,
											)}
											%
										</Text>
									</View>
								))}
							</>
						)}

						{/* Game list */}
						<Text style={styles.sectionTitle}>RECENT GAMES</Text>
						{games.slice(0, 20).map((game) => {
							const tc = teamColor(game.winner);
							const date = new Date(game.date);
							return (
								<View key={game.id} style={styles.gameCard}>
									<View style={styles.gameHeader}>
										<Text style={styles.gameDate}>
											{date.toLocaleDateString()}
										</Text>
										<Text
											style={[
												styles.gameWinner,
												{ color: tc.primary },
											]}
										>
											{game.winner.toUpperCase()} WON
										</Text>
									</View>
									<Text style={styles.gameInfo}>
										{game.players.length} players •{' '}
										{game.rounds} rounds
									</Text>
									<Text
										style={styles.gamePlayers}
										numberOfLines={2}
									>
										{game.players
											.map((p) => p.name)
											.join(', ')}
									</Text>
								</View>
							);
						})}

						<TouchableOpacity
							style={styles.clearBtn}
							onPress={handleClear}
						>
							<Text style={styles.clearBtnText}>
								Clear History
							</Text>
						</TouchableOpacity>
					</>
				)}

				<View style={{ height: 40 }} />
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
		padding: 20,
	},
	title: {
		fontFamily: fonts.heading,
		fontSize: 29,
		color: colors.gold.primary,
		textAlign: 'center',
		letterSpacing: 3,
		marginTop: 8,
		marginBottom: 20,
	},
	emptyState: {
		alignItems: 'center',
		marginTop: 60,
	},
	emptyIcon: {
		fontSize: 65,
		marginBottom: 16,
	},
	emptyText: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.text.secondary,
		textAlign: 'center',
	},
	statsGrid: {
		flexDirection: 'row',
		gap: 10,
		marginBottom: 24,
	},
	statBox: {
		flex: 1,
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.gold.muted,
		borderRadius: 12,
		padding: 16,
		alignItems: 'center',
	},
	statValue: {
		fontFamily: fonts.heading,
		fontSize: 29,
		color: colors.gold.primary,
	},
	statLabel: {
		fontFamily: fonts.body,
		fontSize: 10,
		color: colors.text.muted,
		letterSpacing: 1,
		marginTop: 4,
	},
	sectionTitle: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.gold.primary,
		letterSpacing: 2,
		marginBottom: 12,
	},
	leaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.bg.card,
		borderRadius: 10,
		padding: 14,
		marginBottom: 8,
	},
	leaderRank: {
		fontFamily: fonts.heading,
		fontSize: 17,
		color: colors.gold.primary,
		width: 36,
	},
	leaderInfo: {
		flex: 1,
	},
	leaderName: {
		fontFamily: fonts.bodyBold,
		fontSize: 17,
		color: colors.text.primary,
	},
	leaderStats: {
		fontFamily: fonts.body,
		fontSize: 13,
		color: colors.text.muted,
		marginTop: 2,
	},
	leaderWinRate: {
		fontFamily: fonts.heading,
		fontSize: 19,
		color: colors.gold.primary,
	},
	gameCard: {
		backgroundColor: colors.bg.card,
		borderRadius: 10,
		padding: 14,
		marginBottom: 8,
	},
	gameHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	gameDate: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.muted,
	},
	gameWinner: {
		fontFamily: fonts.heading,
		fontSize: 13,
		letterSpacing: 1,
	},
	gameInfo: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
		marginBottom: 4,
	},
	gamePlayers: {
		fontFamily: fonts.body,
		fontSize: 13,
		color: colors.text.muted,
	},
	clearBtn: {
		marginTop: 20,
		alignSelf: 'center',
		padding: 12,
	},
	clearBtnText: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.danger,
		textDecorationLine: 'underline',
	},
});
