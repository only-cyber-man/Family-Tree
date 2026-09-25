import { useLocalSearchParams, useRouter } from "expo-router";
import { PathView } from "../../../src/components/PathView";
import { Screen } from "../../../src/components/Screen";
import { READING_MAX } from "../../../src/lib/responsive";

/** How are we related (full screen). */
export default function PathScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	return (
		<Screen maxWidth={READING_MAX}>
			<PathView
				targetId={id}
				onBack={() => router.back()}
				onOpen={(pid) => router.push({ pathname: "/person/[id]", params: { id: pid } })}
				onShowOnTree={(pid) => router.navigate({ pathname: "/tree", params: { person: pid } })}
			/>
		</Screen>
	);
}
