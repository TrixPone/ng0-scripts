// ==UserScript==
// @name         Testing - Append Previous Medication on Resume - Part 1
// @namespace    http://rsupkandou.com
// @version      2026-09-01
// @description  Append previous medication history, filtering and zero-qty highlighting
// @author       TrixPone
// @match        https://*.rsupkandou.com/penunjang/C_historyPenunjang/getPencarianResumePasienDetail/*
// @grant        GM_xmlhttpRequest
// @connect      farmasi.rsupkandou.com
// @connect      emr.rsupkandou.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Append%20Previous%20Medication%20on%20Resume%20-%20Part%201.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Append%20Previous%20Medication%20on%20Resume%20-%20Part%201.user.js
// ==/UserScript==

(function () {

    'use strict';

    console.log(
        '[FARMASI PART 1] Loaded:',
        window.location.href
    );


    // =====================================================
    // SHARED DATA
    // =====================================================

    window.farmasiScriptData =
        window.farmasiScriptData || {

            recentsRows: [],

            listeners: []

        };


    // =====================================================
    // STORAGE
    // =====================================================

    const STORAGE_KEY =
        'zeroQtyHighlightState';

    const HISTORY_COLLAPSE_KEY =
        'farmasiHistoryCollapsed';


    let zeroHighlightActive =
        localStorage.getItem(STORAGE_KEY) === 'true';

    let activeFilters =
        new Set();

    let filterContainer =
        null;

    let filterSearchInput =
        null;


    // =====================================================
    // WAIT FOR FARMASI
    // =====================================================

    function waitForFarmasiReady(callback) {

        const observer =
            new MutationObserver(() => {

                const farmasi =
                    document.getElementById('farmasi');

                if (
                    farmasi &&
                    farmasi.classList.contains('active') &&
                    farmasi.classList.contains('show')
                ) {

                    observer.disconnect();

                    console.log('[FARMASI] Ready');

                    callback();

                }

            });


        observer.observe(
            document.body,
            {
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            }
        );


        // In case it is already ready

        const farmasi =
            document.getElementById('farmasi');

        if (
            farmasi &&
            farmasi.classList.contains('active') &&
            farmasi.classList.contains('show')
        ) {

            observer.disconnect();

            console.log('[FARMASI] Ready');

            callback();

        }

    }


    waitForFarmasiReady(initEnhancer);


    // =====================================================
    // INIT
    // =====================================================

    function initEnhancer() {

        console.log('[FARMASI] Initializing...');

        createZeroQtyToggle();

        loadPreviousFarmasi();

        setTimeout(() => {

            createFilterUI();

            updateFilterList();

            if (zeroHighlightActive) {

                highlightZeroQty();

            }

        }, 500);

    }


// =====================================================
// FILTER UI
// =====================================================

function createFilterUI() {

    const farmasi =
        document.getElementById('farmasi');

    if (!farmasi)
        return;


    if (
        farmasi.querySelector(
            '.farmasi-filter-wrapper'
        )
    )
        return;


    const wrapper =
        document.createElement('div');

    wrapper.className =
        'farmasi-filter-wrapper';

    wrapper.style.marginBottom =
        '10px';

    wrapper.style.border =
        '1px solid #00ddbf';

    wrapper.style.borderRadius =
        '6px';


    // =================================================
    // HEADER ROW
    // =================================================

    const headerRow =
        document.createElement('div');

    headerRow.style.display =
        'flex';

    headerRow.style.alignItems =
        'center';

    headerRow.style.gap =
        '10px';

    headerRow.style.padding =
        '8px';


    // =================================================
    // FILTER TITLE
    // =================================================

    const header =
        document.createElement('div');

    header.style.cursor =
        'pointer';

    header.style.color =
        '#00ddbf';

    header.style.fontWeight =
        'bold';

    header.style.userSelect =
        'none';

    header.style.whiteSpace =
        'nowrap';

    header.innerText =
        '▶ Filter Obat';


    // =================================================
    // SEARCH BOX
    // =================================================

    const searchInput =
        document.createElement('input');

    searchInput.type =
        'text';

    searchInput.className =
        'form-control form-control-sm';

    searchInput.placeholder =
        'Cari obat...';

    searchInput.style.flex =
        '1';

    searchInput.style.minWidth =
        '150px';

    searchInput.style.maxWidth =
        '400px';


    // =================================================
    // CLEAR ALL BUTTON
    // =================================================

    const clearBtn =
        document.createElement('button');

    clearBtn.type =
        'button';

    clearBtn.innerText =
        'Clear All';

    clearBtn.className =
        'btn btn-sm btn-outline-secondary';

    clearBtn.style.whiteSpace =
        'nowrap';


    // =================================================
    // BODY
    // =================================================

    const body =
        document.createElement('div');

    body.style.display =
        'none';

    body.style.padding =
        '8px';


    // =================================================
    // FILTER LIST
    // =================================================

    filterContainer =
        document.createElement('div');

    filterContainer.style.maxHeight =
        '180px';

    filterContainer.style.overflowY =
        'auto';


    // =================================================
    // CLEAR ALL
    // =================================================

    clearBtn.onclick = () => {

        activeFilters.clear();

        updateFilterList();

        applyFilter();

    };


    // =================================================
    // SEARCH
    // =================================================

    searchInput.oninput = () => {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!filterContainer)
            return;


        filterContainer
            .querySelectorAll('label')
            .forEach(label => {

                const text =
                    label.innerText
                        .toLowerCase();


                label.style.display =
                    (
                        !search ||
                        text.includes(search)
                    )
                        ? 'block'
                        : 'none';

            });

    };


    // =================================================
    // COLLAPSE / EXPAND
    // =================================================

    header.onclick = () => {

        const opened =
            body.style.display === 'block';


        body.style.display =
            opened
                ? 'none'
                : 'block';


        header.innerText =
            opened
                ? '▶ Filter Obat'
                : '▼ Filter Obat';

    };


    // =================================================
    // BUILD HEADER
    // =================================================

    headerRow.appendChild(
        header
    );

    headerRow.appendChild(
        searchInput
    );

    headerRow.appendChild(
        clearBtn
    );


    // =================================================
    // BUILD BODY
    // =================================================

    body.appendChild(
        filterContainer
    );


    // =================================================
    // BUILD WRAPPER
    // =================================================

    wrapper.appendChild(
        headerRow
    );

    wrapper.appendChild(
        body
    );


    farmasi.prepend(
        wrapper
    );

}


    // =====================================================
    // FILTER SEARCH
    // =====================================================

    function applyFilterSearch() {

        if (!filterContainer)
            return;


        const search =
            filterSearchInput
                ?.value
                .trim()
                .toLowerCase() || '';


        filterContainer
            .querySelectorAll('label')
            .forEach(label => {

                const text =
                    label.innerText
                        .toLowerCase();

                label.style.display =
                    (
                        !search ||
                        text.includes(search)
                    )
                        ? 'block'
                        : 'none';

            });

    }


    // =====================================================
    // UPDATE FILTER LIST
    // =====================================================

    function updateFilterList() {

        if (!filterContainer)
            return;


        const counts = {};


        document
            .querySelectorAll(
                '#farmasi table tbody tr'
            )
            .forEach(row => {

                const name =
                    row.children[2]
                        ?.innerText
                        .trim();

                if (!name)
                    return;


                const qty =
                    parseFloat(
                        row.children[3]
                            ?.innerText
                            .trim()
                    ) || 0;


                counts[name] =
                    (counts[name] || 0) + qty;

            });


        const sorted =
            Object.keys(counts)
                .sort((a, b) =>
                    a.localeCompare(b)
                );


        filterContainer.innerHTML =
            '';


        sorted.forEach(name => {

            const label =
                document.createElement('label');

            label.style.display =
                'block';

            label.style.cursor =
                'pointer';


            if (counts[name] === 0) {

                label.style.opacity =
                    '0.45';

            }


            const checkbox =
                document.createElement('input');

            checkbox.type =
                'checkbox';

            checkbox.value =
                name;

            checkbox.checked =
                activeFilters.has(name);

            checkbox.style.marginRight =
                '6px';


            checkbox.onchange = () => {

                if (checkbox.checked) {

                    activeFilters.add(name);

                } else {

                    activeFilters.delete(name);

                }

                applyFilter();

            };


            label.appendChild(
                checkbox
            );


            label.appendChild(
                document.createTextNode(
                    `${name} (${counts[name].toLocaleString()})`
                )
            );


            filterContainer.appendChild(
                label
            );

        });


        // Re-apply search after rebuilding
        applyFilterSearch();

    }


    // =====================================================
    // APPLY FILTER
    // =====================================================

    function applyFilter() {

        document
            .querySelectorAll(
                '#farmasi table tbody tr'
            )
            .forEach(row => {

                const name =
                    row.children[2]
                        ?.innerText
                        .trim();

                if (!name)
                    return;


                if (activeFilters.size === 0) {

                    row.style.display =
                        '';

                    return;

                }


                let match =
                    false;


                activeFilters.forEach(filter => {

                    if (name.includes(filter)) {

                        match =
                            true;

                    }

                });


                row.style.display =
                    match
                        ? ''
                        : 'none';

            });


        document
            .querySelectorAll(
                '.farmasi-history-entry'
            )
            .forEach(block => {

                const rows =
                    block.querySelectorAll(
                        'tbody tr'
                    );

                if (!rows.length)
                    return;


                const visibleRows =
                    [...rows]
                        .filter(row =>
                            row.style.display !== 'none'
                        );


                block.style.display =
                    visibleRows.length
                        ? ''
                        : 'none';

            });

    }


    // =====================================================
    // ZERO QTY TOGGLE
    // =====================================================

    function createZeroQtyToggle() {

        const tabContent =
            document.querySelector(
                '#myTabContent'
            );

        if (!tabContent)
            return;


        tabContent.style.position =
            'relative';


        if (
            tabContent.querySelector(
                '.farmasi-zero-qty-button'
            )
        )
            return;


        const btn =
            document.createElement('button');


        btn.className =
            'farmasi-zero-qty-button';


        btn.style.position =
            'absolute';

        btn.style.top =
            '5px';

        btn.style.right =
            '10px';

        btn.style.zIndex =
            '9999';


        function updateButton() {

            btn.innerText =
                zeroHighlightActive
                    ? 'Highlight 0 Qty: ON'
                    : 'Highlight 0 Qty: OFF';


            btn.className =
                zeroHighlightActive
                    ? 'btn btn-sm btn-danger farmasi-zero-qty-button'
                    : 'btn btn-sm btn-outline-danger farmasi-zero-qty-button';

        }


        updateButton();


        btn.onclick = () => {

            zeroHighlightActive =
                !zeroHighlightActive;


            localStorage.setItem(
                STORAGE_KEY,
                zeroHighlightActive
            );


            updateButton();

            highlightZeroQty();

        };


        tabContent.appendChild(
            btn
        );

    }


    // =====================================================
    // HIGHLIGHT ZERO QTY
    // =====================================================

    function highlightZeroQty() {

        document
            .querySelectorAll(`
                #farmasiCurrentTable tbody tr,
                #farmasiRecents tbody tr,
                .farmasi-history-entry table tbody tr
            `)
            .forEach(row => {

                const cells =
                    row.querySelectorAll('td');

                if (!cells.length)
                    return;


                let qty =
                    null;


                if (cells.length >= 4) {

                    qty =
                        cells[3]
                            ?.innerText
                            .trim();

                }


                row.style.color =
                    (
                        zeroHighlightActive &&
                        qty === '0'
                    )
                        ? '#ff0000'
                        : '';

            });

    }


    // =====================================================
    // ADD ROWS TO RECENTS
    // =====================================================

    function addRowsToRecents(
        table,
        ruangan
    ) {

        if (!table)
            return;


        table
            .querySelectorAll('tbody tr')
            .forEach(row => {

                const tanggal =
                    row.children[1]
                        ?.innerText
                        .trim();

                const nama =
                    row.children[2]
                        ?.innerText
                        .trim();

                const qty =
                    row.children[3]
                        ?.innerText
                        .trim();


                if (!tanggal)
                    return;


                const ts =
                    new Date(
                        tanggal.replace(
                            ' ',
                            'T'
                        )
                    ).getTime();


                if (isNaN(ts)) {

                    console.warn(
                        '[RECENTS INVALID DATE]',
                        tanggal
                    );

                    return;

                }


                const exists =
                    window.farmasiScriptData
                        .recentsRows
                        .some(r =>

                            r.tanggal === tanggal &&
                            r.nama === nama &&
                            r.qty === qty &&
                            r.ruangan === ruangan

                        );


                if (exists)
                    return;


                window.farmasiScriptData
                    .recentsRows
                    .push({

                        tanggal,
                        nama,
                        qty,
                        ruangan,
                        timestamp: ts

                    });

            });


        window.farmasiScriptData
            .listeners
            .forEach(fn => {

                try {

                    fn();

                } catch (e) {

                    console.error(
                        '[FARMASI DATA LISTENER]',
                        e
                    );

                }

            });

    }


    // =====================================================
    // LOAD PREVIOUS FARMASI
    // =====================================================

    function loadPreviousFarmasi() {

        const farmasi =
            document.getElementById('farmasi');

        if (!farmasi)
            return;


        // =================================================
        // CURRENT TABLE
        // =================================================

        setTimeout(() => {

            const currentTable =
                farmasi.querySelector(
                    '.table-responsive table'
                );


            if (currentTable) {

                currentTable.id =
                    'farmasiCurrentTable';


                console.log(
                    '[HISTORY] Current table found'
                );


                addRowsToRecents(
                    currentTable,
                    'Current Visit'
                );

            }

        }, 1000);


        // =================================================
        // PATIENT NORM
        // =================================================

        const norm =
            document.querySelector(
                '#norm'
            )?.value;


        if (!norm) {

            console.warn(
                '[HISTORY] #norm not found'
            );

            return;

        }


        // =================================================
        // CURRENT ID
        // =================================================

        const currentId =
            window.location.pathname
                .split('/')
                .pop();


        console.log(
            '[HISTORY] Current ID:',
            currentId
        );


        // =================================================
        // CURRENT DATE
        // =================================================

        let currentDate =
            new Date();


        const dateText =
            farmasi.innerText.match(
                /Tanggal Order\s*:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/
            );


        if (dateText) {

            const parts =
                dateText[1].split(/\s+/);


            const datePart =
                parts[0];

            const timePart =
                parts[1];


            const [day, month, year] =
                datePart.split('/');


            const [hour, minute, second] =
                timePart.split(':');


            currentDate =
                new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day),
                    Number(hour),
                    Number(minute),
                    Number(second)
                );

        }


        console.log(
            '[HISTORY] Current date:',
            currentDate
        );


        // =================================================
        // LOADING BAR
        // =================================================

        const loading =
            document.createElement('div');


        loading.style.position =
            'fixed';

        loading.style.bottom =
            '0';

        loading.style.left =
            '0';

        loading.style.width =
            '100%';

        loading.style.padding =
            '8px 15px';

        loading.style.background =
            '#111';

        loading.style.color =
            '#00ddbf';

        loading.style.textAlign =
            'center';

        loading.style.borderTop =
            '2px solid #00ddbf';

        loading.style.zIndex =
            '999999';

        loading.style.display =
            'none';


        document.body.appendChild(
            loading
        );


        // =================================================
        // HISTORY WRAPPER
        // =================================================

        const wrapper =
            document.createElement('div');

        wrapper.className =
            'row mt-4 farmasi-history-wrapper';


        const col =
            document.createElement('div');

        col.className =
            'col-12';


        // =================================================
        // HISTORY COLLAPSIBLE HEADER
        // =================================================

        let collapsedState =
            localStorage.getItem(
                HISTORY_COLLAPSE_KEY
            ) === 'true';


        const title =
            document.createElement('div');


        title.style.color =
            '#00ddbf';

        title.style.borderBottom =
            '2px solid #00ddbf';

        title.style.paddingBottom =
            '6px';

        title.style.marginBottom =
            '10px';

        title.style.fontWeight =
            'bold';

        title.style.cursor =
            'pointer';

        title.style.userSelect =
            'none';


        const historyContent =
            document.createElement('div');


        historyContent.style.display =
            collapsedState
                ? 'none'
                : 'block';


        function updateHistoryTitle() {

            title.innerText =
                (
                    collapsedState
                        ? '▶ '
                        : '▼ '
                ) +
                'Riwayat Farmasi Sebelumnya';

        }


        updateHistoryTitle();


        title.onclick = () => {

            collapsedState =
                !collapsedState;


            historyContent.style.display =
                collapsedState
                    ? 'none'
                    : 'block';


            localStorage.setItem(
                HISTORY_COLLAPSE_KEY,
                collapsedState
            );


            updateHistoryTitle();

        };


        col.appendChild(
            title
        );

        col.appendChild(
            historyContent
        );

        wrapper.appendChild(
            col
        );

        farmasi.appendChild(
            wrapper
        );


        // =================================================
        // GET VISIT LIST
        // =================================================

        const registrationsURL =
            window.location.origin +
            '/penunjang/C_historyPenunjang/getDetailPendaftaran';


        console.log(
            '[HISTORY] Requesting registrations:',
            registrationsURL
        );


        GM_xmlhttpRequest({

            method: 'POST',

            url: registrationsURL,

            headers: {

                'Content-Type':
                    'application/x-www-form-urlencoded; charset=UTF-8',

                'X-Requested-With':
                    'XMLHttpRequest'

            },

            data:
                'norm=' +
                encodeURIComponent(norm),


            onload: function (res) {

                console.log(
                    '[HISTORY] Registration response:',
                    res.status
                );


                let data =
                    [];


                try {

                    data =
                        JSON.parse(
                            res.responseText
                        );

                } catch (e) {

                    console.error(
                        '[HISTORY] Registration JSON error:',
                        e,
                        res.responseText
                    );

                    return;

                }


                console.log(
                    '[HISTORY] Registrations found:',
                    data.length
                );


                // =================================================
                // FILTER PREVIOUS VISITS
                // =================================================

                const previousVisits =
                    data
                        .filter(item => {

                            if (
                                String(
                                    item.id_trx_pendaftaran
                                ) === String(currentId)
                            ) {

                                return false;

                            }


                            if (
                                !item.tanggal_pendaftaran
                            ) {

                                return false;

                            }


                            const visitDate =
                                new Date(
                                    item.tanggal_pendaftaran
                                );


                            return (
                                !isNaN(
                                    visitDate.getTime()
                                ) &&
                                visitDate < currentDate
                            );

                        })
                        .sort((a, b) => {

                            return (
                                new Date(
                                    b.tanggal_pendaftaran
                                ) -
                                new Date(
                                    a.tanggal_pendaftaran
                                )
                            );

                        });


                console.log(
                    '[HISTORY] Previous visits:',
                    previousVisits.length
                );


                if (!previousVisits.length) {

                    console.log(
                        '[HISTORY] No previous visits.'
                    );

                    return;

                }


                loading.style.display =
                    'block';


                loading.innerText =
                    `Loading 0 / ${previousVisits.length}`;


                let loaded =
                    0;


                // =================================================
                // LOAD FARMASI DIRECTLY
                // =================================================

                previousVisits.forEach(item => {

                    const id =
                        item.id_trx_pendaftaran;


                    console.log(
                        '[HISTORY] Loading Farmasi:',
                        id,
                        item.tanggal_pendaftaran,
                        item.nm_unit_ruangan
                    );


                    const farmasiURL =
                        window.location.origin +
                        '/penunjang/C_historyPenunjang/getFarmasi/' +
                        encodeURIComponent(id);


                    GM_xmlhttpRequest({

                        method: 'GET',

                        url: farmasiURL,

                        headers: {

                            'X-Requested-With':
                                'XMLHttpRequest',

                            'Accept':
                                'text/html, */*; q=0.01'

                        },


                        onload: function (r) {

                            loaded++;


                            console.log(
                                '[HISTORY] Farmasi response:',
                                id,
                                r.status
                            );


                            // =================================================
                            // CREATE ENTRY
                            // =================================================

                            const entry =
                                document.createElement('div');

                            entry.className =
                                'farmasi-history-entry';


                            entry.style.margin =
                                '0';

                            entry.style.padding =
                                '0';

                            entry.style.borderBottom =
                                '1px solid #444';


                            // =================================================
                            // ROOM HEADER
                            // =================================================

                            const roomHeader =
                                document.createElement('div');

                            roomHeader.className =
                                'row';

                            roomHeader.style.marginBottom =
                                '0px';


                            roomHeader.innerHTML = `

                                <div class="col-2">
                                    Ruang Rawat
                                </div>

                                <div class="col-1">
                                    :
                                </div>

                                <div class="col-9">
                                    <strong>
                                        ${escapeHtml(
                                            item.nm_unit_ruangan || '-'
                                        )}
                                    </strong>
                                </div>

                            `;


                            entry.appendChild(
                                roomHeader
                            );


                            // =================================================
                            // VISIT DATE
                            // =================================================

                            const visitHeader =
                                document.createElement('div');

                            visitHeader.className =
                                'row';

                            visitHeader.style.marginBottom =
                                '10px';


                            visitHeader.innerHTML = `

                                <div class="col-2">
                                    Tanggal Kunjungan
                                </div>

                                <div class="col-1">
                                    :
                                </div>

                                <div class="col-9">
                                    <strong>
                                        ${escapeHtml(
                                            item.tanggal_pendaftaran || '-'
                                        )}
                                    </strong>
                                </div>

                            `;


                            entry.appendChild(
                                visitHeader
                            );


                            // =================================================
                            // PARSE FARMASI RESPONSE
                            // =================================================

                            let responseHTML =
                                '';


                            if (
                                r.status >= 200 &&
                                r.status < 300
                            ) {

                                responseHTML =
                                    r.responseText || '';

                            }


                            const doc =
                                new DOMParser()
                                    .parseFromString(
                                        responseHTML,
                                        'text/html'
                                    );


                            // =================================================
                            // FIND FARMASI TABLES
                            // =================================================

                            const tables =
                                [
                                    ...doc.querySelectorAll(
                                        '#div_farmasi table'
                                    )
                                ];


                            // Fallback:
                            // getFarmasi response itself may not contain
                            // #div_farmasi.

                            if (!tables.length) {

                                doc
                                    .querySelectorAll(
                                        'table'
                                    )
                                    .forEach(table => {

                                        const headers =
                                            [
                                                ...table.querySelectorAll(
                                                    'thead th'
                                                )
                                            ]
                                            .map(th =>
                                                th.innerText
                                                    .trim()
                                                    .toLowerCase()
                                            );


                                        const looksLikeFarmasi =
                                            headers.includes('no') &&
                                            headers.some(
                                                h =>
                                                    h.includes(
                                                        'tanggal resep'
                                                    )
                                            ) &&
                                            headers.some(
                                                h =>
                                                    h.includes(
                                                        'nama obat'
                                                    )
                                            ) &&
                                            headers.includes('qty');


                                        if (
                                            looksLikeFarmasi
                                        ) {

                                            tables.push(
                                                table
                                            );

                                        }

                                    });

                            }


                            console.log(
                                '[HISTORY] Farmasi table:',
                                id,
                                'tables =',
                                tables.length
                            );


                            // =================================================
                            // INSERT FARMASI CONTENT
                            // =================================================

                            if (tables.length) {

                                const dataTitle =
                                    document.createElement(
                                        'h6'
                                    );

                                dataTitle.className =
                                    'modal-title';

                                dataTitle.innerText =
                                    'Data Farmasi';


                                entry.appendChild(
                                    dataTitle
                                );


                                tables.forEach(
                                    table => {

                                        const responsive =
                                            document.createElement(
                                                'div'
                                            );

                                        responsive.className =
                                            'table-responsive';

                                        responsive.style.marginTop =
                                            '5px';


                                        const clonedTable =
                                            table.cloneNode(
                                                true
                                            );


                                        responsive.appendChild(
                                            clonedTable
                                        );


                                        entry.appendChild(
                                            responsive
                                        );


                                        // Add to Recents

                                        addRowsToRecents(
                                            clonedTable,
                                            item.nm_unit_ruangan ||
                                                '-'
                                        );

                                    }
                                );

                            } else {

                                console.log(
                                    '[HISTORY] No medication table:',
                                    id
                                );


                                const empty =
                                    document.createElement(
                                        'div'
                                    );


                                empty.style.color =
                                    '#ff0000';

                                empty.style.fontWeight =
                                    'bold';

                                empty.style.fontStyle =
                                    'italic';


                                empty.innerText =
                                    'Tidak ada data farmasi.';


                                entry.appendChild(
                                    empty
                                );

                            }


                            historyContent.appendChild(
                                entry
                            );


                            // =================================================
                            // UPDATE UI
                            // =================================================

                            updateFilterList();

                            applyFilter();


                            if (
                                zeroHighlightActive
                            ) {

                                highlightZeroQty();

                            }


                            loading.innerText =
                                `Loading ${loaded} / ${previousVisits.length}`;


                            // =================================================
                            // COMPLETE
                            // =================================================

                            if (
                                loaded ===
                                previousVisits.length
                            ) {

                                console.log(
                                    '[HISTORY] All previous visits loaded.'
                                );


                                loading.innerText =
                                    'Completed ✓';


                                updateFilterList();

                                applyFilter();


                                if (
                                    zeroHighlightActive
                                ) {

                                    highlightZeroQty();

                                }


                                setTimeout(() => {

                                    loading.remove();

                                }, 1200);

                            }

                        },


                        onerror: function (err) {

                            loaded++;


                            console.error(
                                '[HISTORY] Farmasi request failed:',
                                id,
                                err
                            );


                            const entry =
                                document.createElement('div');

                            entry.className =
                                'farmasi-history-entry';


                            entry.style.margin =
                                '0';

                            entry.style.padding =
                                '0';

                            entry.style.borderBottom =
                                '1px solid #444';


                            entry.innerHTML = `

                                <div class="row">

                                    <div class="col-2">
                                        Ruang Rawat
                                    </div>

                                    <div class="col-1">
                                        :
                                    </div>

                                    <div class="col-9">
                                        <strong>
                                            ${escapeHtml(
                                                item.nm_unit_ruangan || '-'
                                            )}
                                        </strong>
                                    </div>

                                </div>

                                <div style="
                                    margin-top:10px;
                                    opacity:.6;
                                    font-style:italic;
                                ">
                                    Gagal memuat data farmasi.
                                </div>

                            `;


                            historyContent.appendChild(
                                entry
                            );


                            loading.innerText =
                                `Loading ${loaded} / ${previousVisits.length}`;


                            if (
                                loaded ===
                                previousVisits.length
                            ) {

                                loading.innerText =
                                    'Completed ✓';


                                setTimeout(() => {

                                    loading.remove();

                                }, 1200);

                            }

                        }

                    });

                });

            },


            onerror: function (err) {

                console.error(
                    '[HISTORY] Registration request failed:',
                    err
                );

                loading.remove();

            }

        });

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHtml(value) {

        return String(value)
            .replace(
                /&/g,
                '&amp;'
            )
            .replace(
                /</g,
                '&lt;'
            )
            .replace(
                />/g,
                '&gt;'
            )
            .replace(
                /"/g,
                '&quot;'
            )
            .replace(
                /'/g,
                '&#039;'
            );

    }

})();
