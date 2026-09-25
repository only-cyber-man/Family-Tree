import { useRouter } from "expo-router";
import { ChevronLeft, Mail } from "lucide-react-native";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Button } from "../src/components/Button";
import { OfflineWriteHint } from "../src/components/Feedback";
import { Screen } from "../src/components/Screen";
import { Text } from "../src/components/Text";
import { TextField } from "../src/components/TextField";
import { useCanWrite } from "../src/hooks/useTreeData";
import { deletionRequestMailto, SUPPORT_EMAIL } from "../src/lib/account";
import { errorMessage } from "../src/lib/errors";
import { haptics } from "../src/services/haptics";
import { useSession } from "../src/store/session";
import { useTheme } from "../src/theme/useTheme";
import { useT } from "../src/i18n";
import { FORM_MAX } from "../src/lib/responsive";

const CONFIRM_WORD = "DELETE";

/**
 * Account deletion (required by Google Play and the App Store). Mirrors the
 * web: every tree the account created with its people, photos and
 * relationships, then the account itself. Online only; typing DELETE is the
 * second, explicit confirmation.
 */
export default function DeleteAccount() {
	const t = useTheme();
	const T = useT();
	const router = useRouter();
	const user = useSession((s) => s.user);
	const deleteAccount = useSession((s) => s.deleteAccount);
	const canWrite = useCanWrite();
	const [typed, setTyped] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const confirmed = typed.trim() === CONFIRM_WORD;

	const submit = async () => {
		if (!confirmed) return setError(T.deleteAccount.typeToConfirmError(CONFIRM_WORD));
		if (!canWrite) return setError(T.deleteAccount.offline);
		setBusy(true);
		setError(null);
		try {
			await deleteAccount();
			haptics.success();
			// Signed out: the auth gate takes over navigation.
		} catch (e) {
			haptics.error();
			setError(errorMessage(e, T));
		} finally {
			setBusy(false);
		}
	};

	return (
		<Screen maxWidth={FORM_MAX} contentStyle={{ gap: 18 }}>
			<Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel={T.common.back}>
				<ChevronLeft size={20} color={t.c.ink2} strokeWidth={2.25} />
				<Text size={16} weight={600} color={t.c.ink2}>
					{T.common.settings}
				</Text>
			</Pressable>
			<Text variant="display" size={28} accessibilityRole="header">
				{T.deleteAccount.title}
			</Text>
			<View style={[styles.box, { backgroundColor: t.c.dangerSoft }]}>
				<Text size={15} weight={700}>
					{T.deleteAccount.permanently}
				</Text>
				<Text size={15} style={{ lineHeight: 22 }}>
					{T.deleteAccount.yourAccount(user?.email)}
					{"\n"}
					{T.deleteAccount.everyTree}
				</Text>
				<Text size={15} style={{ lineHeight: 22 }}>
					{T.deleteAccount.consequences}
				</Text>
			</View>
			<OfflineWriteHint />
			<TextField
				label={T.deleteAccount.typeToConfirm(CONFIRM_WORD)}
				value={typed}
				onChangeText={(v) => {
					setTyped(v);
					setError(null);
				}}
				autoCapitalize="characters"
				autoCorrect={false}
				placeholder={CONFIRM_WORD}
				returnKeyType="done"
				onSubmitEditing={submit}
			/>
			{error ? (
				<View accessibilityRole="alert" style={[styles.box, { backgroundColor: t.c.surface2 }]}>
					<Text size={14} color={t.c.danger} style={{ lineHeight: 20 }}>
						{T.deleteAccount.notFully(error)}
					</Text>
					<Text size={13} color={t.c.ink2} style={{ lineHeight: 19 }}>
						{T.deleteAccount.askUs(SUPPORT_EMAIL)}
					</Text>
					<Button
						kind="secondary"
						size="sm"
						icon={<Mail size={16} color={t.c.ink} strokeWidth={2} />}
						label={T.deleteAccount.emailRequest}
						onPress={() => Linking.openURL(deletionRequestMailto(user?.email, T))}
					/>
				</View>
			) : null}
			<Button kind="danger" label={T.deleteAccount.deleteMine} loadingLabel={T.deleteAccount.deleting} loading={busy} disabled={!confirmed || !canWrite} onPress={submit} />
			<Button kind="text" label={T.deleteAccount.keep} style={{ alignSelf: "center" }} onPress={() => router.back()} />
		</Screen>
	);
}

const styles = StyleSheet.create({
	back: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 },
	box: { padding: 16, borderRadius: 12, gap: 10 },
});
