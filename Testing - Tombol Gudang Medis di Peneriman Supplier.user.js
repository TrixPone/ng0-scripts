// ==UserScript==
// @name         Testing - Tombol Gudang Medis di Peneriman Supplier
// @namespace    http://rsupkandou.com
// @version      2025-10-24
// @description  Automatically set the date to 1st of 2025 and options to Gudang Medis with a single click
// @author       TrixPone
// @match        https://ng0.rsupkandou.com:3000/laporan-farmasi/get-penerimaan-supplier
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @grant        none
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Tombol%20Gudang%20Medis%20di%20Peneriman%20Supplier.user.js
// ==/UserScript==

(function() {
    'use strict';

var GrayBox = document.getElementsByClassName('jumbotron bg-dark p-4 mt-2')[0];
var button = document.createElement("Button");
button.innerHTML = "View Gudang Medis Januari - Sekarang";
button.style = "position:absolute";


GrayBox.appendChild(button);

// Setting function for button when it is clicked.
    button.onclick = autoSet;
      function autoSet() {
        document.getElementsByClassName('form-control form-control-sm bg-dark').periode.selectedIndex=1;
		document.getElementsByClassName('form-control form-control-sm bg-dark').periode.dispatchEvent(new Event("change", {bubbles: true}));

		document.getElementsByClassName('form-control form-control-sm formattanggal').tanggal_dari.value="2025-01-01";
		document.getElementsByClassName('form-control form-control-sm bg-dark').jenis_gudang.selectedIndex=1;
		document.getElementsByClassName('form-control form-control-sm bg-dark').format_laporan.selectedIndex=1;
		document.getElementsByClassName('btn btn-sm btn-primary btn-block float-right')[0].click();
      }


})();
