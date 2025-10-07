// ==UserScript==
// @name         Testing - Tombol History Apol di Nomor Peserta
// @namespace    http://rsupkandou.com
// @version      2025-08-14
// @description  Testing Add Tombol History Apol di SPA Farmasi
// @author       EngulfinglessRaiden
// @match        */spa-farmasi
// @match        https://apotek.bpjs-kesehatan.go.id/apotek/frmHistObat.aspx
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.notification
// @grant        GM.deleteValue
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

function addBTNApol () {
    'use strict';

    // define variables
var NoPeserta = document.getElementsByClassName('col-12 mt-1')[2].innerText;
var URLHistoryApol = 'https://apotek.bpjs-kesehatan.go.id/apotek/frmHistObat.aspx'

var GrayBox = document.getElementsByClassName('col-12 mt-2')[3];
var button = document.createElement("Button");
var NumberApol = NoPeserta

// define button properties
button.innerHTML = "Buka History Apol";
button.onclick = openApol;
button.className = 'btn btn-sm btn-success text-light get-print'

    //append the button
GrayBox.appendChild(button);
    function openApol() {
        //using GM values to make it persists between SPA and Apol
        GM.setValue ("NumberApol", NoPeserta)
        window.open(URLHistoryApol);
        console.log(GM.listValues());
    }
}


//wait for SPA element to show up first
waitForKeyElements (
    "div.col-12.mt-3",
    addBTNApol, false
);


//unused Apol function, backed up just in case
/*
waitForKeyElements (
    "div#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_1_CC",
    ApolFunction, false
);
*/

//need to async, since GM values isn't instantly retrieved
(async function ApolFunction () {
    var NumberApol = await GM.getValue("NumberApol")
    console.log(await GM.getValue("NumberApol"));
    const currentURLPath = window.location.pathname
    if (NumberApol === undefined){
//        GM.notification("No Number", "No Data")
        console.log(await GM.getValue("NumberApol"));
    } else if (currentURLPath !== '/spa-farmasi') {
        GM.notification("Pasted data from SPA", "Value Get!");
        //hopefully these elements doesn't change over time
        document.getElementById('ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_txtNOKAPST_I').value = NumberApol
        document.getElementById('ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_BtnCari_CD').click();
        //delete the value after using it
        GM.deleteValue("NumberApol")
    }
}
)();