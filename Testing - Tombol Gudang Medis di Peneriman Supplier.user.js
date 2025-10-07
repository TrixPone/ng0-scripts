// ==UserScript==
// @name         Testing - Tombol Gudang Medis di Peneriman Supplier
// @namespace    http://tampermonkey.net/
// @version      2025-07-24
// @description  try to take over the world!
// @author       You
// @match        https://ng0.rsupkandou.com:3000/laporan-farmasi/get-penerimaan-supplier
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @grant        none
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