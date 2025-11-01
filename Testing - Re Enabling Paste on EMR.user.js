// ==UserScript==
// @name         Testing - Re Enabling Paste on EMR
// @namespace    http://rsupkandou.com
// @version      2025-11-01
// @description  Testing EMR Paste
// @author       TrixPone
// @match        https://emr.rsupkandou.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @grant        GM_openInTab
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.notification
// @grant        GM.deleteValue
// @updateURL
// @downloadURL
// ==/UserScript==

/* globals jQuery, $  */

function enablePaste () {
    'use strict';

//define variables
var allPencatatan = document.querySelectorAll('[id^="pencatatan"]');

// remove onpaste and ondrop attributes
allPencatatan.forEach(element => {
  element.removeAttribute('onpaste');
  element.removeAttribute('ondrop');
});
}
