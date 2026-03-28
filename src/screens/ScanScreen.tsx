import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function ScanScreen() {
	const { width } = useWindowDimensions();
	const FRAME_SIZE = width * 0.7;
	const [permission, requestPermission] = useCameraPermissions();
	const [scannedText, setScannedText] = useState<string | null>(null);
	const [scanning, setScanning] = useState(true);

	const handleBarCodeScanned = ({ data }: { data: string }) => {
		if (!scanning) return;
		setScanning(false);
		setScannedText(data);
	};

	const handleReset = () => {
		setScannedText(null);
		setScanning(true);
	};

	// Permission not yet determined
	if (!permission) {
		return (
			<SafeAreaView
				style={styles.container}
				edges={['top', 'left', 'right']}
			>
				<View style={styles.center}>
					<Text style={styles.title}>SCAN ROLE</Text>
					<Text style={styles.message}>Loading camera...</Text>
				</View>
			</SafeAreaView>
		);
	}

	// Permission denied
	if (!permission.granted) {
		return (
			<SafeAreaView
				style={styles.container}
				edges={['top', 'left', 'right']}
			>
				<View style={styles.center}>
					<Text style={styles.title}>SCAN ROLE</Text>
					<Text style={styles.message}>
						Camera access is needed to scan QR codes.
					</Text>
					<TouchableOpacity
						style={styles.grantBtn}
						onPress={requestPermission}
					>
						<Text style={styles.grantBtnText}>
							GRANT CAMERA ACCESS
						</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	// Show scanned role
	if (scannedText) {
		// Parse the role text
		const lines = scannedText.split('\n').filter((l) => l.trim());
		const _hasTeammates = scannedText.includes('Your teammates:');

		return (
			<SafeAreaView
				style={styles.container}
				edges={['top', 'left', 'right']}
			>
				<View style={styles.center}>
					<View style={[styles.roleCard, { width: width - 48 }]}>
						{lines.map((line, i) => {
							// Style different lines differently
							if (i === 0) {
								// "PlayerName, your role is:"
								return (
									<Text key={line} style={styles.roleHeader}>
										{line}
									</Text>
								);
							}
							if (line.startsWith('Team:')) {
								const team = line
									.replace('Team: ', '')
									.trim()
									.toLowerCase();
								const tc =
									team === 'mafia'
										? colors.mafia.primary
										: team === 'village'
											? colors.village.primary
											: colors.neutral.primary;
								return (
									<View
										key={line}
										style={[
											styles.teamBadge,
											{ backgroundColor: tc },
										]}
									>
										<Text style={styles.teamBadgeText}>
											{line.replace('Team: ', '')}
										</Text>
									</View>
								);
							}
							if (line.includes('Your teammates:')) {
								return (
									<View
										key={line}
										style={styles.teammatesBox}
									>
										<Text style={styles.teammatesLabel}>
											YOUR TEAMMATES
										</Text>
										<Text style={styles.teammatesText}>
											{line.replace(
												'Your teammates: ',
												'',
											)}
										</Text>
									</View>
								);
							}
							if (line.includes('Do not show')) {
								return (
									<Text key={line} style={styles.warning}>
										{line}
									</Text>
								);
							}
							// Role name line (has emoji) or description
							const hasEmoji = /[\u{1F000}-\u{1FFFF}]/u.test(
								line,
							);
							if (hasEmoji) {
								return (
									<Text key={line} style={styles.roleName}>
										{line}
									</Text>
								);
							}
							return (
								<Text key={line} style={styles.roleDesc}>
									{line}
								</Text>
							);
						})}
					</View>

					<TouchableOpacity
						style={styles.scanAgainBtn}
						onPress={handleReset}
					>
						<Text style={styles.scanAgainBtnText}>SCAN AGAIN</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	// Camera scanner
	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
			<Text style={styles.title}>SCAN ROLE</Text>
			<Text style={styles.subtitle}>Point camera at the QR code</Text>

			<View
				style={[
					styles.cameraContainer,
					{ width: width - 48, height: width - 48 },
				]}
			>
				<CameraView
					style={styles.camera}
					facing="back"
					barcodeScannerSettings={{
						barcodeTypes: ['qr'],
					}}
					onBarcodeScanned={
						scanning ? handleBarCodeScanned : undefined
					}
				/>
				{/* Scanner overlay */}
				<View style={styles.overlay}>
					<View
						style={[
							styles.scanFrame,
							{ width: FRAME_SIZE, height: FRAME_SIZE },
						]}
					/>
				</View>
			</View>

			<Text style={styles.hint}>
				Ask God to show the QR code for your name
			</Text>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bg.primary,
		alignItems: 'center',
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	title: {
		fontFamily: fonts.heading,
		fontSize: 25,
		color: colors.gold.primary,
		letterSpacing: 3,
		marginTop: 16,
	},
	subtitle: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.secondary,
		marginTop: 4,
		marginBottom: 16,
	},
	message: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.text.secondary,
		textAlign: 'center',
		marginBottom: 24,
	},
	grantBtn: {
		backgroundColor: colors.gold.dark,
		borderRadius: 12,
		paddingHorizontal: 32,
		paddingVertical: 16,
	},
	grantBtnText: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.bg.primary,
		letterSpacing: 1,
	},
	cameraContainer: {
		borderRadius: 16,
		overflow: 'hidden',
		borderWidth: 2,
		borderColor: colors.gold.dark,
	},
	camera: {
		flex: 1,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scanFrame: {
		borderWidth: 2,
		borderColor: colors.gold.primary,
		borderRadius: 12,
	},
	hint: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.muted,
		marginTop: 16,
		textAlign: 'center',
	},

	// Scanned role display
	roleCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 2,
		borderColor: colors.gold.dark,
		borderRadius: 20,
		padding: 28,
		alignItems: 'center',
	},
	roleHeader: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.text.secondary,
		marginBottom: 12,
		textAlign: 'center',
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
	roleName: {
		fontFamily: fonts.heading,
		fontSize: 27,
		color: colors.gold.primary,
		marginBottom: 12,
		textAlign: 'center',
	},
	roleDesc: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.primary,
		lineHeight: 22,
		textAlign: 'center',
		marginBottom: 8,
	},
	teammatesBox: {
		borderWidth: 1,
		borderColor: colors.mafia.primary,
		borderRadius: 10,
		padding: 12,
		width: '100%',
		marginTop: 8,
		marginBottom: 8,
	},
	teammatesLabel: {
		fontFamily: fonts.heading,
		fontSize: 11,
		color: colors.mafia.light,
		letterSpacing: 2,
		marginBottom: 4,
	},
	teammatesText: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.primary,
	},
	warning: {
		fontFamily: fonts.body,
		fontSize: 13,
		color: colors.text.muted,
		marginTop: 12,
		textAlign: 'center',
	},
	scanAgainBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.gold.dark,
		borderRadius: 12,
		paddingHorizontal: 32,
		paddingVertical: 14,
		marginTop: 24,
	},
	scanAgainBtnText: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.gold.primary,
		letterSpacing: 1,
	},
});
