// House ads from ads.cyber-man.pl (the "ads" repo). Every request is signed
// with this app's Ed25519 key, so the server knows the fetch came from Family
// Tree; the dashboard there decides which creatives run and records the
// impressions and clicks. Only this file talks to that server.
import * as ed from "@noble/ed25519";
import { sha256 } from "@noble/hashes/sha256";
import { sha512 } from "@noble/hashes/sha512";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";
import Constants from "expo-constants";
import { getLocales } from "expo-localization";
import { Platform } from "react-native";
import { adsPath, audienceHeaders, parseAds, type Ad } from "../lib/ads";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export const ADS_SERVER = "https://ads.cyber-man.pl";

// One app per store in the ads dashboard, so each platform's ads can link to
// its own store page. The key only proves the request comes from this app.
const APP = Platform.select({
	ios: { id: "app_Blhgkx4TTPZGugmm", seed: "llZEkhugJnjbMtL/STbceUlw5RpABgH41nfI+mVxZZg=" },
	default: { id: "app_LDh-hhVueS_2Ao7W", seed: "QplCORrdvUUe4JZql61Yy8bWGh9QyGlyDFZIjJSrgws=" },
});

/**
 * Coarse facts about this install for the dashboard's Audience section: app
 * version and build, OS and its version, device model (Android) or iPhone/iPad,
 * and the device language. No identifiers; the country is derived server-side
 * from the IP address, not sent by the app.
 */
function describeClient(): Record<string, string> {
	try {
		const cfg = Constants.expoConfig;
		const c = Platform.constants as Record<string, unknown>;
		const build = Platform.OS === "android" ? cfg?.android?.versionCode : cfg?.ios?.buildNumber;
		const device =
			Platform.OS === "android"
				? [c.Brand, c.Model].filter((v) => typeof v === "string" && v).join(" ")
				: c.interfaceIdiom === "pad"
					? "iPad"
					: "iPhone";
		return audienceHeaders({
			appVersion: cfg?.version,
			build: build == null ? undefined : String(build),
			os: Platform.OS,
			osVersion: String(Platform.Version),
			device,
			locale: getLocales()[0]?.languageTag ?? undefined,
		});
	} catch {
		return {};
	}
}
const AUDIENCE = describeClient();

/** How long a fetched feed is reused before asking the server again. */
export const FEED_TTL_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 8000;

const b64decode = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const b64encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));

let seed: Uint8Array | null = null;
const privateSeed = () => (seed ??= b64decode(APP.seed));

/** Unique per request; replay protection is the signature plus the server's nonce cache. */
function nonce(): string {
	let s = "";
	for (let i = 0; i < 4; i++) s += Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, "0");
	return s;
}

async function signedFetch(method: "GET" | "POST", pathWithQuery: string, body = ""): Promise<Response> {
	const ts = String(Math.floor(Date.now() / 1000));
	const n = nonce();
	const bodyHash = bytesToHex(sha256(utf8ToBytes(body)));
	const msg = [method, pathWithQuery, ts, n, bodyHash].join("\n");
	const sig = b64encode(ed.sign(utf8ToBytes(msg), privateSeed()));
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		return await fetch(ADS_SERVER + pathWithQuery, {
			method,
			body: body || undefined,
			signal: controller.signal,
			headers: { ...AUDIENCE, "X-App-Id": APP.id, "X-Timestamp": ts, "X-Nonce": n, "X-Signature": sig, "Content-Type": "application/json" },
		});
	} finally {
		clearTimeout(timer);
	}
}

const cache = new Map<string, { at: number; ads: Ad[]; pending?: Promise<Ad[]> }>();

/** The active image ads for a placement; one request per placement per TTL. */
export async function fetchAds(placement: string): Promise<Ad[]> {
	const hit = cache.get(placement);
	const now = Date.now();
	if (hit && now - hit.at < FEED_TTL_MS) return hit.ads;
	if (hit?.pending) return hit.pending;
	const pending = (async () => {
		try {
			const res = await signedFetch("GET", adsPath(placement));
			if (!res.ok) throw new Error(`ads: HTTP ${res.status}`);
			const ads = parseAds(await res.json());
			cache.set(placement, { at: Date.now(), ads });
			return ads;
		} catch (e) {
			cache.delete(placement);
			throw e;
		}
	})();
	cache.set(placement, { at: hit?.at ?? 0, ads: hit?.ads ?? [], pending });
	return pending;
}

const reported = new Set<string>();

/** Tells the server the ad was on screen; once per ad per app run. Fire and forget. */
export function reportImpression(adId: string): void {
	if (reported.has(adId)) return;
	reported.add(adId);
	signedFetch("POST", "/api/v1/events", JSON.stringify({ events: [{ ad_id: adId, type: "impression" }] })).catch(() => {
		reported.delete(adId);
	});
}
