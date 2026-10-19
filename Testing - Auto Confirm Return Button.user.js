// ==UserScript==
// @name         Testing - Auto Confirm Return Button
// @namespace    http://rsupkandou.com
// @version      2026-10-19
// @description  Adds a button to auto confirm on retur page, skipping the whole modal menu
// @author       TrixPone
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @match        *://*.rsupkandou.com/farmasi/retur/C_Return_obat_depo/*
// @grant        GM_xmlhttpRequest
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Auto%20Confirm%20Return%20Button.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Auto%20Confirm%20Return%20Button.user.js
// ==/UserScript==

//THIS SCRIPT IS MADE WITH AI ASSISTANCE

(function () {
    'use strict';

    const BASE_URL =
        'https://farmasi.rsupkandou.com/farmasi/depo-returajax/';

    function addButtons() {
        document.querySelectorAll(
            '#tabel-riwayat tbody tr'
        ).forEach(row => {
            const cells = row.querySelectorAll('td');

            if (cells.length < 11) return;

            const actionCell = cells[10];
            const mainBtn = actionCell.querySelector(
                'button[data-idtrxreturnobat]'
            );

            if (!mainBtn) return;

            // Skip already-confirmed items
            if (mainBtn.innerText.includes('Telah Di Konfirmasi')) {
                return;
            }

            // Make "Jumlah Obat" editable (column 8)
            const qtyCell = cells[7];

            if (!qtyCell.querySelector('.editable-return-qty')) {
                const originalQty = Number(
                    qtyCell.textContent.trim()
                );

                if (!Number.isInteger(originalQty) || originalQty < 1) {
                    return;
                }

                qtyCell.textContent = '';

                const qtyInput = document.createElement('input');
                qtyInput.type = 'number';
                qtyInput.className =
                    'form-control form-control-sm editable-return-qty';

                qtyInput.value = originalQty;
                qtyInput.min = '1';
                qtyInput.max = String(originalQty);
                qtyInput.step = '1';
                qtyInput.style.width = '65px';
                qtyInput.style.margin = '0 auto';
                qtyInput.style.textAlign = 'center';
                qtyInput.title =
                    `Quantity to confirm (maximum ${originalQty})`;

                // Remember the original maximum quantity
                qtyInput.dataset.maxQty = String(originalQty);

                qtyCell.appendChild(qtyInput);
            }

            // Add Auto Confirm button once
            if (actionCell.querySelector('.auto-confirm-btn')) {
                return;
            }

            const id = mainBtn.getAttribute('data-idtrxreturnobat');

            const autoBtn = document.createElement('button');
            autoBtn.type = 'button';
            autoBtn.textContent = 'Auto Confirm';
            autoBtn.className =
                'btn btn-sm btn-warning auto-confirm-btn';

            autoBtn.style.marginTop = '4px';
            autoBtn.style.width = '100%';

            autoBtn.addEventListener('click', function () {
                const qtyInput = qtyCell.querySelector(
                    '.editable-return-qty'
                );

                if (!qtyInput) {
                    alert('Quantity input not found.');
                    return;
                }

                const qty = Number(qtyInput.value);
                const maxQty = Number(qtyInput.dataset.maxQty);

                // Validate the edited quantity
                if (
                    !Number.isInteger(qty) ||
                    qty < 1 ||
                    qty > maxQty
                ) {
                    alert(
                        `Enter a whole number between 1 and ${maxQty}.`
                    );
                    qtyInput.focus();
                    return;
                }

                autoConfirm(id, qty, autoBtn);
            });

            actionCell.appendChild(autoBtn);
        });
    }

    function autoConfirm(id, qty, buttonEl) {
        buttonEl.disabled = true;
        buttonEl.textContent = 'Processing...';

        GM_xmlhttpRequest({
            method: 'POST',
            url: BASE_URL + 'getDetailRetur',
            headers: {
                'Content-Type':
                    'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: new URLSearchParams({
                idtrxreturnobat: id
            }).toString(),

            onload: function (res) {
                let detail;

                try {
                    detail = JSON.parse(res.responseText);
                } catch (error) {
                    console.error(
                        'Failed to parse return details:',
                        res.responseText
                    );
                    setButtonError(buttonEl, 'Detail Error');
                    return;
                }

                // Ensure required detail fields exist
                if (
                    !detail.id_trx_resep_detail ||
                    !detail.id_mst_ruangan ||
                    !detail.exp_date
                ) {
                    console.error('Missing required detail fields:', detail);
                    setButtonError(buttonEl, 'Missing Data');
                    return;
                }

                // Use the EDITED quantity, not detail.qty
                const payload = {
                    idtrxreturnobat: id,
                    idtrxresepdetail: detail.id_trx_resep_detail,
                    qty_konfirmasi: String(qty),
                    depo_tujuan: detail.id_mst_ruangan,
                    exp_date: detail.exp_date,
                    tgl_konfirmasi: getNow(),
                    alasan_retur: ''
                };

                console.log('Sending confirmation:', payload);

                sendConfirm(payload, buttonEl);
            },

            onerror: function (error) {
                console.error('Detail request failed:', error);
                setButtonError(buttonEl, 'Request Error');
            }
        });
    }

    function sendConfirm(payload, buttonEl) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: BASE_URL + 'confirmReturn',
            headers: {
                'Content-Type':
                    'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: new URLSearchParams(payload).toString(),

            onload: function (res) {
                console.log('Confirm response:', res.responseText);

                if (
                    res.status < 200 ||
                    res.status >= 300 ||
                    res.responseText.includes('Tidak Boleh Kosong')
                ) {
                    setButtonError(buttonEl, 'Failed');
                    return;
                }

                buttonEl.textContent = 'Done';
                buttonEl.classList.remove('btn-warning');
                buttonEl.classList.add('btn-success');

                // Update the visible confirmation status immediately
                const row = buttonEl.closest('tr');
                const mainBtn = row?.querySelector(
                    'button[data-idtrxreturnobat]'
                );

                if (mainBtn) {
                    mainBtn.innerHTML =
                        'Telah Di Konfirmasi <i class="fa fa-check"></i>';
                    mainBtn.classList.remove('konfirmasi_obat');
                    mainBtn.classList.add(
                        'custom-btn-green',
                        'detailkonfirmasi'
                    );
                }

                // Remove the Auto Confirm button after success
                buttonEl.remove();
            },

            onerror: function (error) {
                console.error('Confirmation request failed:', error);
                setButtonError(buttonEl, 'Request Error');
            }
        });
    }

    function setButtonError(buttonEl, message) {
        buttonEl.disabled = false;
        buttonEl.textContent = message;
        buttonEl.classList.remove('btn-warning');
        buttonEl.classList.add('btn-danger');
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

    // Simple periodic reattachment for DataTables redraws
    setInterval(addButtons, 1500);

})();
