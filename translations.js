function getCurrentLanguageCode() {
    const scripts = document.querySelectorAll('script[data-cfasync="false"]');
    for (const script of scripts) {
        const src = script.getAttribute('src');
        if (src) {
            const match = src.match(/system\/language\/([^\/]+)\/language\.js/);
            if (match) {
                return match[1];
            }
        }
    }
    return null;
}

 function applyTranslations(lang = 'English') {
    const elements = translations._elements;
    const texts = translations[lang] || translations['English'];

    for (const key in elements) {
        const el = document.querySelector(elements[key]);
        if (el && texts[key]) {
            el.textContent = texts[key];
        }
    }
}

function loadTranlations() {
    const langCode = getCurrentLanguageCode() || 'English';
    applyTranslations(langCode);
}

const translations = {
    _elements: {
        welcome: "#welcomeText",
        login: "#loginBtn",
        register: "#registerBtn",
        whyJoin: "#whyJoin",
        whyJoinText: "#joinText"
    },
    English: {
        welcome: "Welcome to our free teen chat! Meet new friends, share fun moments, and connect with teens worldwide in a safe, moderated space. Join as a guest or register your username - just follow the rules to keep the chat safe for everyone.",
        login: "Login",
        register: "Register",
        whyJoin: "Why join our teen chat?",
        whyJoinText: "Join a safe, friendly space moderated by a dedicated team. No downloads or payments required! Chat with hundreds of teens using private chat, games, music, and more. Please review our Chat Rules before entering. Respect moderators and follow guidelines to keep the community safe."
    },
    Arabic: {
        welcome: "مرحبًا بكم في دردشة المراهقين المجانية! قابل أصدقاء جدد وشارك لحظات ممتعة وتواصل مع مراهقين من جميع أنحاء العالم في مساحة آمنة ومُدارة. انضم كضيف أو قم بتسجيل اسم المستخدم الخاص بك - فقط اتبع القواعد للحفاظ على سلامة الدردشة للجميع.",
        login: "تسجيل الدخول",
        register: "تسجيل",
        whyJoin: "لماذا تنضم إلى دردشة المراهقين؟",
        whyJoinText: "انضم إلى مساحة آمنة وودية تُدار من قبل فريق مخصص. لا تحتاج إلى تنزيلات أو مدفوعات! دردش مع مئات المراهقين باستخدام الدردشة الخاصة، الألعاب، الموسيقى، وأكثر. يرجى مراجعة قواعد الدردشة قبل الدخول. احترم المشرفين واتبع الإرشادات للحفاظ على أمان المجتمع."
    },
    Bulgarian: {
        welcome: "Добре дошли в нашия безплатен чат за тинейджъри! Срещайте нови приятели, споделяйте забавни моменти и се свържете с тийнейджъри от цял свят в безопасна, модерирана среда. Присъединете се като гост или регистрирайте потребителско име – просто спазвайте правилата, за да запазим чата безопасен за всички.",
        login: "Вход",
        register: "Регистрация",
        whyJoin: "Защо да се присъедините към нашия чат за тийнейджъри?",
        whyJoinText: "Присъединете се към безопасно, приветливо място, модерирано от специален екип. Не са необходими изтегляния или плащания! Чатете със стотици тийнейджъри чрез частен чат, игри, музика и още. Моля, прегледайте правилата на чата преди влизане. Уважавайте модераторите и следвайте насоките, за да поддържаме общността безопасна."
    },
    Croatia: {
        welcome: "Dobrodošli u naš besplatni chat za tinejdžere! Upoznajte nove prijatelje, podijelite zabavne trenutke i povežite se s tinejdžerima iz cijelog svijeta u sigurnom, moderiranom prostoru. Pridružite se kao gost ili registrirajte korisničko ime – samo slijedite pravila kako bi chat bio siguran za sve.",
        login: "Prijava",
        register: "Registracija",
        whyJoin: "Zašto se pridružiti našem tinejdžerskom chatu?",
        whyJoinText: "Pridružite se sigurnom, prijateljskom prostoru koji moderira posvećeni tim. Nema preuzimanja ni plaćanja! Čavrljajte sa stotinama tinejdžera koristeći privatni chat, igre, glazbu i još mnogo toga. Molimo vas da prije ulaska proučite Pravila chata. Poštujte moderatore i slijedite smjernice kako bismo zajednicu održali sigurnom."
    },
    Francais: {
        welcome: "Bienvenue sur notre chat gratuit pour adolescents ! Faites de nouveaux amis, partagez des moments amusants et connectez-vous avec des ados du monde entier dans un espace sûr et modéré. Rejoignez en tant qu’invité ou enregistrez votre nom d’utilisateur – suivez simplement les règles pour garantir la sécurité du chat pour tous.",
        login: "Connexion",
        register: "Inscription",
        whyJoin: "Pourquoi rejoindre notre chat pour adolescents ?",
        whyJoinText: "Rejoignez un espace sûr et convivial modéré par une équipe dédiée. Aucun téléchargement ou paiement requis ! Discutez avec des centaines d’adolescents via chat privé, jeux, musique, et plus encore. Veuillez consulter nos Règles du chat avant d’entrer. Respectez les modérateurs et suivez les directives pour garder la communauté en sécurité."
    },
    German: {
        welcome: "Willkommen in unserem kostenlosen Teen‑Chat! Triff neue Freunde, teile lustige Momente und vernetze dich mit Teenagern weltweit in einem sicheren, moderierten Raum. Tritt als Gast bei oder registriere deinen Benutzernamen – befolge einfach die Regeln, damit der Chat für alle sicher bleibt.",
        login: "Anmelden",
        register: "Registrieren",
        whyJoin: "Warum unserem Teen‑Chat beitreten?",
        whyJoinText: "Tritt einem sicheren, freundlichen Raum bei, der von einem engagierten Team moderiert wird. Keine Downloads oder Zahlungen erforderlich! Chatte mit Hunderten von Teenagern über privaten Chat, Spiele, Musik und mehr. Bitte lies unsere Chatregeln, bevor du beitrittst. Respektiere Moderatoren und folge den Richtlinien, um die Community sicher zu halten."
    },
    Greek: {
        welcome: "Καλώς ήρθατε στην δωρεάν συνομιλία μας για εφήβους! Γνωρίστε νέους φίλους, μοιραστείτε διασκεδαστικές στιγμές και συνδεθείτε με εφήβους από όλο τον κόσμο σε έναν ασφαλή, εποπτευόμενο χώρο. Εγγραφείτε ως επισκέπτης ή καταχωρίστε το όνομα χρήστη σας – απλώς ακολουθήστε τους κανόνες για να διατηρήσετε το chat ασφαλές για όλους.",
        login: "Σύνδεση",
        register: "Εγγραφή",
        whyJoin: "Γιατί να συμμετάσχετε στην συνομιλία μας για εφήβους;",
        whyJoinText: "Ελάτε σε έναν ασφαλή, φιλικό χώρο που εποπτεύεται από αφοσιωμένη ομάδα. Δεν απαιτούνται λήψεις ή πληρωμές! Συνομιλήστε με εκατοντάδες εφήβους μέσω ιδιωτικής συνομιλίας, παιχνιδιών, μουσικής και άλλα. Παρακαλούμε διαβάστε τους Κανόνες Συνομιλίας πριν εισέλθετε. Σεβαστείτε τους συντονιστές και ακολουθήστε τις οδηγίες για να παραμείνει η κοινότητα ασφαλής."
    },
    Hebrew: {
        welcome: "ברוכים הבאים לצ׳אט הנוער החינמי שלנו! פגוש חברים חדשים, שתף רגעים כיפיים והתאם לנוער מכל העולם בסביבה בטוחה וממוזגת. הצטרף כאורח או הרשם עם שם משתמש – פשוט עקוב אחר הכללים כדי לשמור על הצ׳אט בטוח לכולם.",
        login: "התחברות",
        register: "הרשמה",
        whyJoin: "למה להצטרף לצ׳אט הנוער שלנו?",
        whyJoinText: "הצטרף למרחב בטוח וידידותי שמנוהל על‑ידי צוות ייעודי. אין צורך בהתקנות או בתשלומים! צ׳אט עם מאות בני נוער באמצעות צ׳אט פרטי, משחקים, מוזיקה ועוד. אנא עיין בחוקי הצ׳אט לפני הכניסה. כבד את המנהלים ופעל לפי ההנחיות כדי לשמור על הקהילה בטוחה."
    },
    Netherlands: {
        welcome: "Welkom bij onze gratis tienerchat! Ontmoet nieuwe vrienden, deel leuke momenten en maak contact met tieners wereldwijd in een veilige, gemodereerde omgeving. Doe mee als gast of registreer je gebruikersnaam – volg gewoon de regels om de chat voor iedereen veilig te houden.",
        login: "Inloggen",
        register: "Registreren",
        whyJoin: "Waarom deelnemen aan onze tienerchat?",
        whyJoinText: "Sluit je aan bij een veilige, vriendelijke ruimte die wordt gemodereerd door een toegewijd team. Geen downloads of betalingen nodig! Chat met honderden tieners via privéchat, spellen, muziek en meer. Lees onze Chatregels voordat je deelneemt. Respecteer moderators en volg de richtlijnen om de community veilig te houden."
    },
    Portuguese: {
        welcome: "Bem‑vindo ao nosso chat gratuito para adolescentes! Faça novos amigos, compartilhe momentos divertidos e conecte‑se com adolescentes do mundo todo num espaço seguro e moderado. Entre como convidado ou cadastre seu nome de usuário – basta seguir as regras para manter o chat seguro para todos.",
        login: "Entrar",
        register: "Registrar",
        whyJoin: "Por que entrar no nosso chat para adolescentes?",
        whyJoinText: "Participe de um espaço seguro e amigável moderado por uma equipe dedicada. Sem downloads ou pagamentos necessários! Converse com centenas de adolescentes usando chat privado, jogos, música e mais. Por favor, revise nossas Regras do Chat antes de entrar. Respeite os moderadores e siga as diretrizes para manter a comunidade segura."
    },
    Romana: {
        welcome: "Bun venit în chat‑ul nostru gratuit pentru adolescenți! Fă noi prieteni, împărtășește momente distractive și conectează‑te cu adolescenți din întreaga lume într‑un spațiu sigur și moderat. Alătură‑te ca invitat sau înregistrează‑ți un nume de utilizator – doar respectă regulile pentru a menține chat‑ul în siguranță pentru toată lumea.",
        login: "Autentificare",
        register: "Înregistrare",
        whyJoin: "De ce să te alături chat‑ului nostru pentru adolescenți?",
        whyJoinText: "Alătură‑te unui spațiu sigur, prietenos, moderat de o echipă dedicată. Nicio descărcare sau plată necesară! Discută cu sute de adolescenți prin chat privat, jocuri, muzică și altele. Te rugăm să consulți Regulile Chat‑ului înainte de intrare. Respectă moderatorii și urmează ghidurile pentru a menține comunitatea în siguranță."
    },
    Russian: {
        welcome: "Добро пожаловать в наш бесплатный подростковый чат! Заводите новых друзей, делитесь весёлыми моментами и общайтесь с подростками со всего мира в безопасном, модерируемом пространстве. Присоединяйтесь как гость или зарегистрируйте имя пользователя — просто следуйте правилам, чтобы чат оставался безопасным для всех.",
        login: "Вход",
        register: "Регистрация",
        whyJoin: "Зачем присоединяться к нашему подростковому чату?",
        whyJoinText: "Присоединяйтесь к безопасному, дружелюбному пространству, которое модерируется преданной командой. Никаких загрузок или оплат! Общайтесь со сотнями подростков через приватный чат, игры, музыку и многое другое. Пожалуйста, ознакомьтесь с Правилами чата перед входом. Уважайте модераторов и следуйте руководствам, чтобы сохранить безопасность сообщества."
    },
    Spanish: {
        welcome: "¡Bienvenido a nuestro chat juvenil gratuito! Conoce nuevos amigos, comparte momentos divertidos y conéctate con adolescentes de todo el mundo en un espacio seguro y moderado. Únete como invitado o registra tu nombre de usuario – solo sigue las reglas para mantener el chat seguro para todos.",
        login: "Iniciar sesión",
        register: "Registrarse",
        whyJoin: "¿Por qué unirse a nuestro chat juvenil?",
        whyJoinText: "Únete a un espacio seguro y amigable moderado por un equipo dedicado. ¡No se requiere descarga ni pagos! Chatea con cientos de adolescentes usando chat privado, juegos, música y más. Por favor, revisa nuestras Reglas del Chat antes de entrar. Respeta a los moderadores y sigue las directrices para mantener la comunidad segura."
    },
    Turkish: {
        welcome: "Ücretsiz genç sohbetimize hoş geldiniz! Yeni arkadaşlar edinin, eğlenceli anları paylaşın ve güvenli, yönetimli bir ortamda dünya çapında gençlerle bağlantı kurun. Misafir olarak katılabilir veya kullanıcı adınızı kaydedebilirsiniz – sohbetin herkes için güvenli kalması adına kurallara uyun.",
        login: "Giriş",
        register: "Kayıt",
        whyJoin: "Genç sohbetimize neden katılmalısınız?",
        whyJoinText: "Adanmış bir ekip tarafından yönetilen güvenli ve samimi bir alana katılın. İndirme veya ödeme gerekmez! Özel sohbet, oyunlar, müzik ve daha fazlasıyla yüzlerce gençle sohbet edin. Lütfen giriş yapmadan önce Sohbet Kurallarımızı inceleyin. Moderatörlere saygı gösterin ve rehberlere uyarak topluluğu güvenli tutun."
    }
};
