import { Redirect } from "expo-router";

/** Placeholder: the tab bar opens /add-person as a sheet instead. */
export default function AddTab() {
	return <Redirect href="/add-person" />;
}
