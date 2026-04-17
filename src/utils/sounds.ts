import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { useSettingsStore } from '../store/settingsStore';

const soundFiles = {
	tap: require('../../assets/sounds/tap.wav'),
	reveal: require('../../assets/sounds/reveal.wav'),
	night: require('../../assets/sounds/night.wav'),
	day: require('../../assets/sounds/day.wav'),
	eliminate: require('../../assets/sounds/eliminate.wav'),
	timer_warning: require('../../assets/sounds/timer_warning.wav'),
	game_start: require('../../assets/sounds/game_start.wav'),
	victory: require('../../assets/sounds/victory.wav'),
	target_select: require('../../assets/sounds/target_select.wav'),
	confirm: require('../../assets/sounds/confirm.wav'),
} as const;

export type SoundName = keyof typeof soundFiles;

// Cache loaded sounds to avoid re-loading
const soundCache: Partial<Record<SoundName, Audio.Sound>> = {};

export async function playSound(name: SoundName) {
	const { soundEnabled, volume } = useSettingsStore.getState();
	if (!soundEnabled) return;

	try {
		// Unload previous instance of same sound if still loaded
		if (soundCache[name]) {
			try {
				await soundCache[name]?.unloadAsync();
			} catch {
				// ignore
			}
		}

		const { sound } = await Audio.Sound.createAsync(soundFiles[name], {
			shouldPlay: true,
			volume,
		});

		soundCache[name] = sound;

		// Auto-cleanup when done
		sound.setOnPlaybackStatusUpdate((status) => {
			if (status.isLoaded && status.didJustFinish) {
				sound.unloadAsync().catch(() => {});
				if (soundCache[name] === sound) {
					delete soundCache[name];
				}
			}
		});
	} catch (e) {
		// Silently fail — sound is non-critical
		console.warn(`Sound playback failed (${name}):`, e);
	}
}

// Initialize audio mode (call once at app start)
export async function initAudio() {
	try {
		await Audio.setAudioModeAsync({
			playsInSilentModeIOS: true,
			staysActiveInBackground: false,
			shouldDuckAndroid: true,
		});
	} catch (e) {
		console.warn('Audio init failed:', e);
	}
}
