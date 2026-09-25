import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { PersonSheetContent } from "../../../src/components/PersonSheetContent";
import { RouteSheet } from "../../../src/components/Sheet";
import { tokens } from "../../../src/theme/tokens";

/** The person sheet opened from Home, Search or Dates (outside the canvas). */
export default function PersonRoute() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const [index, setIndex] = useState(0);
	return (
		<RouteSheet snapPoints={tokens.mobile.sheetSnapPoints.person as unknown as string[]} onChange={setIndex}>
			<PersonSheetContent
				personId={id}
				collapsed={index === 0}
				focusLabel="Focus on tree"
				onClose={() => router.back()}
				onSelect={(next) => router.setParams({ id: next })}
				onFocus={(pid) => {
					router.back();
					router.navigate({ pathname: "/tree", params: { focus: pid } });
				}}
			/>
		</RouteSheet>
	);
}
