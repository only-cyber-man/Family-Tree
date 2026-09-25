import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button } from "../src/components/Button";
import { Notice } from "../src/components/Feedback";
import { PersonPicker } from "../src/components/PersonPicker";
import { RouteSheet, SheetHeader } from "../src/components/Sheet";
import { useGraph, usePictures, useToday } from "../src/hooks/useTreeData";
import { useSettings } from "../src/store/settings";
import { useTree } from "../src/store/tree";

/**
 * "This is me". The design proposes ft_trees.meNode; until the backend has it
 * the choice is made once per tree and kept on this device.
 */
export default function PickMe() {
	const router = useRouter();
	const treeId = useTree((s) => s.treeId);
	const graph = useGraph();
	const pictures = usePictures();
	const today = useToday();
	const current = useSettings((s) => (treeId ? s.meByTree[treeId] : undefined));
	const setMe = useSettings((s) => s.setMe);
	const [value, setValue] = useState<string | null>(current ?? null);
	const close = () => router.back();

	return (
		<RouteSheet
			snapPoints={["92%"]}
			header={
				<SheetHeader
					title="Which one is you?"
					onCancel={close}
					action="Save"
					actionDisabled={!value}
					onAction={() => {
						if (treeId && value) setMe(treeId, value);
						close();
					}}
				/>
			}
		>
			<Notice>Used for “How are we related”. It is stored on this phone only and nobody else sees it.</Notice>
			<PersonPicker inSheet persons={graph?.persons ?? []} value={value} onChange={setValue} today={today} pictures={pictures} limit={8} />
			{current ? (
				<View>
					<Button
						kind="destructive"
						size="md"
						label="Forget my choice"
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
