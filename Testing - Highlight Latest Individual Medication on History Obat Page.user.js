// ==UserScript==
// @name         Testing - Highlight Latest Individual Medication on History Obat Page
// @namespace    http://rsupkandou.com
// @version      2026-01-20
// @description  Highlight latest medication, gray out zero quantity, toggle hide JML OBAT = 0, toggle highlight, remember state, clickable medication filter
// @author       TrixPone
// @match        https://apotek.bpjs-kesehatan.go.id/apotek/frmHistObat.aspx
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Highlight%20Latest%20Individual%20Medication%20on%20History%20Obat%20Page.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Highlight%20Latest%20Individual%20Medication%20on%20History%20Obat%20Page.user.js
// ==/UserScript==

/* globals waitForKeyElements */

let hideZeroQty = localStorage.getItem('hideZeroQty') === 'true';
let highlightEnabled = localStorage.getItem('highlightEnabled') !== 'false';
let currentMedicationFilter = null;

// Wait for grid
waitForKeyElements(
  "div.dxgvCSD",
  function () {
    createToggleUI();
    createMedicationFilterList();
    HighlightApol();
  },
  false
);

// ------------------------
// TOGGLE UI
// ------------------------
function createToggleUI() {
  if (document.getElementById('jmlZeroToggle')) return;

  const container = document.querySelector('div.dxgvCSD');
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.style.margin = '2px 0';
  wrapper.style.fontSize = '13px';
  wrapper.style.display = 'flex';
  wrapper.style.gap = '16px';
  wrapper.style.alignItems = 'center';

  // Hide JML 0
  const zeroCheckbox = document.createElement('input');
  zeroCheckbox.type = 'checkbox';
  zeroCheckbox.id = 'jmlZeroToggle';
  zeroCheckbox.checked = hideZeroQty;

  const zeroLabel = document.createElement('label');
  zeroLabel.htmlFor = 'jmlZeroToggle';
  zeroLabel.textContent = ' Hide JML OBAT = 0';

  zeroCheckbox.addEventListener('change', () => {
    hideZeroQty = zeroCheckbox.checked;
    localStorage.setItem('hideZeroQty', hideZeroQty);
    HighlightApol();
  });

  // Toggle Highlight
  const highlightCheckbox = document.createElement('input');
  highlightCheckbox.type = 'checkbox';
  highlightCheckbox.id = 'highlightToggle';
  highlightCheckbox.checked = highlightEnabled;

  const highlightLabel = document.createElement('label');
  highlightLabel.htmlFor = 'highlightToggle';
  highlightLabel.textContent = ' Toggle Highlight';

  highlightCheckbox.addEventListener('change', () => {
    highlightEnabled = highlightCheckbox.checked;
    localStorage.setItem('highlightEnabled', highlightEnabled);
    HighlightApol();
  });

  const zeroWrap = document.createElement('span');
  zeroWrap.appendChild(zeroCheckbox);
  zeroWrap.appendChild(zeroLabel);

  const highlightWrap = document.createElement('span');
  highlightWrap.appendChild(highlightCheckbox);
  highlightWrap.appendChild(highlightLabel);

  wrapper.appendChild(zeroWrap);
  wrapper.appendChild(highlightWrap);

  container.parentElement.insertBefore(wrapper, container);
}

