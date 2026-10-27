import type { Dict, KinGender, KinTerm, KinWord, StepMove, TypeText } from "./en";
import { form } from "./plural";

// हिन्दी. Typed as Dict: a missing or mistyped key does not compile.
//
// Register: the respectful "आप" throughout, everyday vocabulary with the
// loanwords Indian apps use (ईमेल, पासवर्ड, फ़ोटो, सेटिंग्स), nukta on ज़/फ़/ख़,
// Western digits (numbers are inserted by code) and the danda "।" as the full stop.

const gw = (g: KinGender, m: string, f: string) => (g === "male" ? m : f);
const hiForm = (n: number, one: string, other: string) => form("hi", n, one, other);
const saal = (n: number) => `${n} साल`;
const log = (n: number) => `${n} ${hiForm(n, "व्यक्ति", "लोग")}`;

/** Ordinal: पहला/पहली … 5वाँ/5वीं. Masculine agrees with जन्मदिन, feminine with पुण्यतिथि. */
const ordinal = (n: number, feminine = false): string => {
	const special: Record<number, [string, string]> = {
		1: ["पहला", "पहली"],
		2: ["दूसरा", "दूसरी"],
		3: ["तीसरा", "तीसरी"],
		4: ["चौथा", "चौथी"],
		6: ["छठा", "छठी"],
	};
	const s = special[n];
	if (s) return feminine ? s[1] : s[0];
	return `${n}${feminine ? "वीं" : "वाँ"}`;
};

/**
 * A noun of a relationship chain: direct form, oblique form (the form before
 * का/की/के: बेटा → बेटे), gender, and whether it takes the honorific plural
 * (पिता, पति: "आपके पिता").
 */
interface Noun {
	nom: string;
	obl: string;
	f: boolean;
	hon: boolean;
}
const N = (nom: string, obl = nom, f = false, hon = false): Noun => ({ nom, obl, f, hon });

function noun(w: KinWord): Noun {
	const f = w.gender === "female";
	switch (w.rel) {
		case "parent":
			return f ? N("माँ", "माँ", true) : N("पिता", "पिता", false, true);
		case "child":
			return f ? N("बेटी", "बेटी", true) : N("बेटा", "बेटे");
		case "sibling":
			return f ? N("बहन", "बहन", true) : N("भाई");
		case "spouse":
			return f ? N("पत्नी", "पत्नी", true) : N("पति", "पति", false, true);
		case "partner":
			return N("साथी", "साथी", f);
		default: {
			// otherNoun() puts the oblique form in `gen`; unknown types keep their English label.
			const nom = w.noun?.nom ?? "रिश्तेदार";
			return N(nom, w.noun?.gen || nom, f, /पिता$/.test(nom));
		}
	}
}

/**
 * का/की/के (with "आप" in front: आपका/आपकी/आपके) before a noun. The marker agrees
 * with the noun that follows it: feminine → की; honorific plural, or oblique
 * because another postposition follows → के; otherwise का.
 */
const poss = (n: Noun, oblique: boolean, prefix = "") => prefix + (n.f ? "की" : n.hon || oblique ? "के" : "का");

/** Terms that take the honorific plural after "आप": "आपके पिता", "आपके ससुर". */
const HONORIFIC = new Set(["पिता", "पति", "ससुर", "दामाद", "सौतेले पिता", "धर्मपिता"]);

