import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "../src/components/Avatar";
import { Button } from "../src/components/Button";
import { Badge } from "../src/components/Chip";
import { Notice, OfflineWriteHint, Skeleton } from "../src/components/Feedback";
import { Card, Row } from "../src/components/List";
import { Screen } from "../src/components/Screen";
import { Text } from "../src/components/Text";
import { TextField } from "../src/components/TextField";
import { useCanWrite, useIsOwner } from "../src/hooks/useTreeData";
import { findUserIdByEmail, getUserEmail } from "../src/lib/api";
import { errorMessage, isNotFound } from "../src/lib/errors";
import { haptics } from "../src/services/haptics";
import { useSession } from "../src/store/session";
import { toast } from "../src/store/toast";
import { useTree } from "../src/store/tree";
import { useTrees } from "../src/store/trees";
import { useTheme } from "../src/theme/useTheme";
import { useT } from "../src/i18n";
import { FORM_MAX } from "../src/lib/responsive";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Who can see this tree. Invites resolve an email through
 * ft_gettable_users_email, so invitees must already have an account; no
 * invitation is sent. Viewers see the same list without edit controls.
 */
export default function Invited() {
	const t = useTheme();
	const T = useT();
	const router = useRouter();
	const full = useTree((s) => s.full);
	const addInvited = useTree((s) => s.addInvited);
	const removeInvited = useTree((s) => s.removeInvited);
	const user = useSession((s) => s.user);
	const owner = useIsOwner();
	const canWrite = useCanWrite();
	const ownerEmail = useTrees((s) => s.items.find((i) => i.tree.id === full?.tree.id)?.ownerEmail);
	const [emails, setEmails] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(true);
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	/** Any invite / revoke / undo in flight: every such control is disabled. */
	const [writing, setWriting] = useState(false);
	const invited = full?.tree.invited ?? [];

	useEffect(() => {
		let alive = true;
		const missing = invited.filter((id) => !emails[id]);
		if (!missing.length) return setLoading(false);
		setLoading(true);
		Promise.all(missing.map(async (id) => [id, await getUserEmail(id).catch(() => "")] as const)).then((pairs) => {
			if (!alive) return;
			setEmails((e) => ({ ...e, ...Object.fromEntries(pairs.filter(([, v]) => v)) }));
			setLoading(false);
		});
		return () => {
			alive = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [invited.join(",")]);

	const invite = async () => {
		// Sent trimmed, exactly as typed, like the web client.
		const value = email.trim();
		const treeId = full?.tree.id;
		if (!treeId) return;
		if (!EMAIL.test(value)) return setError(T.auth.emailInvalid);
		// Also covers the keyboard's submit key, which bypasses the disabled button.
		if (!canWrite) return setError(T.offline.write);
		if (writing) return;
		setBusy(true);
		setWriting(true);
		setError(null);
		try {
			const userId = await findUserIdByEmail(value);
			if (userId === full?.tree.creator) return setError(T.invited.thatsYou);
			if (invited.includes(userId)) return setError(T.invited.already);
			// Atomic "invited+" on the server: concurrent changes cannot overwrite each other.
			await addInvited(treeId, userId);
			setEmails((e) => ({ ...e, [userId]: value }));
			setEmail("");
			haptics.success();
			toast(T.invited.canSee(value), "success");
		} catch (e) {
			haptics.error();
			setError(isNotFound(e) ? T.invited.noAccount : errorMessage(e, T));
		} finally {
			setBusy(false);
			setWriting(false);
		}
	};

	const revoke = useCallback(
		(id: string) => {
			const label = emails[id] || T.invited.thisPerson;
			// Bound to this tree: undo must not touch whichever tree is active later.
			const treeId = full?.tree.id;
			if (!treeId || writing) return;
			const run = async (op: () => Promise<unknown>) => {
				setWriting(true);
				try {
					await op();
					return true;
				} catch (e) {
					toast(errorMessage(e, T), "error");
					return false;
				} finally {
					setWriting(false);
				}
			};
			Alert.alert(T.invited.stopTitle(label), T.invited.stopBody, [
				{ text: T.common.cancel, style: "cancel" },
				{
					text: T.invited.revoke,
					style: "destructive",
					onPress: async () => {
						// Atomic "invited-" / "invited+" bound to this tree id.
						if (!(await run(() => removeInvited(treeId, id)))) return;
						toast(T.invited.revoked(label), "info", { label: T.common.undo, onPress: () => void run(() => addInvited(treeId, id)) }, 5000);
					},
				},
			]);
		},
		[emails, addInvited, removeInvited, full?.tree.id, writing, T],
	);

	return (
		<Screen maxWidth={FORM_MAX} contentStyle={{ gap: 18 }}>
			<Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel={T.common.back}>
				<ChevronLeft size={20} color={t.c.ink2} strokeWidth={2.25} />
				<Text size={16} weight={600} color={t.c.ink2}>
					{T.common.settings}
				</Text>
			</Pressable>
			<View style={{ gap: 4 }}>
				<Text variant="display" size={28} accessibilityRole="header">
					{T.invited.title}
				</Text>
				<Text size={15} color={t.c.ink2}>
					{T.invited.subtitle}
				</Text>
			</View>
			{owner ? (
				<>
					<OfflineWriteHint />
					<View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
						<TextField
							containerStyle={{ flex: 1 }}
							value={email}
							onChangeText={(v) => {
								setEmail(v);
								setError(null);
							}}
							placeholder={T.invited.emailPlaceholder}
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							autoComplete="email"
							returnKeyType="send"
							onSubmitEditing={invite}
							error={error}
							accessibilityLabel={T.invited.emailA11y}
						/>
						<Button label={T.invited.invite} loading={busy} disabled={(writing && !busy) || !canWrite} onPress={invite} style={{ height: 50, paddingHorizontal: 16 }} />
					</View>
					<Notice>{T.invited.note}</Notice>
				</>
			) : null}
			<Card>
				<Row
					leading={<Avatar name={owner ? user?.name || user?.username || "?" : ownerEmail || "?"} color={t.c.primary} size={40} />}
					title={owner ? T.invited.youSuffix(user?.username ?? T.common.you) : ownerEmail ?? T.common.owner}
					subtitle={T.invited.creator}
					trailing={<Badge label={T.common.owner} tone="accent" />}
				/>
				{invited.map((id) => (
					<Row
						key={id}
						onLongPress={owner && Platform.OS === "android" && !writing && canWrite ? () => revoke(id) : undefined}
						leading={<Avatar name={emails[id] || "?"} gender="male" size={40} />}
						title={emails[id] ? emails[id] : loading ? <Skeleton width={160} height={14} /> : id === user?.id ? T.common.you : T.invited.unknown}
						subtitle={id === user?.id ? T.invited.viewerYou : T.invited.viewer}
						trailing={
							owner ? (
								<Pressable
									onPress={() => revoke(id)}
									disabled={writing || !canWrite}
									accessibilityRole="button"
									accessibilityState={{ disabled: writing || !canWrite }}
									accessibilityLabel={T.invited.revokeA11y(emails[id] ?? "")}
									style={[styles.revoke, { borderColor: t.c.border, opacity: writing || !canWrite ? 0.45 : 1 }]}
								>
									<Text size={13} weight={600} color={t.c.danger}>
										{T.invited.revoke}
									</Text>
								</Pressable>
							) : null
						}
					/>
				))}
			</Card>
			{invited.length === 0 ? <Text variant="caption">{T.invited.onlyYou}</Text> : null}
		</Screen>
	);
}

const styles = StyleSheet.create({
	back: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 },
	revoke: { height: 36, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, justifyContent: "center" },
});
