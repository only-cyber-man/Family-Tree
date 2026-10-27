import type { Gender, Locale, ThemePref } from "./config";
import type { Dict, KnownRelationship } from "./en";
import { simple } from "./plural";

// हिन्दी. Typed as Dict, so TypeScript fails when a key is missing.
// Respectful "आप", everyday vocabulary with the usual loanwords, danda "।" as the full stop.

const g = (gender: Gender | undefined, male: string, female: string) =>
	gender === "female" ? female : male;

const people = (count: number) => simple("hi", count, "व्यक्ति", "लोग");
/** Oblique plural, before a postposition: "12 लोगों में से". */
const peopleObl = (count: number) => simple("hi", count, "व्यक्ति", "लोगों");
const relationships = (count: number) => simple("hi", count, "रिश्ता", "रिश्ते");
/** Hindi keeps 0 and 1 singular. */
const one = (count: number) => count === 0 || count === 1;
const themes: Record<ThemePref, string> = { light: "हल्की", dark: "गहरी", system: "सिस्टम" };

/**
 * Relationship types from ft_relationships_names that have a Hindi phrasing.
 * Both names are known here, so the sentences are verb-final: "Jan, Anna के पिता हैं".
 */
const known: Record<string, KnownRelationship> = {
	IS_FATHER_OF: {
		type: "पिता",
		edge: () => "पिता",
		sentence: (from, to) => `${from}, ${to} के पिता हैं`,
		role: (otherIsSource, other) => (otherIsSource ? "पिता" : g(other, "बेटा", "बेटी")),
	},
	IS_MOTHER_OF: {
		type: "माँ",
		edge: () => "माँ",
		sentence: (from, to) => `${from}, ${to} की माँ हैं`,
		role: (otherIsSource, other) => (otherIsSource ? "माँ" : g(other, "बेटा", "बेटी")),
	},
	IS_MARRIED_TO: {
		type: "विवाह",
		edge: () => "विवाहित",
		sentence: (from, to) => `${from} और ${to} विवाहित हैं`,
		role: (_, other) => g(other, "पति", "पत्नी"),
	},
	LIVES_WITH: {
		type: "साथ रहते हैं",
		edge: () => "साथ रहते हैं",
		sentence: (from, to) => `${from} और ${to} साथ रहते हैं`,
		role: () => "साथ रहते हैं",
	},
	IS_PARTNER_OF: {
		type: "साथी",
		edge: () => "साथी",
		sentence: (from, to) => `${from} और ${to} साथी हैं`,
		role: () => "साथी",
	},
	IS_ENGAGED_TO: {
		type: "सगाई",
		edge: () => "सगाई",
		sentence: (from, to) => `${from} और ${to} की सगाई हुई है`,
		role: () => "मंगेतर",
	},
	IS_GODPARENT_OF: {
		type: "धर्म माता-पिता",
		edge: (from) => (from ? g(from, "धर्मपिता", "धर्ममाता") : "धर्म माता-पिता"),
		sentence: (from, to, gender) =>
			`${from}, ${to} ${gender ? g(gender, "के धर्मपिता", "की धर्ममाता") : "के धर्म माता-पिता"} हैं`,
		role: (otherIsSource, other) =>
			otherIsSource ? g(other, "धर्मपिता", "धर्ममाता") : g(other, "धर्मपुत्र", "धर्मपुत्री"),
	},
	IS_FRIEND_OF: {
		type: "दोस्ती",
		edge: () => "दोस्त",
		sentence: (from, to) => `${from} और ${to} दोस्त हैं`,
		role: () => "दोस्त",
	},
	IS_STEPPARENT_OF: {
		type: "सौतेले माता-पिता",
		edge: (from) => (from ? g(from, "सौतेले पिता", "सौतेली माँ") : "सौतेले माता-पिता"),
		sentence: (from, to, gender) =>
			`${from}, ${to} ${gender ? g(gender, "के सौतेले पिता", "की सौतेली माँ") : "के सौतेले माता-पिता"} हैं`,
		role: (otherIsSource, other) =>
			otherIsSource ? g(other, "सौतेले पिता", "सौतेली माँ") : g(other, "सौतेला बेटा", "सौतेली बेटी"),
	},
};

