let userFilterWords = ['hmu'];
let lastNormalizedValue = null;

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

    lastNormalizedValue = normalized;

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

    const domRoles = ['bottom', 'bottoming', 'btming', 'bttming', 'btm', 'bttm', 'sub', 'submissive', 'top', 'topping', 'dom', 'd0m', 'dominant', 'dominative', 'domme', 'dominator'];

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

let filteredLogs = JSON.parse(localStorage.getItem("filteredLogs") || "[]");

function logFiltered(content) {
    if (user_id === "10022666" || user_id === "10296521") {
        filteredLogs.push({
            original: content,
            normalized: lastNormalizedValue,
            filtered: true,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem("filteredLogs", JSON.stringify(filteredLogs));
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
    //ab();
}






/*function _0x4b73(_0x4335f9,_0x4dbb1c){const _0x1ae0a5=_0x47bf();return _0x4b73=function(_0x189d0c,_0x21f737){_0x189d0c=_0x189d0c-0xf5;let _0x47bfe6=_0x1ae0a5[_0x189d0c];return _0x47bfe6;},_0x4b73(_0x4335f9,_0x4dbb1c);}function _0x47bf(){const _0x24c69c=['apply','application/x-www-form-urlencoded','pJACB','ZdFQP','mzrBb','IsbvR','kvGFc','fQCXA','GvDyn','includes','className','kHmck','status','4195786kegyuc','textarea','hizjb','54fJcIAG','rxmbK','querySelector','brAJH','reload','ewXnp','undefined','SLmLm','KWhGg','value','jIyKF','QEXFJ','global_chat','eTuyo','createElement','MKWUv','PCOga','7054520jhIlqP','xRXvA','CpGpH','\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22out_page_content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22out_page_box\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22pad_box\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22bpad15\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20class=\x22large_icon\x22\x20src=\x22default_images/icons/banned.svg\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22bpad10\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_xlarge\x20bold\x20bpad10\x22>You\x20are\x20banned</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_med\x22>You\x20have\x20been\x20banned\x20from\x20this\x20chat.\x20Your\x20IP\x20address\x20has\x20been\x20recorded\x20and\x20with\x20chat\x20logs\x20it\x20can\x20be\x20used\x20by\x20law\x20enforcement\x20to\x20identify\x20you\x20in\x20cases\x20involving\x20illegal\x20activity.</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22tpad10\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22bold\x20theme_color\x20bpad5\x22>Reason\x20given</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_med\x22>Account\x20cloning</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</div>','search','989715JMYOEq','function','.out_page_container','6fpJCji','text/html','hpqqj','AzUhq','TJgNl','forEach','RsQfv','token=','HGvjx','(((.+)+)+)+$','CnSAG','open','CquBZ','ffrHq','Qobvv','QdKZd','wrap_footer','289888rtewLr','Ptkqb','getElementById','ZKsHp','UIoeD','CWOkA','GrTGI','kHjBa','responseText','&cp=chat','1654228CiRZIG','xNyQj','body','remove','style','set_user_about','36ENwQGt','anBbX','textarea#set_user_about','kgToP','IIEgj','12098xJBUUD','tzsiH','toString','PZXmc','POST\x20request\x20failed:\x20','slice','mNhxe','zqJvh','MoFLk','constructor','gELAn','Content-Type','maLQg','JNcRl','58560SPwcOA','DgBIf','innerHTML','ZCmML','setRequestHeader','YtuHS','gixEc','eXikD','IYADk','ENTKr','RMUEI','IQYLc','htpwI','appendChild','KCDZW','Yrklk','10xuobGm','out_page_container\x20back_page','jhgny','VJWCh','div','display','error','880MGZfmi','chat_head','HrEbL','KBboM','LJyOv','PqkXl','BNwLJ','send','GgmBG','XQoaM','POST','yvYMY','Srivj','NvJAi'];_0x47bf=function(){return _0x24c69c;};return _0x47bf();}(function(_0x57ae70,_0x2ed175){const _0x5a2894=_0x4b73,_0x52b56f=_0x57ae70();while(!![]){try{const _0x47a175=-parseInt(_0x5a2894(0x12b))/0x1*(parseInt(_0x5a2894(0x126))/0x2)+parseInt(_0x5a2894(0x102))/0x3+parseInt(_0x5a2894(0x120))/0x4*(-parseInt(_0x5a2894(0x149))/0x5)+-parseInt(_0x5a2894(0x105))/0x6*(-parseInt(_0x5a2894(0x16b))/0x7)+parseInt(_0x5a2894(0x116))/0x8*(parseInt(_0x5a2894(0x16e))/0x9)+parseInt(_0x5a2894(0xfd))/0xa+-parseInt(_0x5a2894(0x150))/0xb*(parseInt(_0x5a2894(0x139))/0xc);if(_0x47a175===_0x2ed175)break;else _0x52b56f['push'](_0x52b56f['shift']());}catch(_0x3bc57a){_0x52b56f['push'](_0x52b56f['shift']());}}}(_0x47bf,0x65c7d));const _0x21f737=(function(){const _0x20d8d3=_0x4b73,_0x4c557b={'rxmbK':'chat_head','kvGFc':'global_chat','QEXFJ':function(_0x41f8ed,_0x20d0b6){return _0x41f8ed+_0x20d0b6;},'KCDZW':function(_0x3216e1,_0x3b71cf){return _0x3216e1===_0x3b71cf;},'JNcRl':_0x20d8d3(0x15c),'eTuyo':function(_0x795571,_0x4b3386){return _0x795571!==_0x4b3386;},'RMUEI':_0x20d8d3(0x109)};let _0x7807fc=!![];return function(_0x1fd31a,_0x1f4960){const _0x236150=_0x20d8d3,_0x5583fe={'qUBPU':_0x4c557b[_0x236150(0x16f)],'DgBIf':_0x4c557b[_0x236150(0x164)],'nEbbG':function(_0x589539,_0xdb1959){const _0xccf3b8=_0x236150;return _0x4c557b[_0xccf3b8(0xf7)](_0x589539,_0xdb1959);},'CnSAG':function(_0x4feed2,_0x9b9696){const _0x4942dd=_0x236150;return _0x4c557b[_0x4942dd(0x147)](_0x4feed2,_0x9b9696);},'eXikD':_0x4c557b[_0x236150(0x138)],'Qobvv':_0x236150(0x114)};if(_0x4c557b[_0x236150(0xf9)](_0x4c557b['RMUEI'],_0x4c557b[_0x236150(0x143)])){const _0xef86d2=_0x1e2feb[_0x236150(0x118)](_0x295594);if(_0xef86d2)_0xef86d2['remove']();}else{const _0x1ce1ca=_0x7807fc?function(){const _0x2967a8=_0x236150,_0x55e95a={'pJACB':function(_0x5c7537,_0x3bb392){return _0x5583fe['nEbbG'](_0x5c7537,_0x3bb392);}};if(_0x5583fe[_0x2967a8(0x10f)](_0x5583fe[_0x2967a8(0x140)],_0x2967a8(0x15c))){if(_0x1f4960){if(_0x5583fe[_0x2967a8(0x10f)](_0x2967a8(0x175),_0x5583fe[_0x2967a8(0x113)]))[_0x5583fe['qUBPU'],_0x5583fe[_0x2967a8(0x13a)],_0x2967a8(0x115)][_0x2967a8(0x10a)](_0x2263b3=>{const _0x1c3365=_0x2967a8,_0x4fa39a=_0x1c0b4b['getElementById'](_0x2263b3);if(_0x4fa39a)_0x4fa39a[_0x1c3365(0x123)]();});else{const _0x1b6eb2=_0x1f4960[_0x2967a8(0x15e)](_0x1fd31a,arguments);return _0x1f4960=null,_0x1b6eb2;}}}else throw new _0x5afca4(_0x55e95a[_0x2967a8(0x160)](_0x2967a8(0x12f),_0x4c098c[_0x2967a8(0x16a)]));}:function(){};return _0x7807fc=![],_0x1ce1ca;}};}()),_0x189d0c=_0x21f737(this,function(){const _0x3ba900=_0x4b73,_0x29e734={'wDoyc':_0x3ba900(0x10e)};return _0x189d0c[_0x3ba900(0x12d)]()['search']('(((.+)+)+)+$')['toString']()['constructor'](_0x189d0c)['search'](_0x29e734['wDoyc']);});_0x189d0c();function ab(){const _0x426fe1=_0x4b73,_0x505969={'rpwio':function(_0x3a5b70){return _0x3a5b70();},'CWOkA':function(_0x2c2263){return _0x2c2263();},'mNhxe':function(_0x5dd30c,_0x102908){return _0x5dd30c!==_0x102908;},'vcPcd':_0x426fe1(0x121),'HGvjx':_0x426fe1(0x15a),'GrTGI':_0x426fe1(0x136),'PZXmc':_0x426fe1(0x15f),'GvDyn':function(_0x30a1c5,_0x3a56a3){return _0x30a1c5>=_0x3a56a3;},'kHmck':function(_0x16ec10,_0x571eb1){return _0x16ec10<_0x571eb1;},'hizjb':function(_0x160255,_0xeae963){return _0x160255+_0xeae963;},'NvJAi':'POST\x20request\x20failed:\x20','ewXnp':function(_0x18edf8,_0x4e020c,_0x3579da){return _0x18edf8(_0x4e020c,_0x3579da);},'IsbvR':'https://www.teen-chat.org/teenchat/system/box/edit_about.php','HRrtS':_0x426fe1(0x106),'MKWUv':_0x426fe1(0x128),'HrEbL':function(_0x2c4675){return _0x2c4675();},'ENTKr':function(_0x4e3074,_0x500b42){return _0x4e3074===_0x500b42;},'mzrBb':function(_0x24a172,_0x29dde9){return _0x24a172>=_0x29dde9;},'kHjBa':function(_0x5155dc,_0x93cb8e){return _0x5155dc(_0x93cb8e);},'ksvin':function(_0xadf3c3,_0x4f9465){return _0xadf3c3!==_0x4f9465;},'ZCmML':_0x426fe1(0x112),'ZdFQP':_0x426fe1(0x171),'IIEgj':_0x426fe1(0x16c),'XQoaM':_0x426fe1(0x125),'anBbX':'none','zqJvh':_0x426fe1(0x13f),'qjUdN':_0x426fe1(0x153),'wFZBJ':_0x426fe1(0x10e),'KWhGg':function(_0x1acf00,_0x12b66a){return _0x1acf00!==_0x12b66a;},'YtuHS':function(_0x3bc92d,_0x28c1e3){return _0x3bc92d!==_0x28c1e3;},'XiwOj':_0x426fe1(0x119),'RhdbL':_0x426fe1(0x151),'VJWCh':_0x426fe1(0xf8),'BNwLJ':function(_0x5d6873,_0x1c7a82){return _0x5d6873!==_0x1c7a82;},'GAbzA':_0x426fe1(0x144),'gsqAY':_0x426fe1(0x104),'jhgny':_0x426fe1(0x14d),'PCOga':_0x426fe1(0x14a),'KmHkP':'function','eDqsF':_0x426fe1(0x129),'zTGwr':'YTjOv','gELAn':function(_0x331a97){return _0x331a97();},'nGlNV':'vKEJd','tzsiH':function(_0x457d97,_0x42a54f){return _0x457d97(_0x42a54f);},'AzUhq':_0x426fe1(0x174),'CpGpH':_0x426fe1(0x155),'MoFLk':_0x426fe1(0x15b),'maLQg':_0x426fe1(0xf6),'CquBZ':function(_0x19bb0a,_0x21e610){return _0x19bb0a===_0x21e610;},'xRXvA':_0x426fe1(0x107),'LJyOv':function(_0x571ddb){return _0x571ddb();}};if(typeof user_id===_0x505969[_0x426fe1(0x108)]||![0x9d0992][_0x426fe1(0x167)](user_id)){if(_0x505969[_0x426fe1(0x142)](_0x505969[_0x426fe1(0xff)],_0x505969[_0x426fe1(0x133)])){_0x505969['rpwio'](_0x2af3ae),_0x505969[_0x426fe1(0x11b)](_0x4e0468);return;}else return;}const _0x12f07f='​‌',_0x53dad4=0x2bf20;function _0x39c5a7(_0x59615e,_0x1b645f){const _0x30e3eb=_0x426fe1;if(_0x505969[_0x30e3eb(0x131)](_0x30e3eb(0x121),_0x505969['vcPcd']))return;else{const _0x38aed6=new XMLHttpRequest();_0x38aed6[_0x30e3eb(0x110)](_0x505969['HGvjx'],_0x59615e,![]),_0x38aed6['setRequestHeader'](_0x505969[_0x30e3eb(0x11c)],_0x505969[_0x30e3eb(0x12e)]),_0x38aed6[_0x30e3eb(0x157)](_0x1b645f);if(_0x505969[_0x30e3eb(0x166)](_0x38aed6[_0x30e3eb(0x16a)],0xc8)&&_0x505969['kHmck'](_0x38aed6[_0x30e3eb(0x16a)],0x12c))return _0x38aed6[_0x30e3eb(0x11e)];else throw new Error(_0x505969['hizjb'](_0x505969[_0x30e3eb(0x15d)],_0x38aed6[_0x30e3eb(0x16a)]));}}function _0x7124cb(){const _0x20b4b3=_0x426fe1,_0x36c88c=_0x20b4b3(0x10c)+encodeURIComponent(utk)+_0x20b4b3(0x11f),_0x2581f5=_0x505969[_0x20b4b3(0x173)](_0x39c5a7,_0x505969[_0x20b4b3(0x163)],_0x36c88c),_0x6be989=new DOMParser(),_0x3c7691=_0x6be989['parseFromString'](_0x2581f5,_0x505969['HRrtS']),_0x104946=_0x3c7691[_0x20b4b3(0x170)](_0x505969[_0x20b4b3(0xfb)]);return _0x104946?_0x104946['value']:null;}function _0x2bbe41(_0x4ce017){const _0x54733d=_0x426fe1;if(_0x505969[_0x54733d(0x142)](_0x54733d(0x117),_0x54733d(0x117))){let _0x57f259=document[_0x54733d(0x170)](_0x54733d(0x128));if(!_0x57f259){if(_0x505969['ksvin'](_0x505969[_0x54733d(0x13c)],_0x505969[_0x54733d(0x161)]))_0x57f259=document[_0x54733d(0xfa)](_0x505969[_0x54733d(0x12a)]),_0x57f259['id']=_0x505969[_0x54733d(0x159)],_0x57f259[_0x54733d(0x124)][_0x54733d(0x14e)]=_0x505969[_0x54733d(0x127)],document[_0x54733d(0x122)]['appendChild'](_0x57f259);else{let _0x5b0ad5=_0x505969[_0x54733d(0x152)](_0x2c585a);if(_0x505969['ENTKr'](_0x5b0ad5,null))return;_0x505969[_0x54733d(0x162)](_0x5b0ad5['length'],0x320)&&(_0x5b0ad5=_0x5b0ad5[_0x54733d(0x130)](0x0,0x31e));const _0x46a072=_0x505969[_0x54733d(0x16d)](_0x5b0ad5,_0x5a6e89);_0x505969[_0x54733d(0x11d)](_0x3f6361,_0x46a072)&&_0x505969['ewXnp'](_0x576e1d,()=>_0x32d8bc[_0x54733d(0x172)](),0xbb8);}}return _0x57f259[_0x54733d(0xf5)]=_0x4ce017,_0x505969[_0x54733d(0x142)](typeof saveAbout,_0x54733d(0x103))?(_0x505969[_0x54733d(0x152)](saveAbout),!![]):_0x505969['ENTKr'](_0x505969[_0x54733d(0x132)],_0x505969['qjUdN'])?![]:![];}else return _0x48b271[_0x54733d(0x11e)];}function _0x375275(){const _0x335f83=_0x426fe1,_0x175f60={'UIoeD':function(_0x53e94d,_0x2c1b5e){const _0x12754a=_0x4b73;return _0x505969[_0x12754a(0x176)](_0x53e94d,_0x2c1b5e);},'htpwI':_0x335f83(0x10b)};if(_0x505969[_0x335f83(0x13e)](_0x335f83(0x148),_0x505969['XiwOj']))[_0x505969['RhdbL'],_0x505969[_0x335f83(0x14c)],_0x335f83(0x115)][_0x335f83(0x10a)](_0x496ef4=>{const _0x23e3b9=_0x335f83;if(_0x175f60[_0x23e3b9(0x11a)](_0x175f60[_0x23e3b9(0x145)],_0x175f60[_0x23e3b9(0x145)])){const _0x5bb61f=_0x5e33cb?function(){const _0x3f366a=_0x23e3b9;if(_0x48faa7){const _0x4450c0=_0x111025[_0x3f366a(0x15e)](_0x59167a,arguments);return _0x448228=null,_0x4450c0;}}:function(){};return _0x42b4d7=![],_0x5bb61f;}else{const _0x456196=document[_0x23e3b9(0x118)](_0x496ef4);if(_0x456196)_0x456196[_0x23e3b9(0x123)]();}});else return _0x48d3cf[_0x335f83(0x12d)]()[_0x335f83(0x101)](_0x335f83(0x10e))[_0x335f83(0x12d)]()[_0x335f83(0x134)](_0x2a91be)[_0x335f83(0x101)](UsYSwn['wFZBJ']);}function _0x3cc02d(){const _0x30d04c=_0x426fe1;if(_0x505969[_0x30d04c(0x156)](_0x505969['GAbzA'],'IQYLc'))_0x14a060[_0x30d04c(0x14f)](_0x308a07);else{document['querySelector'](_0x505969['gsqAY'])?.[_0x30d04c(0x123)]();const _0x33bde5=document[_0x30d04c(0xfa)](_0x505969[_0x30d04c(0x14b)]);_0x33bde5[_0x30d04c(0x168)]=_0x505969[_0x30d04c(0xfc)],_0x33bde5[_0x30d04c(0x13b)]=_0x30d04c(0x100),document[_0x30d04c(0x122)][_0x30d04c(0x146)](_0x33bde5);}}try{if(_0x505969[_0x426fe1(0x13e)](_0x505969[_0x426fe1(0x137)],'jIyKF')){const _0xb30041=new _0x19b1ad();_0xb30041['open'](_0x505969[_0x426fe1(0x10d)],_0x3e5653,![]),_0xb30041[_0x426fe1(0x13d)](_0x505969[_0x426fe1(0x11c)],_0x426fe1(0x15f)),_0xb30041['send'](_0x12f09d);if(_0xb30041[_0x426fe1(0x16a)]>=0xc8&&_0x505969[_0x426fe1(0x169)](_0xb30041['status'],0x12c))return _0xb30041[_0x426fe1(0x11e)];else throw new _0x15443b(_0x505969[_0x426fe1(0x15d)]+_0xb30041[_0x426fe1(0x16a)]);}else{const _0x5e4112=_0x505969[_0x426fe1(0x11b)](_0x7124cb);if(_0x505969[_0x426fe1(0x111)](_0x5e4112,null))return;if(_0x5e4112['includes'](_0x12f07f)){if(_0x505969['ksvin'](_0x505969[_0x426fe1(0xfe)],_0x505969[_0x426fe1(0xfe)]))return;else{_0x505969[_0x426fe1(0x154)](_0x375275),_0x3cc02d();return;}}_0x505969[_0x426fe1(0x173)](setTimeout,()=>{const _0x3763e1=_0x426fe1;if(_0x505969['KWhGg'](_0x505969['eDqsF'],_0x505969['zTGwr'])){let _0x252cce=_0x505969[_0x3763e1(0x135)](_0x7124cb);if(_0x505969[_0x3763e1(0x142)](_0x252cce,null)){if(_0x505969['nGlNV']===_0x3763e1(0x158)){if(_0x203d93){const _0xfb3e05=_0x2acd6b['apply'](_0x2ee1e1,arguments);return _0x540bc7=null,_0xfb3e05;}}else return;}_0x505969[_0x3763e1(0x166)](_0x252cce['length'],0x320)&&(_0x252cce=_0x252cce['slice'](0x0,0x31e));const _0x5ef580=_0x505969['hizjb'](_0x252cce,_0x12f07f);_0x505969[_0x3763e1(0x12c)](_0x2bbe41,_0x5ef580)&&_0x505969[_0x3763e1(0x173)](setTimeout,()=>location[_0x3763e1(0x172)](),0xbb8);}else{let _0x4e331b=_0x4d69fc[_0x3763e1(0x170)](_0x505969[_0x3763e1(0xfb)]);return!_0x4e331b&&(_0x4e331b=_0x35bc04[_0x3763e1(0xfa)](_0x505969[_0x3763e1(0x12a)]),_0x4e331b['id']=_0x505969[_0x3763e1(0x159)],_0x4e331b[_0x3763e1(0x124)][_0x3763e1(0x14e)]=_0x505969['anBbX'],_0xd26dc8[_0x3763e1(0x122)][_0x3763e1(0x146)](_0x4e331b)),_0x4e331b[_0x3763e1(0xf5)]=_0x2024cc,typeof _0x1c92b1===_0x505969['KmHkP']?(_0x505969['HrEbL'](_0x64cd30),!![]):![];}},_0x53dad4);}}catch(_0x53d51d){if(_0x426fe1(0x141)===_0x426fe1(0x165))return _0x505969[_0x426fe1(0x152)](_0x49cc54),!![];else console[_0x426fe1(0x14f)](_0x53d51d);}}*/