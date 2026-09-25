import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, Link2 } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, Switch, View } from "react-native";
import { Chip } from "../src/components/Chip";
import { DateField } from "../src/components/DateField";
import { Notice, OfflineWriteHint, SaveFailed, saveErrorMessage } from "../src/components/Feedback";
import { PersonPicker } from "../src/components/PersonPicker";
import { RouteSheet, SheetHeader } from "../src/components/Sheet";
import { Text } from "../src/components/Text";
import { TextField } from "../src/components/TextField";
import { useCanWrite, useGraph, useIsOwner, usePictures, useToday } from "../src/hooks/useTreeData";
import type { NodeInput, PhotoInput } from "../src/lib/api";
import { compareDates, parseDate } from "../src/lib/dates";
import { errorMessage } from "../src/lib/errors";
import { firstName } from "../src/lib/format";
import { classifyName, GROUP_ORDER, groupGlyph, relationChipLabel, typeSentence } from "../src/lib/relations";
import type { CalendarDate, Gender } from "../src/lib/types";
import { haptics } from "../src/services/haptics";
import { pickPhoto, takePhoto } from "../src/services/photos";
import { newRecordId } from "../src/lib/ids";
import { toast } from "../src/store/toast";
import { useTree, type CreateIds } from "../src/store/tree";
import { tokens } from "../src/theme/tokens";
import { useTheme } from "../src/theme/useTheme";
import { useT } from "../src/i18n";
import { useTreeAccounts } from "../src/hooks/useAccounts";
import { linkConflict } from "../src/lib/links";

/** Add person (camera one tap away) or, with ?id=, edit an existing one. */
/** ft_nodes.note is a plain text field; the app caps it here. */
const NOTE_MAX = 2000;

