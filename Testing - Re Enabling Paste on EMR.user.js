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
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Re%20Enabling%20Paste%20on%20EMR.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Re%20Enabling%20Paste%20on%20EMR.user.js
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
