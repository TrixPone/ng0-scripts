// ==UserScript==
// @name         Testing - Quick Print Faktur
// @namespace    http://rsupkandou.com
// @version      2026-01-02
// @description  Testing Add Faktur Buttons on Resep Detail Menu
// @author       TrixPone
// @match        */spa-farmasi
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @grant        GM_openInTab
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.notification
// @grant        GM.deleteValue
// @updateURL
// @downloadURL
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

function addBTN () {
    'use strict';


//define variables
var formArea = document.getElementById('wrapper_resep_detail').querySelectorAll('.form-row')[1]
var resep_detail = document.getElementById('wrapper_resep_detail')
var button = document.createElement("Button");
var button2 = document.createElement("Button");

//define button properties
button.innerHTML = "Faktur + ODD";
button.onclick = FakturODD;
button.className = 'btn btn-warning btn_print'

button2.innerHTML = "Faktur + UDD";
button2.onclick = FakturUDD;
button2.className = 'btn btn-warning btn_print'


//append already existing buttons to outside
if(!document.getElementById('wrapper_resep_detail').querySelectorAll('.col-auto')[0]){
    resep_detail.appendChild(document.getElementsByClassName('modal-body center')[0].cloneNode(true));
} else
{
 console.log('no button yet')
}
//change new buttons to be smaller
document.getElementById('wrapper_resep_detail').querySelectorAll('.col-3').forEach((el,index) => {
    el.classList.replace('col-3', 'col-auto');

//change new cloned button names
    const btn = el.querySelector('button');
    if (!btn || !btn.id) return;

    const originalId = btn.id;

    btn.id = `${originalId}_updated`;

// forward click to original button
    btn.onclick = function () {
        const originalBtn = document.getElementById(originalId);
        if (originalBtn) {
            originalBtn.click();
        }
    };
});

//unused version, hardcoded the changed button-ids lol
/*
document.getElementById("btnprint_updated").onclick = function () {
  document.getElementById("btnprint").click();
};

document.getElementById("btnprint_odd_updated").onclick = function () {
  document.getElementById("btnprint_odd").click();
};

document.getElementById("btnprint_udd_updated").onclick = function () {
  document.getElementById("btnprint_udd").click();
};

document.getElementById("btnprint_odd_single_updated").onclick = function () {
  document.getElementById("btnprint_odd_single").click();
};

*/



//append the button
formArea.appendChild(button);
formArea.append("\u00A0");
formArea.appendChild(button2);

function FakturODD() {
  document.getElementById("btnprint").click();
  document.getElementById("btnprint_udd").click();
}

function FakturUDD() {
  document.getElementById("btnprint").click();
  document.getElementById("btnprint_odd").click();
}

}

//wait for SPA element to show up first
waitForKeyElements (
    "#btn_modal_estimasi",
    addBTN, false
);

