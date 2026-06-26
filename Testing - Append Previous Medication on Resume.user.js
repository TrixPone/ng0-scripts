// ==UserScript==
// @name         Testing - Append Previous Medication on Resume
// @namespace    http://rsupkandou.com
// @version      2026-06-26
// @description  Append previous medication without switching registration
// @author       TrixPone
// @match        https://ng0.rsupkandou.com:3000/penunjang/C_historyPenunjang/getPencarianResumePasienDetail/*
// @match        https://farmasi.rsupkandou.com/penunjang/C_historyPenunjang/getPencarianResumePasienDetail/*
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
const RECENTS_RANGE_KEY = "farmasiRecentsRange";
    const RECENTS_COLLAPSE_KEY =
    "farmasiRecentsCollapsed";

let zeroHighlightActive =
    localStorage.getItem(STORAGE_KEY) === "true";

let activeFilters = new Set();

let filterContainer = null;

let recentsRows = [];

let drugTableBuilt = false;
let drugTableBody = null;

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

    createRecentsUI();

    createDrugTableUI();

    loadPreviousFarmasi();

    setTimeout(() => {

        createFilterUI();

        updateFilterList();

        if (zeroHighlightActive) {
            highlightZeroQty();
        }

    }, 500);
}


    let recentsPane;
let recentsTableBody;

function createRecentsUI() {

    const farmasi =
        document.getElementById('farmasi');

    if (!farmasi) return;

    const wrapper =
        document.createElement('div');

    wrapper.style.marginBottom =
        "10px";

    wrapper.style.border =
        "1px solid #00ddbf";

    wrapper.style.padding =
        "10px";

    wrapper.style.borderRadius =
        "6px";




let recentsCollapsed =
    localStorage.getItem(
        RECENTS_COLLAPSE_KEY
    ) === "true";

const title =
    document.createElement('div');

title.style.color =
    "#00ddbf";

title.style.marginBottom =
    "8px";

title.style.cursor =
    "pointer";

title.style.userSelect =
    "none";

title.style.fontWeight =
    "bold";

function updateRecentsTitle() {

    title.innerText =
        (recentsCollapsed
            ? "▶ "
            : "▼ ")
        + "Recents";
}

updateRecentsTitle();
wrapper.appendChild(title);
    const selector =
        document.createElement('div');

    selector.innerHTML = `
<label>
<input type="radio"
name="recentRange"
value="24">
24 Jam
</label>

<label style="margin-left:15px">
<input type="radio"
name="recentRange"
value="36">
36 Jam
</label>

<label style="margin-left:15px">
<input type="radio"
name="recentRange"
value="168">
1 Minggu
</label>
`;

   const content =
    document.createElement('div');

title.onclick = () => {

    recentsCollapsed =
        !recentsCollapsed;

    localStorage.setItem(
        RECENTS_COLLAPSE_KEY,
        recentsCollapsed
    );

    content.style.display =
        recentsCollapsed
            ? "none"
            : "block";

    updateRecentsTitle();
};


content.style.display =
    recentsCollapsed
        ? "none"
        : "block";

content.appendChild(selector);

wrapper.appendChild(content);

    const table =
        document.createElement('table');
    table.id = "farmasiRecents";

    table.className =
        "table table-sm table-striped table-hover";

    table.innerHTML = `
<thead class="thead-dark">
<tr>
<th>Tanggal Resep</th>
<th>Usia</th>
<th>Nama Obat</th>
<th>Qty</th>
<th>Ruang Rawat</th>
</tr>
</thead>
<tbody></tbody>
`;

    recentsTableBody =
        table.querySelector('tbody');

    content.appendChild(table);

    farmasi.prepend(wrapper);

    let currentRange =
        localStorage.getItem(
            RECENTS_RANGE_KEY
        ) || "24";

    const radio =
        selector.querySelector(
            `input[value="${currentRange}"]`
        );

    if (radio)
        radio.checked = true;

    selector
    .querySelectorAll('input')
    .forEach(r => {

        r.onchange = () => {

            currentRange =
                r.value;

            localStorage.setItem(
                RECENTS_RANGE_KEY,
                currentRange
            );

            rebuildRecents();
            if (drugTableBuilt) {

    buildDrugTable();

}
        };
    });
}

    // =====================================================
// DRUG TABLE (TESTING)
// =====================================================

const DRUGTABLE_COLLAPSE_KEY =
    "farmasiDrugTableCollapsed";

