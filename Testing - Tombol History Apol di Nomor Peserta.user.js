// ==UserScript==
// @name         Testing - Tombol History Apol di Nomor Peserta
// @namespace    http://rsupkandou.com
// @version      2026-02-09
// @description  Testing Add Tombol History Apol di SPA Farmasi
// @author       TrixPone
// @match        */spa-farmasi
// @match        https://apotek.bpjs-kesehatan.go.id/apotek/frmHistObat.aspx
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.notification
// @grant        GM.deleteValue
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Tombol%20History%20Apol%20di%20Nomor%20Peserta.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Tombol%20History%20Apol%20di%20Nomor%20Peserta.user.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

function addBTNApol () {
  'use strict';

  const pesertaValueEl = document.getElementsByClassName('col-12 mt-1')[2];
  const pesertaLabelEl = document.getElementsByClassName('col-12 mt-2')[3];

  if (!pesertaValueEl || !pesertaLabelEl) return;

  // 🚫 STOP if button already exists in this container
  if (pesertaLabelEl.querySelector('.tm-btn-apol')) return;

  const NoPeserta = pesertaValueEl.innerText.trim();
  const URLHistoryApol = 'https://apotek.bpjs-kesehatan.go.id/apotek/frmHistObat.aspx';

  // === Button ===
  const button = document.createElement('button');
  button.innerHTML = 'Buka History Apol';
  button.className = 'btn btn-sm btn-success text-light get-print tm-btn-apol';
  button.onclick = function () {
    GM.setValue('NumberApol', NoPeserta);
    window.open(URLHistoryApol);
  };

  pesertaLabelEl.appendChild(button);

  // === Copy Icon ===
  if (!pesertaValueEl.querySelector('.tm-copy-apol')) {
    const copyButton = document.createElement('icon');
    copyButton.className = 'fa fa-copy tm-copy-apol';
    copyButton.style.cursor = 'pointer';

    copyButton.addEventListener('click', function () {
      navigator.clipboard.writeText(NoPeserta)
        .then(() => {
          const msg = document.createTextNode(' Copied!');
          copyButton.after(msg);
          setTimeout(() => msg.remove(), 2000);
        })
        .catch(err => console.error('Copy failed', err));
    });

    pesertaValueEl.appendChild(copyButton);
  }
}

// Wait for SPA sidebar rebuilds
waitForKeyElements(
  'div.col-12.mt-3',
  addBTNApol,
  false
);

// === APOL PAGE AUTO FILL ===
(async function ApolFunction () {
  const NumberApol = await GM.getValue('NumberApol');
  const currentURLPath = window.location.pathname;

  if (!NumberApol) return;

  if (currentURLPath !== '/spa-farmasi') {
    document.getElementById('ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_txtNOKAPST_I').value = NumberApol;
    document.getElementById('ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_BtnCari_CD').click();
    GM.deleteValue('NumberApol');
  }
})();
