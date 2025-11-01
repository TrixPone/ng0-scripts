// ==UserScript==
// @name         Testing - Always 'Tidak Claim Non INACBGs'
// @namespace    http://rsupkandou.com
// @version      2025-10-07
// @description  Testing Quick Tombol Telaah
// @author       TrixPone
// @match        */spa-farmasi
// @match        https://emr.rsupkandou.com/penunjang/C_historyPenunjang/viewCariHasilPenunjang
// @match        https://emr.rsupkandou.com/emr
// @match        https://emr.rsupkandou.com/emr/C_emr/loadDetailErm/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL	 https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Always%20'Tidak%20Claim%20Non%20INACBGs'.user.js
// @downloadURL	 https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Always%20'Tidak%20Claim%20Non%20INACBGs'.user.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

function addBTN () {
    'use strict';
	document.getElementById('klaim_non_inacbg').value = 2;
    document.getElementById('klaim_non_inacbg').dispatchEvent(new Event("change", {bubbles: true}));
    document.getElementsByClassName('btn btn-primary btn-sm float-right tombolSimpanKpo')[0].click();
}

//wait for SPA element to show up first
waitForKeyElements (
    "#titlemenupelaksana",
    addBTN, false
);

