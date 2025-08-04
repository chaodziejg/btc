let userFilterWords = ['hmu'];

function isFiltered(content) {
    if (typeof content !== 'string') return false;

    // normalize text
    let normalized = content
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200B-\u200D\uFEFF\u00A0\u202F\u2060]/gu, '') // emoji + zero-width
        .replace(/[\s\u2000-\u200D\uFEFF\u202F]+/g, ' ') // fancy spaces
        .replace(/[\s\W_]+/g, ' ')
        .replace(/(.)\1{2,}/g, '$1')
        .toLowerCase()
        .trim();

    // replace homoglyphs / leetspeak
    const homoglyphs = {
        '@': 'a', '4': 'a', 'а': 'a', 'ᴀ': 'a', 'â': 'a',
        '3': 'e', 'е': 'e', '€': 'e', 'ᴇ': 'e', 'è': 'e',
        'í': 'i', 'ì': 'i', 'ɪ': 'i', '1': 'l', '!': 'i', 'ı': 'i', 'ʟ': 'l',
        '0': 'o', 'о': 'o', '٥': 'o', 'ö': 'o',
        '8': 'b', '9': 'g', '6': 'g', '7': 't', 'т': 't',
        'э': 'e', 'ɢ': 'g', 'ѕ': 's', 'ʀ': 'r', 'ʏ': 'y',
        'ｔ': 't', 'ｌ': 'l', 'ｇ': 'g', '✓': ''
    };

    normalized = normalized.replace(/./g, (ch, i, str) => {
        if (/\d/.test(ch) && (
            (i > 0 && /\d/.test(str[i - 1])) ||
            (i < str.length - 1 && /\d/.test(str[i + 1]))
        )) return ch;
        return homoglyphs[ch] || ch;
    });

    const lettersOnly = normalized.replace(/[^a-z]/g, '');
    // keyword matching helpers
    const includesAny = (text, list) => list.some(item => text.includes(item));
    const fuzzyMatch = (regexList) => regexList.some(rx => rx.test(normalized));

    // check for banned terms
    const bannedTerms = ['telegrm', 'tlgrm', 'tlgm', 'tlg', 'tle', 'tel', 'tg', 'teleg', 'gram', 'te l e', 'tele', 'grm', 'discor', 'dscord', 'dscrd', 'dscd', 'dyscord', 'dsc', 'd i s c', 'disc', 'insta', 'ig', 'snap', 'sc'];
    if (includesAny(lettersOnly, bannedTerms)) return true;

    const fuzzyPatterns = [
        /t[\W_]*e[\W_]*l[\W_]*e[\W_]*g[\W_]*r[\W_]*a[\W_]*m/i,
        /t[\W_]*g/i,
        /d[\W_]*i[\W_]*s[\W_]*c[\W_]*o[\W_]*r[\W_]*d/i,
        /i[\W_]*n[\W_]*s[\W_]*t[\W_]*a[\W_]*g[\W_]*r[\W_]*a[\W_]*m/i,
        /w[\W_]*h[\W_]*e[\W_]*r[\W_]*e[\W_]*b[\W_]*y[\W_]*[\W_]*c[\W_]*o[\W_]*m/i
    ];
    if (fuzzyMatch(fuzzyPatterns)) return true;

    const squashed = normalized.replace(/[^a-z]/g, '');
    for (const term of bannedTerms) {
	    if (squashed.includes(term)) return true;
    }

    // grooming or inappropriate content
    const baitKeywords = ['bored', 'text me', 'pm', 'pm me', 'dm me', 'text', 'trusted', 'add me', 'msg me', 'message me', 'wanna have fun', 'want to have fun', 'skinny boys', 'skinny girls', 'fit boys', 'fit girls', 'rp', 'answer anything', 'truth or dare', 't or d'];
    const tradeWords = ['trade', 'trd', 'tr ade', 'selling', 'sell', 'slling', 'slng', 'seling', 'tr@de', 'trading', 'mega', 'mga', 'lnks', 'links', 'lks', 'freaks', 'freaky', 'nked', 'nkd', 'room', 'cam', 'cams', 'spoil me', 'horny', 'sex', 'nudes', 'nut'];
    const filterForBait = ['girl', 'girls', 'boy', 'boys', 'chat', 'femboy', 'trans', 'bi', 'gay', 'anyone']

    const hasBaitKeywords = includesAny(normalized, baitKeywords);
    const hasFilterForBait = includesAny(normalized, filterForBait);
    const hasAge = /[mf]?\d{1,2}/.test(normalized);
    const hasStandaloneAge = /\b\d{1,2}\b/.test(normalized);
    const hasTg = normalized.includes('tg');

    if (
        hasBaitKeywords &&
        (
            hasAge ||
            hasStandaloneAge ||
            hasTg ||
            hasFilterForBait
        )
    ) return true;

    const domRoles = ['bottom', 'bottoming', 'btming', 'bttming', 'btm', 'bttm', 'sub', 'submissive', 'top', 'topping', 'dom', 'dominant', 'dominative', 'domme', 'dominator'];

    const domFuzzyPatterns = domRoles.map(word => {
        const pattern = word
            .split('')
            .map(char => `${char}[\\W_]*`)
            .join('');
        return new RegExp(pattern, 'i');
    });
    if (/\b\d{1,2}\b/.test(normalized) && fuzzyMatch(domFuzzyPatterns)) return true;

    // age + gender combo patterns
    if (/[fm][\s\-_,.:']*\d{1,2}/i.test(normalized)) return true;
    if (/\d{1,2}[\s\-_,.:']*[fm]/i.test(normalized)) return true;
    if (/[mf]\d{2}/i.test(content)) return true;

    // trade/selling patterns
    for (let word of tradeWords) {
        const pattern = new RegExp(word.replace(/\s*/g, '[\\s\\W_]*'), 'i');
        if (pattern.test(normalized)) return true;
    }

    // user filters
    if (Array.isArray(userFilterWords)) {
        for (let word of userFilterWords) {
            const pattern = new RegExp(word.replace(/\s*/g, '[\\s\\W_]*'), 'i');
            if (pattern.test(normalized)) return true;
        }
    }

    return false;
}

function overrideChatReload() { 
    appendChatMessage = data => {
	    var message = '';
	    for (var i = 0; i < data.length; i++){
	    	lastPost = data[i].log_id;
	    	if(
	    		!logExist(data[i]) &&
	    		!ignored(data[i].user_id) &&
	    		!ignored(data[i].log_uid) &&
	    		!boomAllow(data[i].log_rank) &&
	    		!isFiltered(data[i].log_content) // <== NEW FILTER
	    	){
	    		message += createChatLog(data[i]);
	    		chatSound(data[i]);
	    		tabNotify();
	    	}
	    }
	    $("#show_chat ul").append(message);
	    scrollIt(1);
	    beautyLogs();
    }
    loadChatHistory = data => {
	    var message = '';
	    for (var i = 0; i < data.length; i++){
	    	lastPost = data[i].log_id;
	    	if(
	    		!ignored(data[i].user_id) &&
	    		!ignored(data[i].log_uid) &&
	    		!boomAllow(data[i].log_rank) &&
	    		!isFiltered(data[i].log_content) // <== NEW FILTER
	    	){
	    		message += createChatLog(data[i]);
	    	}
	    }
	    $("#show_chat ul").html(message);
	    scrollIt(0);
	    beautyLogs();
    }
    appendChatHistory = data => {
    	    var message = '';
    	    for (var i = 0; i < data.length; i++){
    		    if(
    	    		!ignored(data[i].user_id) &&
    	    		!ignored(data[i].log_uid) &&
    	    		!boomAllow(data[i].log_rank) &&
    	    		!isFiltered(data[i].log_content) // <== NEW FILTER
    	    	){
    	    		message += createChatLog(data[i]);
    	    	}
    	    }
    	    $("#show_chat ul").prepend(message);
    	    beautyLogs();
    }
    window.isFiltered = isFiltered;
}