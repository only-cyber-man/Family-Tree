import { sessionAction, shouldOpenReminder } from "../session";

describe("session expiry", () => {
	const now = 1_800_000_000;
	it("detects an expired token (PocketBase would silently treat it as a guest)", () => {
		expect(sessionAction(now - 1, now, 600)).toBe("expired");
		expect(sessionAction(now, now, 600)).toBe("expired");
	});
	it("refreshes proactively when close to expiry", () => {
		expect(sessionAction(now + 300, now, 600)).toBe("refresh");
		expect(sessionAction(now + 2 * 86400, now, 3 * 86400)).toBe("refresh");
	});
	it("leaves a fresh token alone and reports a missing one", () => {
		expect(sessionAction(now + 7 * 86400, now, 600)).toBe("ok");
		expect(sessionAction(null, now, 600)).toBe("none");
	});
});

describe("reminder taps", () => {
	const data = { treeId: "t1", personId: "p1", userId: "u1" };
	it("opens reminders of the signed-in account for a tree it can see", () => {
		expect(shouldOpenReminder(data, "u1", ["t1", "t2"])).toBe(true);
		expect(shouldOpenReminder(data, "u1", null)).toBe(true);
	});
	it("ignores another account's reminders (delivered before sign-out)", () => {
		expect(shouldOpenReminder(data, "u2", ["t1"])).toBe(false);
		expect(shouldOpenReminder({ treeId: "t1", personId: "p1" }, "u1", ["t1"])).toBe(false);
	});
	it("ignores trees the account can no longer see, and signed-out taps", () => {
		expect(shouldOpenReminder(data, "u1", ["t2"])).toBe(false);
		expect(shouldOpenReminder(data, null, ["t1"])).toBe(false);
	});
});
