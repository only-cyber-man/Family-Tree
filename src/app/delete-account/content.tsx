import Link from "next/link";
import type { Locale } from "@/i18n/config";
import styles from "@/components/legal.module.css";

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
					<strong>Forgot your password?</strong> Choose &ldquo;Forgot?&rdquo; on
					the sign-in page to get a reset link by email, then sign in and
					delete your account.
				</p>
				<div className={styles.actions}>
					<Link href="/sign-in" className="btn btn-outline">
						Sign in
					</Link>
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
					<strong>Nie pamiętasz hasła?</strong> Na stronie logowania wybierz
					&bdquo;Nie pamiętasz?&rdquo;, a wyślemy Ci e-mailem link do zmiany
					hasła. Potem zaloguj się i usuń konto.
				</p>
				<div className={styles.actions}>
					<Link href="/sign-in" className="btn btn-outline">
						Zaloguj się
					</Link>
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
/** Maintained in English and Polish; the other languages read the English text. */
export const DELETE_ACCOUNT_CONTENT: Record<Locale, () => JSX.Element> = {
	en: DeleteEn,
	pl: DeletePl,
	es: DeleteEn,
	fr: DeleteEn,
	de: DeleteEn,
	pt: DeleteEn,
	af: DeleteEn,
	hi: DeleteEn,
};
