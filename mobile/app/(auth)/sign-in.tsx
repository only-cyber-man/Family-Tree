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
import { useT } from "../../src/i18n";
import { en } from "../../src/i18n/en";
import { QuickPrefs } from "../../src/components/Preferences";
import { AuthFrame } from "../../src/components/AuthFrame";
import { useLayout } from "../../src/hooks/useLayout";
import { FORM_MAX } from "../../src/lib/responsive";

export default function SignIn() {
	const t = useTheme();
	const T = useT();
	const layout = useLayout();
	// Tablets: a centred form, never edge to edge.
	const formCap = layout.isTablet ? ({ width: "100%", maxWidth: FORM_MAX, alignSelf: "center" } as const) : null;
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
		if (!who.trim() || !password) return setError(T.auth.enterBoth);
		setBusy(true);
		setError(null);
		try {
			await signIn(who, password);
			haptics.success();
		} catch (e) {
			haptics.error();
			setError(errorMessage(e, T).includes("authenticate") || errorMessage(e, en).includes("authenticate") ? T.auth.wrongCredentials : errorMessage(e, T));
		} finally {
			setBusy(false);
		}
	};

	const forgot = () => {
		const email = login.includes("@") ? login.trim() : "";
		if (!email) {
			Alert.alert(T.auth.forgot, T.auth.forgotHowTo);
			return;
		}
		Alert.alert(T.auth.resetTitle, T.auth.resetConfirm(email), [
			{ text: T.common.cancel, style: "cancel" },
			{
				text: T.auth.send,
				onPress: async () => {
					try {
						await requestPasswordReset(email);
						Alert.alert(T.auth.checkInbox, T.auth.checkInboxBody);
					} catch (e) {
						Alert.alert(T.auth.couldntSend, errorMessage(e, T));
					}
				},
			},
		]);
	};

	if (reauth) {
		return (
			<AuthFrame>
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[styles.fill, { backgroundColor: t.c.bg }]}>
				<View style={[styles.center, formCap, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
					<View style={{ position: "absolute", top: insets.top + 8, right: 24 }}>
						<QuickPrefs />
					</View>
					<View style={[styles.lock, { backgroundColor: t.c.surface2 }]}>
						<Lock size={28} color={t.c.ink2} strokeWidth={1.75} />
					</View>
					<View style={{ gap: 8 }}>
						<Text variant="title" center accessibilityRole="header">
							{T.auth.signInAgain}
						</Text>
						<Text variant="body" color={t.c.ink2} center>
							{T.auth.sessionEnded}
						</Text>
					</View>
					<View style={{ alignSelf: "stretch", gap: 12, paddingTop: 8 }}>
						<TextField
							value={password}
							onChangeText={setPassword}
							placeholder={T.auth.passwordFor(lastLogin ?? "")}
							secret
							autoFocus
							textContentType="password"
							autoComplete="current-password"
							returnKeyType="go"
							onSubmitEditing={submit}
							error={error}
						/>
						<Button label={T.common.signIn} loading={busy} onPress={submit} />
						<Button
							kind="ghost"
							label={T.auth.differentAccount}
							style={{ borderWidth: 0 }}
							onPress={() => forgetExpired()}
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</AuthFrame>
		);
	}

	return (
		<AuthFrame>
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[styles.fill, { backgroundColor: t.c.bg }]}>
			<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.form, formCap, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
				<View style={[styles.brand, { justifyContent: "space-between" }]}>
					<View style={styles.brand}>
						<Mark size={32} />
						<Text serif size={22} weight={600}>
							{T.common.familyTree}
						</Text>
					</View>
					<QuickPrefs />
				</View>
				<View style={{ gap: 6 }}>
					<Text variant="display" accessibilityRole="header">
						{T.auth.welcomeBack}
					</Text>
					<Text variant="bodyLg" color={t.c.ink2}>
						{T.auth.signInSubtitle}
					</Text>
				</View>
				<View style={{ gap: 14 }}>
					<TextField
						label={T.auth.usernameOrEmail}
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
						label={T.auth.password}
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
							{T.auth.forgot}
						</Text>
					</Pressable>
				</View>
				<View style={{ flex: 1, minHeight: 24 }} />
				<View style={{ gap: 10 }}>
					<Button label={T.common.signIn} loading={busy} onPress={submit} />
					<Pressable onPress={() => router.push("/sign-up")} style={{ padding: 8 }} accessibilityRole="button">
						<Text size={14} color={t.c.ink2} center>
							{T.auth.newHere}{" "}
							<Text size={14} weight={700} color={t.c.accent}>
								{T.auth.createAccount}
							</Text>
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
		</AuthFrame>
	);
}

const styles = StyleSheet.create({
	fill: { flex: 1 },
	form: { flexGrow: 1, paddingHorizontal: 24, gap: 24 },
	brand: { flexDirection: "row", alignItems: "center", gap: 10 },
	center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 20 },
	lock: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
