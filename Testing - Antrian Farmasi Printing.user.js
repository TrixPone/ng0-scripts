// ==UserScript==
// @name         Testing - Antrian Farmasi Printing
// @namespace    http://rsupkandou.com
// @version      2026-06-22
// @description  Script for filtering, sort and printing from Antrian Farmasi page
// @author       TrixPone
// @match        https://ng0.rsupkandou.com:3000/monitoring/antrian/*
// @match        https://farmasi.rsupkandou.com/monitoring/antrian/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @grant        none
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Antrian%20Farmasi%20Printing.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Antrian%20Farmasi%20Printing.user.js
// ==/UserScript==

// THIS SCRIPT IS FULLY MADE WITH AI
// me currently dont have time to fully write it

(function () {
    'use strict';

//    let toggleActive = false;
    let fontSize = Number(localStorage.getItem('antrianFontSize')) || 14;
    let activeFilters = new Set(
        JSON.parse(localStorage.getItem('antrianFilters') || '[]')
    );
    let sortState = JSON.parse(localStorage.getItem('antrianSort') || 'null');

    const ACTIVE_COLOR = '#00ddbf';

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

        /* ===== PRINT ONLY ===== */
        @media print {
            .print-rj {
                font-size:38pt !important;
                font-weight:800 !important;
                line-height:1.1 !important;
                white-space:nowrap !important;
            }

            .print-nama {
                font-size:19pt !important;
                font-weight:500 !important;
            }

            .print-no {
                font-size:19pt !important;
                width:1% !important;
                white-space:nowrap !important;
                text-align:center !important;
            }
        }
    `;
    document.head.appendChild(style);

    const observer = new MutationObserver(() => {
        const table = document.querySelector('#tabel_antrian_farmasi table');
       const col12 = document.querySelector('span.col-12');
const headerSpan = document.querySelector(
    'span.col-12:has(#btn_refresh_antrian_farmasi)'
);
        if (table && col12 && !document.getElementById('antrian-print-toolbar')) {
            injectUI(col12);
            enhanceTable();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function injectUI(container) {
        const wrap = document.createElement('div');
        wrap.id = 'antrian-print-toolbar';
        wrap.style.marginBottom = '8px';

      

        const printBtn = btn(
            '<i class="fa fa-print"></i> Print Selected Rows',
            'btn btn-success btn-sm',
            printSelected,
            true
        );

        const tools = document.createElement('div');
        tools.style.marginTop = '6px';
        tools.style.display = '';

        const regulerBtn = filterBtn('Reguler', 'A', 'green-button');
        const khususBtn = filterBtn('Khusus', 'B', 'yellow-button');
        const citoBtn = filterBtn('CITO', 'C', 'red-button');

        const selectAllBtn = btn('Select ALL Visible Rows','btn btn-outline-light btn-sm',selectAllVisible);
        const deselectBtn = btn('Deselect All','btn btn-outline-light btn-sm',deselectAll);

        const fontDown = btn('A−','btn btn-secondary btn-sm',()=>changeFont(-1));
        const fontUp = btn('A+','btn btn-secondary btn-sm',()=>changeFont(1));
        const fontReset = btn('Reset Font','btn btn-secondary btn-sm',resetFont);

        tools.append(fontDown,fontUp,fontReset,regulerBtn,khususBtn,citoBtn,selectAllBtn,deselectBtn);
        tools.prepend(printBtn);

wrap.append(tools);
        container.appendChild(wrap);

        wrap._printBtn = printBtn;
wrap._filterBtns = {
    regulerBtn,
    khususBtn,
    citoBtn
};
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
            activeFilters.has(suffix) ? activeFilters.delete(suffix) : activeFilters.add(suffix);
            localStorage.setItem('antrianFilters', JSON.stringify([...activeFilters]));
            applyFilter();
            updateFilterButtons();
        });
    }

  

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
            tr.onclick = () => {
    tr.classList.toggle('selected-print-row');
};
        });
    }

    function applyFilter() {
        document.querySelectorAll('#tabel_antrian_farmasi tbody tr').forEach(tr => {
            const code = tr.querySelector('td:nth-child(2)')?.innerText.trim();
            tr.style.display =
                !activeFilters.size || [...activeFilters].some(s => code?.endsWith(s))
                    ? ''
                    : 'none';
        });
    }

    function updateFilterButtons() {
        const wrap = document.getElementById('antrian-print-toolbar');
        if (!wrap) return;
        wrap._filterBtns.regulerBtn.classList.toggle('btn-active-custom', activeFilters.has('A'));
        wrap._filterBtns.khususBtn.classList.toggle('btn-active-custom', activeFilters.has('B'));
        wrap._filterBtns.citoBtn.classList.toggle('btn-active-custom', activeFilters.has('C'));
    }

    function applyFont() {
        document.querySelectorAll('#tabel_antrian_farmasi tbody tr')
            .forEach(tr => tr.style.fontSize = fontSize + 'px');
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
        sortState = sortState?.col === col
            ? { col, dir: sortState.dir === 'asc' ? 'desc' : 'asc' }
            : { col, dir: 'asc' };
        localStorage.setItem('antrianSort', JSON.stringify(sortState));
        applySort();
    }

    function applySort() {
        if (!sortState) return;
        const tbody = document.querySelector('#tabel_antrian_farmasi tbody');
        [...tbody.querySelectorAll('tr')]
            .sort((a,b)=>sortState.dir==='asc'
                ? a.children[sortState.col].innerText.localeCompare(b.children[sortState.col].innerText,undefined,{numeric:true})
                : b.children[sortState.col].innerText.localeCompare(a.children[sortState.col].innerText,undefined,{numeric:true})
            ).forEach(r=>tbody.appendChild(r));
    }

    function selectAllVisible() {
        document.querySelectorAll('#tabel_antrian_farmasi tbody tr')
            .forEach(tr => tr.style.display !== 'none' && tr.classList.add('selected-print-row'));
    }

    function deselectAll() {
        document.querySelectorAll('.selected-print-row')
            .forEach(tr => tr.classList.remove('selected-print-row'));
    }

    function printSelected() {
        const table = document.querySelector('#tabel_antrian_farmasi table');
        const selected = table.querySelectorAll('tbody tr.selected-print-row');
        if (!selected.length) return alert('No rows selected.');

        const removeIdx = [];
        table.querySelectorAll('thead th').forEach((th,i)=>{
            const t = th.innerText.toLowerCase();
            if (/(status|mulai|estimasi|selesai|durasi)/.test(t)) removeIdx.push(i);
        });

        const container = document.createElement('div');
        container.id = 'temp-print-container';
        container.innerHTML = `<div style="font-size:28pt;font-weight:800;margin-bottom:12px;">Antrian Farmasi</div>`;

        const pTable = document.createElement('table');
        pTable.style.width = '100%';
        pTable.style.borderCollapse = 'collapse';

        const thead = document.createElement('thead');
        const htr = document.createElement('tr');
        table.querySelectorAll('thead th').forEach((th,i)=>{
            if(!removeIdx.includes(i)) htr.appendChild(th.cloneNode(true));
        });
        thead.appendChild(htr);

        const tbody = document.createElement('tbody');
        selected.forEach(tr=>{
            const r = document.createElement('tr');
            tr.querySelectorAll('td').forEach((td,i)=>{
                if(!removeIdx.includes(i)){
                    const c = td.cloneNode(true);
                    const txt = c.innerText.trim();

                    if (/^RJ/i.test(txt)) c.classList.add('print-rj');
                    else if (i === 0) c.classList.add('print-no');
                    else c.classList.add('print-nama');

                    r.appendChild(c);
                }
            });
            tbody.appendChild(r);
        });

        pTable.append(thead,tbody);
        container.appendChild(pTable);
        document.body.appendChild(container);

        const ps = document.createElement('style');
        ps.innerHTML = `
            @media print {
                body * { visibility:hidden!important; }
                #temp-print-container, #temp-print-container * { visibility:visible!important; }
                #temp-print-container { position:absolute; top:0; left:0; width:100%; }
                th, td { border:1px solid #000; padding:6px; }
            }
        `;
        document.head.appendChild(ps);

        window.print();
        ps.remove();
        container.remove();
    }
})();
