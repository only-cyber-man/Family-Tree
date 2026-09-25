import Link from "next/link";
import { redirect } from "next/navigation";
import { initPocketBase } from "@/lib/ssr";
import { LogoMark } from "@/components/Logo";
import { AlertIcon, PlusIcon } from "@/components/Icons";
import { LegalLinks } from "@/components/LegalShell";
import { LandingNav } from "./LandingNav";
import { HeroGraph } from "./HeroGraph";
import { getT } from "@/i18n/server";
import s from "./landing.module.css";

const LINES = [
	{ key: "biological", color: "var(--bio)", width: 2.5 },
	{ key: "married", color: "var(--inlaw)", width: 4, cap: true },
	{ key: "livesWith", color: "var(--inlaw)", width: 1.25, dash: "2 6", cap: true },
	{ key: "church", color: "var(--church)", width: 2, dash: "2 5" },
	{ key: "other", color: "var(--other)", width: 1, dash: "3 7", muted: true },
] as const;

const CALENDAR_DAYS = [
	{ day: 3, color: "var(--accent)" },
	{ day: 15, color: "var(--church)" },
	{ day: 28, color: "var(--accent)" },
];

/** The phone mock-up is always drawn in the light theme. */
const PHONE_DOTS = [{ c: "#A5584C" }, { c: "#3F6E7A", o: 0.6 }, { c: "#A5584C" }];