// ------------------------
// MEDICATION FILTER LIST
// ------------------------
function createMedicationFilterList() {
  const table = document.getElementById(
    'ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_gvHistPelayanan_DXMainTable'
  );
  if (!table) return;

  if (document.getElementById('medicationFilterList')) return;

  const meds = new Set();
  const rows = table.querySelectorAll('tbody tr.dxgvDataRow_Glass');

  rows.forEach(row => {
    const obatCell = row.cells[4];
    if (obatCell) {
      meds.add(obatCell.textContent.trim());
    }
  });

  const container = document.createElement('div');
  container.id = 'medicationFilterList';
  container.style.margin = '4px 0';
  container.style.maxHeight = '200px';
  container.style.overflowY = 'auto';
  container.style.border = '1px solid #ccc';
  container.style.padding = '4px';
  container.style.display = 'flex';
  container.style.flexWrap = 'wrap';
  container.style.gap = '4px';

  function createButton(text) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.fontSize = '12px';
    btn.style.padding = '2px 6px';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      currentMedicationFilter = text === 'Show All' ? null : text;
      HighlightApol();
      // Highlight selected button
      container.querySelectorAll('button').forEach(b => {
        b.style.backgroundColor = b.textContent === text ? '#d3f9d8' : '';
      });
    });
    return btn;
  }

  // Show All button
  container.appendChild(createButton('Show All'));

  meds.forEach(med => {
    container.appendChild(createButton(med));
  });

  const gridContainer = document.querySelector('div.dxgvCSD');
  if (gridContainer) {
    gridContainer.parentElement.insertBefore(container, gridContainer);
  }
}

// ------------------------
// MAIN LOGIC
// ------------------------
function HighlightApol() {
  const table = document.getElementById(
    'ctl00_ctl00_ASPxSplitter1_Content_ContentSplitter_MainContent_gvHistPelayanan_DXMainTable'
  );
  if (!table) return;

  const rows = table.querySelectorAll('tbody tr.dxgvDataRow_Glass');
  const obatDates = {};

  function parseDateDMY(dateStr) {
    const [d, m, y] = dateStr.split('/').map(Number);
    return new Date(y, m - 1, d);
  }

  function parseJumlah(text) {
    return parseFloat(text.replace('.', '').replace(',', '.')) || 0;
  }

  // FIRST PASS: determine latest valid date per medication
  if (highlightEnabled) {
    rows.forEach(row => {
      const dateCell = row.cells[0];
      const obatCell = row.cells[4];
      const jmlCell  = row.cells[5];

      if (!dateCell || !obatCell || !jmlCell) return;

      const date = dateCell.textContent.trim();
      const obat = obatCell.textContent.trim();
      const jml  = parseJumlah(jmlCell.textContent);

      if (!date || !obat || jml === 0) return;
      if (currentMedicationFilter && obat !== currentMedicationFilter) return;

      const parsedDate = parseDateDMY(date);

      if (!obatDates[obat] || parseDateDMY(obatDates[obat]) < parsedDate) {
        obatDates[obat] = date;
      }
    });
  }

  // SECOND PASS: style & toggle visibility
  rows.forEach(row => {
    const dateCell = row.cells[0];
    const obatCell = row.cells[4];
    const jmlCell  = row.cells[5];

    if (!dateCell || !obatCell || !jmlCell) return;

    const date = dateCell.textContent.trim();
    const obat = obatCell.textContent.trim();
    const jml  = parseJumlah(jmlCell.textContent);

    // Reset styles
    row.style.display = '';
    row.style.backgroundColor = '';
    row.style.color = '';
    row.style.fontStyle = '';
    obatCell.style.backgroundColor = '';
    dateCell.style.color = '';

    // Apply medication filter
    if (currentMedicationFilter && obat !== currentMedicationFilter) {
      row.style.display = 'none';
      return;
    }

    // Zero quantity rows
    if (jml === 0) {
      if (hideZeroQty) {
        row.style.display = 'none';
        return;
      }
      if (highlightEnabled) {
        row.style.backgroundColor = '#f2f2f2';
        row.style.color = '#9a9a9a';
        row.style.fontStyle = 'italic';
      }
      return;
    }

    if (!highlightEnabled) return;

    // Highlight latest valid medication
    if (date === obatDates[obat]) {
      row.style.backgroundColor = '#D3F9D8';
      obatCell.style.backgroundColor = '#D3F9D8';
    }

    // Year coloring
    if (date.includes('2024')) {
      dateCell.style.color = '#006eff';
    }
    if (date.includes('2023')) {
      dateCell.style.color = '#ff8c00';
    }
  });
}
