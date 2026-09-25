import { useRouter } from "expo-router";
import { Lock } from "lucide-react-native";
import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { Mark } from "../../src/components/Illustrations";
import { Text } from "../../src/components/Text";
import { TextField } from "../../src/components/TextField";
import { requestPasswordReset } from "../../src/lib/api";
import { errorMessage } from "../../src/lib/errors";
import { haptics } from "../../src/services/haptics";
import { useSession } from "../../src/store/session";
import { useSettings } from "../../src/store/settings";
import { useTheme } from "../../src/theme/useTheme";

export default function SignIn() {
	const t = useTheme();
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const expired = useSession((s) => s.expired);
	const lastLogin = useSettings((s) => s.lastLogin);
	const signIn = useSession((s) => s.signIn);
	const forgetExpired = useSession((s) => s.forgetExpired);
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const passwordRef = useRef<TextInput>(null);
	const reauth = expired && !!lastLogin;

	const submit = async () => {
		const who = reauth ? lastLogin! : login;
		if (!who.trim() || !password) return setError("Enter your username or email and your password.");
		setBusy(true);
		setError(null);
		try {
			await signIn(who, password);
			haptics.success();
		} catch (e) {
			haptics.error();
			setError(errorMessage(e).includes("authenticate") ? "That username or password is not right." : errorMessage(e));
		} finally {
			setBusy(false);
		}
	};

	const forgot = () => {
		const email = login.includes("@") ? login.trim() : "";
		if (!email) {
			Alert.alert("Forgot password?", "Type your email address in the first field, then tap “Forgot password?” again.");
			return;
		}
		Alert.alert("Reset password", `Send a reset link to ${email}?`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Send",
				onPress: async () => {
					try {
						await requestPasswordReset(email);
						Alert.alert("Check your inbox", "If that email has an account, a reset link is on its way.");
					} catch (e) {
						Alert.alert("Couldn't send", errorMessage(e));
					}
				},
			},
		]);
	};

	if (reauth) {
		return (
			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[styles.fill, { backgroundColor: t.c.bg }]}>
				<View style={[styles.center, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
					<View style={[styles.lock, { backgroundColor: t.c.surface2 }]}>
						<Lock size={28} color={t.c.ink2} strokeWidth={1.75} />
					</View>
					<View style={{ gap: 8 }}>
						<Text variant="title" center accessibilityRole="header">
							Please sign in again
						</Text>
						<Text variant="body" color={t.c.ink2} center>
							Your session ended. Nothing was lost; the tree is still here.
						</Text>
					</View>
					<View style={{ alignSelf: "stretch", gap: 12, paddingTop: 8 }}>
						<TextField
							value={password}
							onChangeText={setPassword}
							placeholder={`Password for ${lastLogin}`}
							secret
							autoFocus
							textContentType="password"
							autoComplete="current-password"
							returnKeyType="go"
							onSubmitEditing={submit}
							error={error}
						/>
						<Button label="Sign in" loading={busy} onPress={submit} />
						<Button
							kind="ghost"
							label="Use a different account"
							style={{ borderWidth: 0 }}
							onPress={() => forgetExpired()}
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		);
	}

	return (
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[styles.fill, { backgroundColor: t.c.bg }]}>
			<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.form, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
				<View style={styles.brand}>
					<Mark size={32} />
					<Text serif size={22} weight={600}>
						Family Tree
					</Text>
				</View>
				<View style={{ gap: 6 }}>
					<Text variant="display" accessibilityRole="header">
						Welcome back
					</Text>
					<Text variant="bodyLg" color={t.c.ink2}>
						Sign in with your Family Tree account.
					</Text>
				</View>
				<View style={{ gap: 14 }}>
					<TextField
						label="Username or email"
						value={login}
						onChangeText={setLogin}
						autoCapitalize="none"
						autoCorrect={false}
						autoComplete="username"
						textContentType="username"
						returnKeyType="next"
						onSubmitEditing={() => passwordRef.current?.focus()}
					/>
					<TextField
						ref={passwordRef}
						label="Password"
						value={password}
						onChangeText={setPassword}
						secret
						autoComplete="current-password"
						textContentType="password"
						returnKeyType="go"
						onSubmitEditing={submit}
						error={error}
					/>
					<Pressable onPress={forgot} hitSlop={10} style={{ alignSelf: "flex-end" }} accessibilityRole="button">
						<Text size={14} weight={600} color={t.c.accent}>
							Forgot password?
						</Text>
					</Pressable>
				</View>
				<View style={{ flex: 1, minHeight: 24 }} />
				<View style={{ gap: 10 }}>
					<Button label="Sign in" loading={busy} onPress={submit} />
					<Pressable onPress={() => router.push("/sign-up")} style={{ padding: 8 }} accessibilityRole="button">
						<Text size={14} color={t.c.ink2} center>
							New here?{" "}
							<Text size={14} weight={700} color={t.c.accent}>
								Create an account
							</Text>
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	fill: { flex: 1 },
	form: { flexGrow: 1, paddingHorizontal: 24, gap: 24 },
	brand: { flexDirection: "row", alignItems: "center", gap: 10 },
	center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 20 },
	lock: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
