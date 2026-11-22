import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import type { GameStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { colors, teamColor } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function RoleRevealScreen() {
	const navigation =
		useNavigation<NativeStackNavigationProp<GameStackParamList>>();
	const { players, setPhase } = useGameStore();

	const handleProceedToNight = () => {
		setPhase('night');
		navigation.replace('NightPhase');
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.hint}>Tell each player their role.</Text>
				{players.map((p) => {
					const tc = teamColor(p.role.team);
					const teamLabel =
						p.role.team.charAt(0).toUpperCase() +
						p.role.team.slice(1);
					return (
						<View key={p.id} style={styles.row}>
							<View style={styles.iconBox}>
								<Ionicons
									name={p.role.icon}
									size={24}
									color={tc.light}
								/>
							</View>
							<View style={styles.info}>
								<Text style={styles.playerName}>{p.name}</Text>
								<Text style={styles.roleName}>
									{p.role.name}
								</Text>
							</View>
							<Text
								style={[styles.teamLabel, { color: tc.light }]}
							>
								{teamLabel}
							</Text>
						</View>
					);
				})}
			</ScrollView>
			<View style={styles.footer}>
				<Button label="Begin night" onPress={handleProceedToNight} />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bg.primary,
	},
	content: {
		padding: 16,
		gap: 8,
	},
	hint: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
		marginBottom: 8,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
	iconBox: {
		width: 24,
		alignItems: 'center',
	},
	info: {
		flex: 1,
	},
	playerName: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 16,
		color: colors.text.primary,
	},
	roleName: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
	},
	teamLabel: {
		fontFamily: fonts.bodyMedium,
		fontSize: 12,
	},
	footer: {
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		backgroundColor: colors.bg.secondary,
	},
});
