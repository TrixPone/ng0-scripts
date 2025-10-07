// ==UserScript==
// @name         Testing - Filter Ruang Rawat di SPA v2
// @namespace    http://rsupkandou.com
// @version      2025-07-24
// @description  Testing ilter Ruang Rawat di SPA (this code partially written by chatgpt)
// @author       EngulfinglessRaiden
// @match        */spa-farmasi
// @grant        GM.setValue
// @grant        GM.getValue
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

function SPAExist () {
        'use strict';




}

    const table = document.getElementById('div_eresep_list_tabel').children[0];
    const rows = table.querySelectorAll("tbody tr");

 function createDropdown(columnIndex, labelText, id) {
     'use strict';



    // Create dropdown

    const dropdownlocation = document.getElementById('div_eresep_list_header').children[0]
    const dropdownDiv = document.createElement('div')
    dropdownDiv.classList.add('col');
    dropdownDiv.id = 'dropdownDivHere';
    dropdownlocation.appendChild(dropdownDiv)

        const dropdown = document.createElement("select");
        dropdown.id = id;
//        dropdown.style.margin = "10px 10px 10px 0";
        dropdown.className = "form-control form-control-sm bg-dark";
//        dropdown.style.width = "200px";

        // Add label
        const label = document.createElement("label");
        label.textContent = labelText + ": ";
        label.style.color = "white";
        label.style.marginRight = "5px";

        // Add "All" option
        const allOption = document.createElement("option");
        allOption.value = "";
        allOption.textContent = "-- All --";
        dropdown.appendChild(allOption);

        // Collect unique values in column
        const valueSet = new Set();
        rows.forEach(row => {
            const cellText = row.cells[columnIndex].innerText.trim();
            valueSet.add(cellText);
        });

        // Populate dropdown
        valueSet.forEach(val => {
            const option = document.createElement("option");
            option.value = val;
            option.textContent = val;
            dropdown.appendChild(option);
        });

        // Wrap label + dropdown together
        const container = document.createElement("div");
        container.style.display = "inline-block";
//        dropdownDiv.appendChild(label);
        dropdownDiv.appendChild(dropdown);

      return dropdown;
 }
    const ruangDropdown = createDropdown(5, "Filter by Ruang Rawat", "ruangRawatFilter");
    const statusDropdown = createDropdown(8, "Filter by Status Resep", "statusResepFilter");

    function applyFilters() {
        const ruangVal = ruangDropdown.value;
        const statusVal = statusDropdown.value;

        rows.forEach(row => {
            const ruang = row.cells[5].innerText.trim();
            const status = row.cells[8].innerText.trim();

            const ruangMatch = ruangVal === "" || ruang === ruangVal;
            const statusMatch = statusVal === "" || status === statusVal;

            row.style.display = (ruangMatch && statusMatch) ? "" : "none";
        });
    }

    ruangDropdown.addEventListener("change", applyFilters);
    statusDropdown.addEventListener("change", applyFilters);



//wait for SPA element to show up first
waitForKeyElements (
    "#div_eresep_list_tabel",
    applyFilters, false
);