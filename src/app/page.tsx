import Link from "next/link";
import { redirect } from "next/navigation";
import { initPocketBase } from "@/lib/ssr";
import { LogoMark } from "@/components/Logo";
import { AlertIcon, PlusIcon } from "@/components/Icons";
import { LandingNav } from "./LandingNav";
import { HeroGraph } from "./HeroGraph";
import s from "./landing.module.css";

const LINES = [
	{ label: "Biological", color: "var(--bio)", width: 2.5 },
	{ label: "Married", color: "var(--inlaw)", width: 4, cap: true },
	{ label: "Lives with", color: "var(--inlaw)", width: 1.25, dash: "2 6", cap: true },
	{ label: "Church", color: "var(--church)", width: 2, dash: "2 5" },
	{ label: "Other", color: "var(--other)", width: 1, dash: "3 7", muted: true },
];

const CALENDAR = [
	{ dow: "Sat", day: 3, title: "Maria Kowalska's birthday", meta: "Birthday · repeats yearly", color: "var(--accent)" },
	{ dow: "Thu", day: 15, title: "† Stanisław Kowalski, remembrance", meta: "Remembrance · repeats yearly", color: "var(--church)" },
	{ dow: "Wed", day: 28, title: "Zofia Nowak's birthday", meta: "Birthday · repeats yearly", color: "var(--accent)" },
];

const STEPS = [
	{ title: "Start with yourself", body: "Create a tree, add the first person: a name, a birth date, and a photo if you have one." },
	{ title: "Link the people you know", body: "Parents, partners, godparents. Pick two people and a relationship, and the line draws itself into the right generation." },
	{ title: "Invite the family", body: "Share read-only access by email, export the dates to your calendar, and keep the tree on your phone." },
];

