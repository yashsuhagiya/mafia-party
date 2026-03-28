import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { GameStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { colors, teamColor } from '../theme/colors';
import { fonts } from '../theme/typography';

/**
 * Builds plain text role info for the QR code.
 * iPhone camera shows this as a text popup when scanned.
 */
function buildRoleText(
	playerName: string,
	roleName: string,
	roleIcon: string,
	team: string,
	description: string,
	teammates: string[],
): string {
	let text = `${playerName}, your role is:\n\n`;
	text += `${roleIcon} ${roleName}\n`;
	text += `Team: ${team.toUpperCase()}\n\n`;
	text += `${description}\n`;

	if (teammates.length > 0) {
		text += `\nYour teammates: ${teammates.join(', ')}\n`;
	}

	text += `\nDo not show this to anyone!`;
	return text;
}

export default function QRRevealScreen() {
	const { width } = useWindowDimensions();
	const QR_SIZE = width - 100;
	const navigation =
		useNavigation<NativeStackNavigationProp<GameStackParamList>>();
	const { players, revealIndex, nextReveal, setPhase } = useGameStore();
	const [showQR, setShowQR] = useState(false);

	const currentPlayer = players[revealIndex];
	const isLastPlayer = revealIndex >= players.length - 1;
	const allRevealed = revealIndex >= players.length;

	// Build QR data for current player
	const getQRData = () => {
		if (!currentPlayer) return '';

		const teammates =
			currentPlayer.role.team === 'mafia'
				? players
						.filter(
							(p) =>
								p.role.team === 'mafia' &&
								p.id !== currentPlayer.id,
						)
						.map((p) => p.name)
				: [];

		return buildRoleText(
			currentPlayer.name,
			currentPlayer.role.name,
			currentPlayer.role.icon,
			currentPlayer.role.team,
			currentPlayer.role.description,
			teammates,
		);
	};

	const handleNext = () => {
		setShowQR(false);
		nextReveal();
	};

	const handleProceedToNight = () => {
		setPhase('night');
		navigation.replace('NightPhase');
	};

	// All done
	if (allRevealed) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.center}>
					<Text style={styles.doneTitle}>ALL ROLES ASSIGNED</Text>
					<Text style={styles.doneSubtitle}>
						Everyone has scanned their QR code. The night begins...
					</Text>
					<TouchableOpacity
						style={styles.nightBtn}
						onPress={handleProceedToNight}
					>
						<Text style={styles.nightBtnText}>
							BEGIN NIGHT PHASE
						</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	const tc = teamColor(currentPlayer.role.team);

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<Text style={styles.title}>ROLE REVEAL</Text>
				<Text style={styles.counter}>
					{revealIndex + 1} of {players.length}
				</Text>

				<Text style={styles.playerName}>{currentPlayer.name}</Text>
				<Text style={styles.instruction}>
					{showQR
						? 'Scan this QR code with your phone camera'
						: 'Tap below to show QR code for this player'}
				</Text>

				{showQR ? (
					<View style={styles.qrContainer}>
						<View style={styles.qrWrapper}>
							<QRCode
								value={getQRData()}
								size={QR_SIZE}
								backgroundColor={colors.bg.card}
								color={colors.text.primary}
							/>
						</View>

						<Text style={styles.scanHint}>
							Player scans with phone camera to see their role
						</Text>

						<TouchableOpacity
							style={styles.nextBtn}
							onPress={handleNext}
						>
							<Text style={styles.nextBtnText}>
								{isLastPlayer ? 'DONE' : 'NEXT PLAYER'}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.hideBtn}
							onPress={() => setShowQR(false)}
						>
							<Text style={styles.hideBtnText}>Hide QR</Text>
						</TouchableOpacity>
					</View>
				) : (
					<TouchableOpacity
						style={[styles.showQRBtn, { borderColor: tc.primary }]}
						onPress={() => setShowQR(true)}
					>
						<Text style={styles.showQRBtnText}>SHOW QR CODE</Text>
					</TouchableOpacity>
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
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	scrollContent: {
		padding: 24,
		alignItems: 'center',
	},
	title: {
		fontFamily: fonts.heading,
		fontSize: 25,
		color: colors.gold.primary,
		letterSpacing: 3,
		marginTop: 12,
	},
	counter: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.muted,
		marginTop: 4,
		marginBottom: 24,
	},
	playerName: {
		fontFamily: fonts.heading,
		fontSize: 33,
		color: colors.gold.primary,
		textAlign: 'center',
		marginBottom: 8,
	},
	instruction: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.secondary,
		textAlign: 'center',
		marginBottom: 24,
	},
	showQRBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 2,
		borderRadius: 16,
		paddingHorizontal: 40,
		paddingVertical: 20,
	},
	showQRBtnText: {
		fontFamily: fonts.heading,
		fontSize: 19,
		color: colors.gold.primary,
		letterSpacing: 1,
	},
	qrContainer: {
		alignItems: 'center',
	},
	qrWrapper: {
		backgroundColor: colors.bg.card,
		borderWidth: 2,
		borderColor: colors.gold.dark,
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
	},
	scanHint: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.muted,
		textAlign: 'center',
		marginBottom: 24,
	},
	nextBtn: {
		backgroundColor: colors.gold.dark,
		borderRadius: 12,
		paddingHorizontal: 40,
		paddingVertical: 16,
		marginBottom: 12,
	},
	nextBtnText: {
		fontFamily: fonts.heading,
		fontSize: 17,
		color: colors.bg.primary,
		letterSpacing: 1,
	},
	hideBtn: {
		padding: 12,
	},
	hideBtnText: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.muted,
		textDecorationLine: 'underline',
	},
	doneTitle: {
		fontFamily: fonts.heading,
		fontSize: 25,
		color: colors.gold.primary,
		letterSpacing: 2,
		marginBottom: 12,
	},
	doneSubtitle: {
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
