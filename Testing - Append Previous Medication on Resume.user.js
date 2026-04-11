// ==UserScript==
// @name         Testing - Append Previous Medication on Resume
// @namespace    http://rsupkandou.com
// @version      2026-04-11
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

const STORAGE_KEY = "zeroQtyHighlightState";
let zeroHighlightActive = localStorage.getItem(STORAGE_KEY) === "true";

let activeFilters = new Set();
let filterContainer = null;

// =====================================================
function waitForFarmasiReady(callback) {

    const observer = new MutationObserver(() => {
        const el = document.getElementById('farmasi');

        if (el && el.classList.contains('active') && el.classList.contains('show')) {
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
function initEnhancer() {
    createZeroQtyToggle();
    loadPreviousFarmasi();

    setTimeout(() => {
        createFilterUI();
        updateFilterList();
        if (zeroHighlightActive) highlightZeroQty();
    }, 500);
}

// =====================================================
// FILTER UI (COLLAPSIBLE + CLEAR)
// =====================================================
function createFilterUI() {

    const farmasi = document.getElementById('farmasi');
    if (!farmasi) return;

    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = "10px";
    wrapper.style.border = "1px solid #00ddbf";
    wrapper.style.borderRadius = "6px";

    const header = document.createElement('div');
    header.style.cursor = "pointer";
    header.style.padding = "8px";
    header.style.color = "#00ddbf";
    header.style.fontWeight = "bold";
    header.innerText = "▶ Filter Obat";

    const body = document.createElement('div');
    body.style.display = "none";
    body.style.padding = "8px";

    const controls = document.createElement('div');
    controls.style.marginBottom = "6px";

    const clearBtn = document.createElement('button');
    clearBtn.innerText = "Clear All";
    clearBtn.className = "btn btn-sm btn-outline-secondary";
    clearBtn.onclick = () => {
        activeFilters.clear();
        updateFilterList();
        applyFilter();
    };

    controls.appendChild(clearBtn);

    filterContainer = document.createElement('div');
    filterContainer.style.maxHeight = "180px";
    filterContainer.style.overflowY = "auto";

    header.onclick = () => {
        const open = body.style.display === "block";
        body.style.display = open ? "none" : "block";
        header.innerText = open ? "▶ Filter Obat" : "▼ Filter Obat";
    };

    body.appendChild(controls);
    body.appendChild(filterContainer);

    wrapper.appendChild(header);
    wrapper.appendChild(body);

    farmasi.prepend(wrapper);
}

// =====================================================
// DYNAMIC FILTER LIST
// =====================================================
function updateFilterList() {

    if (!filterContainer) return;

    const counts = {};

    document.querySelectorAll('#farmasi table tbody tr').forEach(row => {
        const name = row.children[2]?.innerText.trim();
        if (!name) return;

        counts[name] = (counts[name] || 0) + 1;
    });

    const sorted = Object.keys(counts).sort((a, b) => a.localeCompare(b));

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
            if (checkbox.checked) activeFilters.add(name);
            else activeFilters.delete(name);
            applyFilter();
        };

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(`${name} (${counts[name]})`));

        filterContainer.appendChild(label);
    });
}

// =====================================================
function applyFilter() {

    document.querySelectorAll('#farmasi table tbody tr').forEach(row => {

        const name = row.children[2]?.innerText.trim();
        if (!name) return;

        if (activeFilters.size === 0) {
            row.style.display = "";
            return;
        }

        let match = false;

        activeFilters.forEach(f => {
            if (name.includes(f)) match = true;
        });

        row.style.display = match ? "" : "none";
    });
}

// =====================================================
// ZERO QTY
// =====================================================
function createZeroQtyToggle() {

    const tabContent = document.querySelector('#myTabContent');
    if (!tabContent) return;

    tabContent.style.position = "relative";

    const btn = document.createElement('button');
    btn.style.position = "absolute";
    btn.style.top = "5px";
    btn.style.right = "10px";

    function update() {
        btn.innerText = zeroHighlightActive ? "Highlight 0 Qty: ON" : "OFF";
        btn.className = zeroHighlightActive
            ? "btn btn-sm btn-danger"
            : "btn btn-sm btn-outline-danger";
    }

    update();

    btn.onclick = () => {
        zeroHighlightActive = !zeroHighlightActive;
        localStorage.setItem(STORAGE_KEY, zeroHighlightActive);
        update();
        highlightZeroQty();
    };

    tabContent.appendChild(btn);
}

function highlightZeroQty() {

    document.querySelectorAll('#farmasi table tbody tr').forEach(row => {

        const qty = row.querySelector('td:last-child')?.innerText.trim();

        if (qty === "0") {
            row.style.color = zeroHighlightActive ? "#ff0000" : "";
        }
    });
}

// =====================================================
// LOAD DATA
// =====================================================
function loadPreviousFarmasi() {

    const farmasi = document.getElementById('farmasi');
    const norm = document.querySelector('#norm')?.value;
    if (!farmasi || !norm) return;

    const base = window.location.origin + "/";
    const currentId = window.location.pathname.split('/').pop();

    let currentDate = new Date();

    const match = farmasi.innerText.match(
        /Tanggal Order\s*:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/
    );

    if (match) {
        const [d,t] = match[1].split(" ");
        const [day,mon,year] = d.split("/");
        const [h,m,s] = t.split(":");
        currentDate = new Date(year, mon-1, day, h, m, s);
    }

    const loading = document.createElement('div');
    loading.style.position = "fixed";
    loading.style.bottom = "0";
    loading.style.width = "100%";
    loading.style.background = "#111";
    loading.style.color = "#00ddbf";
    loading.style.textAlign = "center";
    loading.style.display = "none";
    document.body.appendChild(loading);

    const container = document.createElement('div');
    container.className = "row mt-4";

    const col = document.createElement('div');
    col.className = "col-12";

    const title = document.createElement('div');
    title.innerText = "Riwayat Farmasi Sebelumnya";
    title.style.color = "#00ddbf";
    title.style.borderBottom = "2px solid #00ddbf";

    col.appendChild(title);
    container.appendChild(col);
    farmasi.appendChild(container);

    GM_xmlhttpRequest({
        method: "POST",
        url: base + "penunjang/C_historyPenunjang/getDetailPendaftaran",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: "norm=" + norm,
        onload: res => {

            const data = JSON.parse(res.responseText);

            const filtered = data.filter(d => {
                if (d.id_trx_pendaftaran == currentId) return false;
                return new Date(d.tanggal_pendaftaran) < currentDate;
            });

            let loaded = 0;
            loading.style.display = "block";

            filtered.forEach(item => {

                GM_xmlhttpRequest({
                    method: "GET",
                    url: base + "penunjang/C_historyPenunjang/getPencarianResumePasienDetail/" + item.id_trx_pendaftaran,
                    onload: r => {

                        const doc = new DOMParser().parseFromString(r.responseText, "text/html");
                        const table = doc.querySelector('#farmasi table');

                        if (table) {
                            col.appendChild(table.cloneNode(true));
                        }

                        loaded++;
                        loading.innerText = `Loading ${loaded}/${filtered.length}`;

                        updateFilterList();   // 🔥 dynamic update
                        applyFilter();

                        if (zeroHighlightActive) highlightZeroQty();
                    }
                });

            });

        }
    });
}

})();
