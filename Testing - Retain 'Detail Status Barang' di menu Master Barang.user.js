// ==UserScript==
// @name         Testing - Retain 'Detail Status Barang' di menu Master Barang
// @namespace    http://rsupkandou.com
// @version      2025-11-01
// @description  For some reason 'jenis status barang' status doesn't persists, this script aims to 'hopefully' fixes that
// @author       EngulfinglessRaiden
// @match        *.rsupkandou.com:3000/master/farmasi
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @grant        none
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Retain%20'Detail%20Status%20Barang'%20di%20menu%20Master%20Barang.user.js
// @downloadURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Retain%20'Detail%20Status%20Barang'%20di%20menu%20Master%20Barang.user.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */



(function() {
    'use strict';
var ModalCompleteCounter = false
// there should be a better way to do this using observers, but me dumb
// me just use interval check 5 times a second if the modal window is opened

const interval = setInterval( () => {

        // variable for text checking
        var StatusBarang = document.querySelector('#namaStatus').innerText;

        // variable for checking if Overlay is active
        var OverlayStatus = document.getElementById('modal_status');

        // make the text checking editable (for pasting purposes)
        document.querySelector('#namaStatus').contentEditable = true;

    //check if overlay is active and complete counter has fired or not
   if((OverlayStatus.hasAttribute("aria-modal")) && ModalCompleteCounter === false){

        // clear all selected checklist
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(el => {el.checked = false;});

       //unique if else, for 'FORNAS'
        if (StatusBarang.includes('NON FORNAS')) {
            document.querySelectorAll('input[value="41"]')[1].checked = true;
        }
        else if (StatusBarang.includes('FORNAS')) {
            document.querySelectorAll('input[value="40"]')[1].checked = true;
        }

        if (StatusBarang.includes('Generik')) {
            document.querySelectorAll('input[value="1"]')[1].checked = true;
        }

        if (StatusBarang.includes('Alkes')) {
            document.querySelectorAll('input[value="2"]')[1].checked = true;
        }

        if (StatusBarang.includes('Kronis')) {
            document.querySelectorAll('input[value="3"]')[1].checked = true;
        }

        if (StatusBarang.includes('Paten')) {
            document.querySelectorAll('input[value="4"]')[1].checked = true;
        }

        if (StatusBarang.includes('Restriksi')) {
            document.querySelectorAll('input[value="5"]')[1].checked = true;
        }

        if (StatusBarang.includes('Status Narkotika')) {
            document.querySelectorAll('input[value="6"]')[1].checked = true;
        }

        if (StatusBarang.includes('Psikotropika')) {
            document.querySelectorAll('input[value="7"]')[1].checked = true;
        }

        if (StatusBarang.includes('Non Narkotika')) {
            document.querySelectorAll('input[value="8"]')[1].checked = true;
        }

        if (StatusBarang.includes('Obat Luar')) {
            document.querySelectorAll('input[value="9"]')[1].checked = true;
        }

        if (StatusBarang.includes('Hanya Cetak ODD')) {
            document.querySelectorAll('input[value="33"]')[1].checked = true;
        }

        if (StatusBarang.includes('Prekursor')) {
            document.querySelectorAll('input[value="34"]')[1].checked = true;
        }

        if (StatusBarang.includes('AMHP')) {
            document.querySelectorAll('input[value="36"]')[1].checked = true;
        }

        if (StatusBarang.includes('Obat kemoterapi luar paket')) {
            document.querySelectorAll('input[value="37"]')[1].checked = true;
        }

        if (StatusBarang.includes('Obat Hemofilia')) {
            document.querySelectorAll('input[value="38"]')[1].checked = true;
        }

        if (StatusBarang.includes('BMHP')) {
            document.querySelectorAll('input[value="39"]')[1].checked = true;
        }

        if (StatusBarang.includes('HIGH ALERT')) {
            document.querySelectorAll('input[value="42"]')[1].checked = true;
        }

        if (StatusBarang.includes('Larutan Pekat')) {
            document.querySelectorAll('input[value="43"]')[1].checked = true;
        }

        if (StatusBarang.includes('KONSINYASI')) {
            document.querySelectorAll('input[value="44"]')[1].checked = true;
        }

        if (StatusBarang.includes('Lain-Lain')) {
            document.querySelectorAll('input[value="45"]')[1].checked = true;
        }

        if (StatusBarang.includes('Ortopedi')) {
            document.querySelectorAll('input[value="46"]')[1].checked = true;
        }

        if (StatusBarang.includes('Cathlab')) {
            document.querySelectorAll('input[value="47"]')[1].checked = true;
        }

        if (StatusBarang.includes('Obat Kemoterapi Oral')) {
            document.querySelectorAll('input[value="48"]')[1].checked = true;
        }

        if (StatusBarang.includes('Obat Kemoterapi Injeksi')) {
            document.querySelectorAll('input[value="49"]')[1].checked = true;
        }
       // set the complete counter to true, so it wont fire again
        ModalCompleteCounter = true
//        console.log(ModalCompleteCounter);

      } else if (OverlayStatus.hasAttribute("aria-hidden")) {
       // set the complete counter to false, if the overlay is hidden
        ModalCompleteCounter = false
//        console.log(ModalCompleteCounter);
      }
      }
, 222 ); /// check for 5 times a second

})();



