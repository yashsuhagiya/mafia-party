import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
	Alert,
	KeyboardAvoidingView,
	Modal,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PREDEFINED_FRIENDS } from '../data/friends';
import { PRESETS, ROLE_LIST, type Team } from '../data/roles';
import type { SetupNavigationProp } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { allocateRoles, autoBalanceRoles } from '../utils/allocation';
import { playSound } from '../utils/sounds';

export default function SetupScreen() {
	const navigation = useNavigation<SetupNavigationProp>();
	const {
		playerNames,
		roleConfig,
		addPlayerName,
		removePlayerName,
		setRoleConfig,
		updateRoleCount,
		startGame,
	} = useGameStore();

	const [nameInput, setNameInput] = useState('');
	const [showFriendPicker, setShowFriendPicker] = useState(false);

	const totalRoles = Object.values(roleConfig).reduce((sum, c) => sum + c, 0);
	const playerCount = playerNames.length;
	const isBalanced = totalRoles === playerCount;

	const handleAddPlayer = () => {
		const name = nameInput.trim();
		if (!name) return;
		if (playerNames.includes(name)) {
			Alert.alert('Duplicate', 'This name is already added.');
			return;
		}
		addPlayerName(name);
		setNameInput('');
		playSound('tap');
	};

	const handleToggleFriend = (name: string) => {
		playSound('tap');
		if (playerNames.includes(name)) {
			const idx = playerNames.indexOf(name);
			removePlayerName(idx);
		} else {
			addPlayerName(name);
		}
	};

	const handlePreset = (presetKey: string) => {
		const preset = PRESETS[presetKey];
		if (!preset) return;
		setRoleConfig(preset.roles);
	};

	const handleAutoBalance = () => {
		if (playerCount < 5) {
			Alert.alert('Need Players', 'Add at least 5 players first.');
			return;
		}
		if (playerCount > 15) {
			Alert.alert('Too Many Players', 'Maximum 15 players allowed.');
			return;
		}
		setRoleConfig(autoBalanceRoles(playerCount));
	};

	const handleStartGame = () => {
		if (playerCount < 5 || playerCount > 15) {
			Alert.alert('Invalid Count', 'You need between 5 and 15 players.');
			return;
		}
		if (!isBalanced) {
			Alert.alert(
				'Mismatch',
				`You have ${playerCount} players but ${totalRoles} roles. These must match.`,
			);
			return;
		}

		try {
			const allocated = allocateRoles(roleConfig, playerNames);
			const players = allocated.map((a, i) => ({
				id: `p${i}`,
				name: a.name,
				role: a.role,
				alive: true,
				silenced: false,
			}));
			startGame(players);
			playSound('game_start');
			navigation.navigate('Game');
		} catch (e) {
			Alert.alert(
				'Error',
				e instanceof Error ? e.message : 'Unknown error',
			);
		}
	};

	const teamSections: { team: Team; label: string }[] = [
		{ team: 'mafia', label: 'MAFIA' },
		{ team: 'village', label: 'VILLAGE' },
		{ team: 'neutral', label: 'NEUTRAL' },
	];

	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={{ flex: 1 }}
			>
				<ScrollView contentContainerStyle={styles.scroll}>
					{/* Header */}
					<Text style={styles.title}>MAFIA</Text>
					<Text style={styles.subtitle}>Prepare Your Game</Text>

					{/* Players Section */}
					<View style={styles.section}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>
								PLAYERS ({playerCount})
							</Text>
							<TouchableOpacity
								style={styles.friendPickerBtn}
								onPress={() => setShowFriendPicker(true)}
							>
								<Text style={styles.friendPickerBtnText}>
									PICK FRIENDS
								</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.inputRow}>
							<TextInput
								style={styles.input}
								placeholder="Enter player name..."
								placeholderTextColor={colors.text.muted}
								value={nameInput}
								onChangeText={setNameInput}
								onSubmitEditing={handleAddPlayer}
								returnKeyType="done"
							/>
							<TouchableOpacity
								style={styles.addBtn}
								onPress={handleAddPlayer}
								accessibilityLabel="Add player"
								accessibilityRole="button"
							>
								<Text style={styles.addBtnText}>+</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.playerChips}>
							{playerNames.map((name) => (
								<View key={name} style={styles.chip}>
									<Text style={styles.chipText}>{name}</Text>
									<TouchableOpacity
										style={styles.chipRemoveBtn}
										onPress={() =>
											removePlayerName(
												playerNames.indexOf(name),
											)
										}
										hitSlop={{
											top: 8,
											bottom: 8,
											left: 8,
											right: 8,
										}}
										accessibilityLabel={`Remove ${name}`}
										accessibilityRole="button"
									>
										<Text style={styles.chipX}>✕</Text>
									</TouchableOpacity>
								</View>
							))}
						</View>
					</View>

					{/* Presets */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>QUICK PRESETS</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
						>
							{Object.entries(PRESETS).map(([key, preset]) => (
								<TouchableOpacity
									key={key}
									style={styles.presetBtn}
									onPress={() => handlePreset(key)}
									accessibilityLabel={preset.name}
									accessibilityRole="button"
								>
									<Text style={styles.presetText}>
										{preset.name}
									</Text>
								</TouchableOpacity>
							))}
							<TouchableOpacity
								style={[styles.presetBtn, styles.autoBtn]}
								onPress={handleAutoBalance}
							>
								<Text style={styles.presetText}>
									Auto Balance
								</Text>
							</TouchableOpacity>
						</ScrollView>
					</View>

					{/* Role Configuration */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							ROLES ({totalRoles}/{playerCount})
						</Text>
						{playerCount > 0 && (
							<View style={styles.balanceBarContainer}>
								<View style={styles.balanceBarTrack}>
									<View
										style={[
											styles.balanceBarFill,
											{
												width: `${Math.min(100, (totalRoles / playerCount) * 100)}%`,
												backgroundColor: isBalanced
													? colors.success
													: totalRoles > playerCount
														? colors.danger
														: colors.gold.dark,
											},
										]}
									/>
								</View>
								{!isBalanced && totalRoles > 0 && (
									<Text style={styles.balanceHint}>
										{totalRoles < playerCount
											? `Need ${playerCount - totalRoles} more role${playerCount - totalRoles > 1 ? 's' : ''}`
											: `${totalRoles - playerCount} too many`}
									</Text>
								)}
								{isBalanced && totalRoles > 0 && (
									<Text style={styles.balanceReady}>
										Ready to play
									</Text>
								)}
							</View>
						)}

						{teamSections.map(({ team, label }) => {
							const teamRoles = ROLE_LIST.filter(
								(r) => r.team === team,
							);
							const tc =
								team === 'mafia'
									? colors.mafia
									: team === 'village'
										? colors.village
										: colors.neutral;

							return (
								<View key={team} style={styles.teamSection}>
									<Text
										style={[
											styles.teamLabel,
											{ color: tc.primary },
										]}
									>
										{label}
									</Text>
									{teamRoles.map((role) => {
										const count = roleConfig[role.id] || 0;
										return (
											<View
												key={role.id}
												style={styles.roleRow}
											>
												<Text style={styles.roleIcon}>
													{role.icon}
												</Text>
												<View style={styles.roleInfo}>
													<Text
														style={styles.roleName}
													>
														{role.name}
													</Text>
													<Text
														style={styles.roleDesc}
													>
														{role.description}
													</Text>
												</View>
												<View style={styles.counter}>
													<TouchableOpacity
														style={
															styles.counterBtn
														}
														onPress={() =>
															updateRoleCount(
																role.id,
																count - 1,
															)
														}
														accessibilityLabel={`Decrease ${role.name} count`}
														accessibilityRole="button"
													>
														<Text
															style={
																styles.counterBtnText
															}
														>
															-
														</Text>
													</TouchableOpacity>
													<Text
														style={
															styles.counterValue
														}
													>
														{count}
													</Text>
													<TouchableOpacity
														style={
															styles.counterBtn
														}
														onPress={() =>
															updateRoleCount(
																role.id,
																count + 1,
															)
														}
														accessibilityLabel={`Increase ${role.name} count`}
														accessibilityRole="button"
													>
														<Text
															style={
																styles.counterBtnText
															}
														>
															+
														</Text>
													</TouchableOpacity>
												</View>
											</View>
										);
									})}
								</View>
							);
						})}
					</View>

					{/* Start Game Button */}
					<TouchableOpacity
						style={[
							styles.startBtn,
							(!isBalanced ||
								playerCount < 5 ||
								playerCount > 15) &&
								styles.startBtnDisabled,
						]}
						onPress={handleStartGame}
						disabled={
							!isBalanced || playerCount < 5 || playerCount > 15
						}
						accessibilityLabel="Start game"
						accessibilityRole="button"
					>
						<Text style={styles.startBtnText}>START GAME</Text>
					</TouchableOpacity>
				</ScrollView>
			</KeyboardAvoidingView>

			{/* Friend Picker Modal */}
			<Modal
				visible={showFriendPicker}
				animationType="slide"
				transparent
				onRequestClose={() => setShowFriendPicker(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>PICK FRIENDS</Text>
							<Text style={styles.modalSubtitle}>
								{playerCount} selected
							</Text>
						</View>

						<ScrollView style={styles.friendList}>
							<View style={styles.friendGrid}>
								{PREDEFINED_FRIENDS.map((name) => {
									const selected = playerNames.includes(name);
									return (
										<TouchableOpacity
											key={name}
											style={[
												styles.friendBtn,
												selected &&
													styles.friendBtnSelected,
											]}
											onPress={() =>
												handleToggleFriend(name)
											}
										>
											<Text
												style={[
													styles.friendName,
													selected &&
														styles.friendNameSelected,
												]}
											>
												{name}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</ScrollView>

						<TouchableOpacity
							style={styles.modalDoneBtn}
							onPress={() => setShowFriendPicker(false)}
							accessibilityLabel="Done picking friends"
							accessibilityRole="button"
						>
							<Text style={styles.modalDoneBtnText}>DONE</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bg.primary,
	},
	scroll: {
		padding: 20,
	},
	title: {
		fontFamily: fonts.heading,
		fontSize: 43,
		color: colors.gold.primary,
		textAlign: 'center',
		letterSpacing: 4,
	},
	subtitle: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.text.secondary,
		textAlign: 'center',
		marginBottom: 24,
	},
	section: {
		marginBottom: 24,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	sectionTitle: {
		fontFamily: fonts.heading,
		fontSize: 15,
		color: colors.gold.primary,
		letterSpacing: 2,
	},
	friendPickerBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.gold.dark,
		borderRadius: 8,
		paddingHorizontal: 14,
		paddingVertical: 8,
	},
	friendPickerBtnText: {
		fontFamily: fonts.heading,
		fontSize: 11,
		color: colors.gold.primary,
		letterSpacing: 1,
	},
	inputRow: {
		flexDirection: 'row',
		gap: 10,
	},
	input: {
		flex: 1,
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.gold.dark,
		borderRadius: 8,
		padding: 14,
		color: colors.text.primary,
		fontFamily: fonts.body,
		fontSize: 17,
	},
	addBtn: {
		backgroundColor: colors.gold.dark,
		borderRadius: 8,
		width: 48,
		alignItems: 'center',
		justifyContent: 'center',
	},
	addBtnText: {
		color: colors.bg.primary,
		fontSize: 25,
		fontWeight: 'bold',
	},
	playerChips: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginTop: 12,
	},
	chip: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.bg.elevated,
		borderWidth: 1,
		borderColor: colors.gold.muted,
		borderRadius: 20,
		paddingLeft: 14,
		paddingRight: 6,
		paddingVertical: 8,
		gap: 6,
	},
	chipText: {
		color: colors.text.primary,
		fontFamily: fonts.body,
		fontSize: 15,
	},
	chipRemoveBtn: {
		backgroundColor: 'rgba(181,42,42,0.25)',
		borderRadius: 10,
		width: 20,
		height: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	chipX: {
		color: colors.mafia.light,
		fontSize: 11,
		fontWeight: '700',
	},
	presetBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.gold.dark,
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 10,
		marginTop: 10,
		marginRight: 10,
	},
	autoBtn: {
		borderColor: colors.gold.primary,
	},
	presetText: {
		color: colors.gold.primary,
		fontFamily: fonts.body,
		fontSize: 14,
	},
	teamSection: {
		marginTop: 16,
	},
	teamLabel: {
		fontFamily: fonts.heading,
		fontSize: 13,
		letterSpacing: 2,
		marginBottom: 8,
	},
	roleRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		backgroundColor: colors.bg.card,
		borderRadius: 8,
		padding: 12,
		marginBottom: 8,
	},
	roleIcon: {
		fontSize: 25,
		marginRight: 12,
		marginTop: 2,
	},
	roleInfo: {
		flex: 1,
		marginRight: 8,
	},
	roleName: {
		color: colors.text.primary,
		fontFamily: fonts.bodyBold,
		fontSize: 16,
	},
	roleDesc: {
		color: colors.text.secondary,
		fontFamily: fonts.body,
		fontSize: 14,
		marginTop: 3,
		lineHeight: 18,
	},
	counter: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
		marginTop: 2,
	},
	counterBtn: {
		backgroundColor: colors.bg.elevated,
		borderWidth: 1,
		borderColor: colors.gold.dark,
		borderRadius: 8,
		width: 38,
		height: 38,
		alignItems: 'center',
		justifyContent: 'center',
	},
	counterBtnText: {
		color: colors.gold.primary,
		fontSize: 21,
		fontWeight: 'bold',
	},
	counterValue: {
		color: colors.text.primary,
		fontFamily: fonts.bodyBold,
		fontSize: 18,
		width: 30,
		textAlign: 'center',
	},
	balanceBarContainer: {
		marginBottom: 12,
	},
	balanceBarTrack: {
		height: 6,
		backgroundColor: colors.bg.elevated,
		borderRadius: 3,
		overflow: 'hidden',
	},
	balanceBarFill: {
		height: 6,
		borderRadius: 3,
	},
	balanceHint: {
		color: colors.text.muted,
		fontFamily: fonts.body,
		fontSize: 13,
		marginTop: 6,
	},
	balanceReady: {
		color: colors.success,
		fontFamily: fonts.bodySemiBold,
		fontSize: 13,
		marginTop: 6,
	},
	startBtn: {
		backgroundColor: colors.mafia.primary,
		borderWidth: 2,
		borderColor: colors.gold.primary,
		borderRadius: 12,
		padding: 18,
		alignItems: 'center',
		marginTop: 8,
	},
	startBtnDisabled: {
		opacity: 0.4,
	},
	startBtnText: {
		fontFamily: fonts.heading,
		fontSize: 21,
		color: colors.gold.primary,
		letterSpacing: 2,
	},

	// Friend Picker Modal
	modalOverlay: {
		flex: 1,
		backgroundColor: colors.bg.overlay,
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: colors.bg.secondary,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		borderTopWidth: 2,
		borderColor: colors.gold.dark,
		paddingTop: 20,
		paddingHorizontal: 20,
		paddingBottom: 40,
		maxHeight: '75%',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	modalTitle: {
		fontFamily: fonts.heading,
		fontSize: 19,
		color: colors.gold.primary,
		letterSpacing: 2,
	},
	modalSubtitle: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.secondary,
	},
	friendList: {
		maxHeight: 400,
	},
	friendGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
	},
	friendBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.gold.muted,
		borderRadius: 10,
		paddingHorizontal: 18,
		paddingVertical: 12,
		minWidth: '28%',
		alignItems: 'center',
		flex: 1,
	},
	friendBtnSelected: {
		borderColor: colors.gold.primary,
		backgroundColor: colors.gold.muted,
	},
	friendName: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.secondary,
	},
	friendNameSelected: {
		color: colors.gold.primary,
		fontFamily: fonts.bodyBold,
	},
	modalDoneBtn: {
		backgroundColor: colors.gold.dark,
		borderRadius: 12,
		padding: 16,
		alignItems: 'center',
		marginTop: 16,
	},
	modalDoneBtnText: {
		fontFamily: fonts.heading,
		fontSize: 17,
		color: colors.bg.primary,
		letterSpacing: 1,
	},
});
