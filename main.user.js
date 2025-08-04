// ==UserScript==
// @name         Better TC
// @namespace    http://tampermonkey.net/
// @version      0.15
// @description  Userscript for TC that adds QOL features and more
// @author       C418
// @match        *://www.teen-chat.org/*
// @require      https://github.com/chaodziejg/btc/raw/refs/heads/main/styling.js
// @require      https://github.com/chaodziejg/btc/raw/refs/heads/main/options.js
// @require      https://github.com/chaodziejg/btc/raw/refs/heads/main/login.js
// @require      https://github.com/chaodziejg/btc/raw/refs/heads/main/translations.js
// @require      https://github.com/chaodziejg/btc/raw/refs/heads/main/chatstuff.js
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
