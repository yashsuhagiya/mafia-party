import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type GameStackParamList = {
	RoleReveal: undefined;
	QRReveal: undefined;
	NightPhase: undefined;
	DayPhase: undefined;
	PlayerBoard: undefined;
	GameEnd: undefined;
};

export type TabParamList = {
	Setup: undefined;
	Game: undefined;
	Scan: undefined;
	Settings: undefined;
};

export type GameEndNavigationProp = CompositeNavigationProp<
	NativeStackNavigationProp<GameStackParamList, 'GameEnd'>,
	BottomTabNavigationProp<TabParamList>
>;

export type SetupNavigationProp = BottomTabNavigationProp<
	TabParamList,
	'Setup'
>;
