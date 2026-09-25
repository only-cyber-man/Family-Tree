import type { FullTree, NodeRecord } from "../../lib/types";

jest.mock("@react-native-async-storage/async-storage", () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"));
jest.mock("../../lib/errors", () => ({
	errorMessage: (e: Error) => e.message,
	isNetworkError: () => false,
	isNotFound: () => false,
}));
jest.mock("../session", () => ({ useSession: { getState: () => ({ user: { id: "u1" } }) } }));
jest.mock("../trees", () => ({ useTrees: { getState: () => ({ patchTree: () => undefined }) } }));
jest.mock("../../lib/api", () => ({
	fetchFullTree: jest.fn(),
	createNode: jest.fn(),
	deleteNode: jest.fn(),
	listNodeRelationships: jest.fn(async () => []),
	deleteRelationship: jest.fn(async () => undefined),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const api = require("../../lib/api") as Record<string, jest.Mock>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useTree, MAX_RELOADS_AFTER_WRITE } = require("../tree") as typeof import("../tree");

const base = { created: "", updated: "" };
const node = (id: string): NodeRecord => ({ ...base, id, name: id, gender: "male", birthDate: "1980-01-01", tree: "t1" });
const tree = (nodes: NodeRecord[]): FullTree => ({
	tree: { ...base, id: "t1", name: "T", creator: "u1", invited: [] },
	nodes,
	relationships: [],
	relationshipNames: [],
	fetchedAt: 0,
});

function deferred<T>() {
	let resolve!: (v: T) => void;
	const promise = new Promise<T>((r) => (resolve = r));
	return { promise, resolve };
}

const input = { name: "new", gender: "male" as const, birthDate: { year: 1990, month: 1, day: 1 }, deathDate: null };
const ids = { nodeId: "new", linkId: "l" };

beforeEach(async () => {
	jest.clearAllMocks();
	useTree.getState().clear();
	api.fetchFullTree.mockResolvedValueOnce(tree([node("a")]));
	await useTree.getState().load("t1");
});

test("a reload that started before a write finished does not undo the write", async () => {
	const stale = deferred<FullTree>();
	api.fetchFullTree.mockReturnValueOnce(stale.promise).mockResolvedValueOnce(tree([node("a"), node("new")]));
	api.createNode.mockResolvedValueOnce(node("new"));

	const reload = useTree.getState().load("t1", { silent: true }); // request goes out
	await useTree.getState().addNode("t1", input, ids); // write completes meanwhile
	stale.resolve(tree([node("a")])); // server answer from before the write
	await reload;

	expect(useTree.getState().full!.nodes.map((n) => n.id).sort()).toEqual(["a", "new"]);
	expect(api.fetchFullTree).toHaveBeenCalledTimes(3); // initial + stale + re-run
});

test("a deleted person does not come back from a stale reload", async () => {
	const stale = deferred<FullTree>();
	api.fetchFullTree.mockReturnValueOnce(stale.promise).mockResolvedValueOnce(tree([]));
	api.deleteNode.mockResolvedValueOnce(undefined);

	const reload = useTree.getState().load("t1", { silent: true });
	await useTree.getState().removeNode("a", "t1");
	stale.resolve(tree([node("a")]));
	await reload;

	expect(useTree.getState().full!.nodes).toEqual([]);
});

test("re-runs are capped and keep the local copy", async () => {
	api.createNode.mockResolvedValue(node("new"));
	// Every reload races a write.
	api.fetchFullTree.mockImplementation(async () => {
		await useTree.getState().addNode("t1", input, ids);
		return tree([node("a")]);
	});
	await useTree.getState().load("t1", { silent: true });
	expect(api.fetchFullTree).toHaveBeenCalledTimes(1 + 1 + MAX_RELOADS_AFTER_WRITE);
	expect(useTree.getState().full!.nodes.map((n) => n.id).sort()).toEqual(["a", "new"]);
});
