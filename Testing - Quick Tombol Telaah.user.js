// ==UserScript==
// @name         Testing - Quick Tombol Telaah
// @namespace    http://rsupkandou.com
// @version      2025-07-24
// @description  Testing Quick Tombol Telaah
// @author       EngulfinglessRaiden
// @match        */spa-farmasi
// @match        https://emr.rsupkandou.com/penunjang/C_historyPenunjang/viewCariHasilPenunjang
// @match        https://emr.rsupkandou.com/emr
// @match        https://emr.rsupkandou.com/emr/C_emr/loadDetailErm/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @grant        GM_openInTab
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.notification
// @grant        GM.deleteValue
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

function addBTN () {
    'use strict';



    //define variables
var TitleTelaahKPO = document.getElementsByClassName('modal-header')[10];

var button = document.createElement("Button");
var button2 = document.createElement("Button");

    //define button properties
button.innerHTML = "Non INACBGS";
button.onclick = NonINACGBS_F;
button.className = 'btn btn-sm btn-success text-light get-print'

button2.innerHTML = "Kronis Belum Stabil Non-Iter";
button2.onclick = INACBGS;
button2.className = 'btn btn-sm btn-success text-light get-print'



    //append the button
TitleTelaahKPO.appendChild(button);
TitleTelaahKPO.append("\u00A0");
TitleTelaahKPO.appendChild(button2);

function NonINACGBS_F() {
	document.getElementById('klaim_non_inacbg').value = 2;
    document.getElementById('klaim_non_inacbg').dispatchEvent(new Event("change", {bubbles: true}));
    document.getElementsByClassName('btn btn-primary btn-sm float-right tombolSimpanKpo')[0].click();
}


function INACBGS() {
	document.getElementById('klaim_non_inacbg').value = 1;
    document.getElementById('klaim_non_inacbg').dispatchEvent(new Event("change", {bubbles: true}));
    document.getElementById('jenis_obat_dpho').value = 2;
    document.getElementById('jenis_obat_dpho').dispatchEvent(new Event("change", {bubbles: true}));
    document.getElementById('status_iterasi').value = 0;
    document.getElementById('status_iterasi').dispatchEvent(new Event("change", {bubbles: true}));
    document.getElementsByClassName('btn btn-primary btn-sm float-right tombolSimpanKpo')[0].click();
}


    console.log('element exist')
}

//wait for SPA element to show up first
waitForKeyElements (
    "#titlemenupelaksana",
    addBTN, false
);

