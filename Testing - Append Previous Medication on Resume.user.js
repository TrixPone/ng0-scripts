// ==UserScript==
// @name         Testing - Append Previous Medication on Resume
// @namespace    http://rsupkandou.com
// @version      2026-05-20
// @description  Append previous medication without switching registration
// @author       TrixPone
// @match        https://ng0.rsupkandou.com:3000/penunjang/C_historyPenunjang/getPencarianResumePasienDetail/*
// @grant        GM_xmlhttpRequest
// @connect      ng0.rsupkandou.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Append%20Previous%20Medication%20on%20Resume.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Append%20Previous%20Medication%20on%20Resume.user.js
// ==/UserScript==

// This script is made with AI Assistance

(function() {
'use strict';

// =====================================================
// STORAGE KEYS
// =====================================================
const STORAGE_KEY = "zeroQtyHighlightState";
const HISTORY_COLLAPSE_KEY = "farmasiHistoryCollapsed";

let zeroHighlightActive =
    localStorage.getItem(STORAGE_KEY) === "true";

let activeFilters = new Set();

let filterContainer = null;

// =====================================================
// WAIT UNTIL FARMASI TAB ACTIVE
// =====================================================
function waitForFarmasiReady(callback) {

    const observer = new MutationObserver(() => {

        const el = document.getElementById('farmasi');

        if (
            el &&
            el.classList.contains('active') &&
            el.classList.contains('show')
        ) {
            observer.disconnect();
            callback();
        }

    });

    observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}

waitForFarmasiReady(initEnhancer);

// =====================================================
// INIT
// =====================================================
function initEnhancer() {

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

    const farmasi = document.getElementById('farmasi');

    if (!farmasi) return;

    const wrapper = document.createElement('div');

    wrapper.style.marginBottom = "10px";
    wrapper.style.border = "1px solid #00ddbf";
    wrapper.style.borderRadius = "6px";

    // Header
    const header = document.createElement('div');

    header.style.cursor = "pointer";
    header.style.padding = "8px";
    header.style.color = "#00ddbf";
    header.style.fontWeight = "bold";

    header.innerText = "▶ Filter Obat";

    // Body
    const body = document.createElement('div');

    body.style.display = "none";
    body.style.padding = "8px";

    // Controls
    const controls = document.createElement('div');

    controls.style.marginBottom = "8px";

    const clearBtn = document.createElement('button');

    clearBtn.innerText = "Clear All";
    clearBtn.className = "btn btn-sm btn-outline-secondary";

    clearBtn.onclick = () => {

        activeFilters.clear();

        updateFilterList();

        applyFilter();
    };

    controls.appendChild(clearBtn);

    // Filter list
    filterContainer = document.createElement('div');

    filterContainer.style.maxHeight = "180px";
    filterContainer.style.overflowY = "auto";

    // Toggle collapse
    header.onclick = () => {

        const opened = body.style.display === "block";

        body.style.display = opened ? "none" : "block";

        header.innerText =
            opened
            ? "▶ Filter Obat"
            : "▼ Filter Obat";
    };

    body.appendChild(controls);
    body.appendChild(filterContainer);

    wrapper.appendChild(header);
    wrapper.appendChild(body);

    farmasi.prepend(wrapper);
}

// =====================================================
// UPDATE FILTER LIST
// =====================================================
function updateFilterList() {

    if (!filterContainer) return;

    const counts = {};

    document.querySelectorAll('#farmasi table tbody tr').forEach(row => {

        const name =
            row.children[2]?.innerText.trim();

        if (!name) return;

        counts[name] = (counts[name] || 0) + 1;
    });

    const sorted =
        Object.keys(counts)
        .sort((a, b) => a.localeCompare(b));

    filterContainer.innerHTML = "";

    sorted.forEach(name => {

        const label = document.createElement('label');

        label.style.display = "block";
        label.style.cursor = "pointer";

        const checkbox = document.createElement('input');

        checkbox.type = "checkbox";
        checkbox.value = name;
        checkbox.checked = activeFilters.has(name);

        checkbox.style.marginRight = "6px";

        checkbox.onchange = () => {

            if (checkbox.checked) {
                activeFilters.add(name);
            } else {
                activeFilters.delete(name);
            }

            applyFilter();
        };

        label.appendChild(checkbox);

        label.appendChild(
            document.createTextNode(
                `${name} (${counts[name]})`
            )
        );

        filterContainer.appendChild(label);
    });
}

// =====================================================
// APPLY FILTER
// =====================================================
function applyFilter() {

    document.querySelectorAll('#farmasi table tbody tr').forEach(row => {

        const name =
            row.children[2]?.innerText.trim();

        if (!name) return;

        // No filters
        if (activeFilters.size === 0) {

            row.style.display = "";

            return;
        }

        let match = false;

        activeFilters.forEach(filter => {

            if (name.includes(filter)) {
                match = true;
            }

        });

        row.style.display = match ? "" : "none";
    });
}

// =====================================================
// ZERO QTY TOGGLE
// =====================================================
function createZeroQtyToggle() {

    const tabContent =
        document.querySelector('#myTabContent');

    if (!tabContent) return;

    tabContent.style.position = "relative";

    const btn = document.createElement('button');

    btn.style.position = "absolute";
    btn.style.top = "5px";
    btn.style.right = "10px";
    btn.style.zIndex = "9999";

    function updateButton() {

        btn.innerText =
            zeroHighlightActive
            ? "Highlight 0 Qty: ON"
            : "Highlight 0 Qty: OFF";

        btn.className =
            zeroHighlightActive
            ? "btn btn-sm btn-danger"
            : "btn btn-sm btn-outline-danger";
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

    tabContent.appendChild(btn);
}

// =====================================================
// HIGHLIGHT ZERO QTY
// =====================================================
function highlightZeroQty() {

    document.querySelectorAll('#farmasi table tbody tr').forEach(row => {

        const qty =
            row.querySelector('td:last-child')
            ?.innerText
            .trim();

        if (qty === "0") {

            row.style.color =
                zeroHighlightActive
                ? "#ff0000"
                : "";
        }
    });
}

// =====================================================
// LOAD PREVIOUS FARMASI
// =====================================================
function loadPreviousFarmasi() {

    const farmasi =
        document.getElementById('farmasi');

    const norm =
        document.querySelector('#norm')?.value;

    if (!farmasi || !norm) return;

    const base =
        window.location.origin + "/";

    const currentId =
        window.location.pathname.split('/').pop();

    // =================================================
    // GET CURRENT TANGGAL ORDER
    // =================================================
    let currentDate = new Date();

    const match = farmasi.innerText.match(
        /Tanggal Order\s*:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/
    );

    if (match) {

        const [datePart, timePart] =
            match[1].split(" ");

        const [day, month, year] =
            datePart.split("/");

        const [hour, minute, second] =
            timePart.split(":");

        currentDate = new Date(
            year,
            month - 1,
            day,
            hour,
            minute,
            second
        );
    }

    // =================================================
    // STICKY LOADING BAR
    // =================================================
    const loading = document.createElement('div');

    loading.style.position = "fixed";
    loading.style.bottom = "0";
    loading.style.left = "0";
    loading.style.width = "100%";

    loading.style.padding = "8px 15px";

    loading.style.background = "#111";
    loading.style.color = "#00ddbf";

    loading.style.textAlign = "center";

    loading.style.borderTop =
        "2px solid #00ddbf";

    loading.style.zIndex = "999999";

    loading.style.display = "none";

    document.body.appendChild(loading);

    // =================================================
    // WRAPPER
    // =================================================
    const wrapper = document.createElement('div');

    wrapper.className = "row mt-4";

    const col = document.createElement('div');

    col.className = "col-12";

    // =================================================
    // COLLAPSIBLE HISTORY SECTION
    // =================================================
    let collapsedState =
        localStorage.getItem(HISTORY_COLLAPSE_KEY) === "true";

    // Header
    const title = document.createElement('div');

    title.style.color = "#00ddbf";

    title.style.borderBottom =
        "2px solid #00ddbf";

    title.style.paddingBottom = "6px";

    title.style.marginBottom = "10px";

    title.style.fontWeight = "bold";

    title.style.cursor = "pointer";

    title.style.userSelect = "none";

    // Content
    const historyContent =
        document.createElement('div');

    historyContent.style.display =
        collapsedState ? "none" : "block";

    function updateHistoryTitle() {

        title.innerText =
            (collapsedState ? "▶ " : "▼ ") +
            "Riwayat Farmasi Sebelumnya";
    }

    updateHistoryTitle();

    title.onclick = () => {

        collapsedState = !collapsedState;

        historyContent.style.display =
            collapsedState
            ? "none"
            : "block";

        localStorage.setItem(
            HISTORY_COLLAPSE_KEY,
            collapsedState
        );

        updateHistoryTitle();
    };

    col.appendChild(title);

    col.appendChild(historyContent);

    wrapper.appendChild(col);

    farmasi.appendChild(wrapper);

    // =================================================
    // FETCH DETAIL PENDAFTARAN
    // =================================================
    GM_xmlhttpRequest({

        method: "POST",

        url:
            base +
            "penunjang/C_historyPenunjang/getDetailPendaftaran",

        headers: {
            "Content-Type":
                "application/x-www-form-urlencoded"
        },

        data:
            "norm=" +
            encodeURIComponent(norm),

        onload: function(res) {

            let data = [];

            try {
                data =
                    JSON.parse(res.responseText);
            } catch (e) {
                return;
            }

            // =========================================
            // FILTER OLDER VISITS ONLY
            // =========================================
            const filtered = data.filter(d => {

                if (
                    d.id_trx_pendaftaran ==
                    currentId
                ) {
                    return false;
                }

                if (!d.tanggal_pendaftaran) {
                    return false;
                }

                const visitDate =
                    new Date(d.tanggal_pendaftaran);

                return visitDate < currentDate;
            });

            if (!filtered.length) return;

            loading.style.display = "block";

            loading.innerText =
                `Loading 0 / ${filtered.length}`;

            let loaded = 0;

            // =========================================
            // FETCH EACH HISTORY PAGE
            // =========================================
            filtered.forEach(item => {

                const url =
                    base +
                    "penunjang/C_historyPenunjang/getPencarianResumePasienDetail/" +
                    item.id_trx_pendaftaran;

                GM_xmlhttpRequest({

                    method: "GET",

                    url: url,

                    onload: function(r) {

                        const doc =
                            new DOMParser()
                            .parseFromString(
                                r.responseText,
                                "text/html"
                            );

                        // =================================
                        // FULL FARMASI BLOCK
                        // =================================
                        const farmasiBlock =
                            doc.querySelector(
                                '#farmasi .col-12'
                            );

                        if (farmasiBlock) {

                            const cloned =
                                farmasiBlock.cloneNode(true);

                            cloned.style.marginTop =
                                "15px";

                            historyContent.appendChild(cloned);
                        }

                        loaded++;

                        loading.innerText =
                            `Loading ${loaded} / ${filtered.length}`;

                        // =================================
                        // UPDATE UI
                        // =================================
                        updateFilterList();

                        applyFilter();

                        if (zeroHighlightActive) {
                            highlightZeroQty();
                        }

                        // =================================
                        // FINISHED
                        // =================================
                        if (loaded === filtered.length) {

                            loading.innerText =
                                "Completed ✓";

                            setTimeout(() => {
                                loading.remove();
                            }, 1200);
                        }
                    }
                });
            });
        }
    });
}

})();
