// ==UserScript==
// @name         Testing - Tombol EMR di Nomor Pendaftaran
// @namespace    http://rsupkandou.com
// @version      2026-09-01
// @description  Testing Add Tombol EMR + Resume + CPPT di SPA
// @author       TrixPone
// @match        */spa-farmasi
// @match        https://emr.rsupkandou.com/penunjang/C_historyPenunjang/viewCariHasilPenunjang
// @match        https://emr.rsupkandou.com/emr
// @match        https://emr.rsupkandou.com/emr/C_emr/loadDetailErm/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @grant        GM_openInTab
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.notification
// @grant        GM.deleteValue
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Tombol%20EMR%20di%20Nomor%20Pendaftaran.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Tombol%20EMR%20di%20Nomor%20Pendaftaran.user.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

function addBTN () {
    'use strict';

    // ============================================================
    // VARIABLES
    // ============================================================

    var EMR =
        document.getElementById('wrapperResep').dataset.idtrxpendaftaran;

    var URLEMR =
        'https://emr.rsupkandou.com/emr/C_emr/loadDetailErm/' + EMR;

    var URLResume =
        'https://emr.rsupkandou.com/penunjang/C_historyPenunjang/getPencarianResumePasienDetail/' + EMR;

    var GrayBox =
        document.getElementsByClassName('col-12 mt-1')[0];

    var NoRM =
        document.getElementById('wrapperResep').dataset.norm;

    // Save NoRM when Farmasi page is initialized
    GM.setValue("NoRM", NoRM);


    // ============================================================
    // CREATE BUTTONS
    // ============================================================

    var button =
        document.createElement("button");

    var button2 =
        document.createElement("button");

    var button3 =
        document.createElement("button");

    var button4 =
        document.createElement("button");


    // ============================================================
    // CPPT BUTTON
    // ============================================================

    button.innerHTML =
        "CPPT";

    button.className =
        'btn btn-sm btn-success text-light get-print';


    // Show / hide CPPT buttons
    button.onclick =
        function () {

            var cpptButtons =
                document.getElementById(
                    'tm-cppt-buttons'
                );

            if (!cpptButtons) {
                return;
            }

            if (
                cpptButtons.style.display === 'none'
            ) {

                cpptButtons.style.display =
                    'inline';

            } else {

                cpptButtons.style.display =
                    'none';

            }

        };


    // ============================================================
    // RESUME EMR
    // ============================================================

    button2.innerHTML =
        "Resume EMR";

    button2.onclick =
        openResume;

    button2.className =
        'btn btn-sm btn-success text-light get-print';


    // ============================================================
    // LAB EMR
    // ============================================================

    button3.innerHTML =
        "Lab EMR";

    button3.onclick =
        cekPenunjang;

    button3.className =
        'btn btn-sm btn-success text-light get-print';


    // ============================================================
    // EMR
    // ============================================================

    button4.innerHTML =
        "EMR";

    button4.onclick =
        openEMR;

    button4.className =
        'btn btn-sm btn-success text-light get-print';


    // ============================================================
    // CPPT SUB-BUTTON CONTAINER
    // ============================================================

    var cpptButtons =
        document.createElement("span");

    cpptButtons.id =
        'tm-cppt-buttons';

    cpptButtons.style.display =
        'none';


    // ============================================================
    // CREATE CPPT BUTTON
    // ============================================================

    function createCPPTButton(
        text,
        formID
    ) {

        var cpptButton =
            document.createElement("button");

        cpptButton.innerHTML =
            text;

        // Slightly yellow
        cpptButton.className =
            'btn btn-sm btn-warning text-light get-print';


        cpptButton.onclick =
            function () {

                var targetURL =
                    'https://emr.rsupkandou.com/emr/C_emr/loadDetailErm/' +
                    EMR +
                    '/' +
                    formID;

                GM_openInTab(
                    targetURL,
                    {
                        incognito: false
                    }
                );

            };


        return cpptButton;

    }


    // ============================================================
    // CREATE THE 4 CPPT BUTTONS
    // ============================================================

    cpptButtons.appendChild(
        createCPPTButton(
            'Rawat Jalan',
            1
        )
    );

    cpptButtons.append(
        "\u00A0"
    );


    cpptButtons.appendChild(
        createCPPTButton(
            'Rawat Inap',
            14
        )
    );

    cpptButtons.append(
        "\u00A0"
    );


    cpptButtons.appendChild(
        createCPPTButton(
            'Rawat Darurat',
            26
        )
    );

    cpptButtons.append(
        "\u00A0"
    );


    cpptButtons.appendChild(
        createCPPTButton(
            'Konsul Umum',
            42
        )
    );


    // ============================================================
    // APPEND BUTTONS
    // ============================================================

    GrayBox.append(
        document.createElement('br')
    );


    // CPPT
    GrayBox.appendChild(
        button
    );

    GrayBox.append(
        "\u00A0"
    );


    // CPPT sub-buttons
    GrayBox.appendChild(
        cpptButtons
    );

    GrayBox.append(
        "\u00A0"
    );


    // EMR
    GrayBox.appendChild(
        button4
    );

    GrayBox.append(
        "\u00A0"
    );


    // Lab EMR
    GrayBox.appendChild(
        button3
    );

    GrayBox.append(
        "\u00A0"
    );


    // Resume EMR
    GrayBox.appendChild(
        button2
    );


    // ============================================================
    // BUTTON FUNCTIONS
    // ============================================================

    function openResume() {

        window.open(
            URLResume
        );

    }


    // ============================================================
    // LAB EMR
    // ============================================================

    function cekPenunjang() {

        // Save NoRM AGAIN before opening the page
        GM.setValue(
            "NoRM",
            NoRM
        );


        console.log(
            '[NoRM] Saved before opening Lab EMR:',
            NoRM
        );


        GM_openInTab(
            'https://emr.rsupkandou.com/penunjang/C_historyPenunjang/viewCariHasilPenunjang',
            {
                incognito: false
            }
        );

    }


    // ============================================================
    // EMR
    // ============================================================

    function openEMR() {

        // Save NoRM AGAIN before opening the page
        GM.setValue(
            "NoRM",
            NoRM
        );


        console.log(
            '[NoRM] Saved before opening EMR:',
            NoRM
        );


        GM_openInTab(
            'https://emr.rsupkandou.com/emr',
            {
                incognito: false
            }
        );

    }

}


