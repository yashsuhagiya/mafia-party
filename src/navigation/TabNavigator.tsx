import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScanScreen from '../screens/ScanScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SetupScreen from '../screens/SetupScreen';
import { useSettingsStore } from '../store/settingsStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import GameStackNavigator from './GameStackNavigator';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<
	string,
	{
		focused: keyof typeof Ionicons.glyphMap;
		unfocused: keyof typeof Ionicons.glyphMap;
	}
> = {
	Setup: { focused: 'dice', unfocused: 'dice-outline' },
	Game: { focused: 'moon', unfocused: 'moon-outline' },
	Scan: { focused: 'qr-code', unfocused: 'qr-code-outline' },
	Settings: { focused: 'settings', unfocused: 'settings-outline' },
};

export default function TabNavigator() {
	const insets = useSafeAreaInsets();
	const revealMode = useSettingsStore((s) => s.revealMode);

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarStyle: {
					backgroundColor: colors.bg.secondary,
					borderTopColor: colors.border,
					borderTopWidth: 1,
					paddingTop: 8,
					height: 60 + insets.bottom,
					paddingBottom: insets.bottom,
				},
				tabBarActiveTintColor: colors.accent.primary,
				tabBarInactiveTintColor: colors.text.muted,
				tabBarLabelStyle: {
					fontFamily: fonts.bodyMedium,
					fontSize: 12,
				},
				tabBarIcon: ({ focused, color }) => {
					const icons = TAB_ICONS[route.name];
					const iconName = focused ? icons.focused : icons.unfocused;
					return <Ionicons name={iconName} size={22} color={color} />;
				},
			})}
		>
			<Tab.Screen name="Setup" component={SetupScreen} />
			<Tab.Screen name="Game" component={GameStackNavigator} />
			{revealMode === 'qr' && (
				<Tab.Screen name="Scan" component={ScanScreen} />
			)}
			<Tab.Screen name="Settings" component={SettingsScreen} />
		</Tab.Navigator>
	);
}
