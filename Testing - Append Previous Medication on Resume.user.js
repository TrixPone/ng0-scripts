// ==UserScript==
// @name         Testing - Append Previous Medication on Resume
// @namespace    http://rsupkandou.com
// @version      2026-02-14
// @description  Append previous medication without switching registration
// @author       TrixPone
// @match        https://ng0.rsupkandou.com:3000/penunjang/C_historyPenunjang/getPencarianResumePasienDetail/*
// @grant        GM_xmlhttpRequest
// @connect      ng0.rsupkandou.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Append%20Previous%20Medication%20on%20Resume.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Append%20Previous%20Medication%20on%20Resume.user.js
// ==/UserScript==

(function() {
    'use strict';

    let zeroHighlightActive = false;

    // =====================================================
    // WAIT UNTIL FARMASI TAB IS ACTIVE
    // =====================================================
    function waitForFarmasiReady(callback) {

        const observer = new MutationObserver(() => {

            const farmasiPane = document.querySelector('#farmasi.active.show');
            const farmasiTable = farmasiPane?.querySelector('table');

            if (farmasiPane && farmasiTable) {
                observer.disconnect();
                callback();
            }

        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }

    waitForFarmasiReady(initEnhancer);

    // =====================================================
    // MAIN INITIALIZER
    // =====================================================
    function initEnhancer() {
        createZeroQtyToggle();
        loadPreviousFarmasi();
    }

    // =====================================================
    // ZERO QTY TOGGLE (TOP RIGHT)
    // =====================================================
    function createZeroQtyToggle() {

        const tabContent = document.querySelector('#myTabContent');
        if (!tabContent) return;

        tabContent.style.position = "relative";

        const toggleBtn = document.createElement('button');
        toggleBtn.innerText = "Highlight 0 Qty: OFF";
        toggleBtn.style.position = "absolute";
        toggleBtn.style.top = "5px";
        toggleBtn.style.right = "10px";
        toggleBtn.style.zIndex = "9999";
        toggleBtn.style.fontSize = "12px";
        toggleBtn.style.padding = "4px 8px";
        toggleBtn.className = "btn btn-sm btn-outline-danger";

        toggleBtn.addEventListener('click', function() {

            zeroHighlightActive = !zeroHighlightActive;

            toggleBtn.innerText = zeroHighlightActive
                ? "Highlight 0 Qty: ON"
                : "Highlight 0 Qty: OFF";

            toggleBtn.className = zeroHighlightActive
                ? "btn btn-sm btn-danger"
                : "btn btn-sm btn-outline-danger";

            highlightZeroQty();
        });

        tabContent.appendChild(toggleBtn);
    }

    function highlightZeroQty() {

        const tables = document.querySelectorAll('#farmasi table');

        tables.forEach(table => {

            const rows = table.querySelectorAll('tbody tr');

            rows.forEach(row => {

                const qtyCell = row.querySelector('td:last-child');
                if (!qtyCell) return;

                const qty = qtyCell.innerText.trim();

                if (qty === "0") {

                    if (zeroHighlightActive) {
                        row.style.color = "#ff0000";   // RED TEXT ONLY
                    } else {
                        row.style.color = "";
                    }
                }

            });

        });
    }

    // =====================================================
    // LOAD PREVIOUS FARMASI
    // =====================================================
    function loadPreviousFarmasi() {

        const farmasiContainer = document.querySelector('#farmasi');
        const normInput = document.querySelector('#norm');

        if (!farmasiContainer || !normInput) return;

        const norm = normInput.value;
        const base_url = window.location.origin + "/";
        const currentId = window.location.pathname.split('/').pop();

        // Sticky Loader
        const loadingBar = document.createElement('div');
        loadingBar.style.position = "fixed";
        loadingBar.style.bottom = "0";
        loadingBar.style.left = "0";
        loadingBar.style.width = "100%";
        loadingBar.style.padding = "8px 15px";
        loadingBar.style.background = "#111";
        loadingBar.style.color = "#00ddbf";
        loadingBar.style.fontSize = "14px";
        loadingBar.style.zIndex = "9999";
        loadingBar.style.borderTop = "2px solid #00ddbf";
        loadingBar.style.textAlign = "center";
        loadingBar.style.display = "none";
        document.body.appendChild(loadingBar);

        // Wrapper Section
        const wrapperRow = document.createElement('div');
        wrapperRow.className = "row mt-4";

        const wrapperCol = document.createElement('div');
        wrapperCol.className = "col-12";

        const titleDiv = document.createElement('div');
        titleDiv.style.color = "#00ddbf";
        titleDiv.style.borderBottom = "2px solid #00ddbf";
        titleDiv.style.paddingBottom = "6px";
        titleDiv.style.marginBottom = "10px";
        titleDiv.style.fontWeight = "bold";
        titleDiv.innerText = "Riwayat Farmasi Sebelumnya";

        wrapperCol.appendChild(titleDiv);
        wrapperRow.appendChild(wrapperCol);
        farmasiContainer.appendChild(wrapperRow);

        // Fetch previous registrations
        GM_xmlhttpRequest({
            method: "POST",
            url: base_url + "penunjang/C_historyPenunjang/getDetailPendaftaran",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: "norm=" + encodeURIComponent(norm),
            onload: function(response) {

                let data;
                try {
                    data = JSON.parse(response.responseText);
                } catch (e) {
                    return;
                }

                const filtered = data.filter(d => d.id_trx_pendaftaran != currentId);

                if (!filtered.length) return;

                loadingBar.style.display = "block";
                loadingBar.innerText = "Loading 0 / " + filtered.length + " ...";

                let loaded = 0;

                filtered.forEach(item => {

                    const detailUrl = base_url +
                        "penunjang/C_historyPenunjang/getPencarianResumePasienDetail/" +
                        item.id_trx_pendaftaran;

                    GM_xmlhttpRequest({
                        method: "GET",
                        url: detailUrl,
                        onload: function(res) {

                            const parser = new DOMParser();
                            const doc = parser.parseFromString(res.responseText, "text/html");

                            const farmasiTable = doc.querySelector('#farmasi table');

                            if (farmasiTable) {

                                const visitInfo = document.createElement('div');
                                visitInfo.className = "mt-3 mb-1";
                                visitInfo.innerHTML = `
                                    <strong>${item.tanggal_pendaftaran}</strong>
                                    | ${item.nm_unit_ruangan}
                                `;

                                wrapperCol.appendChild(visitInfo);
                                wrapperCol.appendChild(farmasiTable.cloneNode(true));
                            }

                            loaded++;
                            loadingBar.innerText = `Loading ${loaded} / ${filtered.length} ...`;

                            if (loaded === filtered.length) {
                                loadingBar.innerText = "Completed ✓";
                                setTimeout(() => loadingBar.remove(), 1200);
                            }

                            // Reapply highlight if toggle active
                            if (zeroHighlightActive) {
                                highlightZeroQty();
                            }
                        }
                    });

                });

            }
        });
    }

})();
