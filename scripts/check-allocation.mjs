import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

// The app's imports are extensionless (bundler resolution); teach Node to add .ts.
registerHooks({
	resolve(specifier, context, nextResolve) {
		try {
			return nextResolve(specifier, context);
		} catch (e) {
			if (specifier.startsWith('.'))
				return nextResolve(`${specifier}.ts`, context);
			throw e;
		}
	},
});

const { allocateRoles } = await import(
	new URL('../src/utils/allocation.ts', import.meta.url).href
);

const config = { mafia: 2, silencer: 1, villager: 5, police: 1, doctor: 1 };
const names = Array.from({ length: 10 }, (_, i) => `P${i}`);
const RUNS = 20000;
const mafiaHits = new Array(names.length).fill(0);
for (let r = 0; r < RUNS; r++) {
	const out = allocateRoles(config, names);
	assert.deepEqual(
		out.map((o) => o.name),
		names,
	);
	const counts = {};
	for (const o of out) counts[o.role.id] = (counts[o.role.id] ?? 0) + 1;
	assert.deepEqual(counts, config);
	out.forEach((o, i) => {
		if (o.role.team === 'mafia') mafiaHits[i]++;
	});
}
const expected = (RUNS * 3) / 10;
for (const h of mafiaHits)
	assert.ok(Math.abs(h - expected) < expected * 0.06, `skewed: ${mafiaHits}`);
console.log('allocation ok', mafiaHits.join(' '));
