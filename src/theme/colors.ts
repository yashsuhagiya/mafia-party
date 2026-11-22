// Black — neutral greys, off-white actions, team colours carry the only hue
export const colors = {
	// Backgrounds — pure black base, neutral grey steps
	bg: {
		primary: '#000000',
		secondary: '#0a0a0a', // Tab bar, pinned footers
		card: '#141414',
		elevated: '#1f1f1f',
		overlay: 'rgba(0,0,0,0.85)',
	},

	// Accent — off-white: primary button, active tab, selection
	accent: {
		primary: '#ededed',
		light: '#ffffff',
		dark: '#a3a3a3',
		muted: 'rgba(255,255,255,0.10)', // Selection fill
	},

	// Team colors — `primary` is readable as text/icons on black and cards
	mafia: {
		primary: '#e5484d', // Blood red
		light: '#f2777a',
		dark: '#b3261e', // Destructive button fill (white text 5.6:1)
		bg: 'rgba(229,72,77,0.12)',
	},
	village: {
		primary: '#6fae6f', // Field green
		light: '#8fc98f',
		dark: '#3d6b3d',
		bg: 'rgba(111,174,111,0.12)',
	},
	neutral: {
		primary: '#d4a24c', // Amber
		light: '#e6bd73',
		dark: '#8a6420',
		bg: 'rgba(212,162,76,0.12)',
	},

	// Hairline border
	border: 'rgba(255,255,255,0.10)',

	// Text
	text: {
		primary: '#ededed',
		secondary: '#a3a3a3', // 7.3:1 on card
		muted: '#808080', // 4.7:1 on card — not on bg.elevated
		inverse: '#000000', // Text on off-white buttons
	},

	// Functional
	alive: '#6fae6f',
	dead: '#2a2a2a',
	danger: '#e5484d',
	success: '#6fae6f',
	warning: '#d4a24c',

	// Phase-specific
	night: {
		bg: '#000000',
		glow: '#ededed',
		text: '#a3a3a3',
	},
	day: {
		bg: '#0a0a0a',
		glow: '#ededed',
		text: '#ededed',
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