export const hi: Dict = {
	lang: "hi",
	locale: "hi-IN",

	common: {
		cancel: "रद्द करें",
		done: "हो गया",
		save: "सेव करें",
		saving: "सेव हो रहा है…",
		close: "बंद करें",
		back: "वापस",
		change: "बदलें",
		tryAgain: "फिर से कोशिश करें",
		add: "जोड़ें",
		create: "बनाएँ",
		creating: "बन रहा है…",
		edit: "बदलाव करें",
		remove: "हटाएँ",
		keep: "रहने दें",
		continue: "आगे बढ़ें",
		undo: "पहले जैसा करें",
		openSettings: "सेटिंग्स खोलें",
		settings: "सेटिंग्स",
		signIn: "साइन इन करें",
		you: "आप",
		loading: "लोड हो रहा है",
		familyTree: "Family Tree",
		owner: "मालिक",
		sharedWithYou: "आपके साथ शेयर किया गया",
		male: "पुरुष",
		female: "महिला",
		show: "दिखाएँ",
		hide: "छिपाएँ",
		showPassword: "पासवर्ड दिखाएँ",
		hidePassword: "पासवर्ड छिपाएँ",
		chooseDate: "तारीख़ चुनें",
		dateA11y: (label, value) => `${label}: ${value}। बदलें`,
		closeDatePicker: "तारीख़ चुनना बंद करें",
		year: "साल",
		yearHint: "किसी साल पर सीधे जाने के लिए वह साल लिखें",
		yearExample: "जैसे 1742",
		removeFilter: (label) => `फ़िल्टर हटाएँ: ${label}`,
		searchByName: "नाम से खोजें",
		noOneCalled: (q) => `“${q}” नाम का कोई नहीं है।`,
		noOneToChoose: "चुनने के लिए अभी कोई नहीं है।",
		selected: "चुना गया",
		reminderScheduled: "रिमाइंडर सेट है",
		noReminder: "कोई रिमाइंडर नहीं",
		range: (lo, hi) => `${lo} से ${hi} तक`,
	},

	offline: {
		banner: "आप ऑफ़लाइन हैं। इस वंश वृक्ष की आख़िरी सहेजी हुई कॉपी दिखाई जा रही है।",
		short: "आप ऑफ़लाइन हैं।",
		write: "आप ऑफ़लाइन हैं — बदलाव सेव नहीं किए जा सकते।",
	},

	save: {
		failedOffline: (what) => `${what} को सेव नहीं किया जा सका: आप ऑफ़लाइन हैं या सर्वर से संपर्क नहीं हो पा रहा। कुछ भी खोया नहीं है; फिर से कोशिश करें।`,
		failed: (what, reason) => `${what} को सेव नहीं किया जा सका। ${reason}`,
		noTree: "कोई वंश वृक्ष खुला नहीं है, इसलिए कुछ सेव नहीं हुआ। कोई वंश वृक्ष चुनें और फिर से कोशिश करें।",
		theChanges: "बदलाव",
		thisPerson: "इस व्यक्ति",
		theRelationship: "इस रिश्ते",
		theTree: "इस वंश वृक्ष",
	},

	errors: {
		network: "कनेक्शन नहीं है। अपना इंटरनेट जाँचें और फिर से कोशिश करें।",
		generic: "कुछ गड़बड़ हो गई।",
		notSignedIn: "आपने साइन इन नहीं किया है।",
		passwordsDontMatch: "पासवर्ड मेल नहीं खाते।",
		sessionExpired: "आपका सेशन ख़त्म हो गया है। कृपया फिर से साइन इन करें।",
		shareUnavailable: "इस डिवाइस पर शेयर करना उपलब्ध नहीं है।",
	},

	tabs: {
		home: "होम",
		tree: "वृक्ष",
		add: "जोड़ें",
		find: "खोजें",
		dates: "तारीख़ें",
		settings: "सेटिंग्स",
		addPerson: "व्यक्ति जोड़ें",
		findPerson: "किसी को खोजें",
	},

	prefs: {
		language: "भाषा",
		languageSystem: "सिस्टम",
		chooseLanguage: "भाषा चुनें",
		appearance: "दिखावट",
		theme: "थीम",
		system: "सिस्टम",
		light: "हल्की",
		dark: "गहरी",
	},

	onboarding: {
		title1: "आपका परिवार, एक ग्राफ़ की तरह।",
		body1: "लोग कार्ड हैं, रिश्ते रेखाएँ, और पीढ़ियाँ जन्म के साल के हिसाब से कतार में लगती हैं। निजी — सिर्फ़ न्योते से शेयर होता है।",
		title2: "कोई जन्मदिन या पुण्यतिथि न छूटे।",
		body2: "एक दिन पहले हल्का सा रिमाइंडर। सब कुछ आपके फ़ोन पर ही रहता है; हमें कुछ नहीं भेजा जाता।",
		page: (n, total) => `${total} में से पेज ${n}`,
		haveAccount: "मेरा खाता पहले से है",
		turnOnReminders: "रिमाइंडर चालू करें",
		notNow: "अभी नहीं",
		previewTitle1: "कल Maria दादी का 75वाँ जन्मदिन है",
		previewWhen1: "कल",
		previewBody1: "ख़ास जन्मदिन है। Maria को फ़ोन करेंगे?",
		previewTitle2: "† Stanisław Kowalski, 28वीं पुण्यतिथि",
		previewWhen2: "15 अक्टू॰",
	},

	auth: {
		welcomeBack: "फिर से स्वागत है",
		signInSubtitle: "अपने Family Tree खाते से साइन इन करें।",
		usernameOrEmail: "यूज़रनेम या ईमेल",
		password: "पासवर्ड",
		forgot: "पासवर्ड भूल गए?",
		newHere: "यहाँ नए हैं?",
		createAccount: "खाता बनाएँ",
		enterBoth: "अपना यूज़रनेम या ईमेल और पासवर्ड डालें।",
		wrongCredentials: "यूज़रनेम या पासवर्ड सही नहीं है।",
		forgotHowTo: "पहले बॉक्स में अपना ईमेल पता लिखें, फिर “पासवर्ड भूल गए?” पर दोबारा टैप करें।",
		resetTitle: "पासवर्ड रीसेट करें",
		resetConfirm: (email) => `${email} पर रीसेट लिंक भेजें?`,
		send: "भेजें",
		checkInbox: "अपना इनबॉक्स देखें",
		checkInboxBody: "अगर इस ईमेल से कोई खाता है, तो रीसेट लिंक भेज दिया गया है।",
		couldntSend: "भेजा नहीं जा सका",
		signInAgain: "कृपया फिर से साइन इन करें",
		sessionEnded: "आपका सेशन ख़त्म हो गया। कुछ भी खोया नहीं है; वंश वृक्ष अब भी यहीं है।",
		passwordFor: (who) => `${who} का पासवर्ड`,
		differentAccount: "दूसरा खाता इस्तेमाल करें",
		startTree: "अपना वंश वृक्ष शुरू करें",
		freePrivate: "मुफ़्त, निजी, बिना विज्ञापन।",
		username: "यूज़रनेम",
		displayName: "दिखने वाला नाम (वैकल्पिक)",
		yourName: "आपका नाम",
		email: "ईमेल",
		confirmPassword: "पासवर्ड दोबारा लिखें",
		step1: "पासवर्ड और उसकी पुष्टि अगले चरण में। चरण 1 / 2।",
		step2: (email) => `हम ${email} पर एक सत्यापन ईमेल भेजेंगे। चरण 2 / 2।`,
		usernameRule: "कम से कम 3 अक्षर या अंक, बिना स्पेस के।",
		emailInvalid: "यह ईमेल पता जैसा नहीं लगता।",
		passwordRule: "कम से कम 8 अक्षर इस्तेमाल करें।",
		createAccountButton: "खाता बनाएँ",
		agreePrefix: "खाता बनाकर आप ",
		privacyPolicy: "गोपनीयता नीति",
		agreeSuffix: " से सहमत होते हैं।",
	},

	home: {
		offline: "आप ऑफ़लाइन हैं",
		couldntLoadTrees: "आपके वंश वृक्ष लोड नहीं हो सके",
		connectFirstTime: "अपने वंश वृक्ष पहली बार देखने के लिए इंटरनेट से जुड़ें।",
		noTrees: "अभी कोई वंश वृक्ष नहीं है",
		noTreesBody: "अपने और अपने माता-पिता से शुरू करें। रिश्तेदारों के न्योते यहाँ अपने आप दिखेंगे।",
		createFirst: "अपना पहला वंश वृक्ष बनाएँ",
		treeUnavailable: "यह वंश वृक्ष उपलब्ध नहीं है",
		couldntOpen: "यह वंश वृक्ष खुल नहीं सका",
		treeUnavailableBody: "हो सकता है इसे हटा दिया गया हो, या इसके मालिक ने इसे आपके साथ शेयर करना बंद कर दिया हो।",
		noCopy: "इस फ़ोन पर इस वंश वृक्ष की कोई कॉपी अभी नहीं है। इंटरनेट से जुड़ें और फिर से कोशिश करें।",
		chooseTree: "वंश वृक्ष चुनें",
		switchTree: "वंश वृक्ष बदलें",
		lookingFor: "किसे ढूँढ रहे हैं?",
		upcoming: "आने वाली तारीख़ें",
		seeAll: "सभी देखें",
		noUpcoming: "कोई आने वाली तारीख़ नहीं",
		noUpcomingEmpty: "वंश वृक्ष में लोग जुड़ने पर जन्मदिन और पुण्यतिथियाँ यहाँ दिखेंगी।",
		noUpcomingYear: "अगले बारह महीनों में कुछ नहीं है।",
		noOne: "यहाँ अभी कोई नहीं है",
		addYourself: "पहले ख़ुद को जोड़ें। बाकी हर व्यक्ति वंश वृक्ष में पहले से मौजूद किसी से जुड़ता है।",
		ownerAddedNoOne: "मालिक ने अभी किसी को नहीं जोड़ा है।",
		addFirst: "पहला व्यक्ति जोड़ें",
		quick: "झटपट",
		addPerson: "व्यक्ति जोड़ें",
		linkTwo: "दो लोगों को जोड़ें",
		aboutTree: "यह वंश वृक्ष",
		detailHint: "बाईं ओर किसी तारीख़ पर टैप करें, वह व्यक्ति यहाँ दिखेगा।",
	},

	tree: {
		loading: "वंश वृक्ष लोड हो रहा है…",
		removeTitle: (name) => `${name} को हटाएँ?`,
		removeBody: "उनके रिश्ते भी हट जाएँगे। इसे पहले जैसा नहीं किया जा सकता।",
		removed: (name) => `${name} को हटा दिया गया`,
		addRelationship: "रिश्ता जोड़ें",
		focusedOn: (name) => `${name} पर फ़ोकस है`,
		parents: "माता-पिता",
		partner: "साथी",
		partners: "साथी",
		children: "बच्चे",
		exitFocus: "फ़ोकस से बाहर",
		search: "खोजें",
		filters: "फ़िल्टर",
		filtersActive: (n) => `फ़िल्टर, ${n} चालू`,
		goUpTo: (name) => `ऊपर ${name} पर जाएँ`,
		resetView: "व्यू रीसेट करें",
		fitAll: "पूरा वंश वृक्ष दिखाएँ",
		allFiltered: "फ़िल्टर ने सबको छिपा दिया है",
		clearFilters: "फ़िल्टर हटाएँ",
		canvasA11y: (n) => `वंश वृक्ष, ${log(n)}। किसी को ढूँढने के लिए खोज का इस्तेमाल करें।`,
		bandLabel: (start, end) => `${start}–${end}`,
		bandLabelShort: (start, end) => `${start}–${String(end).slice(2)}`,
		legend: "संकेत",
		legendBio: "ख़ून का रिश्ता",
		legendMarried: "विवाहित",
		legendLivesWith: "साथ रहते हैं",
		legendInLaw: "वैवाहिक",
		legendChurch: "धार्मिक",
		legendOther: "अन्य",
		youPill: "आप",
		legendYou: "आप",
		panelHint: "किसी व्यक्ति पर टैप करें, उसकी जानकारी यहाँ दिखेगी।",
		panelTitle: "जानकारी",
	},

	person: {
		gone: "यह व्यक्ति अब वंश वृक्ष में नहीं है।",
		ageAlive: (g, age) => `${g} · ${saal(age)}`,
		ageDeceased: (g, age, wouldBe) => `${g} · निधन के समय ${saal(age)}${wouldBe ? ` · आज उम्र ${saal(wouldBe)} होती` : ""}`,
		you: "आप",
		focus: "फ़ोकस",
		focusOnTree: "वंश वृक्ष में देखें",
		howRelated: "हमारा क्या रिश्ता है?",
		turns: (n) => `${ordinal(n)} जन्मदिन`,
		remembranceDay: "पुण्यतिथि",
		remindMe: "याद दिलाएँ",
		noRelationshipsOwner: "अभी कोई रिश्ता नहीं है। इन्हें वंश वृक्ष से जोड़ने के लिए एक रिश्ता जोड़ें।",
		noRelationships: "अभी कोई रिश्ता नहीं है।",
		dragUp: "सभी रिश्ते देखने के लिए ऊपर खींचें",
		removedFromTree: (name) => `${name} को वंश वृक्ष से हटा दिया गया`,
		couldntRemove: (name, reason) => `${name} को हटाया नहीं जा सका। ${reason}`,
		open: "खोलें",
		removeRelationship: "रिश्ता हटाएँ",
		relationshipRemoved: "रिश्ता हटा दिया गया",
		sharedBy: (email) => `${email ? `${email} ने इसे आपके साथ शेयर किया है` : "इसे आपके साथ शेयर किया गया है"}। बदलाव सिर्फ़ मालिक कर सकते हैं।`,
		removeA11y: (name) => `${name} को हटाएँ`,
		thisIsYou: "यह आप हैं",
		linkedTo: (email) => `${email} से जुड़ा हुआ`,
		linkedToAccount: "एक खाते से जुड़ा हुआ",
		note: "नोट",
	},

	path: {
		whichIsYou: "इनमें से आप कौन हैं?",
		needMe: (first) =>
			`यह बताने के लिए कि ${first} से आपका क्या रिश्ता है, ऐप को जानना होगा कि इस वंश वृक्ष में आप कौन हैं। आप एक बार चुनते हैं; यह इसी फ़ोन पर रहता है।`,
		chooseWho: "बताएँ कि आप कौन हैं",
		notConnected: "अभी आपसे जुड़ाव नहीं है",
		notConnectedBody: (name) => `इस वंश वृक्ष में आपके और ${name} के बीच रिश्तों की कोई कड़ी नहीं है। कोई रिश्ता जोड़ने से आप जुड़ जाएँगे।`,
		open: (first) => `${first} को खोलें`,
		stepsThrough: (steps, people) => `${steps} कदम, ${people} ${hiForm(people, "व्यक्ति", "लोगों")} से होकर।`,
		familyOnly: "सिर्फ़ ख़ून और शादी के रिश्तों से सबसे छोटा रास्ता।",
		anyLinks: "पारिवारिक रिश्ते आपको नहीं जोड़ते, इसलिए दूसरे दर्ज रिश्तों का इस्तेमाल किया गया है।",
		youName: (name) => `आप · ${name}`,
		showOnTree: "वंश वृक्ष में दिखाएँ",
		meNote: (name) =>
			`“यह मैं हूँ” (${name}) सिर्फ़ इसी फ़ोन पर सहेजा गया है, क्योंकि शेयर किए गए वंश वृक्ष में अभी इसके लिए कोई जगह नहीं है। इसे सेटिंग्स में बदलें।`,
		notConnectedShort: "अभी आपसे जुड़ा नहीं है",
	},

	search: {
		placeholder: "किसे ढूँढ रहे हैं?",
		a11y: "लोगों को खोजें",
		chooseWho: "बताएँ कि आप कौन हैं",
		chooseWhoBody: "ऐप को बताएँ कि कौन सा व्यक्ति आप हैं, ताकि आप देख सकें कि हर किसी से आपका क्या रिश्ता है। यह चुनाव इसी फ़ोन पर रहता है।",
		noOne: (q) => `इस वंश वृक्ष में “${q}” नाम का कोई नहीं है।`,
	},

	addPerson: {
		add: "व्यक्ति जोड़ें",
		edit: "व्यक्ति की जानकारी बदलें",
		viewerOnly: "यह वंश वृक्ष आपके साथ सिर्फ़ देखने के लिए शेयर किया गया है। लोग सिर्फ़ इसके मालिक जोड़ सकते हैं।",
		chooseTreeFirst: "पहले कोई वंश वृक्ष चुनें या बनाएँ।",
		gone: "यह व्यक्ति अब वंश वृक्ष में नहीं है।",
		nameRequired: "नाम ज़रूरी है।",
		chooseGender: "लिंग चुनें।",
		birthRequired: "जन्म की तारीख़ ज़रूरी है।",
		deathRequired: "निधन की तारीख़ जोड़ें, या इसे बंद कर दें।",
		deathBeforeBirth: "निधन की तारीख़ जन्म की तारीख़ से पहले की है।",
		linkIncomplete: "रिश्ता और व्यक्ति दोनों चुनें, या लिंक हटा दें।",
		saved: (first) => `${first} को सेव कर लिया गया`,
		linkFailed: (first, reason) => `${first} को जोड़ दिया गया, लेकिन रिश्ता सेव नहीं हो सका। ${reason}`,
		added: (first) => `${first} को वंश वृक्ष में जोड़ दिया गया`,
		changePhoto: "फ़ोटो बदलें",
		addPhoto: "फ़ोटो जोड़ें",
		cameraOff: "कैमरे की अनुमति बंद है",
		cameraOffBody: "आप अब भी गैलरी से फ़ोटो चुन सकते हैं, या सेटिंग्स में कैमरे की अनुमति दे सकते हैं।",
		useGallery: "गैलरी से लें",
		takePhoto: "फ़ोटो खींचें",
		fromGallery: "गैलरी से चुनें",
		fullName: "पूरा नाम",
		namePlaceholder: "जैसे सीमा शर्मा",
		gender: "लिंग",
		birthDate: "जन्म की तारीख़",
		passedAway: "निधन हो चुका है",
		passedAwayHint: "निधन की तारीख़ और पुण्यतिथि जोड़ता है",
		deathDate: "निधन की तारीख़",
		linkTo: "किसी से जोड़ें",
		linkOptional: "वैकल्पिक, एक कदम बचाता है",
		linkExample: (name) => `जैसे ${name} की माँ`,
		newPerson: "नया व्यक्ति",
		parentNote: (child) => `नया व्यक्ति माता/पिता है; ${child} उनकी संतान है।`,
		theChosen: "चुना गया व्यक्ति",
		dontLink: "अभी न जोड़ें",
		note: "नोट",
		notePlaceholder: "कुछ भी जो याद रखने लायक हो",
		noteCount: (n, max) => `${n}/${max}`,
		linkedAccount: "जुड़ा हुआ खाता",
		linkedHint: "यह व्यक्ति कौन सा Family Tree खाता है? सिर्फ़ वही खाते दिखते हैं जो इस वंश वृक्ष को देख सकते हैं।",
		linkedNone: "कोई नहीं",
		linkedMe: (email) => (email ? `मैं (${email})` : "मैं"),
		linkedConflict: (name) => `${name} पहले से इस खाते से जुड़ा हुआ है।`,
		loadingAccounts: "खाते लोड हो रहे हैं…",
	},

	addRel: {
		title: "रिश्ता जोड़ें",
		viewerOnly: "रिश्ते सिर्फ़ इस वंश वृक्ष के मालिक जोड़ सकते हैं।",
		chooseBoth: "दोनों लोग चुनें और यह भी कि उनका क्या रिश्ता है।",
		different: "दो अलग-अलग लोग चुनें।",
		duplicate: "यह रिश्ता पहले से वंश वृक्ष में है।",
		added: "रिश्ता जोड़ दिया गया",
		isRelatedTo: "इनके रिश्तेदार हैं",
		from: "किसकी ओर से",
		to: "किसके साथ",
		relation: "रिश्ता",
		changeFrom: "बदलें कि रिश्ता किसकी ओर से है",
		more: "और…",
		fewer: "कम",
		// Hindi is verb-final ("Maria, Tomasz की माँ हैं"), but the preview is assembled
		// as "<A> <verb><join><B>." with B last. So every verb phrase points forward
		// with the pronoun इन ("इनकी माँ हैं" = "is the mother of this person") and the
		// colon then names that person: "Maria इनकी माँ हैं: Tomasz।" The same phrases
		// read correctly as path-step labels, where the next person follows below.
		sentence: (a, verb, b) => `${a} ${verb}: ${b}।`,
		sentenceJoin: ": ",
	},

	filters: {
		title: "फ़िल्टर",
		clearAll: "सब हटाएँ",
		show: (shown, total) => `${total} ${hiForm(total, "व्यक्ति", "लोगों")} में से ${shown} दिखाएँ`,
		hideTypes: "रिश्तों के प्रकार छिपाएँ",
		hidden: "छिपे हुए",
		shown: "दिख रहे",
		age: "उम्र",
		ageRange: "उम्र की सीमा",
		gender: "लिंग",
		everyone: "सभी",
		men: "पुरुष",
		women: "महिलाएँ",
		excludeByName: "नाम से बाहर रखें",
		excludeHint: "कई नाम अल्पविराम (,) से अलग करें।",
		excludePlaceholder: "शर्मा, राम",
		chipHide: (label) => `छिपाएँ: ${label}`,
		chipAge: (lo, hi) => `उम्र ${lo}–${hi}`,
		chipMen: "सिर्फ़ पुरुष",
		chipWomen: "सिर्फ़ महिलाएँ",
		chipNot: (names) => `छोड़कर: ${names}`,
		chipOnly: (names) => `सिर्फ़: ${names}`,
		includeByName: "सिर्फ़ वे नाम दिखाएँ जिनमें हो",
		includeHint: "कई नामों में से कोई भी, अल्पविराम से अलग किए हुए।",
		includePlaceholder: "वर्मा, अनु",
	},

	trees: {
		title: "आपके वंश वृक्ष",
		giveName: "पहले वंश वृक्ष को एक नाम दें।",
		created: (name) => `“${name}” बन गया`,
		nameLabel: "नए वंश वृक्ष का नाम",
		namePlaceholder: "मेरा वंश वृक्ष",
		newTree: "नया वंश वृक्ष",
		people: (n) => log(n),
		updated: (rel) => `${rel} अपडेट हुआ`,
		viewers: (n) => `${n} दर्शक`,
		onlyYou: "सिर्फ़ आप",
		by: (email) => `मालिक: ${email}`,
		active: "सक्रिय ✓",
	},

	invited: {
		title: "यह वंश वृक्ष कौन देख सकता है",
		subtitle: "आमंत्रित लोग देख सकते हैं, बदलाव नहीं कर सकते।",
		thatsYou: "यह आप हैं; यह वंश वृक्ष पहले से आपका है।",
		already: "वे इस वंश वृक्ष को पहले से देख सकते हैं।",
		canSee: (email) => `${email} अब यह वंश वृक्ष देख सकते हैं`,
		noAccount: "इस ईमेल से कोई Family Tree खाता नहीं है। उनसे पहले साइन अप करने को कहें, फिर उन्हें आमंत्रित करें।",
		thisPerson: "इस व्यक्ति",
		stopTitle: (who) => `${who} के साथ शेयर करना बंद करें?`,
		stopBody: "वे अब यह वंश वृक्ष नहीं देख पाएँगे।",
		revoke: "पहुँच हटाएँ",
		revoked: (who) => `${who} अब यह वंश वृक्ष नहीं देख सकते`,
		emailPlaceholder: "naam@example.com",
		emailA11y: "जिसे आमंत्रित करना है, उसका ईमेल",
		invite: "आमंत्रित करें",
		note: "उनके पास इसी ईमेल से Family Tree खाता पहले से होना चाहिए। कोई ईमेल नहीं भेजा जाता; वंश वृक्ष बस उनकी सूची में दिखने लगता है।",
		youSuffix: (name) => `${name} (आप)`,
		creator: "निर्माता",
		viewer: "दर्शक",
		viewerYou: "दर्शक · आप",
		unknown: "अनजान खाता",
		revokeA11y: (email) => `${email} की पहुँच हटाएँ`,
		onlyYou: "यह वंश वृक्ष सिर्फ़ आप देख सकते हैं।",
	},

	dates: {
		title: "तारीख़ें",
		exportIcs: ".ics एक्सपोर्ट करें",
		all: "सभी",
		birthdays: "जन्मदिन",
		remembrance: "पुण्यतिथियाँ",
		quietReminder: "एक दिन पहले हल्का सा रिमाइंडर पाएँ",
		turnOn: "रिमाइंडर चालू करें",
		localOnly: "रिमाइंडर वंश वृक्ष की तारीख़ों से इसी फ़ोन पर सेट होते हैं। सर्वर को कुछ नहीं भेजा जाता।",
		detailHint: "किसी तारीख़ पर टैप करें, वह व्यक्ति यहाँ दिखेगा।",
		none: "कोई आने वाली तारीख़ नहीं",
		noneBody: "वंश वृक्ष में लोग जुड़ने पर जन्मदिन और पुण्यतिथियाँ यहाँ दिखेंगी।",
		footnote:
			"घंटी = एक दिन पहले सुबह 9:00 बजे का लोकल रिमाइंडर (पुण्यतिथि: उसी दिन)। ख़ास उम्र (18, 50, 55, 60…) पर एक हफ़्ता पहले दूसरा रिमाइंडर भी मिल सकता है। एक्सपोर्ट में वे लोग शामिल होते हैं जो अभी वंश वृक्ष में दिख रहे हैं।",
	},

	settings: {
		title: "सेटिंग्स",
		signOutTitle: "साइन आउट करें?",
		signOutBody: "रिमाइंडर हटा दिए जाएँगे और आपके वंश वृक्षों की कॉपियाँ इस फ़ोन से मिटा दी जाएँगी।",
		signOut: "साइन आउट करें",
		account: "खाता",
		accountBody: "पासवर्ड वेबसाइट पर बदला जाता है।",
		openWebsite: "वेबसाइट खोलें",
		reminders: "रिमाइंडर",
		birthdays: "जन्मदिन",
		dayBefore: "एक दिन पहले, सुबह 9:00",
		remembranceDays: "पुण्यतिथियाँ",
		onTheDay: "उसी दिन, सुबह 9:00",
		roundEarly: "ख़ास जन्मदिन एक हफ़्ता पहले",
		roundAges: "18, 50, 55, 60, 65, 70…",
		remindersNote: "सक्रिय वंश वृक्ष के लिए इसी फ़ोन पर सेट होते हैं। सर्वर को कुछ नहीं भेजा जाता।",
		whoCanSee: "यह वंश वृक्ष कौन देख सकता है",
		viewers: (n) => `${n} दर्शक`,
		onlyYou: "सिर्फ़ आप",
		preparing: "तैयार हो रहा है…",
		exportIcs: "कैलेंडर में एक्सपोर्ट करें (.ics)",
		thisIsMe: "यह मैं हूँ",
		notSet: "सेट नहीं है",
		switchTree: "वंश वृक्ष बदलें",
		about: "ऐप के बारे में",
		privacy: "गोपनीयता नीति",
		deleteAccount: "खाता हटाएँ",
		deleteTitle: "अपना खाता हटाएँ?",
		deleteBody:
			"इससे आपका खाता और आपके बनाए हर वंश वृक्ष को, उसके सभी लोगों, फ़ोटो और रिश्तों समेत, हटा दिया जाएगा। आपके आमंत्रित लोगों की पहुँच ख़त्म हो जाएगी। इसे पहले जैसा नहीं किया जा सकता।",
		footer: (version) => `Family Tree ${version} · निर्माता: tomek7667 · family-tree@cyber-man.pl`,
	},

	/** House ads (ads.cyber-man.pl) shown on Home and in Settings. */
	ads: {
		sponsored: "प्रायोजित",
		tag: "विज्ञापन",
		open: (title) => `${title} खोलें`,
	},

	deleteAccount: {
		title: "खाता हटाएँ",
		typeToConfirm: (word) => `पुष्टि के लिए ${word} लिखें`,
		typeToConfirmError: (word) => `पुष्टि के लिए ${word} लिखें।`,
		offline: "आप ऑफ़लाइन हैं — अभी आपका खाता नहीं हटाया जा सकता।",
		permanently: "यह हमेशा के लिए हटा देगा:",
		yourAccount: (email) => `• आपका खाता${email ? ` (${email})` : ""}`,
		everyTree: "• आपका बनाया हर वंश वृक्ष, उसके सभी लोगों, फ़ोटो और रिश्तों समेत",
		consequences: "आपके आमंत्रित लोग उन वंश वृक्षों को नहीं देख पाएँगे। दूसरों के आपके साथ शेयर किए वंश वृक्षों पर कोई असर नहीं पड़ेगा। इसे पहले जैसा नहीं किया जा सकता।",
		notFully: (reason) => `आपका खाता पूरी तरह नहीं हटाया जा सका। ${reason}`,
		askUs: (email) => `आप फिर से कोशिश कर सकते हैं, या ${email} पर हमें लिखकर इसे हटवा सकते हैं।`,
		emailRequest: "हटाने का अनुरोध ईमेल करें",
		deleteMine: "मेरा खाता हटाएँ",
		deleting: "हटाया जा रहा है…",
		keep: "मेरा खाता रहने दें",
		mailSubject: "मेरा Family Tree खाता हटाएँ",
		mailBody: (email) => `कृपया मेरा Family Tree खाता${email ? ` (${email})` : ""} और मेरे बनाए सभी वंश वृक्ष हटा दें।`,
	},

	pickMe: {
		title: "इनमें से आप कौन हैं?",
		note: "“हमारा क्या रिश्ता है” के लिए इस्तेमाल होता है। यह सिर्फ़ इसी फ़ोन पर रहता है और इसे कोई और नहीं देखता।",
		forget: "मेरा चुनाव भूल जाएँ",
		serverLinked: (name) => `इस वंश वृक्ष में ${name} आपके खाते से जुड़ा हुआ है, इसलिए “यह मैं हूँ” हर डिवाइस पर वंश वृक्ष से ही आता है।`,
		saveTitle: "वंश वृक्ष में सेव करें?",
		saveBody: (name) => `इस वंश वृक्ष में ${name} को अपने खाते से जोड़ें? तब “यह मैं हूँ” हर डिवाइस और वेबसाइट पर काम करेगा।`,
		saveLink: "लिंक सेव करें",
		phoneOnly: "सिर्फ़ इसी फ़ोन पर",
		linkSaved: (name) => `${name} अब आपके खाते से जुड़ा हुआ है`,
	},

	notFound: {
		title: "यहाँ कुछ नहीं है",
		body: "यह लिंक ऐसे पेज की ओर जाता है जो ऐप में है ही नहीं।",
		home: "होम पर जाएँ",
	},

	toastsReminders: {
		on: "रिमाइंडर चालू हैं। वे इसी फ़ोन पर रहते हैं।",
		off: "Family Tree के लिए सूचनाएँ बंद हैं।",
		settings: "सेटिंग्स",
		channel: "जन्मदिन और पुण्यतिथियाँ",
	},

	dateNames: {
		monthsNom: ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
		monthsInDate: ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
		// Short names as CLDR hi abbreviates them (॰ is the Devanagari abbreviation sign); the short months stay whole.
		monthsShort: ["जन॰", "फ़र॰", "मार्च", "अप्रैल", "मई", "जून", "जुल॰", "अग॰", "सित॰", "अक्टू॰", "नव॰", "दिस॰"],
		weekdaysShort: ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"],
		/** "4 फ़रवरी 1950" */
		dayMonthYear: (day, month, year) => `${day} ${month} ${year}`,
		/** "15 अक्टू॰" */
		dayMonth: (day, month) => `${day} ${month}`,
	},

	time: {
		justNow: "अभी-अभी",
		minutesAgo: (n) => `${n} मिनट पहले`,
		hoursAgo: (n) => `${n} ${hiForm(n, "घंटा", "घंटे")} पहले`,
		// "कल" is both yesterday and tomorrow; the tense of the verb around it ("कल अपडेट हुआ") says which.
		yesterday: "कल",
		daysAgo: (n) => `${n} दिन पहले`,
		weeksAgo: (n) => `${n} ${hiForm(n, "हफ़्ता", "हफ़्ते")} पहले`,
		monthsAgo: (n) => `${n} ${hiForm(n, "महीना", "महीने")} पहले`,
		yearsAgo: (n) => `${saal(n)} पहले`,
		today: "आज",
		tomorrow: "कल",
		inDays: (n) => `${n} दिन में`,
	},

	events: {
		// "का जन्मदिन" agrees with जन्मदिन, not with the person, so it needs no gender.
		birthdayTitle: (first, age) => `${first} का ${ordinal(age)} जन्मदिन`,
		remembranceTitle: (first, n) => `† ${first}, ${ordinal(n, true)} पुण्यतिथि`,
		birthday: "जन्मदिन",
		remembrance: "पुण्यतिथि",
		roundAge: "ख़ास उम्र",
		reminderEve: (first, age) => `कल ${first} का ${ordinal(age)} जन्मदिन है`,
		reminderEveRoundBody: (first) => `ख़ास जन्मदिन है। ${first} को फ़ोन करेंगे?`,
		reminderWeek: (first, age) => `एक हफ़्ते में ${first} का ${ordinal(age)} जन्मदिन है`,
		reminderWeekBody: (dayMonth) => `${dayMonth} को ख़ास जन्मदिन है।`,
		reminderRemembrance: (name, n) => `† ${name}, ${ordinal(n, true)} पुण्यतिथि`,
		reminderRemembranceBody: (dayMonth) => `पुण्यतिथि · ${dayMonth}`,
	},

	ics: {
		calName: "जन्मदिन",
		birthdayTitle: (name) => `${name} का जन्मदिन`,
		birthdayDesc: (name) => `इस दिन ${name} का जन्मदिन है`,
		deathTitle: (name) => `${name} की पुण्यतिथि`,
		deathDesc: (name) => `इस दिन ${name} की पुण्यतिथि है`,
		// Part of a file name, so it stays in Latin letters.
		fileSuffix: "tarikhen",
		shareTitle: (tree) => `${tree} – तारीख़ें`,
	},

	rel: {
		groups: { BIOLOGICAL: "ख़ून का रिश्ता", "IN-LAW": "वैवाहिक", CHURCH: "धार्मिक", IRRELEVANT: "अन्य" },
		// `sentence` is the middle of "<A> <sentence>: <B>।", see addRel.sentenceJoin.
		types: {
			IS_FATHER_OF: { label: "पिता", sentence: () => "इनके पिता हैं" },
			IS_MOTHER_OF: { label: "माँ", sentence: () => "इनकी माँ हैं" },
			IS_MARRIED_TO: { label: "विवाह", sentence: () => "इनसे विवाहित हैं" },
			LIVES_WITH: { label: "साथ रहते हैं", sentence: (g) => gw(g, "इनके साथ रहते हैं", "इनके साथ रहती हैं") },
			IS_PARTNER_OF: { label: "साथी", sentence: (g) => gw(g, "इनके साथी हैं", "इनकी साथी हैं") },
			IS_ENGAGED_TO: { label: "सगाई", sentence: () => "की सगाई इनसे हुई है" },
			IS_GODPARENT_OF: {
				label: "धर्म माता-पिता",
				sentence: (g) => gw(g, "इनके धर्मपिता हैं", "इनकी धर्ममाता हैं"),
				role: (g) => gw(g, "धर्मपिता", "धर्ममाता"),
				inverseRole: (g) => gw(g, "धर्मपुत्र", "धर्मपुत्री"),
			},
			IS_FRIEND_OF: {
				label: "दोस्ती",
				sentence: (g) => gw(g, "इनके दोस्त हैं", "इनकी दोस्त हैं"),
				role: () => "दोस्त",
				inverseRole: () => "दोस्त",
			},
			IS_STEPPARENT_OF: {
				label: "सौतेले माता-पिता",
				sentence: (g) => gw(g, "इनके सौतेले पिता हैं", "इनकी सौतेली माँ हैं"),
				role: (g) => gw(g, "सौतेला पिता", "सौतेली माँ"),
				inverseRole: (g) => gw(g, "सौतेला बेटा", "सौतेली बेटी"),
			},
		} as Record<string, TypeText>,
		roles: {
			mother: "माँ",
			father: "पिता",
			child: "संतान",
			sibling: (g) => gw(g, "भाई", "बहन"),
			// Only unknown types get here, and their label is still English, so an arrow beats a Hindi verb.
			isSourceOf: (first, labelLower) => `${first} → ${labelLower}`,
		},
	},

	kin: {
		you: "आप",
		youTitle: "आप",
		/**
		 * Hindi kinship words depend on the side of the family (दादा/नाना, चाचा/मामा,
		 * पोता/नाती, साला/देवर…), which a KinTerm does not carry. So only the words
		 * that are right on either side are returned; everything else is null and the
		 * app shows the chain, which spells the side out ("आपकी माँ के पिता").
		 */
		term: (t: KinTerm) => {
			const g = t.gender;
			if (t.kind === "affinal") {
				switch (t.which) {
					case "spouse":
						return gw(g, "पति", "पत्नी");
					case "partner":
						return "साथी";
					case "parentInLaw":
						return gw(g, "ससुर", "सास");
					case "siblingInLaw":
						// साला, देवर, जेठ, जीजा, ननद, भाभी… depend on whose sibling and who is older.
						return null;
					case "childInLaw":
						return gw(g, "दामाद", "बहू");
					case "stepParent":
						// Plural form: the honorific "आपके सौतेले पिता".
						return gw(g, "सौतेले पिता", "सौतेली माँ");
					case "stepChild":
						return gw(g, "सौतेला बेटा", "सौतेली बेटी");
				}
			}
			const { up: u, down: d } = t;
			if (u === 1 && d === 0) return gw(g, "पिता", "माँ");
			if (u === 0 && d === 1) return gw(g, "बेटा", "बेटी");
			if (u === 1 && d === 1) return gw(g, "भाई", "बहन");
			// A brother's child is भतीजा/भतीजी, a sister's भांजा/भांजी: the one side the term does carry.
			if (u === 1 && d === 2 && t.siblingGender) {
				return t.siblingGender === "male" ? gw(g, "भतीजा", "भतीजी") : gw(g, "भांजा", "भांजी");
			}
			return null;
		},
		word: (w: KinWord) => noun(w).nom,
		/** "आपकी माँ के भाई की बेटी": each marker agrees with the noun after it, and nouns before a marker go oblique (बेटे का). */
		chain: (words: KinWord[]) => {
			if (!words.length) return "आप";
			return words
				.map((w, i) => {
					const n = noun(w);
					const last = i === words.length - 1;
					return `${poss(n, !last, i === 0 ? "आप" : "")} ${last ? n.nom : n.obl}`;
				})
				.join(" ");
		},
		phrase: (term, g) => `${g === "female" ? "आपकी" : HONORIFIC.has(term) ? "आपके" : "आपका"} ${term}`,
		/** Bare nouns, like Polish: the label sits under the person it describes, above the next one. */
		step: (move: StepMove, g, typeSentence) => {
			switch (move) {
				case "up":
					return gw(g, "बेटा", "बेटी");
				case "down":
					return gw(g, "पिता", "माँ");
				case "sibling":
					return gw(g, "भाई", "बहन");
				case "spouse":
					return gw(g, "पति", "पत्नी");
				default:
					return typeSentence ?? "रिश्तेदार";
			}
		},
		/** `gen` holds the oblique form the chain needs before का/की/के. */
		otherNoun: (typeName, farIsSource, bidirectional, g, fallbackLabel) => {
			const f = g === "female";
			if (typeName === "IS_GODPARENT_OF") {
				if (farIsSource) return f ? { nom: "धर्ममाता", gen: "धर्ममाता" } : { nom: "धर्मपिता", gen: "धर्मपिता" };
				return f ? { nom: "धर्मपुत्री", gen: "धर्मपुत्री" } : { nom: "धर्मपुत्र", gen: "धर्मपुत्र" };
			}
			if (typeName === "IS_FRIEND_OF") return { nom: "दोस्त", gen: "दोस्त" };
			if (typeName === "IS_STEPPARENT_OF") {
				if (farIsSource) return f ? { nom: "सौतेली माँ", gen: "सौतेली माँ" } : { nom: "सौतेला पिता", gen: "सौतेले पिता" };
				return f ? { nom: "सौतेली बेटी", gen: "सौतेली बेटी" } : { nom: "सौतेला बेटा", gen: "सौतेले बेटे" };
			}
			void bidirectional;
			// Unknown type: its (English) name, unchanged.
			const word = fallbackLabel.replace(/ (of|to|with)$/, "").toLowerCase();
			return { nom: word, gen: word };
		},
	},
};
