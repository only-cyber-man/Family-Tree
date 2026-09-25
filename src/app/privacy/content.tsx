import Link from "next/link";
import type { Locale } from "@/i18n/config";
import styles from "@/components/legal.module.css";

const EMAIL = "family-tree@cyber-man.pl";
const Mail = () => <a href={`mailto:${EMAIL}`}>{EMAIL}</a>;

const PrivacyEn = () => (
	<>
		<section className={styles.section}>
			<p>
				Family Tree lets you build a private family tree on the web at
				family-tree.cyber-man.pl and in the Family Tree app for Android and
				iOS (package <strong>pl.cyberman.familytree</strong>). This policy
				explains what we store, why, who can see it, and how to delete it. It
				is written by the developer, tomek7667, who runs the service and is
				responsible for your data. Questions: <Mail />.
			</p>
		</section>

		<section className={styles.section}>
			<h2>What we store</h2>
			<ul>
				<li>
					<strong>Your account:</strong> username, display name, email address
					and a password. The password is stored only as a secure hash.
				</li>
				<li>
					<strong>Your trees:</strong> the tree names you choose, and for each
					person you add: name, gender, birth date, optional death date, an
					optional photo and an optional note, plus the relationships you draw
					between people. You can also link a person to the account of someone
					who has access to the tree (for example, yourself).
				</li>
				<li>
					<strong>Sharing:</strong> the list of accounts you invite to view a
					tree. Inviting someone looks up whether an account exists for the
					email you type; it does not send them anything.
				</li>
			</ul>
			<p>
				We do not collect location, contacts, advertising identifiers,
				analytics or crash reports, and there is no advertising in the web
				site or the app.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Why we store it</h2>
			<p>
				Only to provide the service you signed up for: signing you in,
				showing your trees to you and to the people you invite, and sending
				the one-off email that verifies your address or resets your
				password. The legal basis is the performance of our agreement with
				you (Art. 6(1)(b) GDPR). We never sell your data or use it for
				advertising or profiling.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Information about your relatives</h2>
			<p>
				A family tree is, by its nature, information about other people. Add
				only what you are entitled to share, keep trees private unless the
				people in them would be comfortable with who you invite, and remove a
				person if they ask you to. You can edit or delete any person at any
				time.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Who can see your data</h2>
			<ul>
				<li>You, and the accounts you explicitly invite to a tree (read-only).</li>
				<li>
					The developer, only as far as needed to run, secure and fix the
					service.
				</li>
			</ul>
			<p>
				There are no public trees and no search across families. We do not
				share your data with third parties, except where the law requires
				it.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Where it is kept</h2>
			<p>
				Your account and trees are stored in a database on a server operated
				by the developer, and all traffic to it is encrypted (HTTPS). The web
				site sets one essential cookie, <code>pb_auth</code>, to keep you
				signed in, and two preference cookies, <code>ft_lang</code> and{" "}
				<code>ft_theme</code>, that remember the language and colour theme you
				pick. None of them is used for tracking.
			</p>
			<p>
				The mobile app additionally keeps on your phone: your sign-in token
				in the system&apos;s secure storage, a copy of recently opened trees
				so you can look at them offline, and your app settings. If you turn
				on reminders, birthday and remembrance notifications are scheduled
				locally on your phone; nothing about them is sent to us. The camera
				and photo library are used only when you choose to add a photo to a
				person.
			</p>
		</section>

		<section className={styles.section}>
			<h2>How long we keep it, and deleting it</h2>
			<p>
				We keep your data for as long as you have an account. You can delete
				single people, relationships or whole trees at any time. Deleting your
				account removes the account and every tree you created, with all the
				people, photos and relationships in them. Trees other people created
				and shared with you are theirs and stay with them.
			</p>
			<p>
				Delete your account in the app (Settings → Delete account), on the
				web on your <Link href="/account">account page</Link>, or by emailing{" "}
				<Mail /> from the address on your account. See{" "}
				<Link href="/delete-account">how to delete your account</Link>. Signing
				out of the app removes everything it stored on your phone.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Your rights</h2>
			<p>
				You can ask for a copy of your data, have it corrected or deleted,
				restrict or object to its processing, and receive it in a portable
				format. Write to <Mail />; we answer within 30 days. You can also
				complain to your data protection authority; in Poland that is the
				President of the Personal Data Protection Office (UODO).
			</p>
		</section>

		<section className={styles.section}>
			<h2>Children</h2>
			<p>
				Family Tree is not directed at children under 13. Accounts are for
				people aged 16 and over; teenagers aged 13 to 15 may use it with the
				permission of a parent or guardian. Children may of course appear in
				a tree their family builds.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Changes</h2>
			<p>
				If this policy changes, the new version will be published on this
				page with a new effective date. Significant changes will also be
				announced in the app.
			</p>
		</section>
	</>
);

