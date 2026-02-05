// ==UserScript==
// @name         Testing - Cetak Nomor Antrian Multiplier
// @namespace    http://rsupkandou.com
// @version      2026-02-05
// @description  Add print multiplier (1x, 5x, 10x) to CETAK buttons
// @author       TrixPone
// @match        https://ng0.rsupkandou.com:3000/monitoring/antrian/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CLICK_DELAY = 300; // ms between each print click
    let multiplier = 1;

    function waitForButtons() {
        const buttons = document.querySelectorAll('.btn_cetak_antrian');
        if (buttons.length === 0) {
            setTimeout(waitForButtons, 500);
            return;
        }

        injectMultiplierUI(buttons[0]);
        overrideButtonClicks(buttons);
    }

    function injectMultiplierUI(referenceButton) {
        if (document.getElementById('cetak-multiplier')) return;

        const container = document.createElement('div');
        container.id = 'cetak-multiplier';
        container.style.cssText = `
            margin-top: 15px;
            padding: 10px;
            border: 1px solid #444;
            border-radius: 6px;
            background: #111;
            color: #fff;
            text-align: center;
        `;

        container.innerHTML = `
            <div style="margin-bottom:6px;font-weight:bold;">
                Jumlah Cetak
            </div>
            <label style="margin:0 10px;cursor:pointer;">
                <input type="radio" name="cetak_multiplier" value="1" checked> 1×
            </label>
            <label style="margin:0 10px;cursor:pointer;">
                <input type="radio" name="cetak_multiplier" value="5"> 5×
            </label>
            <label style="margin:0 10px;cursor:pointer;">
                <input type="radio" name="cetak_multiplier" value="10"> 10×
            </label>
        `;

        referenceButton.closest('.custom-border').appendChild(container);

        container.querySelectorAll('input[name="cetak_multiplier"]').forEach(radio => {
            radio.addEventListener('change', () => {
                multiplier = parseInt(radio.value, 10);
            });
        });
    }

    function overrideButtonClicks(buttons) {
        buttons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopImmediatePropagation();
                e.preventDefault();

                let count = 0;

                const clickLoop = () => {
                    if (count >= multiplier) return;
                    count++;
                    btn.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    }));
                    setTimeout(clickLoop, CLICK_DELAY);
                };

                clickLoop();
            }, true);
        });
    }

    waitForButtons();
})();
