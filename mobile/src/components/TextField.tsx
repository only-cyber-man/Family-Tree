import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { forwardRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { fonts } from "../theme/theme";
import { useTheme } from "../theme/useTheme";
import { Text } from "./Text";

export interface TextFieldProps extends TextInputProps {
	label?: string;
	hint?: ReactNode;
	error?: string | null;
	leading?: ReactNode;
	trailing?: ReactNode;
	/** Password field with a Show / Hide toggle. */
	secret?: boolean;
	/** Use inside @gorhom/bottom-sheet so the keyboard is handled. */
	inSheet?: boolean;
	/** Search style: 26 pt radius. */
	round?: boolean;
	containerStyle?: StyleProp<ViewStyle>;
	/** Field background; defaults to surface (bg inside sheets). */
	tone?: "surface" | "bg";
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
	{ label, hint, error, leading, trailing, secret, inSheet, round, containerStyle, tone, editable = true, onFocus, onBlur, style, ...rest },
	ref,
) {
	const t = useTheme();
	const [focused, setFocused] = useState(false);
	const [shown, setShown] = useState(false);
	const Input = (inSheet ? BottomSheetTextInput : TextInput) as typeof TextInput;
	const borderColor = error ? t.c.danger : focused ? t.c.accent : t.c.border;
	const bg = !editable ? t.c.surface2 : (tone ?? (inSheet ? "bg" : "surface")) === "bg" ? t.c.bg : t.c.surface;
	return (
		<View style={[{ gap: 6 }, containerStyle]}>
			{label ? <Text variant="label">{label}</Text> : null}
			<View style={[styles.glow, { borderColor: focused && !error ? t.c.focusGlow : "transparent", borderRadius: (round ? 26 : 12) + 3 }]}>
				<View
					style={[
						styles.box,
						{ borderColor, borderWidth: focused || error ? 1.5 : 1, backgroundColor: bg, borderRadius: round ? 26 : 12, paddingHorizontal: focused || error ? 15.5 : 16 },
					]}
				>
					{leading}
					<Input
						ref={ref}
						editable={editable}
						placeholderTextColor={t.c.placeholder}
						secureTextEntry={secret && !shown}
						maxFontSizeMultiplier={1.35}
						// The visible label names the field for screen readers.
						accessibilityLabel={rest.accessibilityLabel ?? label ?? rest.placeholder}
						onFocus={(e) => {
							setFocused(true);
							onFocus?.(e);
						}}
						onBlur={(e) => {
							setFocused(false);
							onBlur?.(e);
						}}
						style={[styles.input, { color: editable ? t.c.ink : t.c.ink3, fontFamily: fonts.body[400] }, style]}
						{...rest}
					/>
					{secret ? (
						<Pressable onPress={() => setShown((v) => !v)} hitSlop={10} accessibilityRole="button" accessibilityLabel={shown ? "Hide password" : "Show password"}>
							<Text size={13} weight={600} color={t.c.ink3}>
								{shown ? "Hide" : "Show"}
							</Text>
						</Pressable>
					) : null}
					{trailing}
				</View>
			</View>
			{error ? (
				<Text size={13} color={t.c.danger}>
					{error}
				</Text>
			) : hint ? (
				typeof hint === "string" ? <Text variant="small">{hint}</Text> : hint
			) : null}
		</View>
	);
});

const styles = StyleSheet.create({
	glow: { borderWidth: 3, margin: -3 },
	box: { height: 50, flexDirection: "row", alignItems: "center", gap: 10 },
	input: { flex: 1, fontSize: 16, height: "100%", paddingVertical: 0 },
});
