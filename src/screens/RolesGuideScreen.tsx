import { useState } from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROLE_LIST, type Team } from '../data/roles';
import { colors, teamColor } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function RolesGuideScreen() {
	const [filter, setFilter] = useState<Team | 'all'>('all');
	const [expanded, setExpanded] = useState<string | null>(null);

	const filtered =
		filter === 'all'
			? ROLE_LIST
			: ROLE_LIST.filter((r) => r.team === filter);

	const toggleExpand = (id: string) => {
		setExpanded(expanded === id ? null : id);
	};

	const filters: { key: Team | 'all'; label: string; color: string }[] = [
		{ key: 'all', label: 'ALL', color: colors.gold.primary },
		{ key: 'mafia', label: 'MAFIA', color: colors.mafia.primary },
		{ key: 'village', label: 'VILLAGE', color: colors.village.primary },
		{ key: 'neutral', label: 'NEUTRAL', color: colors.neutral.primary },
	];

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.title}>ROLES GUIDE</Text>
				<Text style={styles.subtitle}>
					{ROLE_LIST.length} roles available
				</Text>

				{/* Filter tabs */}
				<View style={styles.filterRow}>
					{filters.map((f) => (
						<TouchableOpacity
							key={f.key}
							style={[
								styles.filterBtn,
								filter === f.key && {
									borderColor: f.color,
									backgroundColor: `${f.color}20`,
								},
							]}
							onPress={() => setFilter(f.key)}
						>
							<Text
								style={[styles.filterText, { color: f.color }]}
							>
								{f.label}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Role cards */}
				{filtered.map((role) => {
					const tc = teamColor(role.team);
					const isExpanded = expanded === role.id;

					return (
						<TouchableOpacity
							key={role.id}
							style={[
								styles.roleCard,
								{ borderLeftColor: tc.primary },
							]}
							onPress={() => toggleExpand(role.id)}
							activeOpacity={0.7}
						>
							<View style={styles.roleHeader}>
								<Text style={styles.roleIcon}>{role.icon}</Text>
								<View style={styles.roleInfo}>
									<Text style={styles.roleName}>
										{role.name}
									</Text>
									<Text
										style={[
											styles.teamBadge,
											{ color: tc.primary },
										]}
									>
										{role.team.toUpperCase()}
									</Text>
								</View>
								<Text style={styles.expandIcon}>
									{isExpanded ? '▲' : '▼'}
								</Text>
							</View>

							<Text style={styles.roleDesc}>
								{role.description}
							</Text>

							{isExpanded && (
								<View style={styles.details}>
									{role.nightAction && (
										<View style={styles.detailRow}>
											<Text style={styles.detailLabel}>
												NIGHT ACTION
											</Text>
											<Text style={styles.detailValue}>
												{role.nightAction
													.replace(/_/g, ' ')
													.toUpperCase()}
											</Text>
										</View>
									)}

									{role.passiveAbility && (
										<View style={styles.detailRow}>
											<Text style={styles.detailLabel}>
												PASSIVE ABILITY
											</Text>
											<Text style={styles.detailValue}>
												{role.passiveAbility}
											</Text>
										</View>
									)}

									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>
											PLAYER TIP
										</Text>
										<Text style={styles.detailValue}>
											{role.playerTip}
										</Text>
									</View>

									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>
											GOD'S NOTE
										</Text>
										<Text style={styles.detailValue}>
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
	},
	subtitle: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.muted,
		textAlign: 'center',
		marginBottom: 20,
	},
	filterRow: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 20,
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
		fontSize: 11,
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
		fontSize: 33,
		marginRight: 12,
	},
	roleInfo: {
		flex: 1,
	},
	roleName: {
		fontFamily: fonts.heading,
		fontSize: 17,
		color: colors.text.primary,
	},
	teamBadge: {
		fontFamily: fonts.body,
		fontSize: 12,
		letterSpacing: 1,
		marginTop: 2,
	},
	expandIcon: {
		fontSize: 13,
		color: colors.text.muted,
	},
	roleDesc: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.secondary,
		marginTop: 8,
		lineHeight: 20,
	},
	details: {
		marginTop: 12,
		borderTopWidth: 1,
		borderTopColor: colors.gold.muted,
		paddingTop: 12,
	},
	detailRow: {
		marginBottom: 10,
	},
	detailLabel: {
		fontFamily: fonts.heading,
		fontSize: 11,
		color: colors.gold.dark,
		letterSpacing: 2,
		marginBottom: 4,
	},
	detailValue: {
		fontFamily: fonts.body,
		fontSize: 15,
		color: colors.text.primary,
		lineHeight: 20,
	},
});
