// Pure logic for the house-ads client (the ads.cyber-man.pl feed): the signing
// message, the feed path, response parsing and the weighted pick. Network and
// platform code is in src/services/ads.ts.

/** One ad as the feed returns it (only the fields the app uses). */
export interface Ad {
	id: string;
	title: string;
	mediaUrl: string;
	mediaType: "image" | "video";
	width: number;
	height: number;
	/** Click-tracking redirect: opening it records the click and lands on link_url. */
	clickUrl: string;
	weight: number;
}

/** Request path for the feed, with the query in the order the server expects it signed. */
export function adsPath(placement: string, limit = 10): string {
	return `/api/v1/ads?limit=${limit}&placement=${encodeURIComponent(placement)}`;
}

/**
 * The string an app signs: METHOD, PATH?QUERY, unix timestamp, nonce and the
 * hex SHA-256 of the body, joined by "\n". Must match the server byte for byte.
 */
export function signingMessage(method: string, pathWithQuery: string, timestamp: string, nonce: string, bodyHashHex: string): string {
	return [method, pathWithQuery, timestamp, nonce, bodyHashHex].join("\n");
}

/** Keeps the image ads that can be shown; anything malformed is dropped. */
export function parseAds(json: unknown): Ad[] {
	const list = (json as { ads?: unknown })?.ads;
	if (!Array.isArray(list)) return [];
	const out: Ad[] = [];
	for (const raw of list) {
		const a = raw as Record<string, unknown>;
		if (typeof a?.id !== "string" || typeof a.media_url !== "string" || typeof a.click_url !== "string") continue;
		if (a.media_type !== "image") continue; // the banner renders images only
		out.push({
			id: a.id,
			title: typeof a.title === "string" ? a.title : "",
			mediaUrl: a.media_url,
			mediaType: "image",
			width: typeof a.width === "number" && a.width > 0 ? a.width : 0,
			height: typeof a.height === "number" && a.height > 0 ? a.height : 0,
			clickUrl: a.click_url,
			weight: typeof a.weight === "number" && a.weight > 0 ? a.weight : 1,
		});
	}
	return out;
}

/** One ad at random, proportionally to its weight. `random` is in [0, 1). */
export function pickAd(ads: Ad[], random: number = Math.random()): Ad | null {
	if (ads.length === 0) return null;
	const total = ads.reduce((n, a) => n + a.weight, 0);
	let r = random * total;
	for (const a of ads) {
		r -= a.weight;
		if (r < 0) return a;
	}
	return ads[ads.length - 1];
}

/** Width / height of the creative, or 16:9 when the feed did not say. */
export function aspectRatio(ad: Pick<Ad, "width" | "height">): number {
	return ad.width && ad.height ? ad.width / ad.height : 16 / 9;
}

/** What the app knows about itself and the device; every field may be missing. */
export interface ClientInfo {
	/** Marketing version, e.g. "1.0.1". */
	appVersion?: string;
	/** Android versionCode or iOS build number, e.g. "2". */
	build?: string;
	/** "android" | "ios". */
	os?: string;
	/** e.g. "14" or "18.1". */
	osVersion?: string;
	/** e.g. "Google Pixel 7" or "iPad". */
	device?: string;
	/** BCP 47 tag, e.g. "pl-PL". */
	locale?: string;
}

const HEADER_MAX = 64;

/** One header value: printable, trimmed, at most HEADER_MAX characters; "" when nothing is left. */
function headerValue(v: string | undefined): string {
	if (!v) return "";
	// eslint-disable-next-line no-control-regex
	return v.replace(/[\u0000-\u001f\u007f-\u009f]/g, "").trim().slice(0, HEADER_MAX);
}

/**
 * The optional audience headers the ads server shows under "Audience":
 * X-App-Version "1.0.1 (2)", X-OS "android 14", X-Device, X-Locale. They are
 * not signed, and a header whose value is unknown is left out.
 */
export function audienceHeaders(info: ClientInfo): Record<string, string> {
	const version = headerValue(info.appVersion);
	const build = headerValue(info.build);
	const os = headerValue(info.os).toLowerCase();
	const osVersion = headerValue(info.osVersion);
	const out: Record<string, string> = {};
	if (version) out["X-App-Version"] = headerValue(build ? `${version} (${build})` : version);
	if (os) out["X-OS"] = headerValue(osVersion ? `${os} ${osVersion}` : os);
	const device = headerValue(info.device);
	if (device) out["X-Device"] = device;
	const locale = headerValue(info.locale);
	if (locale) out["X-Locale"] = locale;
	return out;
}