export const hi: Dict = {
	locale: "hi" as Locale,
	dateLocale: "hi-IN",

	common: {
		appName: "Family Tree",
		createdBy: "निर्माता: tomek7667",
		cancel: "रद्द करें",
		save: "सेव करें",
		done: "हो गया",
		close: "बंद करें",
		dismiss: "सूचना बंद करें",
		undo: "पहले जैसा करें",
		edit: "बदलाव करें",
		remove: "हटाएँ",
		optional: "वैकल्पिक",
		loading: "लोड हो रहा है…",
		owner: "मालिक",
		sharedWithYou: "आपके साथ शेयर किया गया",
		viewerReadOnly: "दर्शक · सिर्फ़ देखने के लिए",
		creator: "निर्माता",
		someone: "कोई",
		someoneLower: "कोई",
		unknownAccount: "अनजान खाता",
		you: "आप",
		withYou: (name) => `${name} (आप)`,
		male: "पुरुष",
		female: "महिला",
		justNow: "अभी-अभी",
		people,
		relationships,
		mainNav: "मुख्य",
		clearAll: "सब हटाएँ",
		addRelationship: "रिश्ता जोड़ें",
		removeRelationship: "रिश्ता हटाएँ",
		manageInvited: "आमंत्रित लोग प्रबंधित करें",
		emailInvalid: "यह पूरा ईमेल पता जैसा नहीं लगता।",
	},

	prefs: {
		group: "दिखावट की सेटिंग्स",
		language: "भाषा",
		theme: "थीम",
		themes,
		themeCycle: (current, next) => `थीम: ${themes[current]}। ${themes[next]} पर बदलें।`,
	},

	meta: {
		description:
			"एक निजी वंश वृक्ष, ग्राफ़ की तरह बनाया हुआ। जिन लोगों को आप जानते हैं उन्हें जोड़ें, बताएँ कि उनका आपस में क्या रिश्ता है, और देखें कि पीढ़ियाँ जन्म के साल के हिसाब से कैसे कतार में लगती हैं।",
		signIn: "साइन इन",
		signUp: "साइन अप",
		account: "खाता",
		trees: "आपके वंश वृक्ष",
		tree: "वंश वृक्ष",
		privacy: "गोपनीयता नीति",
		privacyDescription: "Family Tree क्या सहेजता है, क्यों, और उसे कैसे हटाएँ।",
		deleteAccount: "अपना खाता हटाएँ",
		deleteAccountDescription: "अपना Family Tree खाता और डेटा कैसे हटाएँ।",
	},

	legal: {
		privacy: "गोपनीयता",
		deleteAccount: "खाता हटाएँ",
		signIn: "साइन इन करें",
		privacyTitle: "गोपनीयता नीति",
		privacyEffective: "25 सितंबर 2026 से प्रभावी",
		deleteTitle: "अपना खाता हटाएँ",
		deleteAppliesTo:
			"Family Tree वेबसाइट और Android व iOS के लिए Family Tree ऐप (pl.cyberman.familytree) पर लागू होता है।",
		deleteMailSubject: "मेरा Family Tree खाता हटाएँ",
		deleteMailBody: (email) =>
			`कृपया मेरा Family Tree खाता${email ? ` (${email})` : ""} और मेरे बनाए सभी वंश वृक्ष हटा दें।`,
	},

	errorPage: {
		title: "कुछ गड़बड़ हो गई",
		home: "मुख्य पेज पर जाएँ",
	},

	landing: {
		nav: {
			features: "ख़ूबियाँ",
			calendar: "कैलेंडर",
			mobile: "मोबाइल ऐप",
			how: "यह कैसे काम करता है",
			logIn: "लॉग इन करें",
			signUp: "साइन अप करें",
			openMenu: "मेनू खोलें",
			closeMenu: "मेनू बंद करें",
		},
		deleted: "आपका खाता और आपके वंश वृक्ष हटा दिए गए हैं।",
		eyebrow: "एक निजी वंश वृक्ष, ग्राफ़ की तरह बनाया हुआ",
		title: "हर परिवार एक ग्राफ़ है। अपना बनाइए।",
		lead:
			"जिन लोगों को आप जानते हैं उन्हें जोड़ें, बताएँ कि उनका आपस में क्या रिश्ता है, और देखें कि पीढ़ियाँ जन्म के साल के हिसाब से कैसे कतार में लगती हैं। शुरू से निजी; सिर्फ़ उन रिश्तेदारों के साथ शेयर होता है जिन्हें आप आमंत्रित करें।",
		cta: "अपना वंश वृक्ष मुफ़्त में शुरू करें",
		logIn: "लॉग इन करें",
		fine: "न विज्ञापन, न सार्वजनिक प्रोफ़ाइल।",
		treeEyebrow: "वंश वृक्ष",
		treeTitle: "फ़ॉर्म और टेबल नहीं, बस डिब्बे और रेखाएँ।",
		treeBody:
			"आप वंश वृक्ष वैसे ही बनाते हैं जैसे किसी लिफ़ाफ़े की पीठ पर स्केच करते: हर व्यक्ति के लिए एक कार्ड, हर रिश्ते के लिए एक रेखा। खींचें, ज़ूम करें, और किसी पर भी क्लिक करके देखें कि वे कौन हैं।",
		decades: ["1920", "1940", "1970", "2000"],
		timelineTitle: "पीढ़ियों की समयरेखा",
		timelineBody:
			"लोग जन्म के साल के हिसाब से एक खड़ी धुरी पर बैठते हैं। दादा-दादी सबसे ऊपर, पोते-पोतियाँ सबसे नीचे, और हर बीस साल पर एक नई पट्टी। कौन पहले आया, यह कभी सोचना नहीं पड़ता।",
		lines: {
			biological: "ख़ून का रिश्ता",
			married: "विवाहित",
			livesWith: "साथ रहते हैं",
			church: "धार्मिक",
			other: "अन्य",
		},
		kindsTitle: "परिवार के चार रूप",
		kindsBody:
			"ख़ून, शादी, धर्म माता-पिता, और वह पड़ोसी जिसे सब चाचा कहते हैं। हर समूह की अपनी रेखा है: शादी पन्ने पर सबसे गहरी लकीर है और “साथ रहते हैं” सबसे हल्की, इसलिए वंश वृक्ष एक नज़र में पढ़ा जाता है और फिर भी पूरी कहानी कहता है।",
		chips: ["उम्र 40–90", "छिपाएँ: वैवाहिक", "सिर्फ़ महिलाएँ", "छोड़कर: Nowak"],
		filtersTitle: "फ़िल्टर जो भीड़ छाँट देते हैं",
		filtersBody:
			"कोई रिश्ते का प्रकार छिपाएँ, उम्र की सीमा तय करें, परिवार का एक पक्ष दिखाएँ। स्क्रीन पर जो बचता है, वही एक्सपोर्ट होता है।",
		calendarEyebrow: "कैलेंडर एक्सपोर्ट",
		calendarTitle: "हर जन्मदिन। हर पुण्यतिथि। उसी कैलेंडर में जो आप पहले से इस्तेमाल करते हैं।",
		calendarBody:
			"एक क्लिक आपके वंश वृक्ष के दिखने वाले हिस्से को .ics फ़ाइल में बदल देता है: हर जीवित व्यक्ति का सालाना जन्मदिन और हर दिवंगत व्यक्ति की सालाना पुण्यतिथि। इसे Google Calendar, Apple Calendar या Outlook में एक बार इंपोर्ट करें, और यह हमेशा दोहराता रहेगा।",
		pills: ["जन्मदिन, हर साल", "पुण्यतिथियाँ", "आपके फ़िल्टर के मुताबिक"],
		calendarMonth: "अक्टूबर",
		calendarFile: "kowalski-parivar.ics",
		calendarRows: [
			{ dow: "शनि", title: "Maria Kowalska का जन्मदिन", meta: "जन्मदिन · हर साल" },
			{ dow: "गुरु", title: "† Stanisław Kowalski, पुण्यतिथि", meta: "पुण्यतिथि · हर साल" },
			{ dow: "बुध", title: "Zofia Nowak का जन्मदिन", meta: "जन्मदिन · हर साल" },
		],
		privateEyebrow: "शुरू से निजी",
		privateTitle: "आपका, और उनका जिन्हें आप आमंत्रित करें।",
		privateBody:
			"न कोई सार्वजनिक वंश वृक्ष है, न परिवारों के बीच खोज। आप वंश वृक्ष बनाते हैं, ईमेल से रिश्तेदारों को आमंत्रित करते हैं, वे देख सकते हैं पर बदल नहीं सकते। मन बदल जाए तो एक क्लिक में पहुँच हटा दें।",
		privateYou: "tomek (आप)",
		privateCreator: "निर्माता · सब कुछ बदल सकता है",
		privateOwner: "मालिक",
		privateInvited: "आमंत्रित · सिर्फ़ देखने के लिए",
		privateRevoke: "पहुँच हटाएँ",
		privateInvite: "ईमेल से आमंत्रित करें…",
		mobileEyebrow: "iPhone और Android",
		mobileTitle: "वंश वृक्ष आपकी जेब में, उन पलों के लिए जब इसकी ज़रूरत हो।",
		mobileBody:
			"किसी शादी में हैं और कोई चेहरा पहचान नहीं पा रहे? नाम खोजें और देखें कि आपका उनसे क्या रिश्ता है। ऐप आने वाले जन्मदिनों और पुण्यतिथियों की सूची भी रखता है, एक दिन पहले रिमाइंडर के साथ, और कुछ टैप में फ़ोटो समेत नया रिश्तेदार जोड़ने देता है।",
		appStoreSmall: "जल्द ही",
		playStoreSmall: "जल्द ही",
		phoneUpcoming: "आने वाली तारीख़ें",
		phoneRows: [
			{ t: "Maria का 75वाँ जन्मदिन", m: "शनि 3 अक्टू॰ · 8 दिन में" },
			{ t: "† Stanisław, 28वीं पुण्यतिथि", m: "गुरु 15 अक्टू॰" },
			{ t: "Zofia का 21वाँ जन्मदिन", m: "बुध 28 अक्टू॰" },
		],
		phoneRelation: "1976 · 50 · आपकी माँ की ममेरी बहन",
		howTitle: "यह कैसे काम करता है",
		steps: [
			{
				title: "ख़ुद से शुरू करें",
				body: "एक वंश वृक्ष बनाएँ, पहला व्यक्ति जोड़ें: नाम, जन्म की तारीख़, और हो तो एक फ़ोटो।",
			},
			{
				title: "जिन्हें जानते हैं, उन्हें जोड़ें",
				body: "माता-पिता, साथी, धर्म माता-पिता। दो लोग और एक रिश्ता चुनें, और रेखा अपने आप सही पीढ़ी में खिंच जाती है।",
			},
			{
				title: "परिवार को आमंत्रित करें",
				body: "ईमेल से सिर्फ़ देखने की पहुँच दें, तारीख़ें अपने कैलेंडर में एक्सपोर्ट करें, और वंश वृक्ष अपने फ़ोन में रखें।",
			},
		],
		minute: "बस एक मिनट लगता है।",
		hero: {
			label: "चार पीढ़ियों वाला एक नमूना वंश वृक्ष",
			married: "विवाहित",
			godparent: "धर्मपिता",
		},
	},

	auth: {
		signInPrompt: "यहाँ नए हैं?",
		signInLink: "खाता बनाएँ",
		signUpPrompt: "पहले से खाता है?",
		signUpLink: "साइन इन करें",
		missingCredentials: "अपना यूज़रनेम या ईमेल और पासवर्ड डालें।",
		unreachable: "सर्वर से संपर्क नहीं हो सका। फिर से कोशिश करें।",
		wrongCredentials: "यूज़रनेम या पासवर्ड गलत है। दोनों जाँचें और फिर से कोशिश करें।",
		resetEmailMissing: "अपने खाते का ईमेल पता डालें।",
		resetSent: (email) =>
			`अगर ${email} से कोई खाता है, तो रीसेट लिंक भेज दिया गया है। अपना इनबॉक्स देखें।`,
		resetFailed: "रीसेट ईमेल नहीं भेजा जा सका। फिर से कोशिश करें।",
		resetTitle: "पासवर्ड रीसेट करें",
		resetSubtitle: "हम आपको नया पासवर्ड चुनने का लिंक ईमेल करेंगे।",
		welcomeTitle: "फिर से स्वागत है",
		welcomeSubtitle: "अपने वंश वृक्ष खोलने के लिए साइन इन करें।",
		email: "ईमेल",
		usernameOrEmail: "यूज़रनेम या ईमेल",
		password: "पासवर्ड",
		forgot: "भूल गए?",
		sending: "भेजा जा रहा है…",
		sendReset: "रीसेट लिंक भेजें",
		signingIn: "साइन इन हो रहा है…",
		signIn: "साइन इन करें",
		backToSignIn: "साइन इन पर वापस जाएँ",
		noAccount: "खाता नहीं है?",
		signUp: "साइन अप करें",
		showPassword: "पासवर्ड दिखाएँ",
		hidePassword: "पासवर्ड छिपाएँ",
		pickUsername: "एक यूज़रनेम चुनें।",
		minPassword: (min) => `कम से कम ${min} अक्षर।`,
		passwordsDiffer: "पासवर्ड मेल नहीं खाते।",
		createFailed: "खाता नहीं बनाया जा सका।",
		signInAfterCreateFailed: (message) =>
			`आपका खाता बन गया, लेकिन साइन इन नहीं हो सका: ${message}। साइन इन करके देखें।`,
		unknownError: "अनजान गड़बड़ी",
		registerTitle: "अपना वंश वृक्ष शुरू करें",
		registerSubtitle: "मुफ़्त, निजी, बिना विज्ञापन।",
		username: "यूज़रनेम",
		displayName: "दिखने वाला नाम",
		confirmPassword: "पासवर्ड दोबारा लिखें",
		creating: "खाता बन रहा है…",
		create: "खाता बनाएँ",
		registerNote:
			"हम एक सत्यापन ईमेल भेजेंगे। आपका वंश वृक्ष सिर्फ़ आपको और आपके आमंत्रित लोगों को दिखता है।",
	},

	nav: {
		trees: "वंश वृक्ष",
		account: "आपका खाता",
		logOut: "लॉग आउट करें",
	},

	account: {
		title: "आपका खाता",
		username: "यूज़रनेम:",
		displayName: "दिखने वाला नाम:",
		email: "ईमेल:",
		deleteHeading: "खाता हटाएँ",
		deleteBodyBefore:
			"आपका खाता और आपके बनाए हर वंश वृक्ष को, उनके सभी लोगों, फ़ोटो और रिश्तों समेत, हटा देता है। दूसरों के आपके साथ शेयर किए वंश वृक्षों पर कोई असर नहीं पड़ता। देखें: ",
		deleteBodyLink: "गोपनीयता नीति",
		deleteBodyAfter: "।",
		failedBefore: (error) => `आपका खाता यहाँ नहीं हटाया जा सका (${error})। इसके बजाय `,
		failedLink: "हटाने का अनुरोध ईमेल करें",
		failedAfter: ", और यह 30 दिनों के भीतर कर दिया जाएगा।",
		deleteButton: "खाता हटाएँ…",
		confirmTitle: "अपना खाता हटाएँ?",
		confirmBody:
			"इससे आपका खाता और आपके बनाए हर वंश वृक्ष को, उनके सभी लोगों, फ़ोटो और रिश्तों समेत, हटा दिया जाएगा। आपके आमंत्रित लोगों की पहुँच ख़त्म हो जाएगी। इसे पहले जैसा नहीं किया जा सकता।",
		confirmLabel: "सब कुछ हटाएँ",
		keep: "मेरा खाता रहने दें",
		typeToConfirm: "पुष्टि के लिए हटाएँ लिखें",
		/** Both nasal spellings, a Latin transliteration and the English word. */
		confirmWords: ["हटाएँ", "हटाएं", "hataye", "hatayen", "delete"],
	},

	dashboard: {
		onlyYou: "सिर्फ़ आप",
		viewers: (count) => `${count} दर्शक`,
		byCreator: (name) => `मालिक: ${name}`,
		stats: (count, ago) => `${count === null ? "" : `${people(count)} · `}${ago} अपडेट हुआ`,
		moreActions: (name) => `${name} के लिए और विकल्प`,
		rename: "नाम बदलें",
		deleteTree: "वंश वृक्ष हटाएँ…",
		open: "खोलें",
		emptyTitle: "अभी कोई वंश वृक्ष नहीं है",
		emptyBody:
			"उन लोगों से शुरू करें जिन्हें आप सबसे अच्छी तरह जानते हैं: आप ख़ुद, आपके माता-पिता, आपके दादा-दादी और नाना-नानी। कुछ देखने लायक बन जाए, तो बाकी परिवार को आमंत्रित कर सकते हैं।",
		createFirst: "अपना पहला वंश वृक्ष बनाएँ",
		emptyNote: "न्योते का इंतज़ार है? आपके साथ शेयर किए गए वंश वृक्ष यहाँ अपने आप दिखते हैं।",
		title: "आपके वंश वृक्ष",
		count: (total, owned, shared) =>
			`${total} वंश वृक्ष${shared > 0 ? ` · ${owned} आपके, ${shared} आपके साथ शेयर किए गए` : ""}`,
		newTree: "नया वंश वृक्ष",
	},

	treeDialogs: {
		nameRequired: "वंश वृक्ष को एक नाम दें।",
		created: "वंश वृक्ष बन गया",
		newTitle: "नया वंश वृक्ष",
		newSubtitle: "ऐसा नाम दें जो आप बोलकर कह सकें।",
		treeName: "वंश वृक्ष का नाम",
		namePlaceholder: "मेरा वंश वृक्ष",
		nameHint: "जैसे “शर्मा परिवार” या “माँ की तरफ़”।",
		createAndOpen: "बनाएँ और खोलें",
		nameEmpty: "नाम खाली नहीं हो सकता।",
		renamed: "वंश वृक्ष का नाम बदल गया",
		renameTitle: "वंश वृक्ष का नाम बदलें",
		alreadyHasAccess: "इस व्यक्ति के पास पहले से पहुँच है।",
		noAccount: "इस ईमेल से अभी कोई Family Tree खाता नहीं है।",
		thatsYou: "यह आप हैं। यह वंश वृक्ष पहले से आपका है।",
		invited: (email, tree) => `${email} अब ${tree} देख सकते हैं`,
		revoked: "पहुँच हटा दी गई",
		whoCanSee: (tree) => `${tree} कौन देख सकता है`,
		whoCanSeeSubtitle:
			"आमंत्रित लोग देख सकते हैं, बदलाव नहीं कर सकते। उनके पास इसी ईमेल से Family Tree खाता होना चाहिए।",
		emailPlaceholder: "naam@example.com",
		emailToInvite: "आमंत्रित करने के लिए ईमेल",
		invite: "आमंत्रित करें",
		revoke: "पहुँच हटाएँ",
		deleteTitle: (tree) => `“${tree}” हटाएँ?`,
		deleteBody: (count, viewers) =>
			`इससे ${count === null ? "इसमें मौजूद सभी लोग" : people(count)} और उनके सभी रिश्ते हट जाएँगे${
				viewers > 0 ? ` — आपके लिए और ${simple("hi", viewers, "आमंत्रित दर्शक", "आमंत्रित दर्शकों")} के लिए भी` : ""
			}। इसे पहले जैसा नहीं किया जा सकता।`,
		deleted: (tree) => `${tree} हटा दिया गया`,
		deleteConfirm: "वंश वृक्ष हटाएँ",
		keep: "रहने दें",
		typeName: "पुष्टि के लिए वंश वृक्ष का नाम लिखें",
	},

	tree: {
		legend: "संकेत",
		deceased: "† दिवंगत",
		filtersCleared: "इन्हें दिखाने के लिए फ़िल्टर हटा दिए गए",
		unknownType: "अनजान",
		chipHide: (type) => `छिपाएँ: ${type}`,
		chipAge: (min, max, plus) => `उम्र ${min}–${max}${plus ? "+" : ""}`,
		chipMen: "सिर्फ़ पुरुष",
		chipWomen: "सिर्फ़ महिलाएँ",
		chipNot: (names) => `छोड़कर: ${names}`,
		chipOnly: (names) => `सिर्फ़: ${names}`,
		removeFilter: (text) => `फ़िल्टर हटाएँ: ${text}`,
		exported: (filename, count) => `${filename} डाउनलोड हो गई · ${people(count)}`,
		calendarFailed: "कैलेंडर नहीं बनाया जा सका",
		back: "वंश वृक्षों पर वापस",
		openFailed: "यह वंश वृक्ष खोला नहीं जा सका",
		backToTrees: "अपने वंश वृक्षों पर वापस जाएँ",
		loadingTree: "वंश वृक्ष लोड हो रहा है…",
		counts: (p, r) => `${people(p)} · ${relationships(r)}`,
		emptyTitle: "यहाँ अभी कोई नहीं है",
		emptyOwner:
			"पहला व्यक्ति जोड़ें — ख़ुद से शुरू करना अच्छा रहता है। आप जिसे भी जोड़ेंगे, वह जन्म के साल के हिसाब से कतार में लग जाएगा।",
		emptyViewer: "निर्माता ने इस वंश वृक्ष में अभी किसी को नहीं जोड़ा है।",
		addFirst: "पहला व्यक्ति जोड़ें",
		editToolbar: "वंश वृक्ष में बदलाव",
		viewToolbar: "देखें",
		addPerson: "व्यक्ति जोड़ें",
		findPerson: "किसी को खोजें",
		filters: "फ़िल्टर",
		exportCalendar: "कैलेंडर में एक्सपोर्ट करें",
		zoomIn: "ज़ूम इन",
		zoomOut: "ज़ूम आउट",
		fit: "स्क्रीन में फ़िट करें",
		visible: (shown, total) => `${peopleObl(total)} में से ${shown} दिख रहे हैं`,
		saved: "बदलाव सेव हो गए",
		added: (name) => `${name} को वंश वृक्ष में जोड़ दिया गया`,
		relationshipAdded: "रिश्ता जोड़ दिया गया",
		removePersonTitle: (name) => `${name} को हटाएँ?`,
		removePersonBody: (count) =>
			`इससे इनसे जुड़े ${relationships(count)} भी ${one(count) ? "हट जाएगा" : "हट जाएँगे"}। इसे पहले जैसा नहीं किया जा सकता।`,
		removePerson: "व्यक्ति हटाएँ",
		personRemoved: (name) => `${name} को हटा दिया गया`,
		removeEdgeTitle: "यह रिश्ता हटाएँ?",
		removeEdgeBody: (sentence) => `${sentence}। दोनों लोग वंश वृक्ष में बने रहेंगे।`,
		relationshipRemoved: "रिश्ता हटा दिया गया",
		canvas: "वंश वृक्ष का कैनवास। खिसकाने के लिए खींचें, ज़ूम करने के लिए स्क्रॉल करें।",
		nodeLabel: (name, years, deceased, link) =>
			`${name}, ${years}${deceased ? ", दिवंगत" : ""}${
				link === "you" ? ", यह आप हैं" : link === "linked" ? ", एक खाते से जुड़ा हुआ" : ""
			}`,
		youPill: "आप",
		legendYou: "आप",
		legendLinked: "जुड़ा हुआ खाता",
		band: (year, span) => `${year}–${year + span - 1}`,
	},

	panel: {
		details: (name) => `${name} की जानकारी`,
		removeWith: (name) => `${name} के साथ का रिश्ता हटाएँ`,
		noRelationships: "अभी कोई रिश्ता नहीं है।",
		showFamily: "पूरा परिवार दिखाएँ",
		hideFamily: "पूरा परिवार छिपाएँ",
		noFamily: "पूरा परिवार निकालने के लिए माता-पिता या शादी का कोई रिश्ता नहीं है।",
		removeNamed: (name) => `${name} को हटाएँ`,
		readOnly: "सिर्फ़ देखने के लिए। बदलाव सिर्फ़ वंश वृक्ष के निर्माता कर सकते हैं।",
		thisIsYou: "यह आप हैं",
		linkedTo: (email) => `${email} से जुड़ा हुआ`,
		note: "नोट",
		relationship: "रिश्ता",
		bidirectional: "दोनों तरफ़",
		directional: "एक तरफ़ →",
	},

	filters: {
		hideTypes: "रिश्तों के प्रकार छिपाएँ",
		hideTypesHint: "कटे हुए प्रकार कैनवास और एक्सपोर्ट से छिपे रहते हैं।",
		age: "उम्र",
		minimum: "कम से कम",
		maximum: "ज़्यादा से ज़्यादा",
		ageHint: "दिवंगत लोगों के लिए निधन के समय की उम्र।",
		gender: "लिंग",
		everyone: "सभी",
		men: "पुरुष",
		women: "महिलाएँ",
		includeByName: "सिर्फ़ वे नाम दिखाएँ जिनमें हो",
		includeHint: "अल्पविराम से अलग करें। जिनके नाम में इनमें से कुछ भी हो, वे रहते हैं।",
		excludeByName: "नाम से बाहर रखें",
		excludeHint:
			"अल्पविराम से अलग करें। नाम के किसी भी हिस्से से मेल खाता है; बड़े-छोटे अक्षरों और एक्सेंट का फ़र्क नहीं पड़ता।",
	},

	dialogs: {
		findTitle: "किसी को खोजें",
		findPlaceholder: "नाम लिखें…",
		searchPeople: "लोगों को खोजें",
		noResults: "इस नाम का कोई नहीं है।",
		nameRequired: "नाम डालें।",
		birthRequired: "जन्म की तारीख़ डालें।",
		deathBeforeBirth: "निधन की तारीख़ जन्म की तारीख़ से पहले की है।",
		editPerson: "व्यक्ति की जानकारी बदलें",
		addPerson: "व्यक्ति जोड़ें",
		personSubtitle: "नाम और जन्म की तारीख़ ज़रूरी हैं। बाकी सब बाद में भी हो सकता है।",
		changePhoto: "फ़ोटो बदलें",
		uploadPhoto: "फ़ोटो अपलोड करें",
		photoHint: "JPG या PNG, ज़्यादा से ज़्यादा 5 MB। चौकोर सबसे अच्छी रहती है।",
		photoTooLarge: "यह फ़ोटो 5 MB से बड़ी है।",
		fullName: "पूरा नाम",
		namePlaceholder: "जैसे सीमा शर्मा",
		birthDate: "जन्म की तारीख़",
		deathDate: "निधन की तारीख़",
		note: "नोट",
		noteHint: "कुछ भी जो याद रखने लायक हो: शादी से पहले का नाम, कहाँ रहते थे, कोई किस्सा।",
		noteCount: (length, max) => `${length} / ${max}`,
		noteTooLong: (max) => `नोट ${max} अक्षरों से छोटा रखें।`,
		linkedAccount: "जुड़ा हुआ खाता",
		linkedHint: "इस व्यक्ति का Family Tree खाता, अगर उनके पास वंश वृक्ष की पहुँच है।",
		linkedNone: "कोई नहीं",
		linkedMe: (name) => `मैं (${name})`,
		linkedConflict: (account, person) =>
			`${account} पहले से ${person} से जुड़ा हुआ है। एक खाता सिर्फ़ एक व्यक्ति से जुड़ सकता है, इसलिए पहले वहाँ से लिंक हटाएँ।`,
		saveChanges: "बदलाव सेव करें",
		addToTree: "वंश वृक्ष में जोड़ें",
		search: "खोजें…",
		readAsSentence: "वाक्य की तरह पढ़ें:",
		duplicate: "यह रिश्ता पहले से वंश वृक्ष में है।",
		fromPerson: "किसकी ओर से",
		toPerson: "किसके साथ",
		relationType: "रिश्ते का प्रकार",
		bothWays: "दोनों तरफ़",
		oneWay: "एक तरफ़",
		exportTitle: "कैलेंडर में एक्सपोर्ट करें",
		exportHeading: (count) => `${peopleObl(count)} को अपने कैलेंडर में एक्सपोर्ट करें`,
		exportBody:
			"एक .ics फ़ाइल जिसमें हर जीवित व्यक्ति का सालाना जन्मदिन और हर दिवंगत व्यक्ति की सालाना पुण्यतिथि है। छिपे हुए लोग शामिल नहीं होते।",
		birthdays: "जन्मदिन",
		remembrances: "पुण्यतिथियाँ",
		download: ".ics डाउनलोड करें",
	},

	person: {
		age: (age, _gender, deceased) => (deceased ? `निधन के समय ${age} साल` : `${age} साल`),
	},

	family: {
		// Hindi names grandparents by side; the generic form counts generations.
		ancestors: (level) =>
			level === 0
				? "दादा-दादी / नाना-नानी"
				: level === 1
				? "परदादा-परदादी / परनाना-परनानी"
				: `पूर्वज (${level + 2} पीढ़ी ऊपर)`,
		descendants: (level) =>
			level === 0
				? "पोते-पोतियाँ / नाती-नातिन"
				: level === 1
				? "परपोते-परपोतियाँ / परनाती-परनातिन"
				: `वंशज (${level + 2} पीढ़ी नीचे)`,
		parents: "माता-पिता",
		auntsAndUncles: "चाचा-मामा और बुआ-मौसी",
		siblings: "भाई-बहन",
		children: "बच्चे",
	},

	rel: {
		groups: {
			BIOLOGICAL: "ख़ून का रिश्ता",
			"IN-LAW": "वैवाहिक",
			CHURCH: "धार्मिक",
			IRRELEVANT: "अन्य",
		},
		legend: {
			married: "विवाहित",
			livesWith: "साथ रहते हैं",
		},
		known,
		// Unknown types keep their English name, so arrows beat a half-Hindi sentence.
		fallbackSentence: (from, phrase, _isVerb, to) => `${from} → ${phrase} → ${to}`,
		fallbackRole: (phrase, _isVerb, firstName, selectedIsSource) =>
			selectedIsSource ? `${firstName} → ${phrase}` : `${phrase} → ${firstName}`,
	},

	calendar: {
		calName: "Family Tree",
		remembranceTitle: (name) => `† ${name}, पुण्यतिथि`,
		remembranceDescription: (name, born) => `${name} की पुण्यतिथि (जन्म ${born})।`,
		birthdayTitle: (name) => `${name} का जन्मदिन`,
		// "का जन्म" agrees with जन्म, so it needs no gender.
		birthdayDescription: (name, born, _gender) => `${name} का जन्म ${born} में हुआ था।`,
		fileFallback: "vansh-vriksh",
	},
};
