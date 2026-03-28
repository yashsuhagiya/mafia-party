import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { GameStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { colors, teamColor } from '../theme/colors';
import { fonts } from '../theme/typography';
import { playSound } from '../utils/sounds';

type RevealState = 'waiting' | 'revealed';

export default function RoleRevealScreen() {
	const { width } = useWindowDimensions();
	const navigation =
		useNavigation<NativeStackNavigationProp<GameStackParamList>>();
	const { players, revealIndex, nextReveal, setPhase } = useGameStore();
	const [state, setState] = useState<RevealState>('waiting');

	const currentPlayer = players[revealIndex];
	const _isLastPlayer = revealIndex >= players.length - 1;
	const allRevealed = revealIndex >= players.length;

	// Find mafia teammates for mafia players
	const mafiaTeammates =
		currentPlayer?.role.team === 'mafia'
			? players
					.filter(
						(p) =>
							p.role.team === 'mafia' &&
							p.id !== currentPlayer.id,
					)
					.map((p) => p.name)
			: [];

	const handleTapToReveal = () => {
		playSound('reveal');
		setState('revealed');
	};

	const handleGotIt = () => {
		playSound('confirm');
		setState('waiting');
		nextReveal();
	};

	const handleProceedToNight = () => {
		playSound('night');
		setPhase('night');
		navigation.replace('NightPhase');
	};

	if (allRevealed) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.center}>
					<Text style={styles.allDoneIcon}>✓</Text>
					<Text style={styles.allDoneTitle}>ALL ROLES REVEALED</Text>
					<Text style={styles.allDoneSubtitle}>
						Everyone knows their role. The night is about to
						begin...
					</Text>
					<TouchableOpacity
						style={styles.nightBtn}
						onPress={handleProceedToNight}
						accessibilityLabel="Begin night phase"
						accessibilityRole="button"
					>
						<Text style={styles.nightBtnText}>
							🌙 BEGIN NIGHT PHASE
						</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	const tc = teamColor(currentPlayer.role.team);

	if (state === 'waiting') {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.center}>
					<Text style={styles.passLabel}>PASS THE PHONE TO</Text>
					<Text style={styles.playerName}>{currentPlayer.name}</Text>
					<Text style={styles.playerCount}>
						{revealIndex + 1} of {players.length}
					</Text>

					<TouchableOpacity
						style={styles.revealBtn}
						onPress={handleTapToReveal}
						accessibilityLabel="Tap to reveal your role"
						accessibilityRole="button"
					>
						<Text style={styles.revealBtnText}>
							TAP TO SEE YOUR ROLE
						</Text>
					</TouchableOpacity>

					<Text style={styles.hint}>
						Only {currentPlayer.name} should be looking at the
						screen
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	// Revealed state
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.center}>
				<View
					style={[
						styles.roleCard,
						{ borderColor: tc.primary, width: width - 48 },
					]}
				>
					<View
						style={[
							styles.teamBadge,
							{ backgroundColor: tc.primary },
						]}
					>
						<Text style={styles.teamBadgeText}>
							{currentPlayer.role.team.toUpperCase()}
						</Text>
					</View>

					<Text style={styles.roleIcon}>
						{currentPlayer.role.icon}
					</Text>
					<Text style={[styles.roleName, { color: tc.primary }]}>
						{currentPlayer.role.name}
					</Text>
					<Text style={styles.roleDesc}>
						{currentPlayer.role.description}
					</Text>

					{currentPlayer.role.passiveAbility && (
						<View style={styles.abilityBox}>
							<Text style={styles.abilityLabel}>
								SPECIAL ABILITY
							</Text>
							<Text style={styles.abilityText}>
								{currentPlayer.role.passiveAbility}
							</Text>
						</View>
					)}

					{mafiaTeammates.length > 0 && (
						<View
							style={[
								styles.abilityBox,
								{ borderColor: colors.mafia.primary },
							]}
						>
							<Text
								style={[
									styles.abilityLabel,
									{ color: colors.mafia.light },
								]}
							>
								YOUR TEAMMATES
							</Text>
							<Text style={styles.abilityText}>
								{mafiaTeammates.join(', ')}
							</Text>
						</View>
					)}

					<Text style={styles.tip}>
						{currentPlayer.role.playerTip}
					</Text>
				</View>

				<TouchableOpacity
					style={styles.gotItBtn}
					onPress={handleGotIt}
					accessibilityLabel="Confirm role seen"
					accessibilityRole="button"
				>
					<Text style={styles.gotItBtnText}>
						GOT IT — PASS BACK TO GOD
					</Text>
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
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	passLabel: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.text.secondary,
		letterSpacing: 3,
		marginBottom: 8,
	},
	playerName: {
		fontFamily: fonts.heading,
		fontSize: 37,
		color: colors.gold.primary,
		textAlign: 'center',
	},
	playerCount: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.muted,
		marginTop: 8,
		marginBottom: 40,
	},
	revealBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 2,
		borderColor: colors.gold.primary,
		borderRadius: 16,
		paddingHorizontal: 40,
		paddingVertical: 20,
	},
	revealBtnText: {
		fontFamily: fonts.heading,
		fontSize: 17,
		color: colors.gold.primary,
		letterSpacing: 1,
	},
	hint: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.muted,
		marginTop: 24,
		textAlign: 'center',
	},
	roleCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 2,
		borderRadius: 20,
		padding: 28,
		alignItems: 'center',
	},
	teamBadge: {
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 4,
		marginBottom: 16,
	},
	teamBadgeText: {
		fontFamily: fonts.heading,
		fontSize: 12,
		color: colors.text.primary,
		letterSpacing: 2,
	},
	roleIcon: {
		fontSize: 57,
		marginBottom: 12,
	},
	roleName: {
		fontFamily: fonts.heading,
		fontSize: 29,
		letterSpacing: 1,
		marginBottom: 8,
	},
	roleDesc: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.secondary,
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 16,
	},
	abilityBox: {
		borderWidth: 1,
		borderColor: colors.gold.dark,
		borderRadius: 10,
		padding: 12,
		width: '100%',
		marginBottom: 12,
	},
	abilityLabel: {
		fontFamily: fonts.heading,
		fontSize: 11,
		color: colors.gold.primary,
		letterSpacing: 2,
		marginBottom: 4,
	},
	abilityText: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.primary,
		lineHeight: 20,
	},
	tip: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
		textAlign: 'center',
		lineHeight: 20,
		marginTop: 4,
	},
	gotItBtn: {
		backgroundColor: colors.gold.dark,
		borderRadius: 12,
		paddingHorizontal: 32,
		paddingVertical: 16,
		marginTop: 24,
	},
	gotItBtnText: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.bg.primary,
		letterSpacing: 1,
	},
	allDoneIcon: {
		fontSize: 65,
		color: colors.gold.primary,
		marginBottom: 16,
	},
	allDoneTitle: {
		fontFamily: fonts.heading,
		fontSize: 25,
		color: colors.gold.primary,
		letterSpacing: 2,
		marginBottom: 12,
	},
	allDoneSubtitle: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.text.secondary,
		textAlign: 'center',
		lineHeight: 24,
		marginBottom: 32,
	},
	nightBtn: {
		backgroundColor: colors.night.bg,
		borderWidth: 2,
		borderColor: colors.night.glow,
		borderRadius: 12,
		paddingHorizontal: 32,
		paddingVertical: 18,
	},
	nightBtnText: {
		fontFamily: fonts.heading,
		fontSize: 19,
		color: colors.night.glow,
		letterSpacing: 1,
	},
});
