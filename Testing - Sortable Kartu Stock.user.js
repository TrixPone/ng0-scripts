// ==UserScript==
// @name         Testing - Sortable Kartu Stock
// @namespace    http://rsupkandou.com
// @version      2026-03-24
// @description  Make the Kartu Stock table sortable
// @author       TrixPone
// @match        */farmasi/gudang/C_stock_barang/view_monitoring_stock*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Sortable%20Kartu%20Stock.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Sortable%20Kartu%20Stock.user.js
// ==/UserScript==

// note: this script is made with AI assistance

(function () {
    'use strict';

    function makeTableSortable(table) {
        if (!table || table.dataset.sortableAttached) return;

        const headers = table.querySelectorAll("thead th");
        const tbody = table.querySelector("#list-stock");

        if (!headers.length || !tbody) return;

        headers.forEach((header, index) => {
            let asc = true;

            header.style.cursor = "pointer";

            header.addEventListener("click", () => {
                const rows = Array.from(tbody.querySelectorAll("tr"));

                // clear all indicators
                headers.forEach(h => {
                    h.innerHTML = h.innerHTML.replace(/[\u25B2\u25BC]/g, '').trim();
                });

                const sortedRows = rows.sort((a, b) => {
                    let A = a.children[index].innerText.trim();
                    let B = b.children[index].innerText.trim();

                    let numA = parseFloat(A.replace(/,/g, ""));
                    let numB = parseFloat(B.replace(/,/g, ""));

                    if (!isNaN(numA) && !isNaN(numB)) {
                        return asc ? numA - numB : numB - numA;
                    }

                    return asc
                        ? A.localeCompare(B)
                        : B.localeCompare(A);
                });

                // set indicator
                header.innerHTML = header.innerHTML.trim() + (asc ? ' ▲' : ' ▼');

                asc = !asc;

                // re-append sorted rows
                tbody.innerHTML = "";
                sortedRows.forEach(row => tbody.appendChild(row));
            });
        });

        table.dataset.sortableAttached = "true";
        console.log("✅ Sortable table with indicator initialized");
    }

    function observeTable() {
        const observer = new MutationObserver(() => {
            const table = document.querySelector("#table_laporan");
            if (table) {
                makeTableSortable(table);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    observeTable();
})();
