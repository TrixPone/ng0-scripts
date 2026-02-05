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

    const CLICK_DELAY = 300;
    let multiplier = 1;

    function waitForButtons() {
        const buttons = document.querySelectorAll('.btn_cetak_antrian');
        if (!buttons.length) {
            setTimeout(waitForButtons, 500);
            return;
        }

        injectMultiplierUI(buttons[0]);
        attachHandlers(buttons);
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

    function attachHandlers(buttons) {
        buttons.forEach(btn => {
            btn.addEventListener('click', function (e) {

                // ignore programmatic clicks
                if (e.__multiplied) return;

                // first click is NORMAL — site handles it
                if (multiplier <= 1) return;

                // schedule extra clicks
                for (let i = 1; i < multiplier; i++) {
                    setTimeout(() => {
                        const evt = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        evt.__multiplied = true;
                        btn.dispatchEvent(evt);
                    }, i * CLICK_DELAY);
                }

            }, false); // <-- NOT capture
        });
    }

    waitForButtons();
})();
