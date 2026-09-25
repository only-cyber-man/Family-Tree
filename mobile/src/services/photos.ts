import * as ImagePicker from "expo-image-picker";
import type { PhotoInput } from "../lib/api";

export type PickResult =
	| { status: "ok"; photo: PhotoInput }
	| { status: "cancelled" }
	| { status: "denied"; canAskAgain: boolean };

const options: ImagePicker.ImagePickerOptions = {
	mediaTypes: ["images"],
	allowsEditing: true,
	aspect: [1, 1],
	quality: 0.8,
};

function toPhoto(res: ImagePicker.ImagePickerResult): PickResult {
	if (res.canceled || !res.assets?.[0]) return { status: "cancelled" };
	const a = res.assets[0];
	return { status: "ok", photo: { uri: a.uri, mimeType: a.mimeType ?? "image/jpeg", fileName: a.fileName ?? undefined } };
}

export async function takePhoto(): Promise<PickResult> {
	const perm = await ImagePicker.requestCameraPermissionsAsync();
	if (!perm.granted) return { status: "denied", canAskAgain: perm.canAskAgain };
	return toPhoto(await ImagePicker.launchCameraAsync(options));
}

export async function pickPhoto(): Promise<PickResult> {
	// The system photo picker needs no permission on iOS 14+ / Android 13+.
	return toPhoto(await ImagePicker.launchImageLibraryAsync(options));
}

