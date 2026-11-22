import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
	Modal,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { ROLE_LIST, type Team } from '../data/roles';
import { useHistoryStore } from '../store/historyStore';
import { useSettingsStore } from '../store/settingsStore';
import { colors, teamColor } from '../theme/colors';
import { fonts } from '../theme/typography';
import { confirm } from '../utils/confirm';

const capitalize = (text: string) =>
	text.charAt(0).toUpperCase() + text.slice(1);

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
				<Text style={styles.title}>Settings</Text>

				{/* Quick links */}
				<View style={styles.section}>
					<TouchableOpacity
						style={styles.linkRow}
						onPress={() => setShowRoles(true)}
					>
						<Ionicons
							name="book-outline"
							size={20}
							color={colors.text.secondary}
						/>
						<View style={styles.linkInfo}>
							<Text style={styles.linkLabel}>Roles guide</Text>
							<Text style={styles.linkDesc}>
								Browse all {ROLE_LIST.length} roles and
								abilities
							</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={20}
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
							color={colors.text.secondary}
						/>
						<View style={styles.linkInfo}>
							<Text style={styles.linkLabel}>Game history</Text>
							<Text style={styles.linkDesc}>
								{totalGames > 0
									? `${totalGames} games played`
									: 'No games yet'}
							</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={20}
							color={colors.text.muted}
						/>
					</TouchableOpacity>
				</View>

				{/* Gameplay */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Gameplay</Text>
					<View style={styles.settingRow}>
						<View style={styles.settingInfo}>
							<Text style={styles.settingLabel}>
								Reveal dead roles
							</Text>
							<Text style={styles.settingDesc}>
								Show role when a player is eliminated
							</Text>
						</View>
						<Switch
							accessibilityLabel="Reveal dead roles"
							value={settings.revealDeadRoles}
							onValueChange={settings.setRevealDeadRoles}
							trackColor={{
								false: colors.bg.elevated,
								true: colors.accent.dark,
							}}
							thumbColor={
								settings.revealDeadRoles
									? colors.accent.primary
									: colors.text.muted
							}
						/>
					</View>
					<View style={styles.settingRow}>
						<View style={styles.settingInfo}>
							<Text style={styles.settingLabel}>
								Discussion timer
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
								Role reveal mode
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
									List
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
					<Text style={styles.sectionTitle}>About</Text>
					<View style={styles.aboutBox}>
						<Text style={styles.aboutTitle}>Mafia</Text>
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
							<Text style={styles.modalTitle}>Roles guide</Text>
							<TouchableOpacity
								onPress={() => setShowRoles(false)}
								accessibilityRole="button"
								accessibilityLabel="Close roles guide"
								hitSlop={8}
							>
								<Ionicons
									name="close"
									size={24}
									color={colors.text.primary}
								/>
							</TouchableOpacity>
						</View>

						{/* Filter tabs */}
						<View style={styles.filterRow}>
							{(
								[
									{
										key: 'all',
										label: 'All',
										color: colors.text.primary,
									},
									{
										key: 'mafia',
										label: 'Mafia',
										color: colors.mafia.primary,
									},
									{
										key: 'village',
										label: 'Village',
										color: colors.village.primary,
									},
									{
										key: 'neutral',
										label: 'Neutral',
										color: colors.neutral.primary,
									},
								] as const
							).map((f) => (
								<TouchableOpacity
									key={f.key}
									style={[
										styles.filterBtn,
										roleFilter === f.key &&
											styles.filterBtnActive,
									]}
									onPress={() => setRoleFilter(f.key)}
								>
									<Text
										style={[
											styles.filterText,
											{
												color:
													roleFilter === f.key
														? colors.text.primary
														: f.color,
											},
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
											<View style={styles.roleIconBox}>
												<Ionicons
													name={role.icon}
													size={24}
													color={tc.primary}
												/>
											</View>
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
													{capitalize(role.team)}
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
															Night action
														</Text>
														<Text
															style={
																styles.detailValue
															}
														>
															{capitalize(
																role.nightAction.replace(
																	/_/g,
																	' ',
																),
															)}
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
															Passive ability
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
														Player tip
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
														God's note
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
							<Text style={styles.modalTitle}>Game history</Text>
							<TouchableOpacity
								onPress={() => setShowHistory(false)}
								accessibilityRole="button"
								accessibilityLabel="Close game history"
								hitSlop={8}
							>
								<Ionicons
									name="close"
									size={24}
									color={colors.text.primary}
								/>
							</TouchableOpacity>
						</View>

						<ScrollView style={styles.modalScroll}>
							{totalGames === 0 ? (
								<View style={styles.emptyState}>
									<Ionicons
										name="document-text-outline"
										size={40}
										color={colors.text.muted}
									/>
									<Text style={styles.emptyText}>
										No games played yet.
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
												Games
											</Text>
										</View>
										<View style={styles.statBox}>
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
												Mafia
											</Text>
										</View>
										<View style={styles.statBox}>
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
												Village
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
														{capitalize(
															game.winner,
														)}{' '}
														won
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

									<Button
										label="Clear history"
										variant="destructive"
										style={styles.clearHistoryBtn}
										onPress={() =>
											confirm(
												'Clear history?',
												'Delete all game records?',
												'Clear',
												clearHistory,
												true,
											)
										}
									/>
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
		fontSize: 32,
		color: colors.text.primary,
		textAlign: 'center',
		marginTop: 8,
		marginBottom: 24,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 14,
		color: colors.text.secondary,
		marginBottom: 12,
	},

	// Link rows
	linkRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
		padding: 16,
		marginBottom: 8,
		gap: 12,
	},
	linkInfo: {
		flex: 1,
	},
	linkLabel: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 16,
		color: colors.text.primary,
	},
	linkDesc: {
		fontFamily: fonts.body,
		fontSize: 12,
		color: colors.text.secondary,
		marginTop: 4,
	},

	// Settings rows
	settingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
		padding: 16,
		marginBottom: 8,
	},
	settingInfo: {
		flex: 1,
	},
	settingLabel: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 16,
		color: colors.text.primary,
	},
	settingDesc: {
		fontFamily: fonts.body,
		fontSize: 12,
		color: colors.text.secondary,
		marginTop: 4,
	},
	optionRow: {
		flexDirection: 'row',
		gap: 8,
	},
	option: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 12,
		minWidth: 44,
		alignItems: 'center' as const,
	},
	optionActive: {
		borderColor: colors.accent.primary,
		backgroundColor: colors.accent.muted,
	},
	optionText: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
	},
	optionTextActive: {
		color: colors.text.primary,
		fontFamily: fonts.bodySemiBold,
	},
	aboutBox: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
		padding: 20,
		alignItems: 'center',
	},
	aboutTitle: {
		fontFamily: fonts.heading,
		fontSize: 24,
		color: colors.text.primary,
		marginBottom: 8,
	},
	aboutText: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
		textAlign: 'center',
		lineHeight: 20,
		marginBottom: 8,
	},
	version: {
		fontFamily: fonts.body,
		fontSize: 12,
		color: colors.text.secondary,
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
		borderBottomColor: colors.border,
	},
	modalTitle: {
		fontFamily: fonts.heading,
		fontSize: 20,
		color: colors.text.primary,
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
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		paddingVertical: 8,
		alignItems: 'center',
	},
	filterBtnActive: {
		borderColor: colors.accent.primary,
		backgroundColor: colors.accent.muted,
	},
	filterText: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 12,
	},
	roleCard: {
		backgroundColor: colors.bg.card,
		borderRadius: 14,
		borderLeftWidth: 4,
		padding: 16,
		marginBottom: 12,
	},
	roleHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	roleIconBox: {
		width: 24,
		marginRight: 12,
	},
	roleName: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 16,
		color: colors.text.primary,
	},
	roleBadge: {
		fontFamily: fonts.body,
		fontSize: 12,
		marginTop: 4,
	},
	roleDesc: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
		marginTop: 8,
		lineHeight: 20,
	},
	roleDetails: {
		marginTop: 12,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		paddingTop: 12,
	},
	detailItem: {
		marginBottom: 12,
	},
	detailLabel: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 12,
		color: colors.text.secondary,
		marginBottom: 4,
	},
	detailValue: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.primary,
		lineHeight: 20,
	},

	// History
	emptyState: {
		alignItems: 'center',
		marginTop: 60,
	},
	emptyText: {
		fontFamily: fonts.body,
		fontSize: 16,
		color: colors.text.secondary,
		textAlign: 'center',
		marginTop: 16,
	},
	statsRow: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 24,
	},
	statBox: {
		flex: 1,
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
		padding: 16,
		alignItems: 'center',
	},
	statValue: {
		fontFamily: fonts.heading,
		fontSize: 32,
		color: colors.text.primary,
	},
	statLabel: {
		fontFamily: fonts.body,
		fontSize: 12,
		color: colors.text.secondary,
		marginTop: 4,
	},
	gameCard: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 14,
		padding: 12,
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
		color: colors.text.secondary,
	},
	gameWinner: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 14,
	},
	gameInfo: {
		fontFamily: fonts.body,
		fontSize: 14,
		color: colors.text.secondary,
	},
	clearHistoryBtn: {
		marginTop: 20,
		alignSelf: 'center',
	},
});
