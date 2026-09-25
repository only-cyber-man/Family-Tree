// Account epoch. Bumped whenever the device's account data is wiped (sign-out,
// account switch). Async work captures the epoch before awaiting and checks it
// before every state write or persist, so work that started for account A can
// never write A's data after B signs in.

let epoch = 0;

export function currentEpoch(): number {
	return epoch;
}

export function bumpEpoch(): number {
	return ++epoch;
}

/** Returns a checker that is true while the account epoch is unchanged. */
export function epochGuard(): () => boolean {
	const start = epoch;
	return () => epoch === start;
}
