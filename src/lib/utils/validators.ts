export const isUuid = (uuid: string): boolean => {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89AB][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
		uuid
	);
};

export const isPocketbaseId = (id: string): boolean => {
	return /^[0-9a-z]{15}$/i.test(id);
};
