import { createLatestRunner } from "../serial";

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("latest-only serial runner", () => {
	it("stops a running job when a newer one is requested, then runs the newer one alone", async () => {
		const run = createLatestRunner();
		const log: string[] = [];
		const job = (name: string, steps: number) => async (isLatest: () => boolean) => {
			for (let i = 0; i < steps; i++) {
				if (!isLatest()) return `${name} stopped`;
				log.push(`${name}${i}`);
				await tick();
			}
			return `${name} done`;
		};
		const a = run(job("A", 5), "A skipped");
		await tick();
		const b = run(job("B", 2), "B skipped");
		expect(await a).toBe("A stopped");
		expect(await b).toBe("B done");
		// A never interleaves with B.
		const firstB = log.indexOf("B0");
		expect(log.slice(firstB).every((l) => l.startsWith("B"))).toBe(true);
	});

	it("skips jobs superseded before they start", async () => {
		const run = createLatestRunner();
		const started: string[] = [];
		const job = (name: string) => async () => {
			started.push(name);
			await tick();
			return name;
		};
		const a = run(job("A"), "skip");
		await tick(); // A has started
		const b = run(job("B"), "skip");
		const c = run(job("C"), "skip"); // supersedes B before it starts
		expect(await Promise.all([a, b, c])).toEqual(["A", "skip", "C"]);
		expect(started).toEqual(["A", "C"]);
	});

	it("keeps running after a job throws", async () => {
		const run = createLatestRunner();
		await expect(run(async () => Promise.reject(new Error("x")), 0)).rejects.toThrow("x");
		await expect(run(async () => 1, 0)).resolves.toBe(1);
	});
});
