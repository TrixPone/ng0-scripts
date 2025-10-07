// ==UserScript==
// @name         Testing - Tombol EMR di Nomor Pendaftaran v3
// @namespace    http://rsupkandou.com
// @version      2025-10-07
// @description  Testing Add Tombol EMR + Resume di SPA
// @author       TrixPone
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
// @updateURL    
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

function addBTN () {
    'use strict';

    //define variables
var EMR = document.getElementById('wrapperResep').dataset.idtrxpendaftaran
var URLEMR = 'https://emr.rsupkandou.com/emr/C_emr/loadDetailErm/' + EMR
var URLResume = 'https://ng0.rsupkandou.com:3000/penunjang/C_historyPenunjang/getPencarianResumePasienDetail/' + EMR

var GrayBox = document.getElementsByClassName('col-12 mt-1')[0];

var NoRM = document.getElementById('wrapperResep').dataset.norm
GM.setValue ("NoRM", NoRM)

var button = document.createElement("Button");
var button2 = document.createElement("Button");
var button3 = document.createElement("Button");
var button4 = document.createElement("Button");

    //define button properties
button.innerHTML = "CPPT";
button.onclick = openEMRDetail;
button.className = 'btn btn-sm btn-success text-light get-print'

button2.innerHTML = "Resume";
button2.onclick = openResume;
button2.className = 'btn btn-sm btn-success text-light get-print'

button3.innerHTML = "Lab EMR";
button3.onclick = cekPenunjang;
button3.className = 'btn btn-sm btn-success text-light get-print'

button4.innerHTML = "EMR";
button4.onclick = openEMR;
button4.className = 'btn btn-sm btn-success text-light get-print'

    //append the button
GrayBox.appendChild(button4);
GrayBox.append("\u00A0");
GrayBox.appendChild(button);
GrayBox.append("\u00A0");
GrayBox.appendChild(button3);
GrayBox.append("\u00A0");
GrayBox.appendChild(button2);


function openEMRDetail() {
	GM_openInTab(URLEMR, {incognito: false});
}

function cekPenunjang() {
    GM_openInTab('https://emr.rsupkandou.com/penunjang/C_historyPenunjang/viewCariHasilPenunjang', {incognito: false});
    console.log(GM.getValue("NoRM"));
}

function openResume() {
	window.open(URLResume);
}

function openEMR() {
    GM_openInTab('https://emr.rsupkandou.com/emr', {incognito: false});
}

}

//wait for SPA element to show up first
waitForKeyElements (
    "div.form-row.mt-3",
    addBTN, false
);

(async function NoRM_F () {
//    console.log(GM.listValues());
    var NoRM = await GM.getValue("NoRM")
    console.log(await GM.getValue("NoRM"));
    const currentURLPath = window.location.pathname
    if (NoRM === undefined){
//        GM.notification("No Number", "No Data")
        console.log(await GM.getValue("NoRM"));
    } else if (currentURLPath !== '/spa-farmasi') {
        console.log(await GM.getValue("NoRM"));
//        GM.notification("Pasted data from SPA", "Value Get!");
        switch(true){
            case currentURLPath.indexOf('viewCariHasilPenunjang') > -1:
                //hopefully these elements doesn't change over time
                document.getElementById('search_norm_penunjang').value = NoRM;
                document.getElementById('select_hasil_penunjang').value = 1;
                document.getElementById('btn_cari_pasien_penunjang').click();
                break;
            case currentURLPath === '/emr':
                document.getElementById('norm').value = NoRM;
                document.getElementsByClassName('btn btn-sm float-right btn-submit-color')[0].click();
                break;
            case currentURLPath.indexOf('loadDetailErm') > -1 :
                document.getElementById('jenis_form_rmk-selectized').click();
//                document.getElementById('jenis_form_rmk-selectized').click();
//                document.querySelectorAll('[data-value="V_emr_rmk_3_2_rev_5 // 14"]')[0].click();
//               document.getElementsByClassName('selectize-input items has-options full has-items')[0].click();
                break;
            //delete the value after using it
            GM.deleteValue("NoRM");
           }
    }
}
)();

