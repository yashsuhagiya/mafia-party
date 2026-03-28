import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ROLE_LIST, type Team } from '../data/roles';
import { useHistoryStore } from '../store/historyStore';
import { useSettingsStore } from '../store/settingsStore';
import { colors, teamColor } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function SettingsScreen() {
	const settings = useSettingsStore();
	const { games, clearHistory } = useHistoryStore();
	const [showRoles, setShowRoles] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [roleFilter, setRoleFilter] = useState<Team | 'all'>('all');
	const [expandedRole, setExpandedRole] = useState<string | null>(null);

	const timerOptions = [3, 5, 7, 10];

	const filteredRoles =
		roleFilter === 'all'
			? ROLE_LIST
			: ROLE_LIST.filter((r) => r.team === roleFilter);

	// History stats
	const totalGames = games.length;
	const mafiaWins = games.filter((g) => g.winner === 'mafia').length;
	const villageWins = games.filter((g) => g.winner === 'village').length;

	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.title}>SETTINGS</Text>

				{/* Quick links */}
				<View style={styles.section}>
					<TouchableOpacity
						style={styles.linkRow}
						onPress={() => setShowRoles(true)}
					>
						<Ionicons
							name="book-outline"
							size={20}
							color={colors.gold.primary}
						/>
						<View style={styles.linkInfo}>
							<Text style={styles.linkLabel}>Roles Guide</Text>
							<Text style={styles.linkDesc}>
								Browse all {ROLE_LIST.length} roles and
								abilities
							</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={18}
							color={colors.text.muted}
						/>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.linkRow}
						onPress={() => setShowHistory(true)}
					>
						<Ionicons
							name="stats-chart-outline"
							size={20}
							color={colors.gold.primary}
						/>
						<View style={styles.linkInfo}>
							<Text style={styles.linkLabel}>Game History</Text>
							<Text style={styles.linkDesc}>
								{totalGames > 0
									? `${totalGames} games played`
									: 'No games yet'}
							</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={18}
							color={colors.text.muted}
						/>
					</TouchableOpacity>
				</View>

				{/* Sound */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>SOUND</Text>
					<View style={styles.settingRow}>
						<View style={styles.settingInfo}>
							<Text style={styles.settingLabel}>
								Sound Effects
							</Text>
							<Text style={styles.settingDesc}>
								Play sounds during phase transitions
							</Text>
						</View>
						<Switch
							value={settings.soundEnabled}
							onValueChange={settings.setSoundEnabled}
							trackColor={{
								false: colors.bg.elevated,
								true: colors.gold.dark,
							}}
							thumbColor={
								settings.soundEnabled
									? colors.gold.primary
									: colors.text.muted
							}
						/>
					</View>
					<View style={styles.settingRow}>
						<View style={styles.settingInfo}>
							<Text style={styles.settingLabel}>
								Ambient Music
							</Text>
							<Text style={styles.settingDesc}>
								Subtle background music during gameplay
							</Text>
						</View>
						<Switch
							value={settings.ambientMusicEnabled}
							onValueChange={settings.setAmbientMusic}
							trackColor={{
								false: colors.bg.elevated,
								true: colors.gold.dark,
							}}
							thumbColor={
								settings.ambientMusicEnabled
									? colors.gold.primary
									: colors.text.muted
							}
						/>
					</View>
				</View>

				{/* Gameplay */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>GAMEPLAY</Text>
					<View style={styles.settingRow}>
						<View style={styles.settingInfo}>
							<Text style={styles.settingLabel}>
								Haptic Feedback
							</Text>
							<Text style={styles.settingDesc}>
								Vibration on key actions
							</Text>
						</View>
						<Switch
							value={settings.hapticEnabled}
							onValueChange={settings.setHapticEnabled}
							trackColor={{
								false: colors.bg.elevated,
								true: colors.gold.dark,
							}}
							thumbColor={
								settings.hapticEnabled
									? colors.gold.primary
									: colors.text.muted
							}
						/>
					</View>
					<View style={styles.settingRow}>
						<View style={styles.settingInfo}>
							<Text style={styles.settingLabel}>
								Reveal Dead Roles
							</Text>
							<Text style={styles.settingDesc}>
								Show role when a player is eliminated
							</Text>
						</View>
						<Switch
							value={settings.revealDeadRoles}
							onValueChange={settings.setRevealDeadRoles}
							trackColor={{
								false: colors.bg.elevated,
								true: colors.gold.dark,
							}}
							thumbColor={
								settings.revealDeadRoles
									? colors.gold.primary
									: colors.text.muted
							}
						/>
					</View>
					<View style={styles.settingRow}>
						<View style={styles.settingInfo}>
							<Text style={styles.settingLabel}>
								Discussion Timer
							</Text>
							<Text style={styles.settingDesc}>
								Duration for day discussions
							</Text>
						</View>
						<View style={styles.optionRow}>
							{timerOptions.map((min) => (
								<TouchableOpacity
									key={min}
									style={[
										styles.option,
										settings.discussionTimerMinutes ===
											min && styles.optionActive,
									]}
									onPress={() =>
										settings.setDiscussionTimer(min)
									}
								>
									<Text
										style={[
											styles.optionText,
											settings.discussionTimerMinutes ===
												min && styles.optionTextActive,
										]}
									>
										{min}m
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>
					<View style={styles.settingRow}>
						<View style={styles.settingInfo}>
							<Text style={styles.settingLabel}>
								Role Reveal Mode
							</Text>
							<Text style={styles.settingDesc}>
								How players see their roles
							</Text>
						</View>
						<View style={styles.optionRow}>
							<TouchableOpacity
								style={[
									styles.option,
									settings.revealMode === 'pass' &&
										styles.optionActive,
								]}
								onPress={() => settings.setRevealMode('pass')}
							>
								<Text
									style={[
										styles.optionText,
										settings.revealMode === 'pass' &&
											styles.optionTextActive,
									]}
								>
									Pass
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.option,
									settings.revealMode === 'qr' &&
										styles.optionActive,
								]}
								onPress={() => settings.setRevealMode('qr')}
							>
								<Text
									style={[
										styles.optionText,
										settings.revealMode === 'qr' &&
											styles.optionTextActive,
									]}
								>
									QR
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				{/* About */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>ABOUT</Text>
					<View style={styles.aboutBox}>
						<Text style={styles.aboutTitle}>MAFIA</Text>
						<Text style={styles.aboutText}>
							In-person Mafia party game manager.{'\n'}Only God
							(the narrator) needs this app.
						</Text>
						<Text style={styles.version}>v1.0.0</Text>
					</View>
				</View>

				<View style={{ height: 40 }} />
			</ScrollView>

			{/* ── Roles Guide Modal ── */}
			<Modal
				visible={showRoles}
				animationType="slide"
				statusBarTranslucent
				onRequestClose={() => setShowRoles(false)}
			>
				<SafeAreaProvider>
					<SafeAreaView
						style={styles.modalContainer}
						edges={['top', 'left', 'right']}
					>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>ROLES GUIDE</Text>
							<TouchableOpacity
								onPress={() => setShowRoles(false)}
							>
								<Ionicons
									name="close"
									size={28}
									color={colors.gold.primary}
								/>
							</TouchableOpacity>
						</View>

						{/* Filter tabs */}
						<View style={styles.filterRow}>
							{(
								[
									{
										key: 'all',
										label: 'ALL',
										color: colors.gold.primary,
									},
									{
										key: 'mafia',
										label: 'MAFIA',
										color: colors.mafia.primary,
									},
									{
										key: 'village',
										label: 'VILLAGE',
										color: colors.village.primary,
									},
									{
										key: 'neutral',
										label: 'NEUTRAL',
										color: colors.neutral.primary,
									},
								] as const
							).map((f) => (
								<TouchableOpacity
									key={f.key}
									style={[
										styles.filterBtn,
										roleFilter === f.key && {
											borderColor: f.color,
											backgroundColor: `${f.color}20`,
										},
									]}
									onPress={() => setRoleFilter(f.key)}
								>
									<Text
										style={[
											styles.filterText,
											{ color: f.color },
										]}
									>
										{f.label}
									</Text>
								</TouchableOpacity>
							))}
						</View>

						<ScrollView style={styles.modalScroll}>
							{filteredRoles.map((role) => {
								const tc = teamColor(role.team);
								const isExpanded = expandedRole === role.id;
								return (
									<TouchableOpacity
										key={role.id}
										style={[
											styles.roleCard,
											{ borderLeftColor: tc.primary },
										]}
										onPress={() =>
											setExpandedRole(
												isExpanded ? null : role.id,
											)
										}
										activeOpacity={0.7}
									>
										<View style={styles.roleHeader}>
											<Text style={styles.roleIcon}>
												{role.icon}
											</Text>
											<View style={{ flex: 1 }}>
												<Text style={styles.roleName}>
													{role.name}
												</Text>
												<Text
													style={[
														styles.roleBadge,
														{ color: tc.primary },
													]}
												>
													{role.team.toUpperCase()}
												</Text>
											</View>
											<Ionicons
												name={
													isExpanded
														? 'chevron-up'
														: 'chevron-down'
												}
												size={16}
												color={colors.text.muted}
											/>
										</View>
										<Text style={styles.roleDesc}>
											{role.description}
										</Text>
										{isExpanded && (
											<View style={styles.roleDetails}>
												{role.nightAction && (
													<View
														style={
															styles.detailItem
														}
													>
														<Text
															style={
																styles.detailLabel
															}
														>
															NIGHT ACTION
														</Text>
														<Text
															style={
																styles.detailValue
															}
														>
															{role.nightAction
																.replace(
																	/_/g,
																	' ',
																)
																.toUpperCase()}
														</Text>
													</View>
												)}
												{role.passiveAbility && (
													<View
														style={
															styles.detailItem
														}
													>
														<Text
															style={
																styles.detailLabel
															}
														>
															PASSIVE ABILITY
														</Text>
														<Text
															style={
																styles.detailValue
															}
														>
															{
																role.passiveAbility
															}
														</Text>
													</View>
												)}
												<View style={styles.detailItem}>
													<Text
														style={
															styles.detailLabel
														}
													>
														PLAYER TIP
													</Text>
													<Text
														style={
															styles.detailValue
														}
													>
														{role.playerTip}
													</Text>
												</View>
												<View style={styles.detailItem}>
													<Text
														style={
															styles.detailLabel
														}
													>
														GOD'S NOTE
													</Text>
													<Text
														style={
															styles.detailValue
														}
													>
														{role.godTip}
													</Text>
												</View>
											</View>
										)}
									</TouchableOpacity>
								);
							})}
							<View style={{ height: 40 }} />
						</ScrollView>
					</SafeAreaView>
				</SafeAreaProvider>
			</Modal>

			{/* ── History Modal ── */}
			<Modal
				visible={showHistory}
				animationType="slide"
				statusBarTranslucent
				onRequestClose={() => setShowHistory(false)}
			>
				<SafeAreaProvider>
					<SafeAreaView
						style={styles.modalContainer}
						edges={['top', 'left', 'right']}
					>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>GAME HISTORY</Text>
							<TouchableOpacity
								onPress={() => setShowHistory(false)}
							>
								<Ionicons
									name="close"
									size={28}
									color={colors.gold.primary}
								/>
							</TouchableOpacity>
						</View>

						<ScrollView style={styles.modalScroll}>
							{totalGames === 0 ? (
								<View style={styles.emptyState}>
									<Ionicons
										name="document-text-outline"
										size={48}
										color={colors.text.muted}
									/>
									<Text style={styles.emptyText}>
										No games played yet. Start your first
										game!
									</Text>
								</View>
							) : (
								<>
									{/* Stats */}
									<View style={styles.statsRow}>
										<View style={styles.statBox}>
											<Text style={styles.statValue}>
												{totalGames}
											</Text>
											<Text style={styles.statLabel}>
												GAMES
											</Text>
										</View>
										<View
											style={[
												styles.statBox,
												{
													borderColor:
														colors.mafia.primary,
												},
											]}
										>
											<Text
												style={[
													styles.statValue,
													{
														color: colors.mafia
															.light,
													},
												]}
											>
												{mafiaWins}
											</Text>
											<Text style={styles.statLabel}>
												MAFIA
											</Text>
										</View>
										<View
											style={[
												styles.statBox,
												{
													borderColor:
														colors.village.primary,
												},
											]}
										>
											<Text
												style={[
													styles.statValue,
													{
														color: colors.village
															.light,
													},
												]}
											>
												{villageWins}
											</Text>
											<Text style={styles.statLabel}>
												VILLAGE
											</Text>
										</View>
									</View>

									{/* Game list */}
									{games.slice(0, 20).map((game) => {
										const tc = teamColor(game.winner);
										const date = new Date(game.date);
										return (
											<View
												key={game.id}
												style={styles.gameCard}
											>
												<View style={styles.gameHeader}>
													<Text
														style={styles.gameDate}
													>
														{date.toLocaleDateString()}
													</Text>
													<Text
														style={[
															styles.gameWinner,
															{
																color: tc.primary,
															},
														]}
													>
														{game.winner.toUpperCase()}{' '}
														WON
													</Text>
												</View>
												<Text style={styles.gameInfo}>
													{game.players.length}{' '}
													players, {game.rounds}{' '}
													rounds
												</Text>
											</View>
										);
									})}

									<TouchableOpacity
										style={styles.clearHistoryBtn}
										onPress={() =>
											Alert.alert(
												'Clear History',
												'Delete all game records?',
												[
													{
														text: 'Cancel',
														style: 'cancel',
													},
													{
														text: 'Clear',
														style: 'destructive',
														onPress: clearHistory,
													},
												],
											)
										}
									>
										<Text style={styles.clearHistoryText}>
											Clear History
										</Text>
									</TouchableOpacity>
								</>
							)}
							<View style={{ height: 40 }} />
						</ScrollView>
					</SafeAreaView>
				</SafeAreaProvider>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bg.primary,
	},
	content: {
		padding: 20,
	},
	title: {
		fontFamily: fonts.heading,
		fontSize: 29,
		color: colors.gold.primary,
		textAlign: 'center',
		letterSpacing: 3,
		marginTop: 8,
		marginBottom: 24,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontFamily: fonts.heading,
		fontSize: 13,
		color: colors.gold.primary,
		letterSpacing: 2,
		marginBottom: 12,
	},

	// Link rows
	linkRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.bg.card,
		borderRadius: 12,
		padding: 16,
		marginBottom: 8,
		gap: 14,
	},
	linkInfo: {
		flex: 1,
	},
	linkLabel: {
		fontFamily: fonts.bodyBold,
		fontSize: 16,
		color: colors.text.primary,
	},
	linkDesc: {
		fontFamily: fonts.body,
		fontSize: 13,
		color: colors.text.muted,
		marginTop: 2,
	},

	// Settings rows
	settingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.bg.card,
		borderRadius: 12,
		padding: 16,
		marginBottom: 8,
	},
	settingInfo: {
		flex: 1,
	},
	settingLabel: {
		fontFamily: fonts.bodyBold,
		fontSize: 16,
		color: colors.text.primary,
	},
	settingDesc: {
		fontFamily: fonts.body,
		fontSize: 13,
		color: colors.text.muted,
		marginTop: 2,
	},
	optionRow: {
		flexDirection: 'row',
		gap: 6,
	},
	option: {
		backgroundColor: colors.bg.elevated,
		borderWidth: 1,
		borderColor: colors.text.muted,
		borderRadius: 8,
		paddingHorizontal: 14,
		paddingVertical: 10,
		minWidth: 44,
		alignItems: 'center' as const,
	},
	optionActive: {
		borderColor: colors.gold.primary,
		backgroundColor: colors.gold.muted,
	},
	optionText: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.muted,
	},
	optionTextActive: {
		color: colors.gold.primary,
		fontFamily: fonts.bodyBold,
	},
	aboutBox: {
		backgroundColor: colors.bg.card,
		borderRadius: 12,
		padding: 20,
		alignItems: 'center',
	},
	aboutTitle: {
		fontFamily: fonts.heading,
		fontSize: 25,
		color: colors.gold.primary,
		letterSpacing: 3,
		marginBottom: 8,
	},
	aboutText: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.secondary,
		textAlign: 'center',
		lineHeight: 20,
		marginBottom: 8,
	},
	version: {
		fontFamily: fonts.body,
		fontSize: 13,
		color: colors.text.muted,
	},

	// Modal shared
	modalContainer: {
		flex: 1,
		backgroundColor: colors.bg.primary,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.gold.muted,
	},
	modalTitle: {
		fontFamily: fonts.heading,
		fontSize: 21,
		color: colors.gold.primary,
		letterSpacing: 2,
	},
	modalScroll: {
		flex: 1,
		padding: 20,
	},

	// Roles Guide
	filterRow: {
		flexDirection: 'row',
		gap: 8,
		paddingHorizontal: 20,
		paddingTop: 12,
	},
	filterBtn: {
		flex: 1,
		borderWidth: 1,
		borderColor: colors.text.muted,
		borderRadius: 8,
		paddingVertical: 8,
		alignItems: 'center',
	},
	filterText: {
		fontFamily: fonts.heading,
		fontSize: 10,
		letterSpacing: 1,
	},
	roleCard: {
		backgroundColor: colors.bg.card,
		borderRadius: 12,
		borderLeftWidth: 4,
		padding: 16,
		marginBottom: 10,
	},
	roleHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	roleIcon: {
		fontSize: 29,
		marginRight: 12,
	},
	roleName: {
		fontFamily: fonts.heading,
		fontSize: 16,
		color: colors.text.primary,
	},
	roleBadge: {
		fontFamily: fonts.body,
		fontSize: 12,
		letterSpacing: 1,
		marginTop: 2,
	},
	roleDesc: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
		marginTop: 8,
		lineHeight: 19,
	},
	roleDetails: {
		marginTop: 12,
		borderTopWidth: 1,
		borderTopColor: colors.gold.muted,
		paddingTop: 12,
	},
	detailItem: {
		marginBottom: 10,
	},
	detailLabel: {
		fontFamily: fonts.heading,
		fontSize: 10,
		color: colors.gold.dark,
		letterSpacing: 2,
		marginBottom: 4,
	},
	detailValue: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.primary,
		lineHeight: 19,
	},

	// History
	emptyState: {
		alignItems: 'center',
		marginTop: 60,
	},
	emptyText: {
		fontFamily: fonts.body,
		fontSize: 17,
		color: colors.text.secondary,
		textAlign: 'center',
		marginTop: 16,
	},
	statsRow: {
		flexDirection: 'row',
		gap: 10,
		marginBottom: 24,
	},
	statBox: {
		flex: 1,
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.gold.muted,
		borderRadius: 12,
		padding: 16,
		alignItems: 'center',
	},
	statValue: {
		fontFamily: fonts.heading,
		fontSize: 29,
		color: colors.gold.primary,
	},
	statLabel: {
		fontFamily: fonts.body,
		fontSize: 10,
		color: colors.text.muted,
		letterSpacing: 1,
		marginTop: 4,
	},
	gameCard: {
		backgroundColor: colors.bg.card,
		borderRadius: 10,
		padding: 14,
		marginBottom: 8,
	},
	gameHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	gameDate: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.muted,
	},
	gameWinner: {
		fontFamily: fonts.heading,
		fontSize: 13,
		letterSpacing: 1,
	},
	gameInfo: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
	},
	clearHistoryBtn: {
		marginTop: 20,
		alignSelf: 'center',
		padding: 12,
	},
	clearHistoryText: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.danger,
		textDecorationLine: 'underline',
	},
});