export default async function Landing({
	searchParams: { err, deleted },
}: {
	searchParams: { err?: string; deleted?: string };
}) {
	const pb = await initPocketBase();
	if (pb.authStore.isValid && !err) {
		return redirect("/trees");
	}
	const t = getT();
	const l = t.landing;

	return (
		<div className={s.page}>
			<LandingNav />
			{deleted ? (
				<div className={`${s.wrap} ${s.errorBanner}`}>
					<div className="alert alert-info" role="status">
						<AlertIcon />
						<span>{l.deleted}</span>
					</div>
				</div>
			) : null}
			{err ? (
				<div className={`${s.wrap} ${s.errorBanner}`}>
					<div className="alert" role="alert">
						<AlertIcon />
						<span>{err}</span>
					</div>
				</div>
			) : null}

			<section className={`${s.wrap} ${s.hero}`}>
				<div className={s.heroCopy}>
					<div className={s.eyebrow}>{l.eyebrow}</div>
					<h1 className={s.heroTitle}>{l.title}</h1>
					<p className={s.lead}>{l.lead}</p>
					<div className={s.ctaRow}>
						<Link href="/sign-up" className={s.ctaPrimary}>
							{l.cta}
						</Link>
						<Link href="/sign-in" className={s.ctaSecondary}>
							{l.logIn}
						</Link>
					</div>
					<div className={s.fine}>{l.fine}</div>
				</div>
				<div className={s.heroArt}>
					<HeroGraph />
				</div>
			</section>

			<section id="features" className={s.band}>
				<div className={`${s.wrap} ${s.section} ${s.stack}`}>
					<div className={s.sectionHead}>
						<div className={s.eyebrow}>{l.treeEyebrow}</div>
						<h2 className={s.h2}>{l.treeTitle}</h2>
						<p className={s.body}>{l.treeBody}</p>
					</div>
					<div className={s.features}>
						<div className={s.feature}>
							<div className={s.featureArt} aria-hidden>
								<div className={s.timelineRow} style={{ top: 0 }} />
								<div className={s.timelineRow} style={{ top: 60 }} />
								{l.decades.map((label, i) => (
									<div key={label} className={s.timelineLabel} style={{ top: 6 + i * 30 }}>
										{label}
									</div>
								))}
								<div className={`${s.miniNode} ${s.male}`} style={{ left: 120, top: 6 }} />
								<div className={`${s.miniNode} ${s.female}`} style={{ left: 200, top: 36 }} />
								<div className={`${s.miniNode} ${s.male}`} style={{ left: 140, top: 66 }} />
								<div className={`${s.miniNode} ${s.female}`} style={{ left: 220, top: 96 }} />
							</div>
							<h3>{l.timelineTitle}</h3>
							<p>{l.timelineBody}</p>
						</div>
						<div className={s.feature}>
							<div className={`${s.featureArt} ${s.lineList}`} aria-hidden>
								{LINES.map((line) => (
									<div key={line.key} className={s.lineRow}>
										<svg width="90" height="8">
											<line
												x1="0"
												y1="4"
												x2="90"
												y2="4"
												strokeWidth={line.width}
												strokeDasharray={"dash" in line ? line.dash : undefined}
												strokeLinecap={"cap" in line ? "round" : undefined}
												style={{ stroke: line.color }}
											/>
										</svg>
										<span style={"muted" in line ? { color: "var(--ink3)" } : undefined}>
											{l.lines[line.key]}
										</span>
									</div>
								))}
							</div>
							<h3>{l.kindsTitle}</h3>
							<p>{l.kindsBody}</p>
						</div>
						<div className={s.feature}>
							<div className={`${s.featureArt} ${s.chipArt}`} aria-hidden>
								{l.chips.map((chip, i) => (
									<span key={chip} className={`${s.chip} ${i === 2 ? s.chipOn : ""}`}>
										{chip}
									</span>
								))}
							</div>
							<h3>{l.filtersTitle}</h3>
							<p>{l.filtersBody}</p>
						</div>
					</div>
				</div>
			</section>

			<section id="calendar" className={`${s.wrap} ${s.section} ${s.split}`}>
				<div className={s.splitCopy}>
					<div className={s.eyebrow}>{l.calendarEyebrow}</div>
					<h2 className={s.h2}>{l.calendarTitle}</h2>
					<p className={s.body}>{l.calendarBody}</p>
					<div className={s.pills}>
						{l.pills.map((pill, i) => (
							<span key={pill} className={s.pill}>
								<span
									className={s.dot}
									style={{ background: ["var(--primary)", "var(--church)", "var(--accent)"][i] }}
								/>
								{pill}
							</span>
						))}
					</div>
				</div>
				<div className={s.splitArt}>
					<div className={s.calendar}>
						<div className={s.calendarHead}>
							<div className={s.calendarMonth}>{l.calendarMonth}</div>
							<div className={s.calendarFile}>{l.calendarFile}</div>
						</div>
						{CALENDAR_DAYS.map((row, i) => (
							<div key={row.day} className={s.calendarRow}>
								<div className={s.calendarDay}>
									<div className={s.calendarDow} style={{ color: row.color }}>
										{l.calendarRows[i].dow}
									</div>
									<div className={s.calendarNum}>{row.day}</div>
								</div>
								<div>
									<div className={s.calendarTitle}>{l.calendarRows[i].title}</div>
									<div className={s.calendarMeta}>{l.calendarRows[i].meta}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className={s.private}>
				<div className={`${s.wrap} ${s.section} ${s.split}`}>
					<div className={s.splitCopy}>
						<div className={s.eyebrow}>{l.privateEyebrow}</div>
						<h2 className={s.h2}>{l.privateTitle}</h2>
						<p className={s.body}>{l.privateBody}</p>
					</div>
					<div className={s.privateList} aria-hidden>
						<div className={s.privateRow}>
							<div className={s.privateAvatar} style={{ background: "#E0955E" }}>
								TK
							</div>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div className={s.who}>{l.privateYou}</div>
								<div className={s.role}>{l.privateCreator}</div>
							</div>
							<span className={s.privateBadge}>{l.privateOwner}</span>
						</div>
						<div className={s.privateRow}>
							<div className={s.privateAvatar} style={{ background: "#6FA3B0" }}>
								AN
							</div>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div className={s.who}>anna.nowak@…</div>
								<div className={s.role}>{l.privateInvited}</div>
							</div>
							<span className={s.privateRevoke}>{l.privateRevoke}</span>
						</div>
						<div className={`${s.privateRow} ${s.privateInvite}`}>
							<PlusIcon size={20} />
							{l.privateInvite}
						</div>
					</div>
				</div>
			</section>

			<section id="mobile" className={`${s.wrap} ${s.section} ${s.split}`}>
				<div className={s.splitCopy}>
					<div className={s.eyebrow}>{l.mobileEyebrow}</div>
					<h2 className={s.h2}>{l.mobileTitle}</h2>
					<p className={s.body}>{l.mobileBody}</p>
					<div className={s.stores}>
						<span className={s.store}>
							<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
								<path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8C6.1 7.4 3.7 9.3 3.7 13c0 1.1.2 2.3.6 3.4.6 1.6 2.6 5.5 4.7 5.4 1.1 0 1.8-.8 3.2-.8s2 .8 3.2.8c2.1 0 3.9-3.5 4.5-5.1-2.8-1.3-3.5-3.9-3.5-4.1zM13.9 5.7c1-1.2 1-2.9.9-3.5-1.4.1-2.9.9-3.7 1.9-.8.9-1.3 2.1-1.1 3.4 1.5.1 2.9-.7 3.9-1.8z" />
							</svg>
							<span className={s.storeText}>
								<span className={s.storeSmall}>{l.appStoreSmall}</span>
								<span className={s.storeBig}>App Store</span>
							</span>
						</span>
						<span className={s.store}>
							<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
								<path d="M4 3.5v17l9.5-8.5L4 3.5z" fill="#6FA3B0" />
								<path d="M4 3.5l9.5 8.5 3-2.7L5.2 3.1c-.5-.3-.9-.1-1.2.4z" fill="#6FB08A" />
								<path d="M4 20.5l9.5-8.5 3 2.7L5.2 20.9c-.5.3-.9.1-1.2-.4z" fill="#E07B71" />
								<path d="M16.5 9.3l3.3 1.9c.6.4.6 1.2 0 1.6l-3.3 1.9-3-2.7 3-2.7z" fill="#D9A85A" />
							</svg>
							<span className={s.storeText}>
								<span className={s.storeSmall}>{l.playStoreSmall}</span>
								<span className={s.storeBig}>Google Play</span>
							</span>
						</span>
					</div>
				</div>
				<div className={`${s.splitArt} ${s.phones}`} aria-hidden>
					<div className={s.phone}>
						<div className={`${s.phoneScreen} ${s.phoneLight}`}>
							<div className={s.phoneTitle}>{l.phoneUpcoming}</div>
							{l.phoneRows.map((text, i) => ({ ...text, ...PHONE_DOTS[i] })).map((row) => (
								<div key={row.t} className={s.phoneCard}>
									<div
										style={{
											width: 28,
											height: 28,
											borderRadius: "50%",
											background: row.c,
											opacity: row.o ?? 1,
											flex: "none",
										}}
									/>
									<div style={{ minWidth: 0, flex: 1 }}>
										<div className={s.phoneCardTitle}>{row.t}</div>
										<div className={s.phoneCardMeta}>{row.m}</div>
									</div>
								</div>
							))}
							<div className={s.phoneTabs}>
								<span className={s.phoneTab} style={{ background: "#2F5D46" }} />
								<span className={s.phoneTab} />
								<span className={s.phoneTab} />
								<span className={s.phoneTab} />
							</div>
						</div>
					</div>
					<div className={s.phone} style={{ marginBottom: 36 }}>
						<div className={`${s.phoneScreen} ${s.phoneDark}`}>
							<div style={{ flex: 1, position: "relative" }}>
								<div style={{ position: "absolute", left: 30, top: 6, width: 64, height: 22, borderRadius: 5, background: "#1F3A41", border: "1.5px solid #6FA3B0" }} />
								<div style={{ position: "absolute", left: 106, top: 6, width: 64, height: 22, borderRadius: 5, background: "#43282A", border: "1.5px solid #D08A80" }} />
								<svg style={{ position: "absolute", inset: 0 }} width="100%" height="100%" viewBox="0 0 196 160">
									<path d="M62 28 L98 70" stroke="#6FB08A" strokeWidth="2" />
									<path d="M138 28 L98 70" stroke="#6FB08A" strokeWidth="2" />
									<path d="M94 6 L106 6" stroke="#E09A5F" strokeWidth="2" strokeDasharray="6 4" />
								</svg>
								<div style={{ position: "absolute", left: 58, top: 70, width: 80, height: 26, borderRadius: 6, background: "#43282A", border: "2px solid #D98A4E", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }} />
							</div>
							<div className={s.phoneSheet}>
								<div style={{ width: 32, height: 4, borderRadius: 2, background: "#4A5A51", margin: "0 auto 4px" }} />
								<div className={s.phoneTitle} style={{ fontSize: 15 }}>
									Anna Nowak
								</div>
								<div style={{ fontSize: 10, color: "#B9B3A5" }}>
									{l.phoneRelation}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section id="how" className={s.band} style={{ borderBottom: 0 }}>
				<div className={`${s.wrap} ${s.section}`} style={{ display: "flex", flexDirection: "column", gap: 36 }}>
					<h2 className={s.h2}>{l.howTitle}</h2>
					<div className={s.steps}>
						{l.steps.map((step, i) => (
							<div key={step.title} className={s.step}>
								<div className={s.stepNum}>{i + 1}</div>
								<h3>{step.title}</h3>
								<p>{step.body}</p>
							</div>
						))}
					</div>
					<div className={s.ctaRow} style={{ paddingTop: 8 }}>
						<Link href="/sign-up" className={s.ctaPrimary}>
							{l.cta}
						</Link>
						<span className={s.fine} style={{ fontSize: 14 }}>
							{l.minute}
						</span>
					</div>
				</div>
			</section>

			<footer className={s.footer}>
				<div className={`${s.wrap} ${s.footerInner}`}>
					<div className={s.footerBrand}>
						<LogoMark size={22} />
						<span className={s.footerName}>{t.common.appName}</span>
						<span>· {t.common.createdBy}</span>
					</div>
					<div className={s.footerBrand} style={{ gap: 20 }}>
						<LegalLinks />
					</div>
				</div>
			</footer>
		</div>
	);
}
