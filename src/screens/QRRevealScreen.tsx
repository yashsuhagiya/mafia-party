import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import type { GameStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

/**
 * Builds plain text role info for the QR code.
 * iPhone camera shows this as a text popup when scanned.
 */
function buildRoleText(
	playerName: string,
	roleName: string,
	team: string,
	description: string,
): string {
	let text = `${playerName}, your role is:\n\n`;
	text += `Role: ${roleName}\n`;
	text += `Team: ${team.charAt(0).toUpperCase()}${team.slice(1)}\n\n`;
	text += `${description}\n`;

	text += `\nDo not show this to anyone.`;
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

		return buildRoleText(
			currentPlayer.name,
			currentPlayer.role.name,
			currentPlayer.role.team,
			currentPlayer.role.description,
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
					<Text style={styles.doneTitle}>All roles assigned</Text>
					<Text style={styles.doneSubtitle}>
						Everyone has scanned their QR code. The night begins.
					</Text>
					<Button
						label="Begin night"
						onPress={handleProceedToNight}
					/>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<Text style={styles.title}>Role reveal</Text>
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

						<Button
							label={isLastPlayer ? 'Done' : 'Next player'}
							onPress={handleNext}
							style={styles.nextBtn}
						/>

						<Button
							label="Hide QR"
							variant="secondary"
							onPress={() => setShowQR(false)}
						/>
					</View>
				) : (
					<Button
						label="Show QR code"
						variant="secondary"
						onPress={() => setShowQR(true)}
					/>
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
		fontSize: 24,
		color: colors.text.primary,
		marginTop: 12,
	},
	counter: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.muted,
		marginTop: 4,
		marginBottom: 24,
	},
	playerName: {
		fontFamily: fonts.heading,
		fontSize: 32,
		color: colors.text.primary,
		textAlign: 'center',
		marginBottom: 8,
	},
	instruction: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
		textAlign: 'center',
		marginBottom: 24,
	},
	qrContainer: {
		alignItems: 'center',
	},
	qrWrapper: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
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
		marginBottom: 12,
	},
	doneTitle: {
		fontFamily: fonts.heading,
		fontSize: 24,
		color: colors.text.primary,
		marginBottom: 12,
	},
	doneSubtitle: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.secondary,
		textAlign: 'center',
		lineHeight: 24,
		marginBottom: 32,
	},
});
