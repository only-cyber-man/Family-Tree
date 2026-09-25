import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { Text } from "../../src/components/Text";
import { TextField } from "../../src/components/TextField";
import { errorMessage } from "../../src/lib/errors";
import { WEB_ORIGIN } from "../../src/lib/ics";
import * as WebBrowser from "expo-web-browser";
import { haptics } from "../../src/services/haptics";
import { useSession } from "../../src/store/session";
import { useTheme } from "../../src/theme/useTheme";
import { useT } from "../../src/i18n";
import { QuickPrefs } from "../../src/components/Preferences";
import { AuthFrame } from "../../src/components/AuthFrame";
import { useLayout } from "../../src/hooks/useLayout";
import { FORM_MAX } from "../../src/lib/responsive";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Same fields as the web RegisterForm, split into two steps. */
export default function SignUp() {
	const t = useTheme();
	const T = useT();
	const layout = useLayout();
	// Tablets: a centred form, never edge to edge.
	const formCap = layout.isTablet ? ({ width: "100%", maxWidth: FORM_MAX, alignSelf: "center" } as const) : null;
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const signUp = useSession((s) => s.signUp);
	const [step, setStep] = useState<1 | 2>(1);
	const [form, setForm] = useState({ username: "", name: "", email: "", password: "", passwordConfirm: "" });
	const [errors, setErrors] = useState<Partial<Record<keyof typeof form | "form", string>>>({});
	const [busy, setBusy] = useState(false);
	const nameRef = useRef<TextInput>(null);
	const emailRef = useRef<TextInput>(null);
	const confirmRef = useRef<TextInput>(null);
	const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

	const next = () => {
		const e: typeof errors = {};
		if (!/^[\w][\w.-]{2,}$/.test(form.username.trim())) e.username = T.auth.usernameRule;
		if (!EMAIL.test(form.email.trim())) e.email = T.auth.emailInvalid;
		setErrors(e);
		if (!Object.keys(e).length) setStep(2);
	};

	const submit = async () => {
		const e: typeof errors = {};
		if (form.password.length < 8) e.password = T.auth.passwordRule;
		if (form.password !== form.passwordConfirm) e.passwordConfirm = T.errors.passwordsDontMatch;
		setErrors(e);
		if (Object.keys(e).length) return;
		setBusy(true);
		try {
			await signUp({ ...form, username: form.username.trim(), email: form.email.trim() });
			haptics.success();
		} catch (err) {
			haptics.error();
			setErrors({ form: errorMessage(err, T) });
		} finally {
			setBusy(false);
		}
	};

	return (
		<AuthFrame>
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.c.bg }}>
			<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.form, formCap, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
				<Pressable
					onPress={() => (step === 2 ? setStep(1) : router.canGoBack() ? router.back() : router.replace("/sign-in"))}
					hitSlop={10}
					accessibilityRole="button"
					accessibilityLabel={T.common.back}
					style={styles.back}
				>
					<ChevronLeft size={20} color={t.c.ink2} strokeWidth={2.25} />
					<Text size={16} weight={600} color={t.c.ink2}>
						{step === 2 ? T.common.back : T.common.signIn}
					</Text>
				</Pressable>
				<QuickPrefs />
				</View>
				<View style={{ gap: 6 }}>
					<Text variant="display" accessibilityRole="header">
						{T.auth.startTree}
					</Text>
					<Text variant="bodyLg" color={t.c.ink2}>
						{T.auth.freePrivate}
					</Text>
				</View>
				{step === 1 ? (
					<View style={{ gap: 12 }}>
						<TextField
							label={T.auth.username}
							value={form.username}
							onChangeText={set("username")}
							autoCapitalize="none"
							autoCorrect={false}
							autoComplete="username-new"
							textContentType="username"
							returnKeyType="next"
							onSubmitEditing={() => nameRef.current?.focus()}
							error={errors.username}
						/>
						<TextField
							ref={nameRef}
							label={T.auth.displayName}
							value={form.name}
							onChangeText={set("name")}
							placeholder={form.username || T.auth.yourName}
							autoComplete="name"
							textContentType="name"
							returnKeyType="next"
							onSubmitEditing={() => emailRef.current?.focus()}
						/>
						<TextField
							ref={emailRef}
							label={T.auth.email}
							value={form.email}
							onChangeText={set("email")}
							autoCapitalize="none"
							autoCorrect={false}
							keyboardType="email-address"
							autoComplete="email"
							textContentType="emailAddress"
							returnKeyType="next"
							onSubmitEditing={next}
							error={errors.email}
						/>
						<Text variant="caption">{T.auth.step1}</Text>
					</View>
				) : (
					<View style={{ gap: 12 }}>
						<TextField
							label={T.auth.password}
							value={form.password}
							onChangeText={set("password")}
							secret
							autoFocus
							autoComplete="new-password"
							textContentType="newPassword"
							returnKeyType="next"
							onSubmitEditing={() => confirmRef.current?.focus()}
							error={errors.password}
						/>
						<TextField
							ref={confirmRef}
							label={T.auth.confirmPassword}
							value={form.passwordConfirm}
							onChangeText={set("passwordConfirm")}
							secret
							autoComplete="new-password"
							textContentType="newPassword"
							returnKeyType="go"
							onSubmitEditing={submit}
							error={errors.passwordConfirm}
						/>
						<Text variant="caption">{T.auth.step2(form.email.trim())}</Text>
						{errors.form ? (
							<Text size={13} color={t.c.danger}>
								{errors.form}
							</Text>
						) : null}
					</View>
				)}
				<View style={{ flex: 1, minHeight: 16 }} />
				<Text size={13} color={t.c.ink3} center style={{ lineHeight: 19 }}>
					{T.auth.agreePrefix}
					<Text
						size={13}
						weight={700}
						color={t.c.accent}
						accessibilityRole="link"
						onPress={() => WebBrowser.openBrowserAsync(`${WEB_ORIGIN}/privacy`)}
					>
						{T.auth.privacyPolicy}
					</Text>
					{T.auth.agreeSuffix}
				</Text>
				{step === 1 ? <Button label={T.common.continue} onPress={next} /> : <Button label={T.auth.createAccountButton} loadingLabel={T.common.creating} loading={busy} onPress={submit} />}
			</ScrollView>
		</KeyboardAvoidingView>
		</AuthFrame>
	);
}

const styles = StyleSheet.create({
	form: { flexGrow: 1, paddingHorizontal: 24, gap: 20 },
	back: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", minHeight: 44 },
});
