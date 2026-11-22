import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
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
import Button from '../components/Button';
import { PREDEFINED_FRIENDS } from '../data/friends';
import { PRESETS, ROLE_LIST, type Team } from '../data/roles';
import type { SetupNavigationProp } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { allocateRoles, autoBalanceRoles } from '../utils/allocation';
import { notify } from '../utils/confirm';

export default function SetupScreen() {
	const navigation = useNavigation<SetupNavigationProp>();
	const {
		phase,
		playerNames,
		roleConfig,
		addPlayerName,
		removePlayerName,
		setRoleConfig,
		updateRoleCount,
		startGame,
	} = useGameStore();

	const [nameInput, setNameInput] = useState('');
	const [nameError, setNameError] = useState('');
	const [showFriendPicker, setShowFriendPicker] = useState(false);

	const totalRoles = Object.values(roleConfig).reduce((sum, c) => sum + c, 0);
	const playerCount = playerNames.length;
	const isBalanced = totalRoles === playerCount;
	const startBlocker =
		playerCount < 5
			? `Add ${5 - playerCount} more player${5 - playerCount > 1 ? 's' : ''} (minimum 5)`
			: playerCount > 15
				? 'Maximum 15 players'
				: !isBalanced
					? `${playerCount} players but ${totalRoles} roles`
					: null;
	const autoBalanceDisabled = playerCount < 5 || playerCount > 15;

	const handleAddPlayer = () => {
		const name = nameInput.trim();
		if (!name) return;
		if (playerNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
			setNameError('That name is already added');
			return;
		}
		addPlayerName(name);
		setNameInput('');
	};

	const handleToggleFriend = (name: string) => {
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
		setRoleConfig(autoBalanceRoles(playerCount));
	};

	const handleStartGame = () => {
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
			navigation.navigate('Game');
		} catch (e) {
			notify(
				'Could not start game',
				e instanceof Error ? e.message : 'Unknown error',
			);
		}
	};

	const teamSections: { team: Team; label: string }[] = [
		{ team: 'mafia', label: 'Mafia' },
		{ team: 'village', label: 'Village' },
		{ team: 'neutral', label: 'Neutral' },
	];

	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={{ flex: 1 }}
			>
				<ScrollView contentContainerStyle={styles.scroll}>
					{/* Header */}
					<Text style={styles.title}>Mafia</Text>
					<Text style={styles.subtitle}>Prepare your game</Text>

					{/* Players Section */}
					<View style={styles.section}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>
								Players ({playerCount})
							</Text>
							<TouchableOpacity
								style={styles.friendPickerBtn}
								onPress={() => setShowFriendPicker(true)}
							>
								<Text style={styles.friendPickerBtnText}>
									Pick friends
								</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.inputRow}>
							<TextInput
								style={styles.input}
								placeholder="Player name"
								placeholderTextColor={colors.text.muted}
								value={nameInput}
								onChangeText={(text) => {
									setNameInput(text);
									setNameError('');
								}}
								onSubmitEditing={handleAddPlayer}
								returnKeyType="done"
							/>
							<TouchableOpacity
								style={styles.addBtn}
								onPress={handleAddPlayer}
								accessibilityLabel="Add player"
								accessibilityRole="button"
							>
								<Ionicons
									name="add"
									size={24}
									color={colors.text.primary}
								/>
							</TouchableOpacity>
						</View>
						{nameError ? (
							<Text style={styles.nameError}>{nameError}</Text>
						) : null}
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
										<Ionicons
											name="close"
											size={12}
											color={colors.mafia.light}
										/>
									</TouchableOpacity>
								</View>
							))}
						</View>
					</View>

					{/* Presets */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Quick presets</Text>
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
								style={[
									styles.presetBtn,
									autoBalanceDisabled &&
										styles.presetBtnDisabled,
								]}
								onPress={handleAutoBalance}
								disabled={autoBalanceDisabled}
								accessibilityRole="button"
							>
								<Text style={styles.presetText}>
									Auto balance
								</Text>
							</TouchableOpacity>
						</ScrollView>
					</View>

					{/* Role Configuration */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							Roles ({totalRoles}/{playerCount})
						</Text>
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
												<View style={styles.roleIcon}>
													<Ionicons
														name={role.icon}
														size={24}
														color={
															colors.text
																.secondary
														}
													/>
												</View>
												<View style={styles.roleInfo}>
													<Text
														style={styles.roleName}
													>
														{role.name}
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
														<Ionicons
															name="remove"
															size={20}
															color={
																colors.text
																	.primary
															}
														/>
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
														<Ionicons
															name="add"
															size={20}
															color={
																colors.text
																	.primary
															}
														/>
													</TouchableOpacity>
												</View>
											</View>
										);
									})}
								</View>
							);
						})}
					</View>
				</ScrollView>

				{/* Pinned footer */}
				<View style={styles.footer}>
					{phase !== 'setup' ? (
						<>
							<Text style={styles.footerStatus}>
								A game is in progress
							</Text>
							<Button
								label="Resume game"
								onPress={() => navigation.navigate('Game')}
							/>
						</>
					) : (
						<>
							<Text
								style={[
									styles.footerStatus,
									!startBlocker && styles.footerReady,
								]}
							>
								{startBlocker ?? 'Ready to play'}
							</Text>
							<Button
								label="Start game"
								disabled={!!startBlocker}
								onPress={handleStartGame}
							/>
						</>
					)}
				</View>
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
							<Text style={styles.modalTitle}>Pick friends</Text>
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

						<Button
							label="Done"
							style={styles.modalDoneBtn}
							onPress={() => setShowFriendPicker(false)}
							accessibilityLabel="Done picking friends"
						/>
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
		fontSize: 40,
		color: colors.text.primary,
		textAlign: 'center',
	},
	subtitle: {
		fontFamily: fonts.body,
		fontSize: 16,
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
		fontFamily: fonts.bodySemiBold,
		fontSize: 14,
		color: colors.text.secondary,
	},
	friendPickerBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	friendPickerBtnText: {
		fontFamily: fonts.bodyMedium,
		fontSize: 14,
		color: colors.text.primary,
	},
	inputRow: {
		flexDirection: 'row',
		gap: 8,
	},
	input: {
		flex: 1,
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		padding: 12,
		color: colors.text.primary,
		fontFamily: fonts.body,
		fontSize: 16,
	},
	addBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		width: 48,
		alignItems: 'center',
		justifyContent: 'center',
	},
	nameError: {
		color: colors.danger,
		fontFamily: fonts.body,
		fontSize: 14,
		marginTop: 8,
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
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 20,
		paddingLeft: 12,
		paddingRight: 8,
		paddingVertical: 8,
		gap: 8,
	},
	chipText: {
		color: colors.text.primary,
		fontFamily: fonts.body,
		fontSize: 14,
	},
	chipRemoveBtn: {
		backgroundColor: colors.mafia.bg,
		borderRadius: 10,
		width: 20,
		height: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	presetBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 12,
		marginTop: 8,
		marginRight: 8,
	},
	presetBtnDisabled: {
		opacity: 0.4,
	},
	presetText: {
		color: colors.text.primary,
		fontFamily: fonts.bodyMedium,
		fontSize: 14,
	},
	teamSection: {
		marginTop: 16,
	},
	teamLabel: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 14,
		marginBottom: 8,
	},
	roleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
		padding: 12,
		marginBottom: 8,
	},
	roleIcon: {
		width: 24,
		marginRight: 12,
		alignItems: 'center',
	},
	roleInfo: {
		flex: 1,
		marginRight: 8,
	},
	roleName: {
		color: colors.text.primary,
		fontFamily: fonts.bodySemiBold,
		fontSize: 16,
	},
	counter: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	counterBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	counterValue: {
		color: colors.text.primary,
		fontFamily: fonts.bodySemiBold,
		fontSize: 16,
		fontVariant: ['tabular-nums'],
		width: 32,
		textAlign: 'center',
	},
	footer: {
		backgroundColor: colors.bg.secondary,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		padding: 16,
		gap: 8,
	},
	footerStatus: {
		color: colors.text.secondary,
		fontFamily: fonts.body,
		fontSize: 14,
		textAlign: 'center',
	},
	footerReady: {
		color: colors.success,
	},

	// Friend Picker Modal
	modalOverlay: {
		flex: 1,
		backgroundColor: colors.bg.overlay,
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: colors.bg.secondary,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		borderTopWidth: 1,
		borderColor: colors.border,
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
		fontSize: 20,
		color: colors.text.primary,
	},
	modalSubtitle: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
	},
	friendList: {
		maxHeight: 400,
	},
	friendGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	friendBtn: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 12,
		minWidth: '28%',
		alignItems: 'center',
		flex: 1,
	},
	friendBtnSelected: {
		borderColor: colors.accent.primary,
		backgroundColor: colors.accent.muted,
	},
	friendName: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.secondary,
	},
	friendNameSelected: {
		color: colors.text.primary,
		fontFamily: fonts.bodySemiBold,
	},
	modalDoneBtn: {
		marginTop: 16,
	},
});