const DRUGTABLE_RANGE_KEY =
    "farmasiDrugTableRange";

function createDrugTableUI() {

    const farmasi =
        document.getElementById("farmasi");

    if (!farmasi) return;

    const wrapper =
        document.createElement("div");

    wrapper.style.marginBottom = "10px";
    wrapper.style.border = "1px solid #00ddbf";
    wrapper.style.padding = "10px";
    wrapper.style.borderRadius = "6px";

    let collapsed =
        localStorage.getItem(
            DRUGTABLE_COLLAPSE_KEY
        );

    collapsed =
        collapsed === null
            ? true
            : collapsed === "true";

    const title =
        document.createElement("div");

    title.style.color = "#00ddbf";
    title.style.fontWeight = "bold";
    title.style.cursor = "pointer";
    title.style.userSelect = "none";
    title.style.marginBottom = "8px";

    const content =
        document.createElement("div");

    content.style.display =
        collapsed ? "none" : "block";

    function refreshTitle() {

        title.innerText =
            (collapsed ? "▶ " : "▼ ")
            + "Drug Table (Testing)";
    }

    refreshTitle();

    title.onclick = () => {

        collapsed = !collapsed;

        localStorage.setItem(
            DRUGTABLE_COLLAPSE_KEY,
            collapsed
        );

        content.style.display =
            collapsed
                ? "none"
                : "block";

        refreshTitle();

        if (
            !collapsed &&
            !drugTableBuilt
        ) {

            buildDrugTable();
            drugTableBuilt = true;
        }

    };

   const yearFilter = document.createElement("div");

yearFilter.id = "drugTableYearFilter";

yearFilter.style.marginBottom = "8px";

content.appendChild(yearFilter);

    const rangeFilter =
    document.createElement("div");

rangeFilter.id =
    "drugTableRangeFilter";

rangeFilter.style.marginBottom =
    "10px";

rangeFilter.innerHTML = `
<label>
<input type="radio"
name="drugRange"
value="1">
 Latest Month
</label>

<label style="margin-left:15px">
<input type="radio"
name="drugRange"
value="2">
 Last 2 Months
</label>

<label style="margin-left:15px">
<input type="radio"
name="drugRange"
value="3">
 Last 3 Months
</label>

<label style="margin-left:15px">
<input type="radio"
name="drugRange"
value="6">
 Last 6 Months
</label>

<label style="margin-left:15px">
<input type="radio"
name="drugRange"
value="999">
 Whole Year
</label>
`;

content.appendChild(rangeFilter);

//--------------------------------------------------
// Expand / Collapse button
//--------------------------------------------------

const expandBtn =
    document.createElement("button");

expandBtn.id = "drugTableExpandAll";

expandBtn.className =
    "btn btn-sm btn-outline-primary";

expandBtn.style.marginBottom = "10px";

expandBtn.dataset.expanded = "false";

expandBtn.innerText = "Expand All";

content.appendChild(expandBtn);


const currentRange =
    localStorage.getItem(
        DRUGTABLE_RANGE_KEY
    ) || "1";

const radio =
    rangeFilter.querySelector(
        `input[value="${currentRange}"]`
    );

if (radio)
    radio.checked = true;

rangeFilter
.querySelectorAll("input")
.forEach(r => {

    r.onchange = () => {

        localStorage.setItem(
            DRUGTABLE_RANGE_KEY,
            r.value
        );

        buildDrugTable();

    };

});



    const table =
        document.createElement("table");
    table.id = "drugTable";

table.className =
"table table-sm table-bordered table-hover";

    table.innerHTML =
`
<thead>
<tr id="drugTableHeader">
<th>Medication</th>
</tr>
</thead>

<tbody></tbody>
`;

    drugTableBody =
        table.querySelector("tbody");

    content.appendChild(table);

    wrapper.appendChild(title);
    wrapper.appendChild(content);

    farmasi.prepend(wrapper);

    if (!collapsed) {

        buildDrugTable();
        drugTableBuilt = true;
    }

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

    const qty =
        parseFloat(
            row.children[3]?.innerText.trim()
        ) || 0;

    counts[name] =
        (counts[name] || 0) + qty;
});
    const sorted =
        Object.keys(counts)
        .sort((a, b) => a.localeCompare(b));

    filterContainer.innerHTML = "";

    sorted.forEach(name => {

        const label = document.createElement('label');

label.style.display = "block";
label.style.cursor = "pointer";

if (counts[name] === 0) {

    label.style.opacity = "0.45";
}

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
        `${name} (${counts[name].toLocaleString()})`
    )
);

        filterContainer.appendChild(label);
    });
}

