import { adsPath, aspectRatio, audienceHeaders, parseAds, pickAd, signingMessage, type Ad } from "../ads";

const ad = (id: string, weight: number): Ad => ({ id, title: id, mediaUrl: `https://ads.example/media/${id}.png`, mediaType: "image", width: 1200, height: 628, clickUrl: `https://ads.example/c/${id}`, weight });

describe("ads", () => {
	it("builds the feed path with the placement encoded", () => {
		expect(adsPath("settings")).toBe("/api/v1/ads?limit=10&placement=settings");
		expect(adsPath("home screen", 3)).toBe("/api/v1/ads?limit=3&placement=home%20screen");
	});

	it("joins the signing message with newlines, in the server's order", () => {
		expect(signingMessage("GET", "/api/v1/ads?limit=10", "1700000000", "abc", "e3b0")).toBe("GET\n/api/v1/ads?limit=10\n1700000000\nabc\ne3b0");
	});

	it("keeps well-formed image ads and drops the rest", () => {
		const parsed = parseAds({
			ads: [
				{ id: "a", title: "A", media_url: "https://x/a.png", media_type: "image", width: 1024, height: 500, click_url: "https://x/c/a", weight: 3 },
				{ id: "v", title: "V", media_url: "https://x/v.mp4", media_type: "video", width: 1280, height: 720, click_url: "https://x/c/v", weight: 1 },
				{ id: "b", media_url: "https://x/b.png", media_type: "image", click_url: "https://x/c/b" },
				{ id: 7, media_url: "https://x/7.png", media_type: "image", click_url: "https://x/c/7" },
				null,
			],
		});
		expect(parsed.map((a) => a.id)).toEqual(["a", "b"]);
		expect(parsed[0]).toMatchObject({ width: 1024, height: 500, weight: 3, title: "A" });
		expect(parsed[1]).toMatchObject({ width: 0, height: 0, weight: 1, title: "" });
		expect(parseAds(null)).toEqual([]);
		expect(parseAds({ ads: "nope" })).toEqual([]);
	});

	it("picks by weight", () => {
		const ads = [ad("light", 1), ad("heavy", 3)];
		expect(pickAd(ads, 0)?.id).toBe("light");
		expect(pickAd(ads, 0.24)?.id).toBe("light");
		expect(pickAd(ads, 0.25)?.id).toBe("heavy");
		expect(pickAd(ads, 0.999)?.id).toBe("heavy");
		expect(pickAd([], 0.5)).toBeNull();
	});

	it("falls back to 16:9 without dimensions", () => {
		expect(aspectRatio({ width: 1024, height: 500 })).toBeCloseTo(2.048);
		expect(aspectRatio({ width: 0, height: 0 })).toBeCloseTo(16 / 9);
	});

	describe("audience headers", () => {
		it("formats version, system, device and locale the way the server shows them", () => {
			expect(audienceHeaders({ appVersion: "1.0.1", build: "2", os: "Android", osVersion: "14", device: "Google Pixel 7", locale: "pl-PL" })).toEqual({
				"X-App-Version": "1.0.1 (2)",
				"X-OS": "android 14",
				"X-Device": "Google Pixel 7",
				"X-Locale": "pl-PL",
			});
		});

		it("leaves out what it does not know instead of sending blanks", () => {
			expect(audienceHeaders({})).toEqual({});
			expect(audienceHeaders({ appVersion: "1.0.1", os: "ios" })).toEqual({ "X-App-Version": "1.0.1", "X-OS": "ios" });
			expect(audienceHeaders({ build: "2", osVersion: "18", device: "  ", locale: "" })).toEqual({});
		});

		it("keeps values printable and short", () => {
			const h = audienceHeaders({ device: " Pixel\u0000 7\n ", locale: "x".repeat(200) });
			expect(h["X-Device"]).toBe("Pixel 7");
			expect(h["X-Locale"]).toHaveLength(64);
		});
	});
});