// ================================================================
// WAIT FOR SPA ELEMENT
// ================================================================

waitForKeyElements(
    "div.form-row.mt-3",
    addBTN,
    false
);


// ================================================================
// NoRM HANDLER
// ================================================================

(async function NoRM_F () {

    var NoRM =
        await GM.getValue("NoRM");


    console.log(
        '[NoRM]',
        NoRM
    );


    const currentURLPath =
        window.location.pathname;


    if (
        NoRM === undefined
    ) {

        console.log(
            '[NoRM] No saved NoRM'
        );

    }


    else if (
        currentURLPath !== '/spa-farmasi'
    ) {

        console.log(
            '[NoRM] Using:',
            NoRM
        );


        switch(true) {


            // ====================================================
            // PENUNJANG
            // ====================================================

            case currentURLPath.indexOf(
                'viewCariHasilPenunjang'
            ) > -1:

                document.getElementById(
                    'search_norm_penunjang'
                ).value =
                    NoRM;


                document.getElementById(
                    'select_hasil_penunjang'
                ).value =
                    1;


                document.getElementById(
                    'btn_cari_pasien_penunjang'
                ).click();


                break;


            // ====================================================
            // EMR
            // ====================================================

            case currentURLPath === '/emr':

                document.getElementById(
                    'norm'
                ).value =
                    NoRM;


                document
                    .getElementsByClassName(
                        'btn btn-sm float-right btn-submit-color'
                    )[0]
                    .click();


                break;


            // ====================================================
            // EMR DETAIL
            // ====================================================

            case currentURLPath.indexOf(
                'loadDetailErm'
            ) > -1:

                var selectizeInput =
                    document.getElementById(
                        'jenis_form_rmk-selectized'
                    );


                if (
                    selectizeInput
                ) {

                    selectizeInput.click();

                }


                break;

        }


        // ========================================================
        // DELETE NoRM AFTER USE
        // ========================================================

        GM.deleteValue(
            "NoRM"
        );

    }

})();
