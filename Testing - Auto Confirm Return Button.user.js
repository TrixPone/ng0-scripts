// ==UserScript==
// @name         Testing - Auto Confirm Return Button
// @namespace    http://rsupkandou.com
// @version      2026-04-27
// @description  Adds a button to auto confirm on retur page, skipping the whole modal menu
// @author       TrixPone
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @match        *://ng0.rsupkandou.com:3000/farmasi/retur/C_Return_obat_depo/*
// @grant        GM_xmlhttpRequest
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Auto%20Confirm%20Return%20Button.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Auto%20Confirm%20Return%20Button.user.js
// ==/UserScript==

//THIS SCRIPT IS MADE WITH AI ASSISTANCE

(function () {
    'use strict';

    function addButtons() {
        document.querySelectorAll('#tabel-riwayat tbody tr').forEach(row => {
            const actionCell = row.querySelector('td:last-child');
            if (!actionCell) return;

            const mainBtn = actionCell.querySelector('button[data-idtrxreturnobat]');
            if (!mainBtn) return;

            // ✅ SKIP if already confirmed
            if (mainBtn.innerText.includes('Telah')) return;

            // prevent duplicate
            if (actionCell.querySelector('.auto-confirm-btn')) return;

            const id = mainBtn.getAttribute('data-idtrxreturnobat');

            const autoBtn = document.createElement('button');
            autoBtn.textContent = 'Auto Confirm';
            autoBtn.className = 'btn btn-sm btn-warning auto-confirm-btn';
            autoBtn.style.marginTop = '4px';
            autoBtn.style.width = '100%';

            autoBtn.onclick = () => autoConfirm(id, autoBtn);

            actionCell.appendChild(autoBtn);
        });
    }

    function autoConfirm(id, buttonEl) {
        buttonEl.disabled = true;
        buttonEl.textContent = 'Processing...';

        GM_xmlhttpRequest({
            method: "POST",
            url: "https://ng0.rsupkandou.com:3000/farmasi/depo-returajax/getDetailRetur",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest"
            },
            data: `idtrxreturnobat=${id}`,

            onload: function (res) {
                let detail;

                try {
                    detail = JSON.parse(res.responseText);
                } catch {
                    buttonEl.textContent = 'Error';
                    return;
                }

                const payload = {
                    idtrxreturnobat: id,
                    idtrxresepdetail: detail.id_trx_resep_detail,
                    qty_konfirmasi: detail.qty,
                    depo_tujuan: detail.id_mst_ruangan,
                    exp_date: detail.exp_date,
                    tgl_konfirmasi: getNow(),
                    alasan_retur: ''
                };

                sendConfirm(payload, buttonEl);
            },

            onerror: () => buttonEl.textContent = 'Error'
        });
    }

    function sendConfirm(payload, buttonEl) {
        const formData = Object.entries(payload)
            .map(([k, v]) => `${k}=${encodeURIComponent(v ?? '')}`)
            .join('&');

        GM_xmlhttpRequest({
            method: "POST",
            url: "https://ng0.rsupkandou.com:3000/farmasi/depo-returajax/confirmReturn",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest"
            },
            data: formData,

            onload: function (res) {
                if (res.responseText.includes("Tidak Boleh Kosong")) {
                    buttonEl.textContent = 'Failed';
                    return;
                }

                buttonEl.textContent = 'Done';
                buttonEl.classList.remove('btn-warning');
                buttonEl.classList.add('btn-success');
            },

            onerror: () => buttonEl.textContent = 'Error'
        });
    }

    function getNow() {
        const d = new Date();
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0') + ' ' +
            String(d.getHours()).padStart(2, '0') + ':' +
            String(d.getMinutes()).padStart(2, '0') + ':' +
            String(d.getSeconds()).padStart(2, '0');
    }

    setInterval(addButtons, 1500);

})();
