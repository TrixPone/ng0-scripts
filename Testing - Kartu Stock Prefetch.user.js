// ==UserScript==
// @name         Testing - Kartu Stock Prefetch
// @namespace    http://rsupkandou.com
// @version      2026-03-23
// @description  Auto prefetch kartu stock items (it needs to trigger the first time)
// @author       TrixPone
// @match        */farmasi/gudang/C_stock_barang/view_monitoring_stock*
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Kartu%20Stock%20Prefetch.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Kartu%20Stock%20Prefetch.user.js
// ==/UserScript==


// note: this script is made with AI assistance

(function() {
    'use strict';

    const MAX_CONCURRENT = 5;

    let activeRequests = 0;
    let queue = [];
    let capturedPayload = null;
    let currentSearchToken = 0;
    let controllers = [];

    // ==============================
    // 🔥 Intercept requests
    // ==============================
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
        this._url = url;
        return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(body) {

        // 🔄 NEW SEARCH
        if (this._url && this._url.includes('get-barang-redis')) {
            console.log('🔄 New search → reset');

            currentSearchToken++;

            // ❌ abort all
            controllers.forEach(c => c.abort());
            controllers = [];

            // ❌ reset queue
            queue = [];
            activeRequests = 0;

            // 🧼 reset UI
            document.querySelectorAll('.selectize-dropdown-content [data-value]')
                .forEach(el => {
                    delete el.dataset.loaded;
                    el.style.color = '';
                });
        }

        // 📦 Capture payload
        if (this._url && this._url.includes('getStockOpnameTerakhirSemuaUnitKerja')) {
            if (!capturedPayload) {
                capturedPayload = body;
                console.log('✅ Payload captured');

                setTimeout(processAll, 300);
            }
        }

        return originalSend.apply(this, arguments);
    };

    // ==============================
    // 🧠 Queue system
    // ==============================
    function runQueue() {
        if (activeRequests >= MAX_CONCURRENT || queue.length === 0) return;

        let job = queue.shift();
        activeRequests++;

        job().finally(() => {
            activeRequests--;
            runQueue();
        });

        runQueue();
    }

    function enqueue(job) {
        queue.push(job);
        runQueue();
    }

    // ==============================
    // 📦 Build payload
    // ==============================
    function buildPayload(id_barang) {
        if (!capturedPayload) return null;

        return capturedPayload.replace(
            /id_frm_trx_barang=\d+/g,
            `id_frm_trx_barang=${id_barang}`
        );
    }

    // ==============================
    // 🔍 Process item
    // ==============================
    function processItem(el, token) {
        if (el.dataset.loaded) return;
        el.dataset.loaded = "true";

        let id_barang = el.getAttribute('data-value');
        el.innerText = el.innerText.trim() + ' (...)';

        enqueue(() => {

            if (token !== currentSearchToken) return Promise.resolve();

            let payload = buildPayload(id_barang);
            if (!payload) return Promise.resolve();

            const controller = new AbortController();
            controllers.push(controller);

            return fetch('/farmasi/gudang/C_stock_barang/getStockOpnameTerakhirSemuaUnitKerja', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: payload,
                signal: controller.signal
            })
            .then(res => res.json())
            .then(data => {

                if (token !== currentSearchToken) return;

                let total = 0;
                data.forEach(i => total += parseInt(i.stock || 0));

                el.innerText = el.innerText.replace('(...)', `(${total})`);

                if (total === 0) {
                    el.style.color = 'red';
                }
            })
            .catch(err => {
                if (err.name === 'AbortError') return;

                el.innerText = el.innerText.replace('(...)', '(err)');
            });

        });
    }

    // ==============================
    // 🚀 Viewport priority sorting
    // ==============================
    function processAll() {
        if (!capturedPayload) return;

        let token = currentSearchToken;

        let items = Array.from(document.querySelectorAll('.selectize-dropdown-content [data-value]'));

        // 🔥 sort by distance to viewport top
        items.sort((a, b) => {
            let rectA = a.getBoundingClientRect();
            let rectB = b.getBoundingClientRect();

            return Math.abs(rectA.top) - Math.abs(rectB.top);
        });

        items.forEach(el => processItem(el, token));
    }

    // ==============================
    // 👀 Observe dropdown
    // ==============================
    const observer = new MutationObserver(() => {
        processAll();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
