import { Ionicons } from '@expo/vector-icons';
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
				<Text style={styles.title}>Town board</Text>
				<Text style={styles.roundText}>Round {round}</Text>

				{/* Stats bar (God-only info is hidden — just alive count) */}
				<View style={styles.statsRow}>
					<View style={styles.statBox}>
						<Text style={styles.statValue}>{alive.length}</Text>
						<Text style={styles.statLabel}>Alive</Text>
					</View>
					<View style={styles.statBox}>
						<Text style={styles.statValue}>{dead.length}</Text>
						<Text style={styles.statLabel}>Dead</Text>
					</View>
					<View style={styles.statBox}>
						<Text style={styles.statValue}>{players.length}</Text>
						<Text style={styles.statLabel}>Total</Text>
					</View>
				</View>

				{/* Alive players */}
				<Text style={styles.sectionTitle}>Alive</Text>
				<View style={styles.grid}>
					{alive.map((player) => (
						<View
							key={player.id}
							style={[
								styles.aliveCard,
								{ minWidth: (width - 60) / 3 },
							]}
						>
							<Ionicons
								name="person"
								size={24}
								color={colors.text.secondary}
								style={styles.aliveIcon}
							/>
							<Text style={styles.aliveName}>{player.name}</Text>
							{player.silenced && (
								<Ionicons
									name="volume-mute"
									size={16}
									color={colors.text.secondary}
									style={styles.silencedBadge}
								/>
							)}
						</View>
					))}
				</View>

				{/* Dead players */}
				{dead.length > 0 && (
					<>
						<Text style={styles.sectionTitle}>Fallen</Text>
						<View style={styles.grid}>
							{dead.map((player) => (
								<View
									key={player.id}
									style={[
										styles.deadCard,
										{ minWidth: (width - 60) / 3 },
									]}
								>
									<Ionicons
										name="close"
										size={24}
										color={colors.text.muted}
										style={styles.deadIcon}
									/>
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
		fontSize: 32,
		color: colors.text.primary,
		marginTop: 8,
	},
	roundText: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
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
		borderColor: colors.border,
		borderRadius: 14,
		paddingHorizontal: 24,
		paddingVertical: 12,
		alignItems: 'center',
		flex: 1,
	},
	statValue: {
		fontFamily: fonts.heading,
		fontSize: 24,
		color: colors.text.primary,
	},
	statLabel: {
		fontFamily: fonts.body,
		fontSize: 12,
		color: colors.text.secondary,
		marginTop: 4,
	},
	sectionTitle: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 14,
		color: colors.text.secondary,
		alignSelf: 'flex-start',
		marginBottom: 12,
		marginTop: 8,
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		width: '100%',
		marginBottom: 20,
	},
	aliveCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
		paddingHorizontal: 16,
		paddingVertical: 12,
		alignItems: 'center',
		flex: 1,
	},
	aliveIcon: {
		marginBottom: 8,
	},
	aliveName: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 14,
		color: colors.text.primary,
		textAlign: 'center',
	},
	silencedBadge: {
		marginTop: 4,
	},
	deadCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
		paddingHorizontal: 16,
		paddingVertical: 12,
		alignItems: 'center',
		flex: 1,
		opacity: 0.5,
	},
	deadIcon: {
		marginBottom: 8,
	},
	deadName: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.muted,
		textAlign: 'center',
		textDecorationLine: 'line-through',
	},
});