export default function AddPerson() {
	const t = useTheme();
	const T = useT();
	const router = useRouter();
	const params = useLocalSearchParams<{ id?: string; linkTo?: string }>();
	const full = useTree((s) => s.full);
	const addNode = useTree((s) => s.addNode);
	const editNode = useTree((s) => s.editNode);
	const removeNode = useTree((s) => s.removeNode);
	const graph = useGraph();
	const pictures = usePictures();
	const today = useToday();
	const owner = useIsOwner();
	const canWrite = useCanWrite();
	const existing = params.id ? full?.nodes.find((n) => n.id === params.id) : undefined;
	// Bound when the form opens: the tree it writes to, and record ids reused by
	// every "Try again" so a retry after a lost response cannot duplicate.
	// The tree this form writes to: bound as soon as it is known (also when it
	// finishes loading after the form opened), so switching trees mid-form
	// cannot redirect the write.
	const boundTree = useRef<string | null>(full?.tree.id ?? null);
	if (!boundTree.current && full) boundTree.current = full.tree.id;
	const ids = useRef<CreateIds>({ nodeId: newRecordId(), linkId: newRecordId() }).current;
	const [saveError, setSaveError] = useState<string | null>(null);

	const [name, setName] = useState(existing?.name ?? "");
	const [gender, setGender] = useState<Gender | null>(existing?.gender ?? null);
	const [birth, setBirth] = useState<CalendarDate | null>(parseDate(existing?.birthDate));
	const [deceased, setDeceased] = useState(!!existing?.deathDate);
	const [death, setDeath] = useState<CalendarDate | null>(parseDate(existing?.deathDate));
	const [photo, setPhoto] = useState<PhotoInput | null>(null);
	const [cameraDenied, setCameraDenied] = useState(false);
	const [linkOpen, setLinkOpen] = useState(!!params.linkTo);
	const [linkType, setLinkType] = useState<string | null>(null);
	const [linkTarget, setLinkTarget] = useState<string | null>(params.linkTo ?? null);
	const [errors, setErrors] = useState<{ name?: string; gender?: string; birth?: string; death?: string; link?: string }>({});
	const [busy, setBusy] = useState(false);
	const [note, setNote] = useState(existing?.note ?? "");
	const [linkedUser, setLinkedUser] = useState<string>(existing?.user ?? "");
	const { accounts, loading: accountsLoading } = useTreeAccounts(full?.tree);
	const conflict = graph ? linkConflict(graph.persons, linkedUser, existing?.id) : null;

	const types = useMemo(
		() => [...(full?.relationshipNames ?? [])].sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.name.localeCompare(b.name)),
		[full],
	);
	const close = () => (router.canGoBack() ? router.back() : router.replace("/"));

	const photoUri = photo?.uri ?? (existing ? pictures[existing.id] : undefined);
	const choose = async (source: "camera" | "library") => {
		const res = source === "camera" ? await takePhoto() : await pickPhoto();
		if (res.status === "ok") {
			setPhoto(res.photo);
			setCameraDenied(false);
		} else if (res.status === "denied") setCameraDenied(true);
	};

	const save = async () => {
		// One account ↔ one person per tree, same rule as the web dialog.
		if (conflict) return;
		const e: typeof errors = {};
		if (!name.trim()) e.name = T.addPerson.nameRequired;
		if (!gender) e.gender = T.addPerson.chooseGender;
		if (!birth) e.birth = T.addPerson.birthRequired;
		if (deceased && !death) e.death = T.addPerson.deathRequired;
		if (birth && deceased && death && compareDates(death, birth) < 0) e.death = T.addPerson.deathBeforeBirth;
		if (!existing && linkOpen && (linkType || linkTarget) && !(linkType && linkTarget)) e.link = T.addPerson.linkIncomplete;
		setErrors(e);
		if (Object.keys(e).length) {
			haptics.error();
			return;
		}
		const input: NodeInput = {
			name: name.trim(),
			gender: gender!,
			birthDate: birth!,
			deathDate: deceased ? death : null,
			photo,
			note: note.slice(0, NOTE_MAX),
			// "" clears the link on the server.
			userId: linkedUser,
		};
		const treeId = boundTree.current ?? useTree.getState().full?.tree.id ?? null;
		if (!treeId) {
			haptics.error();
			setSaveError(T.save.noTree);
			return;
		}
		setBusy(true);
		setSaveError(null);
		try {
			if (existing) {
				await editNode(existing.id, input);
				haptics.success();
				toast(T.addPerson.saved(firstName(input.name)), "success");
				close();
				return;
			}
			const link = linkOpen && linkType && linkTarget ? { relationshipName: linkType, target: linkTarget } : undefined;
			const { node, linkError } = await addNode(treeId, input, ids, link);
			if (linkError) {
				// The person exists; "Try again" finishes the link (same ids, no duplicate).
				haptics.error();
				setSaveError(T.addPerson.linkFailed(firstName(input.name), linkError));
				return;
			}
			haptics.success();
			toast(T.addPerson.added(firstName(input.name)), "success", {
				label: T.common.undo,
				onPress: () => removeNode(node.id, node.tree).catch((err) => toast(errorMessage(err, T), "error")),
			});
			close();
		} catch (err) {
			// Save failed: the form stays open with everything the user entered.
			haptics.error();
			setSaveError(saveErrorMessage(err, existing ? T.save.theChanges : firstName(input.name) || T.save.thisPerson));
		} finally {
			setBusy(false);
		}
	};

	if (!full || (!owner && full)) {
		return (
			<RouteSheet snapPoints={tokens.mobile.sheetSnapPoints.addPerson as unknown as string[]} header={<SheetHeader title={T.addPerson.add} onCancel={close} />}>
				<Notice tone="neutral">{full ? T.addPerson.viewerOnly : T.addPerson.chooseTreeFirst}</Notice>
			</RouteSheet>
		);
	}

	if (params.id && !existing) {
		return (
			<RouteSheet snapPoints={tokens.mobile.sheetSnapPoints.addPerson as unknown as string[]} header={<SheetHeader title={T.addPerson.edit} onCancel={close} />}>
				<Notice tone="neutral">
					{T.addPerson.gone}
				</Notice>
			</RouteSheet>
		);
	}

	const target = linkTarget ? graph?.byId[linkTarget] : undefined;
	const typeName = types.find((x) => x.id === linkType);
	return (
		<RouteSheet
			snapPoints={tokens.mobile.sheetSnapPoints.addPerson as unknown as string[]}
			header={<SheetHeader title={existing ? T.addPerson.edit : T.addPerson.add} onCancel={close} action={T.common.save} onAction={save} busy={busy} actionDisabled={!canWrite || !!conflict} />}
		>
			<OfflineWriteHint />
			{saveError ? <SaveFailed message={saveError} onRetry={save} busy={busy || !canWrite} /> : null}
			<View style={styles.photoBlock}>
				<Pressable
					onPress={() => choose("library")}
					accessibilityRole="button"
					accessibilityLabel={photoUri ? T.addPerson.changePhoto : T.addPerson.addPhoto}
					style={[styles.photo, { borderColor: t.c.borderStrong, backgroundColor: t.c.bg }, photoUri && { borderStyle: "solid", borderWidth: 0 }]}
				>
					{photoUri ? <Image source={{ uri: photoUri }} style={styles.photoImg} contentFit="cover" /> : <Camera size={32} color={t.c.ink3} strokeWidth={1.5} />}
				</Pressable>
				{cameraDenied ? (
					<Notice
						title={T.addPerson.cameraOff}
						actions={
							<>
								<Pressable onPress={() => Linking.openSettings()} style={[styles.smallPill, { backgroundColor: t.c.ink }]} accessibilityRole="button">
									<Text size={13} weight={600} color={t.c.bg}>
										{T.common.openSettings}
									</Text>
								</Pressable>
								<Pressable onPress={() => choose("library")} style={[styles.smallPill, { borderWidth: 1, borderColor: t.c.borderStrong }]} accessibilityRole="button">
									<Text size={13} weight={600}>
										{T.addPerson.useGallery}
									</Text>
								</Pressable>
							</>
						}
					>
						{T.addPerson.cameraOffBody}
					</Notice>
				) : (
					<View style={{ flexDirection: "row", gap: 8 }}>
						<Chip label={T.addPerson.takePhoto} onPress={() => choose("camera")} />
						<Chip label={T.addPerson.fromGallery} onPress={() => choose("library")} />
					</View>
				)}
			</View>

			<TextField
				inSheet
				label={T.addPerson.fullName}
				value={name}
				onChangeText={setName}
				placeholder={T.addPerson.namePlaceholder}
				autoCapitalize="words"
				autoFocus={!existing}
				error={errors.name}
				returnKeyType="done"
			/>

			<View style={{ gap: 6 }}>
				<Text variant="label">{T.addPerson.gender}</Text>
				<View style={{ flexDirection: "row", gap: 8 }}>
					{(["female", "male"] as const).map((g) => {
						const on = gender === g;
						return (
							<Pressable
								key={g}
								onPress={() => setGender(g)}
								accessibilityRole="radio"
								accessibilityState={{ selected: on }}
								style={[styles.gender, { borderColor: on ? t.c.accent : errors.gender ? t.c.danger : t.c.border, backgroundColor: on ? t.c.accentSoft : "transparent" }]}
							>
								<View style={[styles.swatch, { backgroundColor: t.node[g].fill, borderColor: t.node[g].border }]} />
								<Text size={15} weight={600}>
									{g === "female" ? T.common.female : T.common.male}
								</Text>
							</Pressable>
						);
					})}
				</View>
				{errors.gender ? (
					<Text size={13} color={t.c.danger}>
						{errors.gender}
					</Text>
				) : null}
			</View>

			<DateField label={T.addPerson.birthDate} value={birth} onChange={setBirth} error={errors.birth} />

			<View style={styles.switchRow}>
				<View style={{ flex: 1 }}>
					<Text size={15} weight={600}>
						{T.addPerson.passedAway}
					</Text>
					<Text variant="caption">{T.addPerson.passedAwayHint}</Text>
				</View>
				<Switch
					accessibilityLabel={T.addPerson.passedAway}
					value={deceased}
					onValueChange={setDeceased}
					trackColor={{ false: t.c.surface2, true: t.c.primary }}
					ios_backgroundColor={t.c.surface2}
				/>
			</View>
			{deceased ? <DateField label={T.addPerson.deathDate} value={death} onChange={setDeath} error={errors.death} /> : null}

			<TextField
				inSheet
				multiline
				label={T.addPerson.note}
				value={note}
				onChangeText={(v) => setNote(v.slice(0, NOTE_MAX))}
				maxLength={NOTE_MAX}
				placeholder={T.addPerson.notePlaceholder}
				hint={
					<Text variant="small" style={{ textAlign: "right" }}>
						{T.addPerson.noteCount(note.length, NOTE_MAX)}
					</Text>
				}
			/>

			<View style={{ gap: 8 }}>
				<Text variant="label">{T.addPerson.linkedAccount}</Text>
				<Text variant="small">{T.addPerson.linkedHint}</Text>
				<View style={styles.chips}>
					<Chip label={T.addPerson.linkedNone} selected={!linkedUser} onPress={() => setLinkedUser("")} />
					{accounts.map((a) => (
						<Chip
							key={a.id}
							selected={linkedUser === a.id}
							label={a.isMe ? T.addPerson.linkedMe(a.email ?? undefined) : (a.email ?? "…")}
							onPress={() => setLinkedUser(a.id)}
						/>
					))}
				</View>
				{accountsLoading ? <Text variant="small">{T.addPerson.loadingAccounts}</Text> : null}
				{conflict ? <Notice>{T.addPerson.linkedConflict(conflict.name)}</Notice> : null}
			</View>

			{!existing && graph && graph.persons.length > 0 ? (
				<View style={{ gap: 10 }}>
					<Text variant="label">
						{T.addPerson.linkTo}{" "}
						<Text size={13} weight={500} color={t.c.ink3}>
							{T.addPerson.linkOptional}
						</Text>
					</Text>
					{!linkOpen ? (
						<Pressable onPress={() => setLinkOpen(true)} accessibilityRole="button" style={[styles.linkRow, { borderColor: t.c.border, backgroundColor: t.c.bg }]}>
							<Link2 size={18} color={t.c.ink3} strokeWidth={1.75} />
							<Text size={15} color={t.c.ink3}>
								{T.addPerson.linkExample(graph.persons[0]?.name ?? "")}
							</Text>
						</Pressable>
					) : (
						<>
							<View style={[styles.sentence, { backgroundColor: t.c.surface2 }]}>
								<Text serif size={17} style={{ lineHeight: 24 }}>
									<Text serif size={17} weight={600}>
										{name.trim() || T.addPerson.newPerson}
									</Text>{" "}
									{typeName ? typeSentence(typeName.name, gender ?? "female", T) : "…"}
									{T.lang === "pl" ? ": " : " "}
									<Text serif size={17} weight={600}>
										{target?.name ?? "…"}
									</Text>
									.
								</Text>
							</View>
							<View style={styles.chips}>
								{types.map((rt) => (
									<Chip
										key={rt.id}
										height={38}
										selected={linkType === rt.id}
										glyph={groupGlyph(rt.group)}
										glyphColor={rt.group === "BIOLOGICAL" ? t.c.bio : rt.group === "IN-LAW" ? t.c.inlaw : rt.group === "CHURCH" ? t.c.church : t.c.other}
										label={relationChipLabel(rt.name, rt.isBidirectional, T)}
										onPress={() => setLinkType(linkType === rt.id ? null : rt.id)}
									/>
								))}
							</View>
							<PersonPicker inSheet persons={graph.persons} value={linkTarget} onChange={setLinkTarget} today={today} pictures={pictures} limit={5} />
							{errors.link ? (
								<Text size={13} color={t.c.danger}>
									{errors.link}
								</Text>
							) : null}
							{typeName && classifyName(typeName.name).kind === "parent" && !classifyName(typeName.name).reversed ? (
								<Text variant="small">{T.addPerson.parentNote(target ? firstName(target.name) : T.addPerson.theChosen)}</Text>
							) : null}
							<Pressable
								onPress={() => {
									setLinkOpen(false);
									setLinkType(null);
									setLinkTarget(null);
								}}
								accessibilityRole="button"
								style={{ alignSelf: "flex-start", minHeight: 44, justifyContent: "center" }}
							>
								<Text size={14} weight={700} color={t.c.accent}>
									{T.addPerson.dontLink}
								</Text>
							</Pressable>
						</>
					)}
				</View>
			) : null}
		</RouteSheet>
	);
}

const styles = StyleSheet.create({
	photoBlock: { alignItems: "center", gap: 12 },
	photo: { width: 104, height: 104, borderRadius: 52, borderWidth: 2, borderStyle: "dashed", alignItems: "center", justifyContent: "center", overflow: "hidden" },
	photoImg: { width: 104, height: 104 },
	smallPill: { height: 34, paddingHorizontal: 12, borderRadius: 999, justifyContent: "center" },
	gender: { flex: 1, height: 50, borderWidth: 2, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
	swatch: { width: 12, height: 12, borderRadius: 3, borderWidth: 2 },
	switchRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
	linkRow: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10 },
	sentence: { padding: 14, borderRadius: 12 },
	chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
