// ==UserScript==
// @name         Testing - Apol Kandou Button
// @namespace    http://rsupkandou.com
// @version      2025-11-01
// @description  Testing Add Tombol EMR + Resume di SPA
// @author       TrixPone
// @match        https://apotek.bpjs-kesehatan.go.id/apotek/RspMsk1.aspx
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bpjs-kesehatan.go.id
// @grant        GM_openInTab
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.notification
// @grant        GM.deleteValue
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL	 https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Apol%20Kandou%20Button.user.js
// @downloadURL	 https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Apol%20Kandou%20Button.user.js

// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

function yolo () {
    'use strict';

    function CopySEPKandou() {
        InputNoSEP.value = "2101r0010825v"
        InputNoSEP.focus();
    }
            var NoResep = document.getElementById('ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_txtNoResep_I')
            var KandouSEPButton = document.getElementById("ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_BtnCariPopUp").parentNode.parentNode
            var InputNoSEP = document.getElementById("ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_TxtREFASALSJP_I")
            var SubmitButton = document.getElementById("ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_BtnSimpan_I")

            var button = document.createElement("Button");
            button.innerHTML = "2101r0010825v";
            button.onclick = CopySEPKandou;
            button.type="button"
                KandouSEPButton.append("\u00A0");
                KandouSEPButton.append("\u00A0");
                KandouSEPButton.append("\u00A0");
                KandouSEPButton.appendChild(button);
                console.log(GM.getValue("NoResep"));
           }


//wait for SPA element to show up first
waitForKeyElements (
    "#ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_TxtREFASALSJP_I",
    yolo, false
);
