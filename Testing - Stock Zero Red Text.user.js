// ==UserScript==
// @name         Testing - Stock Zero Red Text
// @namespace    http://rsupkandou.com
// @version      2026-02-05
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

    // 🟣 Hardcoded keywords (case-insensitive)
    const MAGENTA_KEYWORDS = [
        'UREA',
        'KLORO'
    ];

    function styleItems() {
        document.querySelectorAll(
            '.selectize-dropdown-content div[data-selectable]'
        ).forEach(el => {

            if (el.dataset.styled) return;

            const originalHTML = el.innerHTML;
            const text = el.textContent;
            const value = el.dataset.value || '';

            // 🔴 Zero stock — HIGHEST PRIORITY (entire entry red)
            const isZeroStock =
                /\(0\)\s*$/.test(text.trim()) ||
                value.endsWith('@0');

            if (isZeroStock) {
                el.style.color = '#ff0000';
                el.dataset.styled = 'zero';
                return;
            }

            // 🟣 Keyword match — partial text only
            let newHTML = originalHTML;
            let matched = false;

            MAGENTA_KEYWORDS.forEach(keyword => {
                const regex = new RegExp(`(${keyword})`, 'gi');
                if (regex.test(newHTML)) {
                    matched = true;
                    newHTML = newHTML.replace(
                        regex,
                        `<span style="color:#FF00FF;">$1</span>`
                    );
                }
            });

            if (matched) {
                el.innerHTML = newHTML;
                el.dataset.styled = 'keyword';
            }
        });
    }

    styleItems();

    const observer = new MutationObserver(styleItems);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
