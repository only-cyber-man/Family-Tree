import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { breakpoint, contentWidth, navMode, sidePanelWidth, type Breakpoint, type NavMode } from "../lib/responsive";
import { TAB_BAR_HEIGHT } from "../theme/theme";

export interface Layout {
	bp: Breakpoint;
	isTablet: boolean;
	isWide: boolean;
	nav: NavMode;
	width: number;
	height: number;
	/** Width left for screens (window minus the rail on tablets). */
	content: number;
	panel: number;
	/** Space the bottom tab bar takes (0 with the rail). */
	bottomBar: number;
}

/** Breakpoint-aware layout; re-renders on rotation and split-screen changes. */
export function useLayout(): Layout {
	const { width, height } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const bp = breakpoint(width);
	const nav = navMode(bp);
	return {
		bp,
		isTablet: bp !== "phone",
		isWide: bp === "wide",
		nav,
		width,
		height,
		content: contentWidth(width, bp),
		panel: sidePanelWidth(width),
		bottomBar: nav === "tabs" ? TAB_BAR_HEIGHT + insets.bottom : 0,
	};
}
