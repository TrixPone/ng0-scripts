// ==UserScript==
// @name         Testing - Cetak Nomor Antrian Multiplier
// @namespace    http://rsupkandou.com
// @version      2026-02-18
// @description  Add print multiplier (1x, 5x, 10x) to CETAK buttons
// @author       TrixPone
// @match        https://ng0.rsupkandou.com:3000/monitoring/antrian/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let multiplier = 1;
    let statusEl = null;
    let stopBtn = null;
    let stopRequested = false;
    let activeRequests = 0;

    /* ==============================
       NETWORK MONITOR
    ============================== */

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function () {
        this._isTracked = true;
        return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function () {
        if (this._isTracked) {
            activeRequests++;

            this.addEventListener('loadend', () => {
                activeRequests--;
            });
        }
        return originalSend.apply(this, arguments);
    };

    function waitForNetworkIdle() {
        return new Promise(resolve => {
            const check = () => {
                if (activeRequests === 0) {
                    resolve();
                } else {
                    setTimeout(check, 50);
                }
            };
            check();
        });
    }

    /* ==============================
       UI
    ============================== */

    function waitForButtons() {
        const buttons = document.querySelectorAll('.btn_cetak_antrian');
        if (!buttons.length) {
            setTimeout(waitForButtons, 500);
            return;
        }

        injectUI(buttons[0]);
        attachHandlers(buttons);
    }

    function injectUI(referenceButton) {
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

    /* ==============================
       SMART PRINT SEQUENCER
    ============================== */

    function attachHandlers(buttons) {
        buttons.forEach(btn => {
            btn.addEventListener('click', async function (e) {

                if (e.__multiplied) return;
                if (multiplier <= 1) return;

                stopRequested = false;
                stopBtn.style.display = 'inline-block';

                let printed = 1;
                statusEl.textContent = `Printing ${printed} / ${multiplier}`;

                for (let i = 1; i < multiplier; i++) {

                    if (stopRequested) break;

                    await waitForNetworkIdle();

                    if (stopRequested) break;

                    printed++;
                    statusEl.textContent = `Printing ${printed} / ${multiplier}`;

                    const evt = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    evt.__multiplied = true;
                    btn.dispatchEvent(evt);
                }

                stopBtn.style.display = 'none';

                if (!stopRequested) {
                    statusEl.textContent = 'Done ✔';
                }
            }, false);
        });
    }

    waitForButtons();
})();
