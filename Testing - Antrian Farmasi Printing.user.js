// ==UserScript==
// @name         Testing - Antrian Farmasi Printing
// @namespace    http://rsupkandou.com
// @version      2026-01-21
// @description  Script for filtering, sort and printing from Antrian Farmasi page
// @author       TrixPone
// @match        https://ng0.rsupkandou.com:3000/monitoring/antrian/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @grant        none
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Antrian%20Farmasi%20Printing.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Antrian%20Farmasi%20Printing.user.js
// ==/UserScript==

// THIS SCRIPT IS FULLY MADE WITH AI
// me currently dont have time to fully write it

(function () {
    'use strict';

    /* ================= STATE ================= */

    let toggleActive = false;

    let fontSize = Number(localStorage.getItem('antrianFontSize')) || 14;
    let activeFilter = localStorage.getItem('antrianFilter') || null;
    let sortState = JSON.parse(localStorage.getItem('antrianSort') || 'null');

    const ACTIVE_COLOR = '#00ddbf';

    /* ================= STYLES ================= */

    const style = document.createElement('style');
    style.innerHTML = `
        .btn-active-custom {
            background:${ACTIVE_COLOR}!important;
            border-color:${ACTIVE_COLOR}!important;
            color:#000!important;
        }
        .selected-print-row {
            background:#2a7cff55!important;
        }
        .sort-btn {
            background:none;
            border:none;
            color:#fff;
            cursor:pointer;
            padding:0 4px;
            font-size:12px;
        }
        .sort-btn.active {
            color:${ACTIVE_COLOR};
        }
    `;
    document.head.appendChild(style);

    /* ================= OBSERVER ================= */

    const observer = new MutationObserver(() => {
        const table = document.querySelector('#tabel_antrian_farmasi table');
        const col12 = document.querySelector('.col-12');

        if (table && col12 && !document.getElementById('togglePrintBtn')) {
            injectUI(col12);
            enhanceTable();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    /* ================= UI ================= */

    function injectUI(container) {
        const wrap = document.createElement('div');
        wrap.style.marginBottom = '8px';

        const toggleBtn = btn('Toggle Print State', 'btn btn-warning btn-sm', togglePrint);
        toggleBtn.id = 'togglePrintBtn';

        const printBtn = btn(
            '<i class="fa fa-print"></i> Print Selected Rows',
            'btn btn-success btn-sm',
            printSelected,
            true
        );
        printBtn.style.display = 'none';

        const tools = document.createElement('div');
        tools.style.marginTop = '6px';
        tools.style.display = 'none';

        const regulerBtn = filterBtn('Reguler', 'A', 'green-button');
        const khususBtn = filterBtn('Khusus', 'B', 'yellow-button');
        const citoBtn = filterBtn('CITO', 'C', 'red-button');

        const selectAllBtn = btn(
            'Select ALL Visible Rows',
            'btn btn-outline-light btn-sm',
            selectAllVisible
        );
        const deselectBtn = btn(
            'Deselect All',
            'btn btn-outline-light btn-sm',
            deselectAll
        );

        const fontDown = btn('A−', 'btn btn-secondary btn-sm', () => changeFont(-1));
        const fontUp = btn('A+', 'btn btn-secondary btn-sm', () => changeFont(1));
        const fontReset = btn('Reset Font', 'btn btn-secondary btn-sm', resetFont);

        tools.append(
            fontDown,
            fontUp,
            fontReset,
            regulerBtn,
            khususBtn,
            citoBtn,
            selectAllBtn,
            deselectBtn
        );

        wrap.append(toggleBtn, printBtn, tools);
        container.prepend(wrap);

        wrap._toggleBtn = toggleBtn;
        wrap._printBtn = printBtn;
        wrap._tools = tools;
        wrap._filterBtns = { regulerBtn, khususBtn, citoBtn };
    }

    function btn(text, cls, fn, html = false) {
        const b = document.createElement('button');
        b.className = cls + ' mr-1';
        html ? (b.innerHTML = text) : (b.textContent = text);
        b.onclick = fn;
        return b;
    }

    function filterBtn(label, suffix, color) {
        return btn(label, `btn ${color} btn_cetak_antrian btn-sm`, () => {
            activeFilter = activeFilter === suffix ? null : suffix;
            localStorage.setItem('antrianFilter', activeFilter || '');
            applyFilter();
            updateFilterButtons();
        });
    }

    /* ================= TOGGLE ================= */

    function togglePrint() {
        toggleActive = !toggleActive;
        const wrap = document.querySelector('.col-12').firstChild;
        wrap._toggleBtn.classList.toggle('btn-active-custom', toggleActive);
        wrap._printBtn.style.display = toggleActive ? '' : 'none';
        wrap._tools.style.display = toggleActive ? '' : 'none';
    }

    /* ================= TABLE ================= */

    function enhanceTable() {
        applyFont();
        applyFilter();
        applySort();
        makeRowsSelectable();
        injectSortButtons();
        updateFilterButtons();
    }

    function makeRowsSelectable() {
        document.querySelectorAll('#tabel_antrian_farmasi tbody tr').forEach(tr => {
            if (tr.dataset.sel) return;
            tr.dataset.sel = '1';
            tr.style.cursor = 'pointer';
            tr.onclick = () => {
                if (!toggleActive) return;
                tr.classList.toggle('selected-print-row');
            };
        });
    }

    /* ================= FILTER ================= */

    function applyFilter() {
        document.querySelectorAll('#tabel_antrian_farmasi tbody tr').forEach(tr => {
            const code = tr.querySelector('td:nth-child(2)')?.innerText.trim();
            tr.style.display =
                !activeFilter || code?.endsWith(activeFilter) ? '' : 'none';
        });
    }

    function updateFilterButtons() {
        const wrap = document.querySelector('.col-12')?.firstChild;
        if (!wrap) return;

        Object.entries(wrap._filterBtns).forEach(([key, btn]) => {
            const suffix = key === 'regulerBtn' ? 'A' : key === 'khususBtn' ? 'B' : 'C';
            btn.classList.toggle('btn-active-custom', activeFilter === suffix);
        });
    }

    /* ================= FONT ================= */

    function applyFont() {
        document
            .querySelectorAll('#tabel_antrian_farmasi tbody tr')
            .forEach(tr => (tr.style.fontSize = fontSize + 'px'));
    }

    function changeFont(delta) {
        fontSize = Math.min(22, Math.max(10, fontSize + delta));
        localStorage.setItem('antrianFontSize', fontSize);
        applyFont();
    }

    function resetFont() {
        fontSize = 14;
        localStorage.setItem('antrianFontSize', fontSize);
        applyFont();
    }

    /* ================= SORT ================= */

    function injectSortButtons() {
        document.querySelectorAll('#tabel_antrian_farmasi thead th').forEach((th, i) => {
            if (th.querySelector('.sort-btn')) return;

            const sb = document.createElement('button');
            sb.className = 'sort-btn';
            sb.innerHTML = '▲▼';
            sb.onclick = () => toggleSort(i);
            th.appendChild(sb);
        });
    }

    function toggleSort(col) {
        sortState =
            sortState?.col === col
                ? { col, dir: sortState.dir === 'asc' ? 'desc' : 'asc' }
                : { col, dir: 'asc' };

        localStorage.setItem('antrianSort', JSON.stringify(sortState));
        applySort();
    }

    function applySort() {
        if (!sortState) return;

        const tbody = document.querySelector('#tabel_antrian_farmasi tbody');
        const rows = [...tbody.querySelectorAll('tr')];

        rows.sort((a, b) => {
            const A = a.children[sortState.col]?.innerText || '';
            const B = b.children[sortState.col]?.innerText || '';
            return sortState.dir === 'asc'
                ? A.localeCompare(B, undefined, { numeric: true })
                : B.localeCompare(A, undefined, { numeric: true });
        });

        rows.forEach(r => tbody.appendChild(r));
    }

    /* ================= SELECT ================= */

    function selectAllVisible() {
        document
            .querySelectorAll('#tabel_antrian_farmasi tbody tr')
            .forEach(tr => {
                if (tr.style.display !== 'none') {
                    tr.classList.add('selected-print-row');
                }
            });
    }

    function deselectAll() {
        document
            .querySelectorAll('.selected-print-row')
            .forEach(tr => tr.classList.remove('selected-print-row'));
    }

    /* ================= PRINT ================= */

    function printSelected() {
        const table = document.querySelector('#tabel_antrian_farmasi table');
        const selected = table.querySelectorAll('tbody tr.selected-print-row');

        if (!selected.length) {
            alert('No rows selected.');
            return;
        }

        /* === ROBUST COLUMN REMOVAL === */
        const removeIdx = [];
        table.querySelectorAll('thead th').forEach((th, i) => {
            const text = th.innerText
                .toLowerCase()
                .replace(/\s+/g, '');

            if (
                text.includes('status') ||
                text.includes('mulai') ||
                text.includes('estimasi') ||
                text.includes('selesai') ||
                text.includes('durasi')
            ) {
                removeIdx.push(i);
            }
        });

        const container = document.createElement('div');
        container.id = 'temp-print-container';

        container.innerHTML = `
            <div style="margin-bottom:10px;">
                <div style="font-size:20px;font-weight:600;">Antrian Farmasi</div>
                <div style="font-size:14px;">
                    Printed: ${new Date().toLocaleString()}<br>
                    Total Rows: ${selected.length}
                </div>
            </div>
            <hr>
        `;

        const pTable = document.createElement('table');
        pTable.style.width = '100%';
        pTable.style.borderCollapse = 'collapse';
        pTable.style.fontSize = fontSize + 'px';

        const thead = document.createElement('thead');
        const htr = document.createElement('tr');

        table.querySelectorAll('thead th').forEach((th, i) => {
            if (!removeIdx.includes(i)) {
                htr.appendChild(th.cloneNode(true));
            }
        });

        thead.appendChild(htr);

        const tbody = document.createElement('tbody');
        selected.forEach(tr => {
            const r = document.createElement('tr');
            tr.querySelectorAll('td').forEach((td, i) => {
                if (!removeIdx.includes(i)) {
                    r.appendChild(td.cloneNode(true));
                }
            });
            tbody.appendChild(r);
        });

        pTable.append(thead, tbody);
        container.appendChild(pTable);
        document.body.appendChild(container);

        const ps = document.createElement('style');
        ps.innerHTML = `
            @media print {
                body * { visibility:hidden!important; }
                #temp-print-container,
                #temp-print-container * { visibility:visible!important; }
                #temp-print-container {
                    position:absolute;
                    top:0;
                    left:0;
                    width:100%;
                }
                th, td {
                    border:1px solid #000;
                    padding:4px;
                }
            }
        `;
        document.head.appendChild(ps);

        window.print();

        ps.remove();
        container.remove();
    }
})();
