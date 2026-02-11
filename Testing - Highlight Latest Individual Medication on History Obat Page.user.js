// ==UserScript==
// @name         Testing - Highlight Latest Individual Medication on History Obat Page
// @namespace    http://rsupkandou.com
// @version      2026-02-11
// @description  Highlight latest medication, gray out zero quantity, toggle hide JML OBAT = 0, toggle highlight, remember state, clickable medication filter
// @author       TrixPone
// @match        https://apotek.bpjs-kesehatan.go.id/apotek/frmHistObat.aspx
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Highlight%20Latest%20Individual%20Medication%20on%20History%20Obat%20Page.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Highlight%20Latest%20Individual%20Medication%20on%20History%20Obat%20Page.user.js
// ==/UserScript==


/* globals waitForKeyElements */

(function () {
    'use strict';

    const LS = {
        highlight: 'histobat_toggle_highlight',
        hideZero: 'histobat_hide_zero',
        filterObat: 'histobat_filter_obat'
    };

    const state = {
        highlight: localStorage.getItem(LS.highlight) !== 'false',
        hideZero: localStorage.getItem(LS.hideZero) === 'true',
        filterObat: localStorage.getItem(LS.filterObat) || '__ALL__'
    };

    function parseDateDMY(d) {
        const [dd, mm, yy] = d.split('/').map(Number);
        return new Date(yy, mm - 1, dd);
    }

    function getMainTable() {
        return document.getElementById(
            'ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_gvHistPelayanan_DXMainTable'
        );
    }

    function getColumnIndexByHeaderText(text) {
        const headerRow = document.getElementById(
            'ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_gvHistPelayanan_DXHeadersRow0'
        );
        if (!headerRow) return -1;

        const cells = [...headerRow.children];
        return cells.findIndex(td => td.innerText.trim() === text);
    }

    function applyLogic() {
        const table = getMainTable();
        if (!table) return;

        const idxDate = getColumnIndexByHeaderText('TGL PELAYANAN');
        const idxObat = getColumnIndexByHeaderText('NAMA OBAT');
        const idxJml  = getColumnIndexByHeaderText('JML OBAT');

        if (idxDate < 0 || idxObat < 0) return;

        const rows = table.querySelectorAll('tbody tr.dxgvDataRow_Glass');
        const latest = {};

        rows.forEach(row => {
            const date = row.cells[idxDate]?.innerText.trim();
            const obat = row.cells[idxObat]?.innerText.trim();
            if (!date || !obat) return;

            const d = parseDateDMY(date);
            if (!latest[obat] || parseDateDMY(latest[obat]) < d) {
                latest[obat] = date;
            }
        });

        rows.forEach(row => {
            row.style.display = '';
            row.style.backgroundColor = '';
            row.style.opacity = '';

            const date = row.cells[idxDate]?.innerText.trim();
            const obat = row.cells[idxObat]?.innerText.trim();
            const jml  = idxJml >= 0 ? row.cells[idxJml]?.innerText.trim() : '';

            if (state.highlight && latest[obat] === date) {
                row.style.backgroundColor = '#D3F9D8';
            }

            if (state.highlight && jml === '0') {
                row.style.opacity = '0.45';
            }

            if (state.hideZero && jml === '0') {
                row.style.display = 'none';
            }

            if (state.filterObat !== '__ALL__' && obat !== state.filterObat) {
                row.style.display = 'none';
            }
        });
    }

    function buildControls() {
        if (document.getElementById('histobat-controls')) return;

        const anchor = document.querySelector('.dxgvCSD');
        if (!anchor) return;

        const wrap = document.createElement('div');
        wrap.id = 'histobat-controls';
        wrap.style.display = 'flex';
        wrap.style.alignItems = 'center';
        wrap.style.gap = '8px';
        wrap.style.margin = '2px';

        function checkbox(label, checked, onChange) {
            const l = document.createElement('label');
            l.style.cursor = 'pointer';
            const i = document.createElement('input');
            i.type = 'checkbox';
            i.checked = checked;
            i.onchange = onChange;
            l.append(i, ' ', label);
            return l;
        }

        const toggleHighlight = checkbox('Toggle Highlight', state.highlight, e => {
            state.highlight = e.target.checked;
            localStorage.setItem(LS.highlight, state.highlight);
            applyLogic();
        });

        const hideZero = checkbox('Hide JML OBAT = 0', state.hideZero, e => {
            state.hideZero = e.target.checked;
            localStorage.setItem(LS.hideZero, state.hideZero);
            applyLogic();
        });

        const select = document.createElement('select');
        select.style.height = '26px';
        select.onchange = () => {
            state.filterObat = select.value;
            localStorage.setItem(LS.filterObat, state.filterObat);
            applyLogic();
        };

        wrap.append(toggleHighlight, hideZero, select);
        anchor.prepend(wrap);

        buildMedicationDropdown(select);
    }

    function buildMedicationDropdown(select) {
        const table = getMainTable();
        if (!table) return;

        const idxObat = getColumnIndexByHeaderText('NAMA OBAT');
        if (idxObat < 0) return;

        const meds = new Set();
        table.querySelectorAll('tbody tr.dxgvDataRow_Glass').forEach(r => {
            const v = r.cells[idxObat]?.innerText.trim();
            if (v) meds.add(v);
        });

        select.innerHTML = '';
        const all = document.createElement('option');
        all.value = '__ALL__';
        all.textContent = 'Show All';
        select.appendChild(all);

        [...meds].sort().forEach(m => {
            const o = document.createElement('option');
            o.value = m;
            o.textContent = m;
            select.appendChild(o);
        });

        select.value = state.filterObat;
    }

    function injectPasteIcon() {
        const table = document.getElementById(
            'ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_txtNOKAPST'
        );
        if (!table || table.dataset.pasteReady) return;
        table.dataset.pasteReady = '1';

        const tr = table.querySelector('tbody tr');
        const td = document.createElement('td');
        td.style.paddingLeft = '4px';

        const btn = document.createElement('span');
        btn.textContent = '📋';
        btn.style.cursor = 'pointer';
        btn.title = 'Paste';
        btn.onclick = async () => {
            const input = document.getElementById(
                'ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_txtNOKAPST_I'
            );
            if (!input) return;
            const text = await navigator.clipboard.readText();
            input.value = text;
            input.focus();
            input.dispatchEvent(new Event('change', { bubbles: true }));
        };

        td.appendChild(btn);
        tr.appendChild(td);
    }

    waitForKeyElements('.dxgvCSD', () => {
        buildControls();
        applyLogic();
    });

    waitForKeyElements(
        '#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_txtNOKAPST',
        injectPasteIcon
    );

})();
