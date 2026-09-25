import { useRouter } from "expo-router";
import { View } from "react-native";
import { Button } from "../src/components/Button";
import { EmptyTreeIllustration } from "../src/components/Illustrations";
import { Text } from "../src/components/Text";
import { useTheme } from "../src/theme/useTheme";

export default function NotFound() {
	const t = useTheme();
	const router = useRouter();
	return (
		<View style={{ flex: 1, backgroundColor: t.c.bg, alignItems: "center", justifyContent: "center", padding: 32, gap: 20 }}>
			<EmptyTreeIllustration />
			<Text variant="title" center>
				Nothing here
			</Text>
			<Text variant="body" color={t.c.ink2} center>
				That link points to a page the app does not have.
			</Text>
			<Button label="Go home" onPress={() => router.replace("/")} />
		</View>
	);
}