// =====================================================
// APPLY FILTER
// =====================================================
function applyFilter() {

    // =====================================
    // FILTER ROWS
    // =====================================
    document
    .querySelectorAll('#farmasi table tbody tr')
    .forEach(row => {

        const name =
            row.children[2]?.innerText.trim();

        if (!name) return;

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

        row.style.display =
            match ? "" : "none";
    });

    // =====================================
    // HIDE EMPTY HISTORY BLOCKS
    // =====================================
    document
    .querySelectorAll('.farmasi-history-entry')
    .forEach(block => {

        const rows =
            block.querySelectorAll('tbody tr');

        if (!rows.length) return;

        const visibleRows =
            [...rows].filter(row =>
                row.style.display !== "none"
            );

        block.style.display =
            visibleRows.length
                ? ""
                : "none";
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

   document.querySelectorAll(`
#farmasiCurrentTable tbody tr,
#farmasiRecents tbody tr,
.farmasi-history-entry table tbody tr
`)
    .forEach(row => {

        const cells =
            row.querySelectorAll('td');

        if (!cells.length)
            return;

        let qty = null;

        // Recents table
        if (cells.length === 5) {

            qty =
                cells[3]
                ?.innerText
                .trim();
        }

        // Farmasi table
        else if (cells.length >= 4) {

            const possibleQty =
                cells[3]
                ?.innerText
                .trim();

            if (!isNaN(possibleQty)) {
                qty = possibleQty;
            }
        }

        row.style.color =
            (
                zeroHighlightActive &&
                qty === "0"
            )
            ? "#ff0000"
            : "";
    });
}

//HELPER


 function addRowsToRecents(table, ruangan) {

    table
    .querySelectorAll('tbody tr')
    .forEach(row => {

        const tanggal =
            row.children[1]?.innerText.trim();

        const nama =
            row.children[2]?.innerText.trim();

        const qty =
            row.children[3]?.innerText.trim();

        if (!tanggal) return;



if (!tanggal) return;

const ts = new Date(
    tanggal.replace(" ", "T")
).getTime();

        if (isNaN(ts)) {

    console.warn(
        "[RECENTS INVALID DATE]",
        tanggal
    );

    return;
}

        const exists =
    recentsRows.some(r =>

        r.tanggal === tanggal &&
        r.nama === nama &&
        r.qty === qty &&
        r.ruangan === ruangan
    );

if (exists)
    return;

console.log(
    "[RECENTS]",
    {
        tanggal,
        nama,
        qty,
        ts
    }
);
        recentsRows.push({

            tanggal,
            nama,
            qty,
            ruangan,
            timestamp: ts

        });

        console.log(
    "[RECENTS TOTAL]",
    recentsRows.length
);
    });


}


function getRelativeTime(timestamp) {

    const diffMs =
        Date.now() - timestamp;

    const minutes =
        Math.floor(diffMs / 60000);

    if (minutes < 1)
        return "Baru saja";

    if (minutes < 60)
        return `${minutes} menit lalu`;

    const hours =
        Math.floor(minutes / 60);

    const remMinutes =
        minutes % 60;

    if (hours < 24) {

        if (remMinutes === 0)
            return `${hours} jam lalu`;

        return `${hours} jam ${remMinutes} menit lalu`;
    }

    const days =
        Math.floor(hours / 24);

    const remHours =
        hours % 24;

    if (days < 7) {

        if (remHours === 0)
            return `${days} hari lalu`;

        return `${days} hari ${remHours} jam lalu`;
    }

    const weeks =
        Math.floor(days / 7);

    return `${weeks} minggu lalu`;
}

    function buildDrugTable() {

    if (!drugTableBody)
        return;

    const yearFilter =
        document.getElementById(
            "drugTableYearFilter"
        );

    //--------------------------------------------------
    // Collect all years
    //--------------------------------------------------

    const years =
        [...new Set(

            recentsRows.map(r =>
                new Date(r.timestamp)
                    .getFullYear()
            )

        )]
        .sort((a,b)=>b-a);

        //--------------------------------------------------
        // Rebuild year filter
        //--------------------------------------------------

        const previousSelection =
              [...yearFilter.querySelectorAll("input:checked")]
        .map(x => Number(x.value));

        yearFilter.innerHTML = "";

        years.forEach((year, index) => {

            const label =
                  document.createElement("label");

            label.style.marginRight = "12px";

            const latestYear =
    years[0];

const checked =
    previousSelection.length
        ? previousSelection.includes(year)
        : year === latestYear;

            label.innerHTML =
                `
<input
type="checkbox"
value="${year}"
${checked ? "checked" : ""}>
 ${year}
`;

            label.querySelector("input").onchange =
                buildDrugTable;

            yearFilter.appendChild(label);

        });

    //--------------------------------------------------
    // Selected years
    //--------------------------------------------------

    const selectedYears =
        [...yearFilter.querySelectorAll(
            "input:checked"
        )]
        .map(x=>Number(x.value));

    //--------------------------------------------------
    // Filter rows
    //--------------------------------------------------



       const selectedRange =
    Number(
        localStorage.getItem(
            DRUGTABLE_RANGE_KEY
        ) || 1
    );

const newestTimestamp =
    Math.max(
        ...recentsRows
            .filter(r =>
                selectedYears.includes(
                    new Date(r.timestamp).getFullYear()
                )
            )
            .map(r => r.timestamp)
    );

const newestDate =
    new Date(newestTimestamp);

const newestYear =
    newestDate.getFullYear();

const newestMonth =
    newestDate.getMonth();

const filtered =
    recentsRows.filter(r => {

        const d =
            new Date(r.timestamp);

        if (
            !selectedYears.includes(
                d.getFullYear()
            )
        ) {
            return false;
        }

        const diffMonths =
            (newestYear - d.getFullYear()) * 12
            +
            (newestMonth - d.getMonth());

        return diffMonths < selectedRange;

    });

    //--------------------------------------------------
    // Dates
    //--------------------------------------------------

    const allDates =
        [...new Set(

            filtered.map(r=>{

                const d =
                    new Date(r.timestamp);

                return (
`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
);

            })

        )]
        .sort();

    //--------------------------------------------------
    // Medication map
    //--------------------------------------------------

    const map={};

    filtered.forEach(r=>{

        const d =
            new Date(r.timestamp);

        const dateKey=
`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

        const group =
            r.nama
            .trim()
            .split(/\s+/)[0];

        map[group] ??=
            {variants:{}};

        map[group]
        .variants[r.nama]
        ??={};

        map[group]
        .variants[r.nama][dateKey]=

            (
                map[group]
                .variants[r.nama][dateKey]
                ||0
            )

            +

            Number(r.qty);

    });

    //--------------------------------------------------
    // Header
    //--------------------------------------------------

    const header =
        document.getElementById(
            "drugTableHeader"
        );

    header.innerHTML =
        "<th>Medication</th>";

    allDates.forEach(date=>{

        const p =
            date.split("-");

        header.innerHTML+=
`
<th>${p[1]}/${p[2]}</th>
`;

    });

    //--------------------------------------------------
    // Body
    //--------------------------------------------------

    drugTableBody.innerHTML="";

    Object.keys(map)
    .sort()
    .forEach(group=>{

        const cls =
"group-"+group.replace(/\W/g,"_");

        drugTableBody.insertAdjacentHTML(
"beforeend",
`
<tr
class="drugGroup"
data-group="${cls}"
data-name="${group}"
data-open="false"
style="cursor:pointer">

<td colspan="${allDates.length+1}">
<b>▶ ${group}</b>
</td>

</tr>
`
);

        Object.keys(
            map[group].variants
        )
        .sort()
        .forEach(name=>{

            let html=
`
<tr
class="${cls}"
style="display:none">

<td style="padding-left:24px">
${name}
</td>
`;

            allDates.forEach(date=>{

                html+=
`
<td>
${map[group].variants[name][date] ?? ""}
</td>
`;

            });

            html+="</tr>";

            drugTableBody
            .insertAdjacentHTML(
                "beforeend",
                html
            );

        });

    });

    //--------------------------------------------------
    // Expand collapse
    //--------------------------------------------------

    drugTableBody
    .querySelectorAll(".drugGroup")
    .forEach(row=>{

        row.onclick=()=>{

            const cls =
                row.dataset.group;

            const open =
                row.dataset.open==="true";

            row.dataset.open =
                !open;

row.querySelector("b").innerText =
    (open ? "▶ " : "▼ ")
    + row.dataset.name;

            drugTableBody
            .querySelectorAll(
                "."+cls
            )
            .forEach(r=>{

                r.style.display=
                    open
                    ?"none"
                    :"";

            });

        };

    });

//--------------------------------------------------
// Expand / Collapse All
//--------------------------------------------------

const expandBtn =
    document.getElementById(
        "drugTableExpandAll"
    );

if (expandBtn) {

    expandBtn.onclick = () => {

        const expand =
            expandBtn.dataset.expanded !== "true";

        drugTableBody
        .querySelectorAll(".drugGroup")
        .forEach(row => {

            row.dataset.open = expand;

            row.querySelector("b").innerText =
                (expand ? "▼ " : "▶ ")
                + row.dataset.name;

            drugTableBody
            .querySelectorAll(
                "." + row.dataset.group
            )
            .forEach(r => {

                r.style.display =
                    expand
                        ? ""
                        : "none";

            });

        });

        expandBtn.dataset.expanded =
            expand;

        expandBtn.innerText =
            expand
                ? "Collapse All"
                : "Expand All";

    };

}

}


    function rebuildRecents() {

    if (!recentsTableBody)
        return;

        recentsTableBody.innerHTML = "";

    const hours =
        Number(
            localStorage.getItem(
                RECENTS_RANGE_KEY
            ) || 24
        );

    const cutoff =
        Date.now() -
        (hours * 60 * 60 * 1000);

    console.log(
        "[RECENTS REBUILD]",
        {
            totalRows: recentsRows.length,
            cutoff: new Date(cutoff)
        }
    );
    recentsRows
    .filter(r => {

    const keep =
        r.timestamp >= cutoff;

    console.log(
        "[RECENTS FILTER]",
        r.nama,
        r.timestamp,
        keep
    );

    return keep;
})

    .sort((a,b)=>{

    const drugCompare =
        a.nama.localeCompare(
            b.nama
        );

    if (drugCompare !== 0)
        return drugCompare;

    return b.timestamp -
           a.timestamp;
})
    .forEach(r => {

        recentsTableBody
        .insertAdjacentHTML(
            "beforeend",
            `
<tr>
<td>${r.tanggal}</td>
<td>
    <span style="
        color:#00ddbf;
        font-weight:bold;
        white-space:nowrap;
    ">
        ${getRelativeTime(r.timestamp)}
    </span>
</td>
<td>${r.nama}</td>
<td>${r.qty}</td>
<td>${r.ruangan}</td>
</tr>
`
        );
    });

    if (zeroHighlightActive) {
        highlightZeroQty();
    }
}


// =====================================================
// LOAD PREVIOUS FARMASI
// =====================================================
function loadPreviousFarmasi() {

    const farmasi =
        document.getElementById('farmasi');


setTimeout(() => {

    const currentTable =
        farmasi.querySelector(
            '.table-responsive table'
        );
    if (currentTable) {
    currentTable.id = "farmasiCurrentTable";
}
    console.log(
    "[CURRENT TABLE]",
    currentTable
);

    if (currentTable) {

            console.log(
        currentTable.outerHTML
    );


        addRowsToRecents(
            currentTable,
            "Current Visit"
        );

        rebuildRecents();
        if (drugTableBuilt) {

    buildDrugTable();

}
    }

}, 1000);

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

cloned.classList.add(
    'farmasi-history-entry'
);

    cloned.style.marginTop = "15px";

    // =================================
    // RUANG RAWAT HEADER
    // =================================
    const ruanganDiv =
        document.createElement('div');

    ruanganDiv.className = "row";

    ruanganDiv.innerHTML = `
        <div class="col-2">
            Ruang Rawat
        </div>
        <div class="col-1">:</div>
        <div class="col-9">
            <strong>${item.nm_unit_ruangan || '-'}</strong>
        </div>
    `;

    cloned.insertBefore(
        ruanganDiv,
        cloned.firstChild
    );

                            const clonedTable =
    cloned.querySelector('table');

if (clonedTable) {

    addRowsToRecents(
        clonedTable,
        item.nm_unit_ruangan
    );
}

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

    rebuildRecents();

    if (drugTableBuilt) {

        buildDrugTable();

    }

    if (zeroHighlightActive) {

        highlightZeroQty();

    }

    loading.innerText = "Completed ✓";

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
