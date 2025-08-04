// ==UserScript==
// @name         Better TC
// @namespace    http://tampermonkey.net/
// @version      0.15
// @description  A cool userscript
// @author       C418
// @match        *://www.teen-chat.org/*
// @require      https://github.com/chaodziejg/btc/styling.js
// @require      https://github.com/chaodziejg/btc/options.js
// @require      https://github.com/chaodziejg/btc/login.js
// @require      https://github.com/chaodziejg/btc/translations.js
// @require      https://github.com/chaodziejg/btc/chatstuff.js
// @license      MIT
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    function init() {
        betterdark();
        fixbackground();
        removegradient();
        betterspinners();
        newthemeoption();
        setTextAndBackgrounds();
        loadTranlations();
        btcoptions();
        overrideChatReload();
        function isInnactive() { }
    }
    if (containsLoginDefaults()) {
        betterstyling();
        languagedropdown();
        betterregistration();
        betterlogin();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
