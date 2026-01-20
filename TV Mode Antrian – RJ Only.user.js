// ==UserScript==
// @name         TV Mode Antrian – RJ Only
// @namespace    http://rsupkandou.com
// @version      2026-01-20
// @description  RJ-only TV cards, numeric sort, color coding, modal-safe rehook, Simpan full refresh
// @author       TrixPone
// @match        https://ng0.rsupkandou.com:3000/monitoring/antrian/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @grant        none
// ==/UserScript==

// THIS SCRIPT IS FULLY MADE WITH AI
// me currently dont have time to fully write it

(function () {
    'use strict';

    const AUTO_LENGTH = 1000;
    const DEFAULT_BORDER = '#00ddbf';
    let tbodyObserver = null;

    // RJ-only is DEFAULT
    let RJ_ONLY_MODE = true;

    /* -------------------- helpers -------------------- */

    function waitFor(cond, cb, delay = 300) {
        const t = setInterval(() => {
            if (cond()) {
                clearInterval(t);
                cb();
            }
        }, delay);
    }

    function getJenisColor(jenis) {
        const j = (jenis || '').toLowerCase();
        if (j.includes('cito')) return '#dc3545';
        if (j.includes('khusus')) return '#ffc107';
        return null;
    }

    function extractRJNumber(no) {
        const m = (no || '').match(/RJ(\d+)/i);
        return m ? parseInt(m[1], 10) : 999999;
    }

    function cleanupObserver() {
        if (tbodyObserver) {
            tbodyObserver.disconnect();
            tbodyObserver = null;
        }
    }

    /* -------------------- datatables length -------------------- */

    function forceLength1000(wrapper) {
        const select = wrapper.querySelector('select[name="tabel_antrian_length"]');
        if (!select) return;

        if (!select.querySelector('option[value="1000"]')) {
            const opt = document.createElement('option');
            opt.value = '1000';
            opt.textContent = '1000';
            select.appendChild(opt);
        }

        if (select.value !== '1000') {
            select.value = '1000';
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    /* -------------------- RJ-only toggle UI -------------------- */

    function injectRJToggle(wrapper) {
        const filter = wrapper.querySelector('.dataTables_filter');
        if (!filter || filter.querySelector('.rj-only-toggle')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'RJ Only';

        function updateStyle() {
            btn.className = RJ_ONLY_MODE
                ? 'btn btn-success rj-only-toggle mr-2'
                : 'btn btn-outline-info text-light rj-only-toggle mr-2';
        }

        updateStyle();

        btn.addEventListener('click', () => {
            RJ_ONLY_MODE = !RJ_ONLY_MODE;
            updateStyle();
            renderCards();
        });

        filter.prepend(btn);
    }

    /* -------------------- card rendering -------------------- */

    function renderCards() {
        const pane = document.querySelector('.tab-pane.active.show');
        if (!pane) return;

        const table = pane.querySelector('table.tabel_antrian');
        const wrapper = pane.querySelector('#tabel_antrian_wrapper');
        if (!table || !wrapper) return;

        injectRJToggle(wrapper);

        let container = wrapper.querySelector('.tv-cards-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'tv-cards-container';
            Object.assign(container.style, {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '8px',
                padding: '10px'
            });
            wrapper.appendChild(container);
        }

        container.innerHTML = '';

        const rows = Array.from(table.querySelectorAll('tbody tr'))
            .filter(r => r.querySelector('td'))
            .sort((a, b) => {
                const aNo = extractRJNumber(a.getAttribute('no_antrian') || a.children[0]?.innerText);
                const bNo = extractRJNumber(b.getAttribute('no_antrian') || b.children[0]?.innerText);
                return aNo - bNo;
            });

        rows.forEach(row => {
            const noAntrian = row.getAttribute('no_antrian') || row.children[0]?.innerText || '';
            const jenis = row.children[1]?.innerText || '';
            const nama = row.children[2]?.innerText.split('\n')[0] || '';
            const status = row.children[3]?.innerText || '';

            const jenisColor = getJenisColor(jenis);
            const borderColor = jenisColor || DEFAULT_BORDER;
            const textColor = jenisColor || '#ffffff';

            const card = document.createElement('div');
            Object.assign(card.style, {
                border: `2px solid ${borderColor}`,
                borderRadius: '6px',
                height: '95px',
                background: '#111',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer'
            });

            if (RJ_ONLY_MODE) {
                card.style.fontSize = '1.8rem';
                card.style.fontWeight = '700';
                card.innerHTML = `<b style="color:${textColor}">${noAntrian}</b>`;
            } else {
                card.style.fontSize = '0.65rem';
                card.innerHTML = `
                    <b style="color:${textColor}">${noAntrian}</b>
                    <div style="color:${textColor}">${jenis}</div>
                    <div style="font-size:0.6rem">${nama}</div>
                    <div style="font-size:0.6rem">${status}</div>
                `;
            }

            card.onclick = () => row.click();
            container.appendChild(card);
        });
    }

    /* -------------------- hook logic -------------------- */

    function hookActiveTable() {
        cleanupObserver();

        const pane = document.querySelector('.tab-pane.active.show');
        if (!pane) return;

        const table = pane.querySelector('table.tabel_antrian');
        const wrapper = pane.querySelector('#tabel_antrian_wrapper');
        if (!table || !wrapper) return;

        table.style.display = 'none';
        wrapper.querySelector('.dataTables_paginate')?.style.setProperty('display', 'none');
        wrapper.querySelector('.dataTables_length')?.style.setProperty('display', 'none');

        forceLength1000(wrapper);
        setTimeout(renderCards, 200);

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        tbodyObserver = new MutationObserver(renderCards);
        tbodyObserver.observe(tbody, { childList: true });
    }

    /* -------------------- Simpan = FULL REFRESH -------------------- */

    function hookSimpanButton() {
        document.body.addEventListener('click', e => {
            const btn = e.target.closest('#simpan_status_resep');
            if (!btn) return;

            setTimeout(() => {
                location.reload();
            }, 800); // allow backend save to finish
        });
    }

    /* -------------------- global rehooks -------------------- */

    function hookTabs() {
        document.querySelectorAll('#myTab button, #myTab a').forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(hookActiveTable, 300);
            });
        });
    }

    function hookModals() {
        document.body.addEventListener('shown.bs.modal', () => {
            setTimeout(hookActiveTable, 300);
        });
        document.body.addEventListener('hidden.bs.modal', () => {
            setTimeout(hookActiveTable, 300);
        });
    }

    function hookDataTablesDraw() {
        if (window.jQuery) {
            $(document).on('draw.dt', () => {
                setTimeout(hookActiveTable, 100);
            });
        }
    }

    /* -------------------- init -------------------- */

    waitFor(
        () => document.querySelector('#myTab') && document.querySelector('table.tabel_antrian'),
        () => {
            hookTabs();
            hookModals();
            hookDataTablesDraw();
            hookSimpanButton();
            hookActiveTable();
        }
    );

})();
