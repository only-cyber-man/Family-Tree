import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { useSettings } from "../store/settings";
import { themes, type Theme } from "./theme";

const ThemeContext = createContext<Theme>(themes.light);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const system = useColorScheme();
	const pref = useSettings((s) => s.theme);
	const scheme = pref === "system" ? (system === "dark" ? "dark" : "light") : pref;
	const theme = useMemo(() => themes[scheme], [scheme]);
	return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
	return useContext(ThemeContext);
}