export default async function Landing({
	searchParams: { err },
}: {
	searchParams: { err?: string };
}) {
	const pb = await initPocketBase();
	if (pb.authStore.isValid && !err) {
		return redirect("/trees");
	}

	return (
		<div className={s.page}>
			<LandingNav />
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
					<div className={s.eyebrow}>A private family tree, drawn as a graph</div>
					<h1 className={s.heroTitle}>Every family is a graph. Draw yours.</h1>
					<p className={s.lead}>
						Add the people you know, link how they are related, and watch the
						generations line up by birth year. Private by default, shared only
						with the relatives you invite.
					</p>
					<div className={s.ctaRow}>
						<Link href="/sign-up" className={s.ctaPrimary}>
							Start your tree, free
						</Link>
						<Link href="/sign-in" className={s.ctaSecondary}>
							Log in
						</Link>
					</div>
					<div className={s.fine}>No ads, no public profiles.</div>
				</div>
				<div className={s.heroArt}>
					<HeroGraph />
				</div>
			</section>

			<section id="features" className={s.band}>
				<div className={`${s.wrap} ${s.section} ${s.stack}`}>
					<div className={s.sectionHead}>
						<div className={s.eyebrow}>The tree</div>
						<h2 className={s.h2}>Boxes and lines, not forms and tables.</h2>
						<p className={s.body}>
							You build the tree the way you would sketch it on the back of an
							envelope: a card for each person, a line for each relationship.
							Drag, zoom, and click anyone to see who they are.
						</p>
					</div>
					<div className={s.features}>
						<div className={s.feature}>
							<div className={s.featureArt} aria-hidden>
								<div className={s.timelineRow} style={{ top: 0 }} />
								<div className={s.timelineRow} style={{ top: 60 }} />
								{["1920s", "1940s", "1970s", "2000s"].map((label, i) => (
									<div key={label} className={s.timelineLabel} style={{ top: 6 + i * 30 }}>
										{label}
									</div>
								))}
								<div className={`${s.miniNode} ${s.male}`} style={{ left: 120, top: 6 }} />
								<div className={`${s.miniNode} ${s.female}`} style={{ left: 200, top: 36 }} />
								<div className={`${s.miniNode} ${s.male}`} style={{ left: 140, top: 66 }} />
								<div className={`${s.miniNode} ${s.female}`} style={{ left: 220, top: 96 }} />
							</div>
							<h3>A timeline of generations</h3>
							<p>
								People sit on a vertical axis by birth year. Grandparents at the
								top, grandchildren at the bottom, and every twenty years a new
								band. You never wonder who came first.
							</p>
						</div>
						<div className={s.feature}>
							<div className={`${s.featureArt} ${s.lineList}`} aria-hidden>
								{LINES.map((line) => (
									<div key={line.label} className={s.lineRow}>
										<svg width="90" height="8">
											<line
												x1="0"
												y1="4"
												x2="90"
												y2="4"
												strokeWidth={line.width}
												strokeDasharray={line.dash}
												strokeLinecap={line.cap ? "round" : undefined}
												style={{ stroke: line.color }}
											/>
										</svg>
										<span style={line.muted ? { color: "var(--ink3)" } : undefined}>
											{line.label}
										</span>
									</div>
								))}
							</div>
							<h3>Four kinds of family</h3>
							<p>
								Blood, marriage, godparents, and the neighbour everyone calls
								uncle. Each group has its own line, and a marriage is the
								heaviest stroke on the page while “lives with” is the faintest,
								so the tree reads at a glance and still tells the whole story.
							</p>
						</div>
						<div className={s.feature}>
							<div className={`${s.featureArt} ${s.chipArt}`} aria-hidden>
								<span className={s.chip}>Age 40–90</span>
								<span className={s.chip}>Hide: In-law</span>
								<span className={`${s.chip} ${s.chipOn}`}>Women only</span>
								<span className={s.chip}>Not: Nowak</span>
							</div>
							<h3>Filters that cut the noise</h3>
							<p>
								Hide a relationship type, narrow to an age range, show one side
								of the family. Whatever is left on screen is what gets exported.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section id="calendar" className={`${s.wrap} ${s.section} ${s.split}`}>
				<div className={s.splitCopy}>
					<div className={s.eyebrow}>Calendar export</div>
					<h2 className={s.h2}>
						Every birthday. Every remembrance day. In the calendar you already
						use.
					</h2>
					<p className={s.body}>
						One click turns the visible part of your tree into an .ics file: a
						yearly birthday for everyone living, and a yearly anniversary for
						everyone who has passed. Import it into Google Calendar, Apple
						Calendar or Outlook once, and it repeats forever.
					</p>
					<div className={s.pills}>
						<span className={s.pill}>
							<span className={s.dot} style={{ background: "var(--primary)" }} />
							Birthdays, yearly
						</span>
						<span className={s.pill}>
							<span className={s.dot} style={{ background: "var(--church)" }} />
							Remembrance anniversaries
						</span>
						<span className={s.pill}>
							<span className={s.dot} style={{ background: "var(--accent)" }} />
							Follows your filters
						</span>
					</div>
				</div>
				<div className={s.splitArt}>
					<div className={s.calendar}>
						<div className={s.calendarHead}>
							<div className={s.calendarMonth}>October</div>
							<div className={s.calendarFile}>kowalski-family.ics</div>
						</div>
						{CALENDAR.map((row) => (
							<div key={row.day} className={s.calendarRow}>
								<div className={s.calendarDay}>
									<div className={s.calendarDow} style={{ color: row.color }}>
										{row.dow}
									</div>
									<div className={s.calendarNum}>{row.day}</div>
								</div>
								<div>
									<div className={s.calendarTitle}>{row.title}</div>
									<div className={s.calendarMeta}>{row.meta}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className={s.private}>
				<div className={`${s.wrap} ${s.section} ${s.split}`}>
					<div className={s.splitCopy}>
						<div className={s.eyebrow}>Private by default</div>
						<h2 className={s.h2}>Yours, and whoever you invite.</h2>
						<p className={s.body}>
							There are no public trees and no search across families. You
							create a tree, you invite relatives by email, they can look but not
							touch. Change your mind and revoke access with one click.
						</p>
					</div>
					<div className={s.privateList} aria-hidden>
						<div className={s.privateRow}>
							<div className={s.privateAvatar} style={{ background: "#E0955E" }}>
								TK
							</div>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div className={s.who}>tomek (you)</div>
								<div className={s.role}>Creator · can edit everything</div>
							</div>
							<span className={s.privateBadge}>Owner</span>
						</div>
						<div className={s.privateRow}>
							<div className={s.privateAvatar} style={{ background: "#6FA3B0" }}>
								AN
							</div>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div className={s.who}>anna.nowak@…</div>
								<div className={s.role}>Invited · read-only</div>
							</div>
							<span className={s.privateRevoke}>Revoke</span>
						</div>
						<div className={`${s.privateRow} ${s.privateInvite}`}>
							<PlusIcon size={20} />
							Invite by email…
						</div>
					</div>
				</div>
			</section>

			<section id="mobile" className={`${s.wrap} ${s.section} ${s.split}`}>
				<div className={s.splitCopy}>
					<div className={s.eyebrow}>iPhone and Android</div>
					<h2 className={s.h2}>
						The tree in your pocket, for the moments you need it.
					</h2>
					<p className={s.body}>
						At a wedding and can’t place a face? Search a name and see how you are
						related. The app also keeps an upcoming list of birthdays and
						remembrance days, with a reminder the day before, and lets you add a
						new relative with a photo in a few taps.
					</p>
					<div className={s.stores}>
						<span className={s.store}>
							<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
								<path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8C6.1 7.4 3.7 9.3 3.7 13c0 1.1.2 2.3.6 3.4.6 1.6 2.6 5.5 4.7 5.4 1.1 0 1.8-.8 3.2-.8s2 .8 3.2.8c2.1 0 3.9-3.5 4.5-5.1-2.8-1.3-3.5-3.9-3.5-4.1zM13.9 5.7c1-1.2 1-2.9.9-3.5-1.4.1-2.9.9-3.7 1.9-.8.9-1.3 2.1-1.1 3.4 1.5.1 2.9-.7 3.9-1.8z" />
							</svg>
							<span className={s.storeText}>
								<span className={s.storeSmall}>Coming soon to the</span>
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
								<span className={s.storeSmall}>COMING SOON TO</span>
								<span className={s.storeBig}>Google Play</span>
							</span>
						</span>
					</div>
				</div>
				<div className={`${s.splitArt} ${s.phones}`} aria-hidden>
					<div className={s.phone}>
						<div className={`${s.phoneScreen} ${s.phoneLight}`}>
							<div className={s.phoneTitle}>Upcoming</div>
							{[
								{ t: "Maria turns 75", m: "Sat 3 Oct · in 8 days", c: "#A5584C" },
								{ t: "† Stanisław, 28 yrs", m: "Thu 15 Oct", c: "#3F6E7A", o: 0.6 },
								{ t: "Zofia turns 21", m: "Wed 28 Oct", c: "#A5584C" },
							].map((row) => (
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
									1976 · 50 · your mother’s cousin
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section id="how" className={s.band} style={{ borderBottom: 0 }}>
				<div className={`${s.wrap} ${s.section}`} style={{ display: "flex", flexDirection: "column", gap: 36 }}>
					<h2 className={s.h2}>How it works</h2>
					<div className={s.steps}>
						{STEPS.map((step, i) => (
							<div key={step.title} className={s.step}>
								<div className={s.stepNum}>{i + 1}</div>
								<h3>{step.title}</h3>
								<p>{step.body}</p>
							</div>
						))}
					</div>
					<div className={s.ctaRow} style={{ paddingTop: 8 }}>
						<Link href="/sign-up" className={s.ctaPrimary}>
							Start your tree, free
						</Link>
						<span className={s.fine} style={{ fontSize: 14 }}>
							Takes about a minute.
						</span>
					</div>
				</div>
			</section>

			<footer className={s.footer}>
				<div className={`${s.wrap} ${s.footerInner}`}>
					<div className={s.footerBrand}>
						<LogoMark size={22} />
						<span className={s.footerName}>Family Tree</span>
						<span>· Created by tomek7667</span>
					</div>
					<a href="mailto:family-tree@cyber-man.pl">family-tree@cyber-man.pl</a>
				</div>
			</footer>
		</div>
	);
}
