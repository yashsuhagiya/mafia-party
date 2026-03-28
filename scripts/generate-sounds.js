/**
 * Generate simple WAV sound effects for the Mafia party game.
 * Run: node scripts/generate-sounds.js
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

function writeWav(filename, samples) {
	const buffer = Buffer.alloc(44 + samples.length * 2);
	const numChannels = 1;
	const bitsPerSample = 16;
	const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
	const blockAlign = numChannels * (bitsPerSample / 8);
	const dataSize = samples.length * 2;

	// RIFF header
	buffer.write('RIFF', 0);
	buffer.writeUInt32LE(36 + dataSize, 4);
	buffer.write('WAVE', 8);

	// fmt chunk
	buffer.write('fmt ', 12);
	buffer.writeUInt32LE(16, 16);
	buffer.writeUInt16LE(1, 20); // PCM
	buffer.writeUInt16LE(numChannels, 22);
	buffer.writeUInt32LE(SAMPLE_RATE, 24);
	buffer.writeUInt32LE(byteRate, 28);
	buffer.writeUInt16LE(blockAlign, 32);
	buffer.writeUInt16LE(bitsPerSample, 34);

	// data chunk
	buffer.write('data', 36);
	buffer.writeUInt32LE(dataSize, 40);

	for (let i = 0; i < samples.length; i++) {
		const clamped = Math.max(-1, Math.min(1, samples[i]));
		buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
	}

	fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
	console.log(
		`  Created ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`,
	);
}

function sine(freq, t) {
	return Math.sin(2 * Math.PI * freq * t);
}

function envelope(t, attack, decay, sustain, release, duration) {
	if (t < attack) return t / attack;
	if (t < attack + decay) return 1 - ((t - attack) / decay) * (1 - sustain);
	if (t < duration - release) return sustain;
	if (t < duration)
		return sustain * (1 - (t - (duration - release)) / release);
	return 0;
}

// --- Sound generators ---

function generateTap() {
	const duration = 0.08;
	const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
	for (let i = 0; i < samples.length; i++) {
		const t = i / SAMPLE_RATE;
		const env = Math.exp(-t * 60);
		samples[i] =
			(sine(800, t) * 0.3 +
				sine(1200, t) * 0.2 +
				(Math.random() * 2 - 1) * 0.1) *
			env *
			0.6;
	}
	return samples;
}

function generateReveal() {
	const duration = 0.8;
	const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
	for (let i = 0; i < samples.length; i++) {
		const t = i / SAMPLE_RATE;
		const freq = 200 + t * 600;
		const env = envelope(t, 0.05, 0.1, 0.6, 0.3, duration);
		// Mysterious shimmer
		samples[i] =
			(sine(freq, t) * 0.3 +
				sine(freq * 1.5, t) * 0.15 +
				sine(freq * 2, t) * 0.1) *
			env *
			0.5;
	}
	return samples;
}

function generateNightTransition() {
	const duration = 1.2;
	const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
	for (let i = 0; i < samples.length; i++) {
		const t = i / SAMPLE_RATE;
		const freq = 150 - t * 30;
		const env = envelope(t, 0.2, 0.3, 0.5, 0.5, duration);
		// Deep ominous tone with sub-harmonics
		samples[i] =
			(sine(freq, t) * 0.4 +
				sine(freq * 0.5, t) * 0.2 +
				sine(freq * 1.5, t) * 0.1 +
				sine(freq * 3, t) * 0.05) *
			env *
			0.5;
	}
	return samples;
}

function generateDayTransition() {
	const duration = 1.0;
	const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
	for (let i = 0; i < samples.length; i++) {
		const t = i / SAMPLE_RATE;
		const freq = 400 + t * 200;
		const env = envelope(t, 0.1, 0.2, 0.5, 0.4, duration);
		// Bright ascending tone
		samples[i] =
			(sine(freq, t) * 0.3 +
				sine(freq * 2, t) * 0.15 +
				sine(freq * 3, t) * 0.08) *
			env *
			0.5;
	}
	return samples;
}

function generateEliminate() {
	const duration = 0.6;
	const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
	for (let i = 0; i < samples.length; i++) {
		const t = i / SAMPLE_RATE;
		const freq = 200 * Math.exp(-t * 3);
		const env = envelope(t, 0.01, 0.05, 0.6, 0.3, duration);
		// Dramatic impact
		samples[i] =
			(sine(freq, t) * 0.4 +
				sine(freq * 0.5, t) * 0.3 +
				(Math.random() * 2 - 1) * 0.05 * Math.exp(-t * 8)) *
			env *
			0.6;
	}
	return samples;
}

function generateTimerWarning() {
	const duration = 0.4;
	const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
	for (let i = 0; i < samples.length; i++) {
		const t = i / SAMPLE_RATE;
		// Two quick beeps
		const beep1 = t < 0.15 ? sine(880, t) * Math.exp(-t * 15) : 0;
		const beep2 =
			t > 0.2 && t < 0.35 ? sine(1100, t) * Math.exp(-(t - 0.2) * 15) : 0;
		samples[i] = (beep1 + beep2) * 0.4;
	}
	return samples;
}

function generateGameStart() {
	const duration = 1.5;
	const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
	for (let i = 0; i < samples.length; i++) {
		const t = i / SAMPLE_RATE;
		const env = envelope(t, 0.05, 0.2, 0.6, 0.8, duration);
		// Dramatic chord: minor with tension
		const f1 = 220; // A
		const f2 = 261; // C
		const f3 = 330; // E
		const f4 = 440; // A octave
		samples[i] =
			(sine(f1, t) * 0.25 +
				sine(f2, t) * 0.2 +
				sine(f3, t) * 0.2 +
				sine(f4, t) * 0.15) *
			env *
			0.5;
	}
	return samples;
}

function generateVictory() {
	const duration = 1.8;
	const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
	for (let i = 0; i < samples.length; i++) {
		const t = i / SAMPLE_RATE;
		const env = envelope(t, 0.05, 0.1, 0.7, 0.6, duration);
		// Ascending triumphant arpeggio
		let note;
		if (t < 0.3)
			note = 330; // E
		else if (t < 0.6)
			note = 392; // G
		else if (t < 0.9)
			note = 494; // B
		else note = 659; // E high

		samples[i] =
			(sine(note, t) * 0.3 +
				sine(note * 2, t) * 0.15 +
				sine(note * 0.5, t) * 0.1) *
			env *
			0.5;
	}
	return samples;
}

function generateTargetSelect() {
	const duration = 0.12;
	const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
	for (let i = 0; i < samples.length; i++) {
		const t = i / SAMPLE_RATE;
		const env = Math.exp(-t * 30);
		samples[i] = (sine(600, t) * 0.3 + sine(900, t) * 0.2) * env * 0.5;
	}
	return samples;
}

function generateConfirm() {
	const duration = 0.25;
	const samples = new Float64Array(Math.floor(SAMPLE_RATE * duration));
	for (let i = 0; i < samples.length; i++) {
		const t = i / SAMPLE_RATE;
		// Two-tone ascending confirmation
		const note = t < 0.1 ? 500 : 700;
		const env = t < 0.1 ? Math.exp(-t * 20) : Math.exp(-(t - 0.1) * 12);
		samples[i] =
			(sine(note, t) * 0.3 + sine(note * 1.5, t) * 0.1) * env * 0.5;
	}
	return samples;
}

// --- Generate all sounds ---
console.log('Generating sound effects...\n');

writeWav('tap.wav', generateTap());
writeWav('reveal.wav', generateReveal());
writeWav('night.wav', generateNightTransition());
writeWav('day.wav', generateDayTransition());
writeWav('eliminate.wav', generateEliminate());
writeWav('timer_warning.wav', generateTimerWarning());
writeWav('game_start.wav', generateGameStart());
writeWav('victory.wav', generateVictory());
writeWav('target_select.wav', generateTargetSelect());
writeWav('confirm.wav', generateConfirm());

console.log('\nDone! All sound effects saved to assets/sounds/');
