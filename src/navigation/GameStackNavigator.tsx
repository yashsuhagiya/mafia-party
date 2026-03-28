import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DayPhaseScreen from '../screens/DayPhaseScreen';
import GameEndScreen from '../screens/GameEndScreen';
import NightPhaseScreen from '../screens/NightPhaseScreen';
import PlayerBoardScreen from '../screens/PlayerBoardScreen';
import QRRevealScreen from '../screens/QRRevealScreen';
import RoleRevealScreen from '../screens/RoleRevealScreen';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { GameStackParamList } from './types';

const Stack = createNativeStackNavigator<GameStackParamList>();

function CancelGameButton() {
	const resetGame = useGameStore((s) => s.resetGame);

	const handleCancel = () => {
		Alert.alert(
			'End Game',
			'Are you sure you want to cancel the current game? All progress will be lost.',
			[
				{ text: 'Keep Playing', style: 'cancel' },
				{
					text: 'End Game',
					style: 'destructive',
					onPress: resetGame,
				},
			],
		);
	};

	return (
		<TouchableOpacity
			onPress={handleCancel}
			style={styles.cancelBtn}
			accessibilityLabel="End current game"
			accessibilityRole="button"
		>
			<Text style={styles.cancelBtnText}>END</Text>
		</TouchableOpacity>
	);
}

function NoGameScreen() {
	return (
		<SafeAreaView
			style={styles.noGameContainer}
			edges={['top', 'left', 'right']}
		>
			<Text style={styles.noGameTitle}>NO ACTIVE GAME</Text>
			<Text style={styles.noGameText}>
				Go to the Setup tab to add players, configure roles, and start a
				new game.
			</Text>
		</SafeAreaView>
	);
}

export default function GameStackNavigator() {
	const revealMode = useSettingsStore((s) => s.revealMode);
	const phase = useGameStore((s) => s.phase);

	if (phase === 'setup') {
		return <NoGameScreen />;
	}

	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: { backgroundColor: colors.bg.primary },
				headerTintColor: colors.gold.primary,
				headerTitleStyle: { fontFamily: fonts.heading, fontSize: 16 },
				contentStyle: { backgroundColor: colors.bg.primary },
				animation: 'fade',
				headerShown: true,
				headerRight: () => <CancelGameButton />,
			}}
		>
			{revealMode === 'qr' ? (
				<Stack.Screen
					name="QRReveal"
					component={QRRevealScreen}
					options={{ title: 'Role Reveal' }}
				/>
			) : (
				<Stack.Screen
					name="RoleReveal"
					component={RoleRevealScreen}
					options={{ title: 'Role Reveal' }}
				/>
			)}
			<Stack.Screen
				name="NightPhase"
				component={NightPhaseScreen}
				options={{ title: 'Night' }}
			/>
			<Stack.Screen
				name="DayPhase"
				component={DayPhaseScreen}
				options={{ title: 'Day' }}
			/>
			<Stack.Screen
				name="PlayerBoard"
				component={PlayerBoardScreen}
				options={{ title: 'Town Board' }}
			/>
			<Stack.Screen
				name="GameEnd"
				component={GameEndScreen}
				options={{ title: 'Game Over', headerRight: () => null }}
			/>
		</Stack.Navigator>
	);
}

const styles = StyleSheet.create({
	noGameContainer: {
		flex: 1,
		backgroundColor: colors.bg.primary,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 32,
	},
	noGameTitle: {
		fontFamily: fonts.heading,
		fontSize: 25,
		color: colors.gold.primary,
		letterSpacing: 2,
		marginBottom: 16,
	},
	noGameText: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.text.secondary,
		textAlign: 'center',
		lineHeight: 24,
	},
	cancelBtn: {
		paddingHorizontal: 8,
		paddingVertical: 6,
	},
	cancelBtnText: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: '#ffffff',
	},
});
