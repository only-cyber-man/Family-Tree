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
import { classifyName, GROUP_ORDER, groupGlyph, humanizeName } from "../src/lib/relations";
import type { CalendarDate, Gender } from "../src/lib/types";
import { haptics } from "../src/services/haptics";
import { pickPhoto, takePhoto } from "../src/services/photos";
import { newRecordId } from "../src/lib/ids";
import { toast } from "../src/store/toast";
import { useTree, type CreateIds } from "../src/store/tree";
import { tokens } from "../src/theme/tokens";
import { useTheme } from "../src/theme/useTheme";

/** Add person (camera one tap away) or, with ?id=, edit an existing one. */
export default function AddPerson() {
	const t = useTheme();
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
		const e: typeof errors = {};
		if (!name.trim()) e.name = "Name is required.";
		if (!gender) e.gender = "Choose a gender.";
		if (!birth) e.birth = "Birth date is required.";
		if (deceased && !death) e.death = "Add the date they passed away, or switch this off.";
		if (birth && deceased && death && compareDates(death, birth) < 0) e.death = "Death date is before the birth date.";
		if (!existing && linkOpen && (linkType || linkTarget) && !(linkType && linkTarget)) e.link = "Choose both the relation and the person, or clear the link.";
		setErrors(e);
		if (Object.keys(e).length) {
			haptics.error();
			return;
		}
		const input: NodeInput = { name: name.trim(), gender: gender!, birthDate: birth!, deathDate: deceased ? death : null, photo };
		const treeId = boundTree.current ?? useTree.getState().full?.tree.id ?? null;
		if (!treeId) {
			haptics.error();
			setSaveError("No tree is open, so nothing was saved. Choose a tree and try again.");
			return;
		}
		setBusy(true);
		setSaveError(null);
		try {
			if (existing) {
				await editNode(existing.id, input);
				haptics.success();
				toast(`${firstName(input.name)} saved`, "success");
				close();
				return;
			}
			const link = linkOpen && linkType && linkTarget ? { relationshipName: linkType, target: linkTarget } : undefined;
			const { node, linkError } = await addNode(treeId, input, ids, link);
			if (linkError) {
				// The person exists; "Try again" finishes the link (same ids, no duplicate).
				haptics.error();
				setSaveError(`${firstName(input.name)} was added, but the link couldn't be saved. ${linkError}`);
				return;
			}
			haptics.success();
			toast(`${firstName(input.name)} added to the tree`, "success", {
				label: "Undo",
				onPress: () => removeNode(node.id, node.tree).catch((err) => toast(errorMessage(err), "error")),
			});
			close();
		} catch (err) {
			// Save failed: the form stays open with everything the user entered.
			haptics.error();
			setSaveError(saveErrorMessage(err, existing ? "the changes" : firstName(input.name) || "this person"));
		} finally {
			setBusy(false);
		}
	};

	if (!full || (!owner && full)) {
		return (
			<RouteSheet snapPoints={tokens.mobile.sheetSnapPoints.addPerson as unknown as string[]} header={<SheetHeader title="Add person" onCancel={close} />}>
				<Notice tone="neutral">{full ? "This tree is shared with you to look at. Only its owner can add people." : "Choose or create a tree first."}</Notice>
			</RouteSheet>
		);
	}

	if (params.id && !existing) {
		return (
			<RouteSheet snapPoints={tokens.mobile.sheetSnapPoints.addPerson as unknown as string[]} header={<SheetHeader title="Edit person" onCancel={close} />}>
				<Notice tone="neutral">
					This person is no longer in the tree.
				</Notice>
			</RouteSheet>
		);
	}

	const target = linkTarget ? graph?.byId[linkTarget] : undefined;
	const typeName = types.find((x) => x.id === linkType);
	return (
		<RouteSheet
			snapPoints={tokens.mobile.sheetSnapPoints.addPerson as unknown as string[]}
			header={<SheetHeader title={existing ? "Edit person" : "Add person"} onCancel={close} action="Save" onAction={save} busy={busy} actionDisabled={!canWrite} />}
		>
			<OfflineWriteHint />
			{saveError ? <SaveFailed message={saveError} onRetry={save} busy={busy || !canWrite} /> : null}
			<View style={styles.photoBlock}>
				<Pressable
					onPress={() => choose("library")}
					accessibilityRole="button"
					accessibilityLabel={photoUri ? "Change photo" : "Add a photo"}
					style={[styles.photo, { borderColor: t.c.borderStrong, backgroundColor: t.c.bg }, photoUri && { borderStyle: "solid", borderWidth: 0 }]}
				>
					{photoUri ? <Image source={{ uri: photoUri }} style={styles.photoImg} contentFit="cover" /> : <Camera size={32} color={t.c.ink3} strokeWidth={1.5} />}
				</Pressable>
				{cameraDenied ? (
					<Notice
						title="Camera access is off"
						actions={
							<>
								<Pressable onPress={() => Linking.openSettings()} style={[styles.smallPill, { backgroundColor: t.c.ink }]} accessibilityRole="button">
									<Text size={13} weight={600} color={t.c.bg}>
										Open Settings
									</Text>
								</Pressable>
								<Pressable onPress={() => choose("library")} style={[styles.smallPill, { borderWidth: 1, borderColor: t.c.borderStrong }]} accessibilityRole="button">
									<Text size={13} weight={600}>
										Use gallery
									</Text>
								</Pressable>
							</>
						}
					>
						You can still pick a photo from your gallery, or allow the camera in Settings.
					</Notice>
				) : (
					<View style={{ flexDirection: "row", gap: 8 }}>
						<Chip label="Take photo" onPress={() => choose("camera")} />
						<Chip label="Choose from gallery" onPress={() => choose("library")} />
					</View>
				)}
			</View>

			<TextField
				inSheet
				label="Full name"
				value={name}
				onChangeText={setName}
				placeholder="e.g. Maria Kowalska"
				autoCapitalize="words"
				autoFocus={!existing}
				error={errors.name}
				returnKeyType="done"
			/>

			<View style={{ gap: 6 }}>
				<Text variant="label">Gender</Text>
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
									{g === "female" ? "Female" : "Male"}
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

			<DateField label="Birth date" value={birth} onChange={setBirth} error={errors.birth} />

			<View style={styles.switchRow}>
				<View style={{ flex: 1 }}>
					<Text size={15} weight={600}>
						Has passed away
					</Text>
					<Text variant="caption">Adds a death date and a remembrance day</Text>
				</View>
				<Switch
					accessibilityLabel="Has passed away"
					value={deceased}
					onValueChange={setDeceased}
					trackColor={{ false: t.c.surface2, true: t.c.primary }}
					ios_backgroundColor={t.c.surface2}
				/>
			</View>
			{deceased ? <DateField label="Date of death" value={death} onChange={setDeath} error={errors.death} /> : null}

			{!existing && graph && graph.persons.length > 0 ? (
				<View style={{ gap: 10 }}>
					<Text variant="label">
						Link to someone{" "}
						<Text size={13} weight={500} color={t.c.ink3}>
							optional, saves a step
						</Text>
					</Text>
					{!linkOpen ? (
						<Pressable onPress={() => setLinkOpen(true)} accessibilityRole="button" style={[styles.linkRow, { borderColor: t.c.border, backgroundColor: t.c.bg }]}>
							<Link2 size={18} color={t.c.ink3} strokeWidth={1.75} />
							<Text size={15} color={t.c.ink3}>
								e.g. mother of {graph.persons[0]?.name}
							</Text>
						</Pressable>
					) : (
						<>
							<View style={[styles.sentence, { backgroundColor: t.c.surface2 }]}>
								<Text serif size={17} style={{ lineHeight: 24 }}>
									<Text serif size={17} weight={600}>
										{name.trim() || "New person"}
									</Text>{" "}
									{typeName ? humanizeName(typeName.name).toLowerCase() : "…"}{" "}
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
										label={`${humanizeName(rt.name)} ${rt.isBidirectional ? "↔" : "→"}`}
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
								<Text variant="small">The new person is the parent; {target ? firstName(target.name) : "the chosen person"} is the child.</Text>
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
									Don't link now
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
