import {
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

/**
 * Public-safe view — shows alive/dead status only, NO roles.
 * Can be shown to all players.
 */
export default function PlayerBoardScreen() {
	const { width } = useWindowDimensions();
	const { players, round } = useGameStore();

	const alive = players.filter((p) => p.alive);
	const dead = players.filter((p) => !p.alive);

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.title}>TOWN BOARD</Text>
				<Text style={styles.roundText}>Round {round}</Text>

				{/* Stats bar (God-only info is hidden — just alive count) */}
				<View style={styles.statsRow}>
					<View style={styles.statBox}>
						<Text style={styles.statValue}>{alive.length}</Text>
						<Text style={styles.statLabel}>ALIVE</Text>
					</View>
					<View style={styles.statBox}>
						<Text style={styles.statValue}>{dead.length}</Text>
						<Text style={styles.statLabel}>DEAD</Text>
					</View>
					<View style={styles.statBox}>
						<Text style={styles.statValue}>{players.length}</Text>
						<Text style={styles.statLabel}>TOTAL</Text>
					</View>
				</View>

				{/* Alive players */}
				<Text style={styles.sectionTitle}>ALIVE</Text>
				<View style={styles.grid}>
					{alive.map((player) => (
						<View
							key={player.id}
							style={[
								styles.aliveCard,
								{ minWidth: (width - 60) / 3 },
							]}
						>
							<Text style={styles.aliveIcon}>🤠</Text>
							<Text style={styles.aliveName}>{player.name}</Text>
							{player.silenced && (
								<Text style={styles.silencedBadge}>🤐</Text>
							)}
						</View>
					))}
				</View>

				{/* Dead players */}
				{dead.length > 0 && (
					<>
						<Text style={styles.sectionTitle}>FALLEN</Text>
						<View style={styles.grid}>
							{dead.map((player) => (
								<View
									key={player.id}
									style={[
										styles.deadCard,
										{ minWidth: (width - 60) / 3 },
									]}
								>
									<Text style={styles.deadIcon}>💀</Text>
									<Text style={styles.deadName}>
										{player.name}
									</Text>
								</View>
							))}
						</View>
					</>
				)}
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
		alignItems: 'center',
	},
	title: {
		fontFamily: fonts.heading,
		fontSize: 29,
		color: colors.gold.primary,
		letterSpacing: 3,
		marginTop: 8,
	},
	roundText: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.muted,
		marginBottom: 20,
	},
	statsRow: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 24,
	},
	statBox: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.gold.muted,
		borderRadius: 12,
		paddingHorizontal: 24,
		paddingVertical: 14,
		alignItems: 'center',
		flex: 1,
	},
	statValue: {
		fontFamily: fonts.heading,
		fontSize: 25,
		color: colors.gold.primary,
	},
	statLabel: {
		fontFamily: fonts.body,
		fontSize: 11,
		color: colors.text.muted,
		letterSpacing: 1,
		marginTop: 4,
	},
	sectionTitle: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.gold.primary,
		letterSpacing: 2,
		alignSelf: 'flex-start',
		marginBottom: 12,
		marginTop: 8,
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		width: '100%',
		marginBottom: 20,
	},
	aliveCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.alive,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		alignItems: 'center',
		flex: 1,
	},
	aliveIcon: {
		fontSize: 29,
		marginBottom: 6,
	},
	aliveName: {
		fontFamily: fonts.bodyBold,
		fontSize: 14,
		color: colors.text.primary,
		textAlign: 'center',
	},
	silencedBadge: {
		fontSize: 17,
		marginTop: 4,
	},
	deadCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.dead,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		alignItems: 'center',
		flex: 1,
		opacity: 0.5,
	},
	deadIcon: {
		fontSize: 29,
		marginBottom: 6,
	},
	deadName: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.muted,
		textAlign: 'center',
		textDecorationLine: 'line-through',
	},
});
