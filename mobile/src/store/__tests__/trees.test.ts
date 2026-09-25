jest.mock("@react-native-async-storage/async-storage", () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"));
jest.mock("../../lib/errors", () => ({ errorMessage: (e: Error) => e.message, isNetworkError: () => false }));
jest.mock("../../lib/pb", () => ({ pb: { authStore: { isValid: true } } }));
jest.mock("../session", () => ({ useSession: { getState: () => ({ user: { id: "u1" } }) } }));
jest.mock("../../lib/api", () => ({
	createTree: jest.fn(async (name: string, creator: string, id: string) => ({ id, name, creator, invited: [], created: "", updated: "" })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useTrees } = require("../trees") as typeof import("../trees");

test("a retried create (same client id) upserts instead of adding a second card", async () => {
	await useTrees.getState().create("Kowalski", "tree00000000001");
	await useTrees.getState().create("Kowalski family", "tree00000000001");
	await useTrees.getState().create("Mum's side", "tree00000000002");
	const items = useTrees.getState().items;
	expect(items.map((i) => i.tree.id)).toEqual(["tree00000000002", "tree00000000001"]);
	expect(items[1].tree.name).toBe("Kowalski family");
});
