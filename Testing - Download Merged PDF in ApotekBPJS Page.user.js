// ==UserScript==
// @name         Testing - Download Merged PDF in ApotekBPJS Page
// @namespace    http://rsupkandou.com
// @version      1.2
// @description  Download MergedPDF after iframe gen
// @match        */getViewMonitoringKlaimApotek
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rsupkandou.com.
// @author       TrixPone
// @updateURL	 https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Download%20Merged%20PDF%20in%20ApotekBPJS%20Page.user.js  
// @downloadURL	 https://github.com/TrixPone/ng0-scripts/raw/refs/heads/main/Testing%20-%20Download%20Merged%20PDF%20in%20ApotekBPJS%20Page.user.js
// ==/UserScript==

// AI ASSISTANCE WAS USED IN MAKING THIS SCRIPT

(function () {
    'use strict';

    function sanitize(text) {
        return text
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
    }

    function waitForIframeAndLoad(callback) {
        const wrapper = document.querySelector('#wrapper_iframe');
        if (!wrapper) return;

        const observer = new MutationObserver(() => {
            const iframe = wrapper.querySelector('iframe');
            if (!iframe || !iframe.src) return;

            observer.disconnect();

            iframe.addEventListener('load', () => {
                callback(iframe);
            }, { once: true });
        });

        observer.observe(wrapper, { childList: true, subtree: true });
    }

    function addDownloadButtons() {
        document.querySelectorAll('.btn-modal-generate-pdf').forEach(btn => {
            if (btn.dataset.injected) return;
            btn.dataset.injected = '1';

            const row = btn.closest('tr');
            if (!row) return;

            const nama = sanitize(row.children[1]?.innerText || 'UNKNOWN');
            const resep = sanitize(row.children[8]?.innerText || 'UNKNOWN');
            const filename = `${nama}_${resep}.pdf`;

            const dlBtn = document.createElement('button');
            dlBtn.className = 'btn btn-sm btn-outline-success ml-1';
            dlBtn.innerHTML = '<i class="fa fa-download"></i> Download PDF';

            dlBtn.onclick = () => {
                // Step 1: open modal
                btn.click();

                // Step 2: wait for modal & Generate PDF button
                const modalObserver = new MutationObserver(() => {
                    const genBtn = document.querySelector('#btn-generate-pdf');
                    if (!genBtn) return;

                    modalObserver.disconnect();

                    // Step 3: wait for iframe generation
                    waitForIframeAndLoad((iframe) => {
                        fetch(iframe.src, { credentials: 'include' })
                            .then(res => res.blob())
                            .then(blob => {
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                URL.revokeObjectURL(url);
                            })
                            .catch(err => {
                                console.error(err);
                                alert('Failed to download PDF');
                            });
                    });

                    // Step 4: trigger backend merge
                    genBtn.click();
                });

                modalObserver.observe(document.body, { childList: true, subtree: true });
            };

            btn.parentNode.appendChild(dlBtn);
        });
    }

    const tableObserver = new MutationObserver(addDownloadButtons);
    tableObserver.observe(document.body, { childList: true, subtree: true });

    setTimeout(addDownloadButtons, 1500);
})();
