import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function ScanScreen() {
	const { width } = useWindowDimensions();
	const FRAME_SIZE = width * 0.7;
	const [permission, requestPermission] = useCameraPermissions();
	const [scannedText, setScannedText] = useState<string | null>(null);
	const [scanning, setScanning] = useState(true);

	const handleBarCodeScanned = ({ data }: { data: string }) => {
		if (!scanning || !data.includes('\nRole: ')) return;
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
					<Text style={styles.title}>Scan role</Text>
					<Text style={styles.message}>Loading camera</Text>
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
					<Text style={styles.title}>Scan role</Text>
					<Text style={styles.message}>
						Camera access is needed to scan QR codes.
					</Text>
					<Button
						label="Grant camera access"
						onPress={requestPermission}
					/>
				</View>
			</SafeAreaView>
		);
	}

	// Show scanned role
	if (scannedText) {
		// Parse the role text
		const lines = scannedText.split('\n').filter((l) => l.trim());

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
								return (
									<Text key={line} style={styles.teamText}>
										{line}
									</Text>
								);
							}
							if (line.includes('Do not show')) {
								return (
									<Text key={line} style={styles.warning}>
										{line}
									</Text>
								);
							}
							if (line.startsWith('Role:')) {
								return (
									<Text key={line} style={styles.roleName}>
										{line.replace('Role: ', '')}
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

					<Button
						label="Hide and scan again"
						variant="secondary"
						onPress={handleReset}
						style={styles.scanAgainBtn}
					/>
				</View>
			</SafeAreaView>
		);
	}

	// Camera scanner
	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
			<Text style={styles.title}>Scan role</Text>
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
		fontSize: 24,
		color: colors.text.primary,
		marginTop: 16,
	},
	subtitle: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
		marginTop: 4,
		marginBottom: 16,
	},
	message: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.secondary,
		textAlign: 'center',
		marginBottom: 24,
	},
	cameraContainer: {
		borderRadius: 14,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: colors.border,
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
		borderColor: colors.accent.primary,
		borderRadius: 10,
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
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
		padding: 24,
		alignItems: 'center',
	},
	roleHeader: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.secondary,
		marginBottom: 12,
		textAlign: 'center',
	},
	teamText: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
		marginBottom: 16,
	},
	roleName: {
		fontFamily: fonts.heading,
		fontSize: 32,
		color: colors.text.primary,
		marginBottom: 4,
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
	warning: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.muted,
		marginTop: 12,
		textAlign: 'center',
	},
	scanAgainBtn: {
		marginTop: 24,
	},
});
