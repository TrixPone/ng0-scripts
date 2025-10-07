// ==UserScript==
// @name         Testing - Nomor Antrian Proses
// @namespace    http://rsupkandou.com
// @version      2025-10-07
// @description  Testing Add Tombol EMR + Resume di SPA
// @author       TrixPone
// @match        */spa-farmasi
// @match        https://*.rsupkandou.com*/monitoring/antrian/*
// @grant        GM_openInTab
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.notification
// @grant        GM.deleteValue
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Nomor%20Antrian%20Proses.user.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

function addBTN () {
    'use strict';

    //define variables

//var NomorAntrian = document.getElementsByClassName('btn btn-sm btn-success btn_modal_estimasi_durasi')[0].dataset.nomor_antrian;
var NomorAntrian = Array.from(document.querySelectorAll('label')).find(el => el.textContent === 'Nomor Antrian ').parentElement.childNodes[3].innerText
var DivAntrian = Array.from(document.querySelectorAll('label')).find(el => el.textContent === 'Nomor Antrian ').parentElement;
var URLAntrian = 'https://ng0.rsupkandou.com:3000/monitoring/antrian/C_Antrian/antrianFarmasi/8'
var NoRM = document.getElementById('wrapperResep').dataset.norm

GM.setValue ("NoRM", NoRM)
GM.setValue ("NoAntrian", NomorAntrian)

console.log(GM.getValue("NoRM"));
console.log(GM.getValue("NoAntrian"));

var button = document.createElement("Button");


    //define button properties
button.innerHTML = "Tunggu 30 Menit + Proses";
button.onclick = Menit30Proses;
button.className = 'btn btn-sm btn-success text-light get-print'

    //append the button
DivAntrian.appendChild(button);
DivAntrian.append("\u00A0");

function Menit30Proses() {
	window.open(URLAntrian, {incognito: false});

}


}

//wait for SPA element to show up first
waitForKeyElements (
    "#wrapper_resep_detail",
    addBTN, false
);

(async function NoRM_F () {
//    console.log(GM.listValues());
    var NoAntrian = await GM.getValue("NoAntrian")
    var NoRM = await GM.getValue("NoRM")
    var OverlayStatus = document.getElementById('modalantrian');
    var ModalCompleteCounter = false

    console.log(await GM.getValue("NoAntrian"));
    const currentURLPath = window.location.pathname
    if (NoAntrian === undefined){
//        GM.notification("No Number", "No Data")
        console.log(await GM.getValue("NoAntrian"));
    } else if (currentURLPath !== '/spa-farmasi') {
        console.log(await GM.getValue("NoAntrian"));
//        GM.notification("Pasted data from SPA", "Value Get!");
        switch(true){
            case currentURLPath.indexOf('antrianFarmasi') > -1:
                //hopefully these elements doesn't change over time
                document.getElementById('btn_modal_antrian').click();

                const ModalCheckInterval = setInterval ( () => {
                if((OverlayStatus.hasAttribute("aria-modal")) && ModalCompleteCounter === false)
                {
//                document.querySelector("input[type='search']").value = NoRM
//                document.querySelector("input[type='search']").dispatchEvent(new Event("change", {bubbles: true}));

                document.getElementsByClassName('custom-select custom-select-sm form-control form-control-sm')[0].options[3].value = 1000
                document.getElementsByClassName('custom-select custom-select-sm form-control form-control-sm')[0].options[3].innerText = 1000

                document.getElementsByClassName('custom-select custom-select-sm form-control form-control-sm')[0].value = 1000
                document.getElementsByClassName('custom-select custom-select-sm form-control form-control-sm')[0].dispatchEvent(new Event("change", {bubbles: true}));

                document.querySelectorAll('tr[no_antrian="'+NoAntrian+'"]')[1].click();


                ModalCompleteCounter = true

                } else if (OverlayStatus.hasAttribute("aria-hidden")) {
                    ModalCompleteCounter = false
                    document.getElementById('estimasi').value = 30
                    document.getElementById('simpan_status_resep').click();

                    document.getElementById('status_resep').value = 2
                    document.getElementById('status_resep').dispatchEvent(new Event("change", {bubbles: true}));

                    document.getElementById('simpan_status_resep').click();
                    clearInterval(ModalCheckInterval)

                }

                }, 500);

                break;
            //delete the value after using it
            GM.deleteValue("NoRM");
            GM.deleteValue("NoAntrian");
           }
    }
}
)();
