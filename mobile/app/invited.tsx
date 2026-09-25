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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Who can see this tree. Invites resolve an email through
 * ft_gettable_users_email, so invitees must already have an account; no
 * invitation is sent. Viewers see the same list without edit controls.
 */
export default function Invited() {
	const t = useTheme();
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
		if (!EMAIL.test(value)) return setError("That doesn't look like an email address.");
		// Also covers the keyboard's submit key, which bypasses the disabled button.
		if (!canWrite) return setError("You're offline — changes can't be saved.");
		if (writing) return;
		setBusy(true);
		setWriting(true);
		setError(null);
		try {
			const userId = await findUserIdByEmail(value);
			if (userId === full?.tree.creator) return setError("That's you; you already own this tree.");
			if (invited.includes(userId)) return setError("They can already see this tree.");
			// Atomic "invited+" on the server: concurrent changes cannot overwrite each other.
			await addInvited(treeId, userId);
			setEmails((e) => ({ ...e, [userId]: value }));
			setEmail("");
			haptics.success();
			toast(`${value} can now see this tree`, "success");
		} catch (e) {
			haptics.error();
			setError(isNotFound(e) ? "No Family Tree account uses that email. Ask them to sign up first, then invite them." : errorMessage(e));
		} finally {
			setBusy(false);
			setWriting(false);
		}
	};

	const revoke = useCallback(
		(id: string) => {
			const label = emails[id] || "this person";
			// Bound to this tree: undo must not touch whichever tree is active later.
			const treeId = full?.tree.id;
			if (!treeId || writing) return;
			const run = async (op: () => Promise<unknown>) => {
				setWriting(true);
				try {
					await op();
					return true;
				} catch (e) {
					toast(errorMessage(e), "error");
					return false;
				} finally {
					setWriting(false);
				}
			};
			Alert.alert(`Stop sharing with ${label}?`, "They will no longer see this tree.", [
				{ text: "Cancel", style: "cancel" },
				{
					text: "Revoke",
					style: "destructive",
					onPress: async () => {
						// Atomic "invited-" / "invited+" bound to this tree id.
						if (!(await run(() => removeInvited(treeId, id)))) return;
						toast(`${label} can no longer see this tree`, "info", { label: "Undo", onPress: () => void run(() => addInvited(treeId, id)) }, 5000);
					},
				},
			]);
		},
		[emails, addInvited, removeInvited, full?.tree.id, writing],
	);

	return (
		<Screen contentStyle={{ gap: 18 }}>
			<Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
				<ChevronLeft size={20} color={t.c.ink2} strokeWidth={2.25} />
				<Text size={16} weight={600} color={t.c.ink2}>
					Settings
				</Text>
			</Pressable>
			<View style={{ gap: 4 }}>
				<Text variant="display" size={28} accessibilityRole="header">
					Who can see this tree
				</Text>
				<Text size={15} color={t.c.ink2}>
					Invited people can look, not edit.
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
							placeholder="name@example.com"
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							autoComplete="email"
							returnKeyType="send"
							onSubmitEditing={invite}
							error={error}
							accessibilityLabel="Email of the person to invite"
						/>
						<Button label="Invite" loading={busy} disabled={(writing && !busy) || !canWrite} onPress={invite} style={{ height: 50, paddingHorizontal: 16 }} />
					</View>
					<Notice>They need a Family Tree account with this email already. Nothing is emailed; the tree simply appears in their list.</Notice>
				</>
			) : null}
			<Card>
				<Row
					leading={<Avatar name={owner ? user?.name || user?.username || "?" : ownerEmail || "?"} color={t.c.primary} size={40} />}
					title={owner ? `${user?.username ?? "You"} (you)` : ownerEmail ?? "Owner"}
					subtitle="Creator"
					trailing={<Badge label="Owner" tone="accent" />}
				/>
				{invited.map((id) => (
					<Row
						key={id}
						onLongPress={owner && Platform.OS === "android" && !writing && canWrite ? () => revoke(id) : undefined}
						leading={<Avatar name={emails[id] || "?"} gender="male" size={40} />}
						title={emails[id] ? emails[id] : loading ? <Skeleton width={160} height={14} /> : id === user?.id ? "You" : "Unknown account"}
						subtitle={id === user?.id ? "Viewer · you" : "Viewer"}
						trailing={
							owner ? (
								<Pressable
									onPress={() => revoke(id)}
									disabled={writing || !canWrite}
									accessibilityRole="button"
									accessibilityState={{ disabled: writing || !canWrite }}
									accessibilityLabel={`Revoke ${emails[id] ?? ""}`}
									style={[styles.revoke, { borderColor: t.c.border, opacity: writing || !canWrite ? 0.45 : 1 }]}
								>
									<Text size={13} weight={600} color={t.c.danger}>
										Revoke
									</Text>
								</Pressable>
							) : null
						}
					/>
				))}
			</Card>
			{invited.length === 0 ? <Text variant="caption">Only you can see this tree.</Text> : null}
		</Screen>
	);
}

const styles = StyleSheet.create({
	back: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 },
	revoke: { height: 36, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, justifyContent: "center" },
});
