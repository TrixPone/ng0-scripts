// ==UserScript==
// @name         Testing - Referensi-Obat-Matcher
// @namespace    http://rsupkandou.com
// @version      2026-02-10
// @description  Referensi Obat sidebar with whitelist, subitem badges, and GitHub JSON
// @author       TrixPone
// @match        */spa-farmasi
// @grant        GM.xmlHttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com
// @connect      raw.githubusercontent.com
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL    https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Referensi-Obat-Matcher.user.js
// @downloadURL  https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Referensi-Obat-Matcher.user.js

// ==/UserScript==
/* globals waitForKeyElements */

// THIS SCRIPT IS FULLY MADE WITH AI
// me currently dont have time to fully write it

(function() {
    'use strict';

    console.log('[SCRIPT] Referensi-Obat-Matcher loaded');

    const githubUrl = 'https://raw.githubusercontent.com/TrixPone/ng0-scripts/refs/heads/main/configs/reference_obat.json';
    let referenceObat = null;

    async function loadGithubJSON() {
        return new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                method: 'GET',
                url: githubUrl,
                onload: function(res) {
                    try {
                        referenceObat = JSON.parse(res.responseText);
                        console.log('[CONFIG] Loaded reference_obat.json', referenceObat);
                        resolve(referenceObat);
                    } catch (e) {
                        console.error('[CONFIG] Failed to parse JSON', e);
                        reject(e);
                    }
                },
                onerror: reject
            });
        });
    }

    function buildSidebar(norm, namaPasien) {
        const colDiv = document.querySelector('#tampilan_pendaftaran .col');
        if (!colDiv) return;

        // Remove existing sidebar
        const existing = document.getElementById('tm-referensi-obat');
        if (existing) existing.remove();

        const sidebar = document.createElement('div');
        sidebar.id = 'tm-referensi-obat';
        sidebar.className = 'form-row mt-4';
        sidebar.style.fontSize = '.875rem';

        // Header with JSON refresh
        const headerDiv = document.createElement('div');
        headerDiv.className = 'col-12 d-flex align-items-center mb-1';
        headerDiv.innerHTML = `<h6 style="margin-right:6px;">Referensi Obat</h6><span title="Refresh JSON" style="cursor:pointer;">🔄️</span>`;
        sidebar.appendChild(headerDiv);

        headerDiv.querySelector('span').addEventListener('click', async () => {
            if (confirm('Yakin ingin refresh JSON?')) {
                await loadGithubJSON();
                buildSidebar(norm, namaPasien);
                const msg = document.createElement('div');
                msg.textContent = 'JSON refreshed';
                msg.style.position = 'absolute';
                msg.style.background = '#dff0d8';
                msg.style.padding = '2px 6px';
                msg.style.borderRadius = '4px';
                headerDiv.appendChild(msg);
                setTimeout(() => msg.remove(), 3000);
            }
        });

        sidebar.innerHTML += '<div class="col-12"><div class="custom-border-bottom"></div></div>';

        let idx = 0;
        for (const key in referenceObat) {
            const item = referenceObat[key];

            // Only show if any alias exists in table
            const tbody = document.querySelector('#tbody_resep_detail');
            const rowsText = Array.from(tbody.querySelectorAll('tr')).map(tr => tr.innerText);
            const matched = item.aliases.some(alias => rowsText.some(t => t.includes(alias)));
            if (!matched) continue;

            // Main header
            const mainDiv = document.createElement('div');
            mainDiv.className = 'col-12 mt-2';
            const mainHeader = document.createElement('strong');
            mainHeader.dataset.ref = `tm-ref-${idx}`;
            mainHeader.style.cursor = 'pointer';
            mainHeader.style.color = '#00ddbf'; // updated main color
            mainHeader.textContent = '▶ ' + item.label;
            mainDiv.appendChild(mainHeader);
            sidebar.appendChild(mainDiv);

            const mainContent = document.createElement('div');
            mainContent.id = `tm-ref-${idx}`;
            mainContent.className = 'col-12 mt-1';
            mainContent.style.display = 'none';
            mainContent.style.paddingLeft = '8px';
            sidebar.appendChild(mainContent);

            // Subitems
            if (item.subitems && item.subitems.length) {
                item.subitems.forEach((subitem, subidx) => {
                    const subDiv = document.createElement('div');
                    subDiv.style.fontSize = '0.85em';

                    const hasName = subitem.formulation && subitem.formulation.trim() !== '';
                    let subSpan;
                    if (hasName) {
                        subSpan = document.createElement('span');
                        subSpan.dataset.ref = `tm-sub-${idx}-${subidx}`;
                        subSpan.dataset.label = subitem.formulation;
                        subSpan.style.cursor = 'pointer';
                        subSpan.style.color = '#2a6f5f';
                        subSpan.style.fontWeight = 'bold'; // make bold

                        // Add badge inline if exists
                        const badgeHTML = subitem.subbadge ? ` <span class="${subitem.subbadge.class}" style="margin-left:4px;">${subitem.subbadge.text}</span>` : '';
                        subSpan.innerHTML = `▶ ${subitem.formulation}${badgeHTML}`;
                        subDiv.appendChild(subSpan);
                    }

                    const subContent = document.createElement('div');
                    subContent.id = hasName ? `tm-sub-${idx}-${subidx}` : '';
                    subContent.style.display = 'block'; // always show content if no name
                    subContent.style.paddingLeft = '10px';

                    if (subitem.kronis) subContent.innerHTML += `<div>Kronis: ${subitem.kronis}</div>`;
                    if (subitem.mingguan) subContent.innerHTML += `<div>Mingguan: ${subitem.mingguan}</div>`;

                    if (subitem.rm_whitelist && norm && subitem.rm_whitelist.includes(norm)) {
                        const notice = document.createElement('div');
                        notice.textContent = `RM pasien ${namaPasien} masuk dalam list alergi`;
                        notice.style.color = 'red';
                        subContent.appendChild(notice);
                    }

                    if (hasName) subDiv.appendChild(subContent);
                    else subDiv.appendChild(subContent); // if no name, just append content

                    mainContent.appendChild(subDiv);

                    // Sub toggle only if has name
                    if (hasName) {
                        subSpan.addEventListener('click', () => {
                            const visible = subContent.style.display !== 'none';
                            subContent.style.display = visible ? 'none' : 'block';
                            subSpan.innerHTML = (visible ? '▶ ' : '▼ ') + subitem.formulation + (subitem.subbadge ? ` <span class="${subitem.subbadge.class}" style="margin-left:4px;">${subitem.subbadge.text}</span>` : '');
                        });
                    }
                });
            }

            // Main toggle
            mainHeader.addEventListener('click', () => {
                const visible = mainContent.style.display !== 'none';
                mainContent.style.display = visible ? 'none' : 'block';
                mainHeader.textContent = (visible ? '▶ ' : '▼ ') + item.label;

                // Expand all subitems automatically if main opened
                if (!visible) {
                    mainContent.querySelectorAll('div > div').forEach(sub => sub.querySelector('div').style.display = 'block');
                }
            });

            idx++;
        }

        // Append to bottom of col
        colDiv.appendChild(sidebar);
        console.log('[SIDEBAR] Built Referensi Obat sidebar');
    }

    async function init() {
        await loadGithubJSON();

        waitForKeyElements('#tbody_resep_detail', () => {
            const wrapper = document.getElementById('wrapperResep');
            const norm = wrapper ? wrapper.dataset.norm : null;
            const namaPasien = wrapper ? wrapper.dataset.nama_pasien : null;
            buildSidebar(norm, namaPasien);
        });
    }

    init();

})();
