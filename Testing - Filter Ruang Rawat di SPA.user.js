// ==UserScript==
// @name         SPA Farmasi – Filter + Search (Auto Rebuild ver)
// @namespace    http://rsupkandou.com
// @version      2026-01-13
// @description  Filter Ruang Rawat, Status Resep, and text search with auto rebuild
// @author       TrixPone
// @match        */spa-farmasi
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @updateURL	 https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Filter%20Ruang%20Rawat%20di%20SPA.user.js
// @downloadURL	 https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Filter%20Ruang%20Rawat%20di%20SPA.user.js
// ==/UserScript==

/* globals waitForKeyElements */

// this script is made with AI assistance

(function () {
    'use strict';

    let ruangDropdown, statusDropdown, searchInput;

    function clearOldControls() {
        document.querySelectorAll('.spa-filter-col').forEach(el => el.remove());
    }

    function initControls(headerRow) {
        clearOldControls();

        function createCol() {
            const col = document.createElement('div');
            col.className = 'col spa-filter-col';
            headerRow.appendChild(col);
            return col;
        }

        // Ruang Rawat
        ruangDropdown = document.createElement('select');
        ruangDropdown.className = 'form-control form-control-sm bg-dark';
        ruangDropdown.innerHTML = `<option value="">-- All Ruang --</option>`;
        createCol().appendChild(ruangDropdown);

        // Status Resep
        statusDropdown = document.createElement('select');
        statusDropdown.className = 'form-control form-control-sm bg-dark';
        statusDropdown.innerHTML = `<option value="">-- All Status --</option>`;
        createCol().appendChild(statusDropdown);

        // Search box
        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Cari nama / norm / resep...';
        searchInput.className = 'form-control form-control-sm bg-dark';
        createCol().appendChild(searchInput);
    }

    function populateDropdown(dropdown, rows, columnIndex) {
        const values = new Set();

        rows.forEach(row => {
            values.add(row.cells[columnIndex].innerText.trim());
        });

        values.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            dropdown.appendChild(opt);
        });
    }

    function applyFilters() {
        const ruangVal = ruangDropdown.value;
        const statusVal = statusDropdown.value;
        const searchVal = searchInput.value.toLowerCase();

        document.querySelectorAll('#div_eresep_list_tabel tbody tr').forEach(row => {
            const ruang = row.cells[5].innerText.trim();
            const status = row.cells[8].innerText.trim();
            const rowText = row.innerText.toLowerCase();

            const ruangMatch = ruangVal === '' || ruang === ruangVal;
            const statusMatch = statusVal === '' || status === statusVal;
            const searchMatch = searchVal === '' || rowText.includes(searchVal);

            row.style.display = (ruangMatch && statusMatch && searchMatch)
                ? ''
                : 'none';
        });
    }

    function initFilters() {
        const table = document.querySelector('#div_eresep_list_tabel table');
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        if (!rows.length) return;

        const headerRow = document
            .getElementById('div_eresep_list_header')
            .querySelector('.row');

        initControls(headerRow);

        populateDropdown(ruangDropdown, rows, 5);
        populateDropdown(statusDropdown, rows, 8);

        ruangDropdown.addEventListener('change', applyFilters);
        statusDropdown.addEventListener('change', applyFilters);
        searchInput.addEventListener('input', applyFilters);
    }

    // Rebuild whenever table appears / reappears
    waitForKeyElements(
        '#div_eresep_list_tabel table',
        initFilters,
        true
    );
})();
