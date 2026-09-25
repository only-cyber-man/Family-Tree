import * as SecureStore from "expo-secure-store";

// SecureStore values are limited (~2 KB on some platforms) and a PocketBase
// auth payload (token + user record) can exceed that, so values are chunked.

const CHUNK = 1800;

export async function setSecure(key: string, value: string): Promise<void> {
	const chunks: string[] = [];
	for (let i = 0; i < value.length; i += CHUNK) chunks.push(value.slice(i, i + CHUNK));
	const prev = Number((await SecureStore.getItemAsync(`${key}.n`)) ?? "0");
	for (let i = 0; i < chunks.length; i++) await SecureStore.setItemAsync(`${key}.${i}`, chunks[i]);
	for (let i = chunks.length; i < prev; i++) await SecureStore.deleteItemAsync(`${key}.${i}`);
	await SecureStore.setItemAsync(`${key}.n`, String(chunks.length));
}

export async function getSecure(key: string): Promise<string | null> {
	const n = Number((await SecureStore.getItemAsync(`${key}.n`)) ?? "0");
	if (!n) return null;
	let out = "";
	for (let i = 0; i < n; i++) {
		const part = await SecureStore.getItemAsync(`${key}.${i}`);
		if (part == null) return null;
		out += part;
	}
	return out;
}

export async function deleteSecure(key: string): Promise<void> {
	const n = Number((await SecureStore.getItemAsync(`${key}.n`)) ?? "0");
	for (let i = 0; i < n; i++) await SecureStore.deleteItemAsync(`${key}.${i}`);
	await SecureStore.deleteItemAsync(`${key}.n`);
}
