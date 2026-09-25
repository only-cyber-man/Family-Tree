import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { en } from "@/i18n/en";
import { pl } from "@/i18n/pl";
import { deletionRequestMailto, SUPPORT_EMAIL } from "@/lib/account";
import styles from "@/components/legal.module.css";

const Mail = () => <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;

const DeleteEn = () => (
	<>
		<section className={styles.section}>
			<h2>What gets deleted</h2>
			<ul>
				<li>Your account: username, display name, email address and password.</li>
				<li>
					Every tree you created, with all the people, photos, dates and
					relationships in it. People you invited lose access to those trees.
				</li>
				<li>Your access to trees other people shared with you.</li>
			</ul>
			<p>
				Nothing is kept after the deletion. Trees other people created are
				theirs and are not affected.
			</p>
		</section>

		<section className={styles.section}>
			<h2>How to delete it</h2>
			<div className={styles.card}>
				<p>
					<strong>In the app:</strong> Settings → Delete account.
				</p>
				<p>
					<strong>On the web:</strong> sign in and open your account page,
					then choose Delete account.
				</p>
				<div className={styles.actions}>
					<Link href="/account" className="btn btn-primary">
						Go to my account
					</Link>
				</div>
			</div>
			<div className={styles.card}>
				<p>
					<strong>Can&apos;t sign in?</strong> Email <Mail /> from the address on
					your account and ask for it to be deleted. We confirm by email and
					delete everything listed above within 30 days.
				</p>
				<div className={styles.actions}>
					<a href={deletionRequestMailto(en)} className="btn btn-outline">
						Email a deletion request
					</a>
				</div>
			</div>
		</section>

		<section className={styles.section}>
			<p>
				See the <Link href="/privacy">privacy policy</Link> for everything we
				store and why.
			</p>
		</section>
	</>
);

const DeletePl = () => (
	<>
		<section className={styles.section}>
			<h2>Co zostanie usunięte</h2>
			<ul>
				<li>Twoje konto: nazwa użytkownika, wyświetlana nazwa, adres e-mail i hasło.</li>
				<li>
					Wszystkie utworzone przez Ciebie drzewa wraz ze wszystkimi osobami,
					zdjęciami, datami i relacjami. Zaproszone przez Ciebie osoby tracą
					dostęp do tych drzew.
				</li>
				<li>Twój dostęp do drzew udostępnionych Ci przez inne osoby.</li>
			</ul>
			<p>
				Po usunięciu nic nie jest przechowywane. Drzewa utworzone przez inne
				osoby należą do nich i pozostają bez zmian.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Jak usunąć konto</h2>
			<div className={styles.card}>
				<p>
					<strong>W aplikacji:</strong> Ustawienia → Usuń konto.
				</p>
				<p>
					<strong>W przeglądarce:</strong> zaloguj się, otwórz stronę swojego
					konta i wybierz Usuń konto.
				</p>
				<div className={styles.actions}>
					<Link href="/account" className="btn btn-primary">
						Przejdź do mojego konta
					</Link>
				</div>
			</div>
			<div className={styles.card}>
				<p>
					<strong>Nie możesz się zalogować?</strong> Wyślij wiadomość na adres{" "}
					<Mail /> z adresu e-mail przypisanego do konta i poproś o jego
					usunięcie. Potwierdzimy to e-mailem i usuniemy wszystkie wymienione
					wyżej dane w ciągu 30 dni.
				</p>
				<div className={styles.actions}>
					<a href={deletionRequestMailto(pl)} className="btn btn-outline">
						Wyślij prośbę o usunięcie
					</a>
				</div>
			</div>
		</section>

		<section className={styles.section}>
			<p>
				W <Link href="/privacy">polityce prywatności</Link> znajdziesz pełną
				informację o tym, jakie dane przechowujemy i dlaczego.
			</p>
		</section>
	</>
);

/** A Record over Locale, so a missing language is a type error. */
export const DELETE_ACCOUNT_CONTENT: Record<Locale, () => JSX.Element> = {
	en: DeleteEn,
	pl: DeletePl,
};
