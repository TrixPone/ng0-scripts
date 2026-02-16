// ==UserScript==
// @name         Testing - Highlight Latest Individual Medication on History Obat Page
// @namespace    http://rsupkandou.com
// @version      2026-02-16
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

    function getMainTable() {
        return document.getElementById(
            'ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_gvHistPelayanan_DXMainTable'
        );
    }

    // ✅ CORRECT DX HEADER DETECTION
    function getColumnIndexes() {
        const headerRow = document.querySelector(
            '#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_gvHistPelayanan_DXHeadersRow0'
        );
        if (!headerRow) return null;

        const headers = headerRow.querySelectorAll('td.dxgvHeader_Glass');
        const idx = {};

        headers.forEach((td, i) => {
            const t = td.innerText.trim();
            if (t === 'TGL PELAYANAN') idx.date = i;
            if (t === 'NAMA OBAT') idx.obat = i;
            if (t === 'JML OBAT') idx.jml = i;
        });

        return idx;
    }

    function parseDateDMY(d) {
        const [dd, mm, yy] = d.split('/').map(Number);
        return new Date(yy, mm - 1, dd);
    }

    function parseJml(text) {
        return parseFloat(
            text.replace(/\./g, '').replace(',', '.')
        ) || 0;
    }

    function applyLogic() {
        const table = getMainTable();
        if (!table) return;

        const idx = getColumnIndexes();
        if (!idx) return;

        const rows = table.querySelectorAll('tbody tr.dxgvDataRow_Glass');
        const latest = {};

        // find latest per medication
        if (state.highlight) {
            rows.forEach(r => {
                const date = r.cells[idx.date]?.innerText.trim();
                const obat = r.cells[idx.obat]?.innerText.trim();
                const jml = parseJml(r.cells[idx.jml]?.innerText || '');

                if (!date || jml === 0) return;
                if (state.filterObat !== '__ALL__' && obat !== state.filterObat) return;

                const d = parseDateDMY(date);
                if (!latest[obat] || parseDateDMY(latest[obat]) < d) {
                    latest[obat] = date;
                }
            });
        }

        rows.forEach(r => {
            r.style.display = '';
            r.style.backgroundColor = '';
            r.style.color = '';
            r.style.opacity = '';

            const date = r.cells[idx.date]?.innerText.trim();
            const obat = r.cells[idx.obat]?.innerText.trim();
            const jml = parseJml(r.cells[idx.jml]?.innerText || '');

            // filter medication
            if (state.filterObat !== '__ALL__' && obat !== state.filterObat) {
                r.style.display = 'none';
                return;
            }

            // zero handling
            if (jml === 0) {
                if (state.hideZero) {
                    r.style.display = 'none';
                } else if (state.highlight) {
                    r.style.backgroundColor = '#f2f2f2';
                    r.style.color = '#999';
                }
                return;
            }

            // latest highlight
            if (state.highlight && latest[obat] === date) {
                r.style.backgroundColor = '#D3F9D8';
            }
        });
    }

    function buildControls() {
        const anchor = document.querySelector('.dxgvCSD');
        if (!anchor || document.getElementById('histobat-controls')) return;

        const wrap = document.createElement('div');
        wrap.id = 'histobat-controls';
        wrap.style.display = 'flex';
        wrap.style.alignItems = 'center';
        wrap.style.gap = '8px';
        wrap.style.margin = '2px';

        function makeCheck(label, checked, cb) {
            const l = document.createElement('label');
            const i = document.createElement('input');
            i.type = 'checkbox';
            i.checked = checked;
            i.onchange = cb;
            l.append(i, ' ', label);
            return l;
        }

        const toggleHighlight = makeCheck('Toggle Highlight', state.highlight, e => {
            state.highlight = e.target.checked;
            localStorage.setItem(LS.highlight, state.highlight);
            applyLogic();
        });

        const hideZero = makeCheck('Hide JML OBAT = 0', state.hideZero, e => {
            state.hideZero = e.target.checked;
            localStorage.setItem(LS.hideZero, state.hideZero);
            applyLogic();
        });

        const select = document.createElement('select');
        select.onchange = () => {
            state.filterObat = select.value;
            localStorage.setItem(LS.filterObat, state.filterObat);
            applyLogic();
        };

        wrap.append(toggleHighlight, hideZero, select);
        anchor.prepend(wrap);

        buildDropdown(select);
    }

    function buildDropdown(select) {
        const table = getMainTable();
        if (!table) return;

        const idx = getColumnIndexes();
        if (!idx) return;

        const meds = new Set();

        table.querySelectorAll('tbody tr.dxgvDataRow_Glass').forEach(r => {
            const val = r.cells[idx.obat]?.innerText.trim();
            if (val) meds.add(val);
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

        const icon = document.createElement('span');
        icon.innerHTML = '📋';
        icon.style.cursor = 'pointer';
        icon.title = 'Paste';

        icon.onclick = async () => {
            const input = document.getElementById(
                'ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_txtNOKAPST_I'
            );
            if (!input) return;
            const text = await navigator.clipboard.readText();
            input.value = text;
            input.focus();
            input.dispatchEvent(new Event('change', { bubbles: true }));
        };

        td.appendChild(icon);
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
