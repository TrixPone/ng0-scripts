// ==UserScript==
// @name         Testing - Re Enabling Paste on EMR
// @namespace    http://rsupkandou.com
// @version      2025-11-05
// @description  Testing on enabling: paste, selecting, and printing on EMR
// @author       TrixPone
// @match        https://emr.rsupkandou.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @grant        GM_openInTab
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.notification
// @grant        GM.deleteValue
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Re%20Enabling%20Paste%20on%20EMR.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Re%20Enabling%20Paste%20on%20EMR.user.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

function enablePaste () {
    'use strict';

//define variables
var allPencatatan = document.querySelectorAll('[id^="pencatatan"]');
var allRMKContentDiv = document.getElementById('table_rmk').querySelectorAll('div')
var allRMKContentSpan = document.getElementById('table_rmk').querySelectorAll('span')
var printElement = document.getElementsByClassName('hiddenform ')[0];


//console.log('here')

// remove onpaste and ondrop attributes
allPencatatan.forEach(element => {
  element.removeAttribute('onpaste');
  element.removeAttribute('ondrop');
});

// remove user-select property on div
allRMKContentDiv.forEach(element => {
  element.style.removeProperty('webkit-user-select');
  element.style.removeProperty('user-select');
});

// remove user-select property on span
allRMKContentSpan.forEach(element => {
  element.style.removeProperty('webkit-user-select');
  element.style.removeProperty('user-select');
});

// remove print override element
if (printElement) {
  printElement.remove(); // This removes the element from the DOM
}


}

//wait for first table elements to show up first
waitForKeyElements (
    "td.sorting_1",
    enablePaste, false
);
