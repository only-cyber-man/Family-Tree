// PocketBase record ids: 15 characters of [a-z0-9]. Generating them on the
// client when an edit is first made makes creates idempotent: a retry sends
// the same id, and "id already taken" means the first attempt succeeded.

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
export const PB_ID_LENGTH = 15;

type RandomBytes = (n: number) => Uint8Array;

function defaultBytes(n: number): Uint8Array {
	const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;
	const out = new Uint8Array(n);
	if (c?.getRandomValues) return c.getRandomValues(out);
	for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 256);
	return out;
}

export function newRecordId(bytes: RandomBytes = defaultBytes): string {
	let id = "";
	// Rejection sampling keeps the distribution uniform over 36 symbols.
	while (id.length < PB_ID_LENGTH) {
		for (const b of bytes(PB_ID_LENGTH * 2)) {
			if (b < 252 && id.length < PB_ID_LENGTH) id += ALPHABET[b % 36];
		}
	}
	return id;
}

export function isRecordId(id: string): boolean {
	return /^[a-z0-9]{15}$/.test(id);
}
