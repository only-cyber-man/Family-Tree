import { isRecordId, newRecordId, PB_ID_LENGTH } from "../ids";
import { changedFields, createOnce, isIdTaken } from "../idempotent";

// Same shape as pocketbase's ClientResponseError.
class ClientResponseError extends Error {
	constructor(
		public status: number,
		public response: { code: number; message: string; data: Record<string, unknown> },
	) {
		super(response.message);
	}
}
const pbError = (status: number, data: Record<string, unknown> = {}) =>
	new ClientResponseError(status, { code: status, message: "Failed to create record.", data });

describe("client-generated record ids", () => {
	it("are 15 chars of [a-z0-9]", () => {
		for (let i = 0; i < 200; i++) {
			const id = newRecordId();
			expect(id).toHaveLength(PB_ID_LENGTH);
			expect(isRecordId(id)).toBe(true);
		}
	});

	it("are unique across many draws", () => {
		const ids = new Set(Array.from({ length: 5000 }, () => newRecordId()));
		expect(ids.size).toBe(5000);
	});

	it("reject biased bytes (>= 252) and still fill the id", () => {
		let call = 0;
		const bytes = (n: number) => Uint8Array.from({ length: n }, (_, i) => (call++ === 0 && i % 2 === 0 ? 255 : i));
		expect(isRecordId(newRecordId(bytes))).toBe(true);
	});
});

describe("idempotent create", () => {
	it("detects PocketBase's id validation error", () => {
		expect(isIdTaken(pbError(400, { id: { code: "validation_not_unique", message: "Value must be unique." } }))).toBe(true);
		expect(isIdTaken(pbError(400, { name: { code: "validation_required" } }))).toBe(false);
		expect(isIdTaken(pbError(0))).toBe(false);
		expect(isIdTaken(new Error("x"))).toBe(false);
	});

	it("returns the existing record when the first attempt was committed", async () => {
		const server = new Map<string, { id: string; name: string }>();
		const create = async (id: string) => {
			if (server.has(id)) throw pbError(400, { id: { code: "validation_not_unique" } });
			server.set(id, { id, name: "Barbara" });
			return server.get(id)!;
		};
		const once = (id: string) => createOnce(() => create(id), async () => server.get(id)!, isIdTaken);
		// First attempt commits; the client never sees the response.
		await create("abc123abc123abc");
		// The retry with the same id succeeds without a second record.
		await expect(once("abc123abc123abc")).resolves.toEqual({ id: "abc123abc123abc", name: "Barbara" });
		expect(server.size).toBe(1);
	});

	it("still fails on other errors", async () => {
		await expect(createOnce(async () => Promise.reject(pbError(400, { name: {} })), async () => "x", isIdTaken)).rejects.toBeInstanceOf(ClientResponseError);
	});
});

describe("reconciling a committed earlier attempt", () => {
	const taken = () => Object.assign(new Error("taken"), { status: 400, response: { code: 400, message: "", data: { id: { code: "validation_not_unique" } } } });

	it("updates the existing record when the user edited fields between attempts", async () => {
		const server = { id: "x", name: "Barbra", birthDate: "1950-02-04 00:00:00.000Z" };
		const patches: Record<string, unknown>[] = [];
		const desired = { name: "Barbara", birthDate: "1950-02-04" };
		const saved = await createOnce(
			async () => Promise.reject(taken()),
			async () => server,
			isIdTaken,
			async (existing) => {
				const diff = changedFields(existing, desired);
				if (!diff.length) return existing;
				patches.push(desired);
				return { ...existing, ...desired };
			},
		);
		expect(patches).toEqual([desired]);
		expect(saved.name).toBe("Barbara");
	});

	it("does not update when nothing changed (dates compared by day)", () => {
		expect(changedFields({ name: "A", birthDate: "1950-02-04 00:00:00.000Z", deathDate: "" }, { name: "A", birthDate: "1950-02-04", deathDate: "" })).toEqual([]);
		expect(changedFields({ name: "A", deathDate: undefined }, { name: "A", deathDate: "" })).toEqual([]);
		expect(changedFields({ name: "A", gender: "male" }, { name: "A", gender: "female" })).toEqual(["gender"]);
		expect(changedFields({ deathDate: "" }, { deathDate: "2001-11-11" })).toEqual(["deathDate"]);
	});
});
