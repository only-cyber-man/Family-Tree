import { getT } from "@/i18n/server";

export default function LoadingPage() {
	const t = getT();
	return (
		<div className="page-center" style={{ minHeight: "100vh" }}>
			<span className="spinner" style={{ width: 28, height: 28, color: "var(--primary)" }} />
			<p>{t.common.loading}</p>
		</div>
	);
}
