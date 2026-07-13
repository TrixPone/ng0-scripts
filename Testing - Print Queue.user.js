// ==UserScript==
// @name         Testing - Print Queue
// @namespace    http://rsupkandou.com
// @version      2026-07-13
// @description  Queue system for Printing
// @author       TrixPone
// @match        */spa-farmasi
// @grant        none
// @run-at       document-idle
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Print%20Queue.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Print%20Queue.user.js
// ==/UserScript==

/**********************************************************************
 *
 * Print Queue Manager
 *
 * Version : 0.1.0
 * Date    : 2026-07-13
 *
 * Changelog
 * ----------
 * v0.1.0
 * - Queue Print ODD Single
 * - Sequential printing
 * - Floating status panel
 * - AJAX compatible
 *
 **********************************************************************/

// THIS SCRIPT IS FULLY MADE WITH AI
// me currently dont have time to fully write it

(function () {
    'use strict';

    /**********************************************************************
     * CONFIG
     **********************************************************************/
    const CONFIG = {
//        DRY_RUN: true,          // false = real printing later
        PANEL_HIDE_DELAY: 2000, // ms after queue finishes
        PRINT_DELAY: 500        // gap between jobs
    };

    /**********************************************************************
     * STATE
     **********************************************************************/
    const queue = [];
    let busy = false;
    let hideTimer = null;

    /**********************************************************************
     * PANEL
     **********************************************************************/
    const panel = document.createElement("div");

    panel.id = "tm-print-queue";

    panel.innerHTML = `
<div class="title">

🖨 Print Queue

</div>

<div class="section">

<div class="label">

Printing

</div>

<div id="pq-current">

Idle

</div>

</div>

<div class="section">

<div class="label">

Waiting

</div>

<div id="pq-waiting">

None

</div>

</div>
`;

    document.body.appendChild(panel);

    const style = document.createElement("style");

    style.textContent = `
#tm-print-queue{
position:fixed;
top:12px;
right:12px;
width:300px;
background:#202124;
color:white;
border-radius:10px;
padding:12px;
font:13px sans-serif;
box-shadow:0 4px 15px rgba(0,0,0,.3);
z-index:2147483647;

display:none;
}

#tm-print-queue .title{
font-weight:bold;
margin-bottom:8px;
}

#tm-print-queue .section{
margin-top:8px;
}

#tm-print-queue .label{
opacity:.7;
font-size:11px;
margin-bottom:2px;
}
`;

    document.head.appendChild(style);

    function showPanel() {
        clearTimeout(hideTimer);
        panel.style.display = "block";
    }

    function hidePanel() {
        hideTimer = setTimeout(() => {
            if (!busy && queue.length === 0) {
                panel.style.display = "none";
            }
        }, CONFIG.PANEL_HIDE_DELAY);
    }

    function updatePanel(current = "Idle") {

    if (busy || queue.length) {

        showPanel();

    }

   const currentEl =
    document.getElementById("pq-current");

const waiting =
    document.getElementById("pq-waiting");

        currentEl.textContent = current;

    if (!queue.length) {

        waiting.innerHTML = "None";

        if (!busy) {

            hidePanel();

        }

        return;

    }

    const grouped={};

    queue.forEach(job=>{

       const label =

    job.drug
        ? `${job.type} • ${job.drug}`
        : job.type;

grouped[label] =

    (grouped[label] || 0) + 1;

    });

    waiting.innerHTML=Object.entries(grouped)

.map(([label,count])=>

            `• ${label}${count > 1 ? ` ×${count}` : ""}`

        )

        .join("<br>");

}

    /**********************************************************************
     * HELPERS
     **********************************************************************/
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**********************************************************************
 * PRINT TYPE
 **********************************************************************/

function getPrintType(button){

    const uri = button.dataset.uri || "";

    if(uri.includes("view_auto_cetak_odd_single"))
        return "ODD SINGLE";

    if(uri.includes("view_auto_cetak_odd"))
        return "ODD";

    if(uri.includes("view_auto_cetak_udd_single"))
        return "UDD SINGLE";

    if(uri.includes("view_auto_cetak_udd"))
        return "UDD";

    if(uri.includes("view_cetak_faktur_obat_spa"))
        return "FAKTUR";

    return null;

}



   function makeJob(button){

    const row = button.closest("tr");

    const drug =
        row?.querySelector("td:nth-child(2)")?.textContent.trim()
        || "";

    return {

        uri: button.dataset.uri,

        type: getPrintType(button),

        label: button.textContent.trim(),

        drug,

        time: Date.now()

    };

}
    /**********************************************************************
     * PRINT
     **********************************************************************/
 async function printJob(job) {

    try {

        const response = await fetch(job.uri, {
            method: "POST",
            credentials: "same-origin"
        });

        if (!response.ok) {
            throw new Error(response.status);
        }

        const json = await response.json();

        console.groupCollapsed(
            "%cPrintQueue",
            "color:#4CAF50;font-weight:bold",
            job.drug
        );

        console.log(job);
        console.log(json);

        console.groupEnd();

        await sleep(CONFIG.PRINT_DELAY);

        return true;

    } catch (err) {

        console.error("[PrintQueue]", err);

        return false;

    }

}

    /**********************************************************************
     * QUEUE WORKER
     **********************************************************************/
    async function processQueue() {

        if (busy) return;

        if (!queue.length) return;

        busy = true;

while (queue.length) {

    const job = queue[0];

    updatePanel(

    job.type +

    (job.drug ? " • " + job.drug : "")

);

    const success = await printJob(job);

    if (success) {

        queue.shift();

    } else {

        break;

    }

}


        busy = false;

updatePanel("Idle");

hidePanel();

    }

    function enqueue(button){

    queue.push(makeJob(button));

updatePanel();

if (!busy) {

    processQueue().catch(console.error);

}

}

    /**********************************************************************
 * CLICK INTERCEPTOR
 **********************************************************************/

document.addEventListener("click", function(e){

    const button=e.target.closest(".btn_print");

    if(!button) return;

const type = getPrintType(button);

if(!type)
    return;

    e.preventDefault();
e.stopPropagation();
e.stopImmediatePropagation();

    enqueue(button);

    console.log(

    `[PrintQueue] Queued ${getPrintType(button)}`,

    button.dataset.uri

);
},true);

    /**********************************************************************
     * DEBUG
     **********************************************************************/
    window.PrintQueue={

    enqueue,

    queue,

    processQueue,

    CONFIG,

    dryRun(){

        const btn=document.querySelector(
            '.btn_print[data-uri*="view_auto_cetak_odd_single"]'
        );

        if(btn)
            enqueue(btn);

    }

};

    console.log(
        "[PrintQueue] Checkpoint 1A loaded."
    );

})();
