import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import { Button } from "../src/components/Button";
import { Notice } from "../src/components/Feedback";
import { PersonPicker } from "../src/components/PersonPicker";
import { RouteSheet, SheetHeader } from "../src/components/Sheet";
import { useCanWrite, useGraph, useIsOwner, useMeInfo, usePictures, useToday } from "../src/hooks/useTreeData";
import { useT } from "../src/i18n";
import { errorMessage } from "../src/lib/errors";
import { linkConflict } from "../src/lib/links";
import { useSession } from "../src/store/session";
import { useSettings } from "../src/store/settings";
import { toast } from "../src/store/toast";
import { useTree } from "../src/store/tree";

/**
 * "This is me". The server link (ft_nodes.user = my account) is the source of
 * truth; when a person in this tree is linked to me, that is shown and the
 * on-device pick is hidden. Otherwise the pick is kept on this phone, and on
 * trees I own the app offers to save it as the server link.
 */
export default function PickMe() {
	const router = useRouter();
	const T = useT();
	const treeId = useTree((s) => s.treeId);
	const setNodeUser = useTree((s) => s.setNodeUser);
	const graph = useGraph();
	const pictures = usePictures();
	const today = useToday();
	const owner = useIsOwner();
	const canWrite = useCanWrite();
	const me = useMeInfo();
	const myUserId = useSession((s) => s.user?.id);
	const current = useSettings((s) => (treeId ? s.meByTree[treeId] : undefined));
	const setMe = useSettings((s) => s.setMe);
	const [value, setValue] = useState<string | null>(current ?? null);
	const close = () => router.back();

	if (me.source === "server" && me.person) {
		return (
			<RouteSheet snapPoints={["50%"]} header={<SheetHeader title={T.pickMe.title} onCancel={close} />}>
				<Notice>{T.pickMe.serverLinked(me.person.name)}</Notice>
			</RouteSheet>
		);
	}

	const save = () => {
		if (!treeId || !value) return;
		setMe(treeId, value);
		const person = graph?.byId[value];
		// Offer the server link only where it can be written and would not take the account from someone else.
		if (owner && canWrite && myUserId && person && !linkConflict(graph?.persons ?? [], myUserId, value)) {
			Alert.alert(T.pickMe.saveTitle, T.pickMe.saveBody(person.name), [
				{ text: T.pickMe.phoneOnly, style: "cancel", onPress: close },
				{
					text: T.pickMe.saveLink,
					onPress: () => {
						setNodeUser(treeId, value, myUserId)
							.then(() => toast(T.pickMe.linkSaved(person.name), "success"))
							.catch((e) => toast(errorMessage(e, T), "error"));
						close();
					},
				},
			]);
			return;
		}
		close();
	};

	return (
		<RouteSheet
			snapPoints={["92%"]}
			header={<SheetHeader title={T.pickMe.title} onCancel={close} action={T.common.save} actionDisabled={!value} onAction={save} />}
		>
			<Notice>{T.pickMe.note}</Notice>
			<PersonPicker inSheet persons={graph?.persons ?? []} value={value} onChange={setValue} today={today} pictures={pictures} limit={8} />
			{current ? (
				<View>
					<Button
						kind="destructive"
						size="md"
						label={T.pickMe.forget}
						onPress={() => {
							if (treeId) setMe(treeId, null);
							close();
						}}
					/>
				</View>
			) : null}
		</RouteSheet>
	);
}
