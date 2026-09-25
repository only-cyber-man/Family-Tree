export default function LoadingPage() {
	return (
		<div className="page-center" style={{ minHeight: "100vh" }}>
			<span className="spinner" style={{ width: 28, height: 28, color: "var(--primary)" }} />
			<p>Loading…</p>
		</div>
	);
}
