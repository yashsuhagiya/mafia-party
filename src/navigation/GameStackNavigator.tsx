import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { confirm } from '../utils/confirm';
import type { GameStackParamList } from './types';

const Stack = createNativeStackNavigator<GameStackParamList>();

function CancelGameButton() {
	const resetGame = useGameStore((s) => s.resetGame);

	const handleCancel = () => {
		confirm(
			'End game?',
			'All progress will be lost.',
			'End game',
			resetGame,
			true,
		);
	};

	return (
		<TouchableOpacity
			onPress={handleCancel}
			style={styles.headerBtn}
			hitSlop={8}
			accessibilityLabel="End current game"
			accessibilityRole="button"
		>
			<Text style={styles.cancelBtnText}>End</Text>
		</TouchableOpacity>
	);
}

function NoGameScreen() {
	return (
		<SafeAreaView
			style={styles.noGameContainer}
			edges={['top', 'left', 'right']}
		>
			<Text style={styles.noGameTitle}>No active game</Text>
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

	const initialRouteName =
		phase === 'night'
			? 'NightPhase'
			: phase === 'day'
				? 'DayPhase'
				: phase === 'ended'
					? 'GameEnd'
					: revealMode === 'qr'
						? 'QRReveal'
						: 'RoleReveal';

	return (
		<Stack.Navigator
			initialRouteName={initialRouteName}
			screenOptions={({ navigation }) => ({
				headerStyle: { backgroundColor: colors.bg.primary },
				headerTintColor: colors.text.primary,
				headerTitleStyle: {
					fontFamily: fonts.bodySemiBold,
					fontSize: 16,
				},
				contentStyle: { backgroundColor: colors.bg.primary },
				animation: 'fade',
				headerShown: true,
				headerRight: () => (
					<View style={styles.headerRight}>
						<TouchableOpacity
							onPress={() => navigation.navigate('PlayerBoard')}
							style={styles.headerBtn}
							accessibilityLabel="Open town board"
							accessibilityRole="button"
						>
							<Ionicons
								name="people-outline"
								size={22}
								color={colors.text.primary}
							/>
						</TouchableOpacity>
						<CancelGameButton />
					</View>
				),
			})}
		>
			{revealMode === 'qr' ? (
				<Stack.Screen
					name="QRReveal"
					component={QRRevealScreen}
					options={{ title: 'Roles' }}
				/>
			) : (
				<Stack.Screen
					name="RoleReveal"
					component={RoleRevealScreen}
					options={{ title: 'Roles' }}
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
				options={{ title: 'Town board', headerRight: () => null }}
			/>
			<Stack.Screen
				name="GameEnd"
				component={GameEndScreen}
				options={{ title: 'Game over', headerRight: () => null }}
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
		fontSize: 24,
		color: colors.text.primary,
		marginBottom: 16,
	},
	noGameText: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.secondary,
		textAlign: 'center',
		lineHeight: 24,
	},
	headerRight: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	headerBtn: {
		padding: 12,
	},
	cancelBtnText: {
		fontFamily: fonts.bodyMedium,
		fontSize: 14,
		color: colors.text.primary,
	},
});
