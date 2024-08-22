import PocketBase from "pocketbase";

export const pb = new PocketBase("https://pocketbase.cyber-man.pl");

export const getPocketbaseError = ({
	url,
	message,
	response,
}: {
	url?: string;
	message?: string;
	response: {
		code: number;
		message: string;
		data: Record<
			string,
			{
				code: string;
				message: string;
			}
		>;
	};
}) => {
	if (!url) {
		return message ?? "Unknown error";
	}
	let error = response.message + "\n";
	Object.keys(response.data).forEach((key) => {
		error += `\n${key}: ${response.data[key].message}`;
	});
	return error;
};
