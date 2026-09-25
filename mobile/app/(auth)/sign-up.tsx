import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { Text } from "../../src/components/Text";
import { TextField } from "../../src/components/TextField";
import { errorMessage } from "../../src/lib/errors";
import { haptics } from "../../src/services/haptics";
import { useSession } from "../../src/store/session";
import { useTheme } from "../../src/theme/useTheme";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Same fields as the web RegisterForm, split into two steps. */
export default function SignUp() {
	const t = useTheme();
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
		if (!/^[\w][\w.-]{2,}$/.test(form.username.trim())) e.username = "At least 3 letters or digits, no spaces.";
		if (!EMAIL.test(form.email.trim())) e.email = "That doesn't look like an email address.";
		setErrors(e);
		if (!Object.keys(e).length) setStep(2);
	};

	const submit = async () => {
		const e: typeof errors = {};
		if (form.password.length < 8) e.password = "Use at least 8 characters.";
		if (form.password !== form.passwordConfirm) e.passwordConfirm = "Passwords do not match.";
		setErrors(e);
		if (Object.keys(e).length) return;
		setBusy(true);
		try {
			await signUp({ ...form, username: form.username.trim(), email: form.email.trim() });
			haptics.success();
		} catch (err) {
			haptics.error();
			setErrors({ form: errorMessage(err) });
		} finally {
			setBusy(false);
		}
	};

	return (
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.c.bg }}>
			<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.form, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
				<Pressable
					onPress={() => (step === 2 ? setStep(1) : router.canGoBack() ? router.back() : router.replace("/sign-in"))}
					hitSlop={10}
					accessibilityRole="button"
					accessibilityLabel="Back"
					style={styles.back}
				>
					<ChevronLeft size={20} color={t.c.ink2} strokeWidth={2.25} />
					<Text size={16} weight={600} color={t.c.ink2}>
						{step === 2 ? "Back" : "Sign in"}
					</Text>
				</Pressable>
				<View style={{ gap: 6 }}>
					<Text variant="display" accessibilityRole="header">
						Start your tree
					</Text>
					<Text variant="bodyLg" color={t.c.ink2}>
						Free, private, no ads.
					</Text>
				</View>
				{step === 1 ? (
					<View style={{ gap: 12 }}>
						<TextField
							label="Username"
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
							label="Display name (optional)"
							value={form.name}
							onChangeText={set("name")}
							placeholder={form.username || "Your name"}
							autoComplete="name"
							textContentType="name"
							returnKeyType="next"
							onSubmitEditing={() => emailRef.current?.focus()}
						/>
						<TextField
							ref={emailRef}
							label="Email"
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
						<Text variant="caption">Password and confirmation come next. Step 1 of 2.</Text>
					</View>
				) : (
					<View style={{ gap: 12 }}>
						<TextField
							label="Password"
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
							label="Confirm password"
							value={form.passwordConfirm}
							onChangeText={set("passwordConfirm")}
							secret
							autoComplete="new-password"
							textContentType="newPassword"
							returnKeyType="go"
							onSubmitEditing={submit}
							error={errors.passwordConfirm}
						/>
						<Text variant="caption">We send a verification email to {form.email.trim()}. Step 2 of 2.</Text>
						{errors.form ? (
							<Text size={13} color={t.c.danger}>
								{errors.form}
							</Text>
						) : null}
					</View>
				)}
				<View style={{ flex: 1, minHeight: 16 }} />
				{step === 1 ? <Button label="Continue" onPress={next} /> : <Button label="Create account" loadingLabel="Creating…" loading={busy} onPress={submit} />}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	form: { flexGrow: 1, paddingHorizontal: 24, gap: 20 },
	back: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", minHeight: 44 },
});
