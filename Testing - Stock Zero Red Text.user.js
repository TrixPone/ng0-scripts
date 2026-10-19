
 // ==UserScript==
 // @name         Testing - Stock Zero Red Text
 // @namespace    http://rsupkandou.com
 // @version      2026-10-13
 // @description  Script for highlighting zero stock with bright red
 // @author       TrixPone
 // @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
 // @match        https://farmasi.rsupkandou.com/*spa-farmasi*
 // @match        https://*.rsupkandou.com/farmasi/depo/C_order_depo/view_order_detail/*
 // @grant        none
 // @updateURL    https://raw.githubusercontent.com/TrixPone/ng0-scripts/main/Testing%20-%20Stock%20Zero%20Red%20Text.user.js
 // @downloadURL  https://raw.githubusercontent.com/TrixPone/ng0-scripts/main/Testing%20-%20Stock%20Zero%20Red%20Text.user.js
 // ==/UserScript==
 // THIS SCRIPT IS FULLY MADE WITH AI

(function () {
    'use strict';

    const MAGENTA_KEYWORDS = [
        'HIDROKSI',
        'UREA',
        'KLORO'
    ];

    const DROPDOWN_SELECTOR = '.selectize-dropdown-content';
    const ITEM_SELECTOR = 'div[data-selectable]';

    let nextStockOrder = 0;

    // -----------------------------------
    // Stock detection
    // -----------------------------------
    function isZeroStock(el) {
        const text = el.textContent.trim();
        const value = el.dataset.value || '';

        return /\(0\)\s*$/.test(text) || value.endsWith('@0');
    }

    // -----------------------------------
    // Keyword highlighting
    // -----------------------------------
    const escapedKeywords = MAGENTA_KEYWORDS
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)
        .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    const keywordRegex = escapedKeywords.length
        ? new RegExp(`(${escapedKeywords.join('|')})`, 'gi')
        : null;

    function highlightKeywords(el) {
        const text = el.textContent;

        // Skip rebuilding if the current highlight is already correct
        if (
            el.dataset.tmHighlighted === 'true' &&
            el.dataset.tmSourceText === text
        ) {
            return;
        }

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let matched = false;

        if (keywordRegex) {
            keywordRegex.lastIndex = 0;

            let match;

            while ((match = keywordRegex.exec(text)) !== null) {
                matched = true;

                fragment.appendChild(
                    document.createTextNode(
                        text.slice(lastIndex, match.index)
                    )
                );

                const span = document.createElement('span');
                span.dataset.tmKeyword = 'true';
                span.style.color = '#FF00FF';
                span.textContent = match[0];

                fragment.appendChild(span);
                lastIndex = keywordRegex.lastIndex;
            }
        }

        if (!matched) {
            // Remove previous keyword spans only when necessary
            if (el.dataset.tmHighlighted === 'true') {
                el.textContent = text;
                delete el.dataset.tmHighlighted;
                delete el.dataset.tmSourceText;
            }

            return;
        }

        fragment.appendChild(
            document.createTextNode(text.slice(lastIndex))
        );

        el.replaceChildren(fragment);
        el.dataset.tmHighlighted = 'true';
        el.dataset.tmSourceText = text;
    }

    // -----------------------------------
    // Process and sort one dropdown
    // -----------------------------------
    function processDropdown(dropdown) {
        const items = Array.from(
            dropdown.querySelectorAll(ITEM_SELECTOR)
        );

        if (!items.length) return;

        // Assign a stable original order to each new option
        items.forEach(el => {
            if (el.dataset.stockOrder === undefined) {
                el.dataset.stockOrder = String(nextStockOrder++);
            }
        });

        // Available stock first; preserve order within each group
        const sorted = [...items].sort((a, b) => {
            const aZero = isZeroStock(a);
            const bZero = isZeroStock(b);

            if (aZero !== bZero) {
                return aZero ? 1 : -1;
            }

            return Number(a.dataset.stockOrder) -
                   Number(b.dataset.stockOrder);
        });

        // Only move nodes when the order actually differs
        const needsSorting = sorted.some(
            (el, index) => el !== items[index]
        );

        if (needsSorting) {
            sorted.forEach(el => dropdown.appendChild(el));
        }

        // Apply stock and keyword colors
        sorted.forEach(el => {
            if (isZeroStock(el)) {
                // Zero stock takes priority over keywords
                el.style.color = '#FF0000';

                // Remove keyword spans if present
                if (el.dataset.tmHighlighted === 'true') {
                    el.textContent = el.textContent;
                    delete el.dataset.tmHighlighted;
                    delete el.dataset.tmSourceText;
                }
            } else {
                el.style.removeProperty('color');
                highlightKeywords(el);
            }
        });
    }

    function processAllDropdowns() {
        document.querySelectorAll(DROPDOWN_SELECTOR)
            .forEach(processDropdown);
    }

    // -----------------------------------
    // Observe dynamic Selectize/AJAX lists
    // -----------------------------------
    const observer = new MutationObserver(records => {
        // Ignore unrelated changes elsewhere on the page
        const relevant = records.some(record => {
            const target = record.target.nodeType === Node.ELEMENT_NODE
                ? record.target
                : record.target.parentElement;

            if (target?.closest(DROPDOWN_SELECTOR)) {
                return true;
            }

            return Array.from(record.addedNodes).some(node => {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    return false;
                }

                return node.matches(DROPDOWN_SELECTOR) ||
                    node.matches(ITEM_SELECTOR) ||
                    !!node.querySelector(
                        `${DROPDOWN_SELECTOR}, ${ITEM_SELECTOR}`
                    );
            });
        });

        if (!relevant) return;

        // Disconnect before changing DOM to prevent observer feedback loops
        observer.disconnect();

        try {
            processAllDropdowns();
        } finally {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    });

    // Initial pass, before observation begins
    processAllDropdowns();

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
})();
