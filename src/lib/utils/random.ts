export const shuffle = <T>(
	array: T[],
	random: () => number = Math.random
): T[] => {
	return array.sort(() => random() - 0.5);
};
