// Moonlit Ash — Cool gray + pale moonlight blue
export const colors = {
	// Backgrounds — ash gray tones
	bg: {
		primary: '#0e1114', // Deep charcoal
		secondary: '#151a1e', // Slightly lighter ash
		card: '#1c2228', // Card surface
		elevated: '#242c33', // Elevated surfaces
		overlay: 'rgba(8,12,16,0.85)', // Modal overlays
	},

	// Accent colors — pale moonlight blue
	gold: {
		primary: '#8bb8d0', // Pale ice blue — main accent
		light: '#a8d4ec', // Lighter moonlight
		dark: '#5e8fa8', // Deeper steel blue
		muted: 'rgba(139,184,208,0.15)', // Blue with opacity
	},

	// Team colors
	mafia: {
		primary: '#9b3a3a', // Muted crimson
		light: '#c25050', // Brighter crimson
		dark: '#6e2020', // Deep crimson
		bg: 'rgba(155,58,58,0.10)', // Red tinted background
	},
	village: {
		primary: '#4a90a8', // Frosty teal
		light: '#6ab0c8', // Lighter teal
		dark: '#2a6a80', // Deep teal
		bg: 'rgba(74,144,168,0.10)', // Teal tinted background
	},
	neutral: {
		primary: '#7a6a8a', // Misty lavender
		light: '#9a8aaa', // Lighter lavender
		dark: '#5a4a6a', // Deep lavender
		bg: 'rgba(122,106,138,0.10)', // Lavender tinted background
	},

	// Text
	text: {
		primary: '#d8dee6', // Cool off-white
		secondary: '#8a929c', // Muted cool gray
		muted: '#4a525c', // Very muted
		inverse: '#0e1114', // Dark text on light bg
	},

	// Functional
	alive: '#4a8a6a', // Muted sage green
	dead: '#3a2a30', // Muted ash-gray
	danger: '#c25050', // Alert crimson
	success: '#4a8a6a', // Sage green
	warning: '#c8a860', // Pale amber warning

	// Phase-specific
	night: {
		bg: '#080c10', // Near-black blue
		glow: '#6aa0c0', // Cold moonlight glow
		text: '#8aaabe', // Dim blue-gray text
	},
	day: {
		bg: '#151a1e', // Ash base
		glow: '#a8d4ec', // Bright moonlight
		text: '#d8dee6', // Crisp cool text
	},
} as const;

export const teamColor = (team: 'mafia' | 'village' | 'neutral') => {
	switch (team) {
		case 'mafia':
			return colors.mafia;
		case 'village':
			return colors.village;
		case 'neutral':
			return colors.neutral;
	}
};
