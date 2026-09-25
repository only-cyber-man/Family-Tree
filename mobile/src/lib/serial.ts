/**
 * Runs async jobs one at a time where only the most recent request matters.
 * Each job gets `isLatest()`; a job that is superseded while it runs should
 * stop, and jobs superseded before they start are skipped entirely. Used for
 * reminder scheduling, where two overlapping runs (tree A, then tree B) would
 * otherwise interleave and leave tree A's reminders scheduled.
 */
export function createLatestRunner() {
	let token = 0;
	let chain: Promise<unknown> = Promise.resolve();
	return function run<T>(job: (isLatest: () => boolean) => Promise<T>, skipped: T): Promise<T> {
		const mine = ++token;
		const isLatest = () => mine === token;
		const result = chain.then(() => (isLatest() ? job(isLatest) : skipped));
		chain = result.catch(() => undefined);
		return result;
	};
}
