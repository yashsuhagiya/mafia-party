import {
	type StyleProp,
	StyleSheet,
	Text,
	TouchableOpacity,
	type ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

interface ButtonProps {
	label: string;
	onPress: () => void;
	variant?: 'primary' | 'secondary' | 'destructive';
	disabled?: boolean;
	accessibilityLabel?: string;
	style?: StyleProp<ViewStyle>;
}

export default function Button({
	label,
	onPress,
	variant = 'primary',
	disabled = false,
	accessibilityLabel,
	style,
}: ButtonProps) {
	return (
		<TouchableOpacity
			style={[
				styles.base,
				variantStyles[variant],
				disabled && styles.disabled,
				style,
			]}
			onPress={onPress}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel ?? label}
			accessibilityState={{ disabled }}
		>
			<Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	base: {
		borderRadius: 10,
		minHeight: 48,
		paddingVertical: 12,
		paddingHorizontal: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	label: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 16,
		textAlign: 'center',
	},
	disabled: {
		opacity: 0.4,
	},
});

const variantStyles = StyleSheet.create({
	primary: {
		backgroundColor: colors.accent.primary,
	},
	secondary: {
		backgroundColor: colors.bg.card,
		borderWidth: 1,
		borderColor: colors.border,
	},
	destructive: {
		backgroundColor: colors.mafia.dark,
	},
});

const labelStyles = StyleSheet.create({
	primary: { color: colors.text.inverse },
	secondary: { color: colors.text.primary },
	destructive: { color: colors.text.primary },
});
