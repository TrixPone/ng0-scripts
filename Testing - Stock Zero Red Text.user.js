// ==UserScript==
// @name         Testing - Stock Zero Red Text
// @namespace    http://rsupkandou.com
// @version      2026-02-03
// @description  Script for highlighting zero stock with bright red
// @author       TrixPone
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @match        */spa-farmasi*
// @grant        none
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Stock%20Zero%20Red%20Text.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Stock%20Zero%20Red%20Text.user.js
// ==/UserScript==

// THIS SCRIPT IS FULLY MADE WITH AI

(function () {
    'use strict';

    function styleZeroStock() {
        document.querySelectorAll(
            '.selectize-dropdown-content div[data-selectable]'
        ).forEach(el => {

            if (el.dataset.zeroStyled) return;

            const isZero =
                /\(0\)\s*$/.test(el.textContent.trim()) ||
                (el.dataset.value && el.dataset.value.endsWith('@0'));

            if (isZero) {
                el.dataset.zeroStyled = 'true';
                el.style.color = '#ff0000'; // bright red
            }
        });
    }

    styleZeroStock();

    const observer = new MutationObserver(styleZeroStock);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
