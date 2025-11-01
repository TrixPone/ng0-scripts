// ==UserScript==
// @name         Testing - Highlight Latest Individual Medication on History Obat Page
// @namespace    http://rsupkandou.com
// @version      2025-11-01
// @description  Highlight Latest Individual Medication on History Obat Page, i admit on using chatgpt assistance on making this script
// @author       TrixPone
// @match        https://apotek.bpjs-kesehatan.go.id/apotek/frmHistObat.aspx
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Highlight%20Latest%20Individual%20Medication%20on%20History%20Obat%20Page.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Highlight%20Latest%20Individual%20Medication%20on%20History%20Obat%20Page.user.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

//wait for SPA element to show up first
waitForKeyElements (
    "div.dxgvCSD",
    HighlightApol, false
);


    function HighlightApol() {
const table = document.getElementById('ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_gvHistPelayanan_DXMainTable');
const rows = table.querySelectorAll('tbody tr.dxgvDataRow_Glass');
const obatDates = {}; // To store the latest date for each NAMA OBAT

// Function to parse DD/MM/YYYY into a Date object
function parseDateDMY(dateStr) {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day); // JS months are 0-based
}

// Loop through each row
rows.forEach(row => {
  const dateCell = row.cells[0]; // TGL PELAYANAN (date) column
  const obatCell = row.cells[4]; // NAMA OBAT column
  const date = dateCell.textContent.trim();

  if (date && obatCell.textContent.trim()) {
    const obatName = obatCell.textContent.trim();
    const parsedDate = parseDateDMY(date);

    // Update the latest date for each NAMA OBAT
    if (!obatDates[obatName] || parseDateDMY(obatDates[obatName]) < parsedDate) {
      obatDates[obatName] = date; // Store the latest date string
    }
  }
});

// Now highlight the latest NAMA OBAT in the table
rows.forEach(row => {
  const dateCell = row.cells[0]; // TGL PELAYANAN column
  const obatCell = row.cells[4]; // NAMA OBAT column
  const date = dateCell.textContent.trim();
  const obatName = obatCell.textContent.trim();

  if (date === obatDates[obatName]) {
    obatCell.style.backgroundColor = '#D3F9D8';
    obatCell.parentElement.style.backgroundColor = '#D3F9D8';
  }


        if (date.includes('2024')) {
            dateCell.style.color = '#006eff';
        };

        if (date.includes('2023')) {
            dateCell.style.color = '#ff8c00';
        };

	  });
    }
