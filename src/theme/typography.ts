import { StyleSheet } from 'react-native';

// Rye for headings (RDR2 western feel), Inter for everything else
export const fonts = {
	heading: 'Rye_400Regular',
	body: 'Inter_400Regular',
	bodyMedium: 'Inter_500Medium',
	bodySemiBold: 'Inter_600SemiBold',
	bodyBold: 'Inter_700Bold',
} as const;

export const typography = StyleSheet.create({
	title: {
		fontFamily: fonts.heading,
		fontSize: 28,
		letterSpacing: 1,
	},
	subtitle: {
		fontFamily: fonts.heading,
		fontSize: 20,
		letterSpacing: 0.5,
	},
	heading: {
		fontFamily: fonts.heading,
		fontSize: 16,
		letterSpacing: 0.5,
	},
	body: {
		fontFamily: fonts.body,
		fontSize: 16,
		lineHeight: 24,
	},
	bodySmall: {
		fontFamily: fonts.body,
		fontSize: 14,
		lineHeight: 20,
	},
	label: {
		fontFamily: fonts.bodySemiBold,
		fontSize: 12,
		letterSpacing: 1,
		textTransform: 'uppercase',
	},
	caption: {
		fontFamily: fonts.body,
		fontSize: 12,
		lineHeight: 16,
	},
});
