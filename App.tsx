import {
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { Rye_400Regular, useFonts } from '@expo-google-fonts/rye';
import { NavigationContainer, type Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import { colors } from './src/theme/colors';
import { fonts } from './src/theme/typography';

const navTheme: Theme = {
	dark: true,
	colors: {
		primary: colors.accent.primary,
		background: colors.bg.primary,
		card: colors.bg.secondary,
		text: colors.text.primary,
		border: colors.border,
		notification: colors.mafia.primary,
	},
	fonts: {
		regular: { fontFamily: fonts.body, fontWeight: '400' },
		medium: { fontFamily: fonts.bodyMedium, fontWeight: '500' },
		bold: { fontFamily: fonts.heading, fontWeight: '400' },
		heavy: { fontFamily: fonts.heading, fontWeight: '400' },
	},
};

export default function App() {
	const [fontsLoaded] = useFonts({
		Rye_400Regular,
		Inter_400Regular,
		Inter_500Medium,
		Inter_600SemiBold,
	});

	if (!fontsLoaded) {
		return (
			<View style={styles.loading}>
				<ActivityIndicator size="large" color={colors.accent.primary} />
			</View>
		);
	}

	return (
		<SafeAreaProvider>
			<NavigationContainer theme={navTheme}>
				<StatusBar style="light" />
				<TabNavigator />
			</NavigationContainer>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	loading: {
		flex: 1,
		backgroundColor: colors.bg.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
