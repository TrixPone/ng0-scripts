// ==UserScript==
// @name         Testing - Obat tidak ada Highlighting
// @namespace    http://rsupkandou.com
// @version      2026-02-03
// @description  Highlight qty non zero and 'Obat tidak ada' in spa-page
// @author       TrixPone
// @match        */spa-farmasi*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Obat%20tidak%20ada%20Highlighting.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Obat%20tidak%20ada%20Highlighting.user.js
// ==/UserScript==

// THIS SCRIPT IS FULLY MADE WITH AI

(function () {
    'use strict';

    /* ===============================
       STYLE: always make warning red
       =============================== */
    const style = document.createElement('style');
    style.textContent = `
        p.pt-3 {
            color: red !important;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);

    /* ===============================
       CORE LOGIC
       =============================== */
    function applyHighlight() {
        document.querySelectorAll('tbody#tbody_resep_detail tr').forEach(tr => {

            const warning = tr.querySelector('p.pt-3');
            const qtyCell = tr.querySelector('td.td-update-qty');
            if (!warning || !qtyCell) return;

            const span = qtyCell.querySelector('span');
            const input = qtyCell.querySelector('input.input-update-qty');
            if (!span || !input) return;

            const qty = parseInt(span.textContent.trim(), 10) || 0;
            const isEditing = input.type === 'text';

            /* ===============================
               RESET STATE (safe every tick)
               =============================== */
            span.style.color = '';
            span.style.fontWeight = '';
            span.style.display = '';

            if (isEditing) {
                span.style.display = 'none';
                input.style.display = '';
            } else {
                input.style.display = 'none';
            }

            /* ===============================
               APPLY CONDITION
               =============================== */
            if (warning.textContent.includes('Obat tidak ada.') && qty > 0) {
                span.style.color = 'red';
                span.style.fontWeight = 'bold';
            }
        });
    }

    /* ===============================
       SIMPLE + STABLE POLLING
       =============================== */
    setInterval(applyHighlight, 700);

})();
