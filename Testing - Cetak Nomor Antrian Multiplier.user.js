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
    let statusEl = null;
    let stopBtn = null;
    let stopRequested = false;

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
            <label style="margin:0 8px;cursor:pointer;">
                <input type="radio" name="cetak_multiplier" value="1" checked> 1×
            </label>
            <label style="margin:0 8px;cursor:pointer;">
                <input type="radio" name="cetak_multiplier" value="5"> 5×
            </label>
            <label style="margin:0 8px;cursor:pointer;">
                <input type="radio" name="cetak_multiplier" value="10"> 10×
            </label>
            <label style="margin:0 8px;cursor:pointer;">
                <input type="radio" name="cetak_multiplier" value="50"> 50×
            </label>

            <div id="cetak-status" style="margin-top:8px;font-size:13px;color:#aaa;">
                Ready
            </div>

            <button id="cetak-stop"
                style="
                    display:none;
                    margin-top:6px;
                    padding:4px 10px;
                    font-size:12px;
                    background:#a00;
                    color:#fff;
                    border:none;
                    border-radius:4px;
                    cursor:pointer;
                ">
                STOP PRINTING
            </button>
        `;

        referenceButton.closest('.custom-border').appendChild(container);

        statusEl = container.querySelector('#cetak-status');
        stopBtn = container.querySelector('#cetak-stop');

        stopBtn.addEventListener('click', () => {
            stopRequested = true;
            statusEl.textContent = 'Stopped ⛔';
            stopBtn.style.display = 'none';
        });

        container.querySelectorAll('input[name="cetak_multiplier"]').forEach(radio => {
            radio.addEventListener('change', () => {
                multiplier = parseInt(radio.value, 10);
                statusEl.textContent = 'Ready';
            });
        });
    }

    function attachHandlers(buttons) {
        buttons.forEach(btn => {
            btn.addEventListener('click', function (e) {

                // ignore programmatic clicks
                if (e.__multiplied) return;

                if (multiplier <= 1) return;

                if (multiplier >= 50) {
                    const ok = confirm(
                        `YAKIN BRO?\n\nIni bakal cetak ${multiplier} kali.\n\nLanjut?`
                    );
                    if (!ok) {
                        statusEl.textContent = 'Cancelled';
                        return;
                    }
                }

                stopRequested = false;
                stopBtn.style.display = 'inline-block';

                let printed = 1;
                statusEl.textContent = `Printing ${printed} / ${multiplier}`;

                for (let i = 1; i < multiplier; i++) {
                    setTimeout(() => {
                        if (stopRequested) return;

                        printed++;
                        statusEl.textContent = `Printing ${printed} / ${multiplier}`;

                        const evt = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        evt.__multiplied = true;
                        btn.dispatchEvent(evt);

                        if (printed === multiplier) {
                            stopBtn.style.display = 'none';
                            setTimeout(() => {
                                statusEl.textContent = 'Done ✔';
                            }, 400);
                        }
                    }, i * CLICK_DELAY);
                }

            }, false);
        });
    }

    waitForButtons();
})();