const PrivacyPl = () => (
	<>
		<section className={styles.section}>
			<p>
				Family Tree pozwala tworzyć prywatne drzewo genealogiczne w przeglądarce,
				pod adresem family-tree.cyber-man.pl, oraz w aplikacji Family Tree na
				Androida i iOS (pakiet <strong>pl.cyberman.familytree</strong>). Ta
				polityka wyjaśnia, jakie dane przechowujemy, w jakim celu, kto może je
				zobaczyć i jak je usunąć. Jej autorem jest twórca aplikacji, tomek7667,
				który prowadzi serwis i odpowiada za Twoje dane. Pytania prosimy kierować
				na adres <Mail />.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Jakie dane przechowujemy</h2>
			<ul>
				<li>
					<strong>Twoje konto:</strong> nazwę użytkownika, wyświetlaną nazwę,
					adres e-mail i hasło. Hasło przechowujemy wyłącznie w postaci
					bezpiecznego skrótu (hash).
				</li>
				<li>
					<strong>Twoje drzewa:</strong> nadane przez Ciebie nazwy drzew, a dla
					każdej dodanej osoby: imię i nazwisko, płeć, datę urodzenia,
					opcjonalnie datę śmierci, zdjęcie i notatkę, a także relacje, które
					między osobami zaznaczysz. Możesz też powiązać osobę z kontem kogoś,
					kto ma dostęp do drzewa (na przykład z własnym kontem).
				</li>
				<li>
					<strong>Udostępnianie:</strong> listę kont, które zapraszasz do
					oglądania drzewa. Zaproszenie sprawdza jedynie, czy istnieje konto
					przypisane do wpisanego adresu e-mail; zapraszana osoba nie otrzymuje
					żadnej wiadomości.
				</li>
			</ul>
			<p>
				Nie zbieramy danych o lokalizacji, kontaktów, identyfikatorów
				reklamowych, danych analitycznych ani raportów o awariach, a na stronie
				internetowej i w aplikacji nie ma reklam.
			</p>
		</section>

		<section className={styles.section}>
			<h2>W jakim celu je przechowujemy</h2>
			<p>
				Wyłącznie po to, aby świadczyć usługę, do której założono konto:
				umożliwić Ci logowanie, pokazywać Twoje drzewa Tobie i zaproszonym przez
				Ciebie osobom oraz wysłać jednorazową wiadomość e-mail potwierdzającą
				Twój adres lub umożliwiającą zresetowanie hasła. Podstawą prawną jest
				wykonanie zawartej z Tobą umowy (art. 6 ust. 1 lit. b RODO). Nigdy nie
				sprzedajemy Twoich danych ani nie wykorzystujemy ich do reklamy lub
				profilowania.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Informacje o Twoich krewnych</h2>
			<p>
				Drzewo genealogiczne z natury zawiera informacje o innych osobach.
				Dodawaj tylko te informacje, którymi masz prawo się dzielić, nie
				udostępniaj drzewa nikomu, na kogo nie zgodziłyby się osoby w nim
				ujęte, i usuń osobę, jeśli Cię o to poprosi. W każdej chwili możesz
				edytować lub usunąć dowolną osobę.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Kto ma dostęp do Twoich danych</h2>
			<ul>
				<li>Ty oraz konta, które wyraźnie zaprosisz do drzewa (tylko do odczytu).</li>
				<li>
					Twórca aplikacji – wyłącznie w zakresie niezbędnym do prowadzenia,
					zabezpieczania i naprawiania serwisu.
				</li>
			</ul>
			<p>
				Nie ma publicznych drzew ani wyszukiwania między rodzinami. Nie
				przekazujemy Twoich danych osobom trzecim, chyba że wymagają tego
				przepisy prawa.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Gdzie są przechowywane</h2>
			<p>
				Twoje konto i drzewa są przechowywane w bazie danych na serwerze
				utrzymywanym przez twórcę aplikacji, a cała komunikacja z nim jest
				szyfrowana (HTTPS). Strona internetowa zapisuje jeden niezbędny plik
				cookie, <code>pb_auth</code>, który utrzymuje sesję logowania, oraz dwa
				pliki cookie z preferencjami, <code>ft_lang</code> i{" "}
				<code>ft_theme</code>, które zapamiętują wybrany język i motyw
				kolorystyczny. Żaden z nich nie służy do śledzenia.
			</p>
			<p>
				Aplikacja mobilna dodatkowo przechowuje na Twoim telefonie: token
				logowania w bezpiecznym magazynie systemu, kopię ostatnio otwieranych
				drzew, aby można je było przeglądać offline, oraz ustawienia aplikacji.
				Jeśli włączysz przypomnienia, powiadomienia o urodzinach i rocznicach
				śmierci są planowane lokalnie na telefonie i nic na ich temat nie
				trafia do nas. Z aparatu i galerii zdjęć aplikacja korzysta tylko
				wtedy, gdy zdecydujesz się dodać zdjęcie osoby.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Jak długo je przechowujemy i jak je usunąć</h2>
			<p>
				Przechowujemy Twoje dane tak długo, jak długo masz konto. W każdej
				chwili możesz usunąć pojedyncze osoby, relacje lub całe drzewa.
				Usunięcie konta usuwa samo konto i wszystkie utworzone przez Ciebie
				drzewa wraz ze wszystkimi osobami, zdjęciami i relacjami. Drzewa
				utworzone przez inne osoby i udostępnione Tobie należą do nich i u nich
				pozostają.
			</p>
			<p>
				Konto możesz usunąć w aplikacji (Ustawienia → Usuń konto), w
				przeglądarce na <Link href="/account">stronie swojego konta</Link> lub
				wysyłając wiadomość na adres <Mail /> z adresu e-mail przypisanego do
				konta. Zobacz też,{" "}
				<Link href="/delete-account">jak usunąć konto</Link>. Wylogowanie z
				aplikacji usuwa wszystko, co zapisała ona na telefonie.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Twoje prawa</h2>
			<p>
				Możesz zażądać kopii swoich danych, ich sprostowania lub usunięcia,
				ograniczenia ich przetwarzania lub wnieść sprzeciw wobec przetwarzania,
				a także otrzymać je w formacie umożliwiającym ich przeniesienie. Napisz
				na adres <Mail /> – odpowiadamy w ciągu 30 dni. Możesz także złożyć
				skargę do organu ochrony danych osobowych; w Polsce jest nim Prezes
				Urzędu Ochrony Danych Osobowych (UODO).
			</p>
		</section>

		<section className={styles.section}>
			<h2>Dzieci</h2>
			<p>
				Family Tree nie jest przeznaczony dla dzieci poniżej 13 lat. Konto
				mogą założyć osoby, które ukończyły 16 lat; młodzież w wieku 13–15
				lat może korzystać z aplikacji za zgodą rodzica lub opiekuna. Dzieci
				mogą oczywiście pojawiać się w drzewie tworzonym przez ich rodzinę.
			</p>
		</section>

		<section className={styles.section}>
			<h2>Zmiany</h2>
			<p>
				Jeśli ta polityka się zmieni, nowa wersja zostanie opublikowana na tej
				stronie z nową datą obowiązywania. O istotnych zmianach poinformujemy
				również w aplikacji.
			</p>
		</section>
	</>
);

/** A Record over Locale, so a missing language is a type error. */
export const PRIVACY_CONTENT: Record<Locale, () => JSX.Element> = { en: PrivacyEn, pl: PrivacyPl };
