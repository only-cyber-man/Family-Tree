import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLayout } from "../hooks/useLayout";
import { sideBySideHero } from "../lib/responsive";
import { useTheme } from "../theme/useTheme";
import { GraphIllustration } from "./Illustrations";

/**
 * Sign in / sign up on tablets: in roomy landscape the brand illustration sits
 * beside the form; otherwise the form alone (callers cap its width).
 */
export function AuthFrame({ children }: { children: ReactNode }) {
	const t = useTheme();
	const insets = useSafeAreaInsets();
	const layout = useLayout();
	if (!sideBySideHero(layout.width, layout.height)) return <>{children}</>;
	return (
		<View style={{ flex: 1, flexDirection: "row", backgroundColor: t.c.bg }}>
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: t.c.surface2, paddingLeft: insets.left }}>
				<GraphIllustration width={Math.min(420, layout.width * 0.32)} />
			</View>
			<View style={{ flex: 1 }}>{children}</View>
		</View>
	);
}
