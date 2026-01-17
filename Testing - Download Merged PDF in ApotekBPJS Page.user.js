// ==UserScript==
// @name         Testing - Download Merged PDF in ApotekBPJS Page
// @namespace    http://rsupkandou.com
// @version      1.3
// @description  Download MergedPDF after iframe gen
// @match        https://ng0.rsupkandou.com:3000/monitoring/depo/C_monitoring_obat/getViewMonitoringKlaimApotek
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

    function waitForIframeSrc(callback) {
        const wrapper = document.querySelector('#wrapper_iframe');
        if (!wrapper) return;

        // Step 1: wait for iframe existence
        const iframeObserver = new MutationObserver(() => {
            const iframe = wrapper.querySelector('iframe');
            if (!iframe) return;

            iframeObserver.disconnect();

            // Step 2: watch src changes
            const srcObserver = new MutationObserver(() => {
                const src = iframe.getAttribute('src');
                if (!src || src === 'about:blank') return;

                srcObserver.disconnect();
                callback(iframe);
            });

            srcObserver.observe(iframe, {
                attributes: true,
                attributeFilter: ['src']
            });
        });

        iframeObserver.observe(wrapper, { childList: true, subtree: true });
    }

    function injectButtons() {
        document.querySelectorAll('.btn-modal-generate-pdf').forEach(btn => {
            if (btn.dataset.hooked) return;
            btn.dataset.hooked = '1';

            const row = btn.closest('tr');
            if (!row) return;

            const nama = sanitize(row.children[1]?.innerText || 'UNKNOWN');
            const resep = sanitize(row.children[8]?.innerText || 'UNKNOWN');
            const filename = `${nama}_${resep}.pdf`;

            const dlBtn = document.createElement('button');
            dlBtn.className = 'btn btn-sm btn-outline-success ml-1';
            dlBtn.innerHTML = '<i class="fa fa-download"></i> Download PDF';

            dlBtn.onclick = () => {
                // Open modal
                btn.click();

                // Wait for Generate PDF button
                const modalObserver = new MutationObserver(() => {
                    const genBtn = document.querySelector('#btn-generate-pdf');
                    if (!genBtn) return;

                    modalObserver.disconnect();

                    // Watch iframe src
                    waitForIframeSrc((iframe) => {
                        fetch(iframe.src, { credentials: 'include' })
                            .then(r => r.blob())
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
                                alert('PDF download failed');
                            });
                    });

                    // Trigger backend merge
                    genBtn.click();
                });

                modalObserver.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            };

            btn.parentNode.appendChild(dlBtn);
        });
    }

    const tableObserver = new MutationObserver(injectButtons);
    tableObserver.observe(document.body, { childList: true, subtree: true });

    setTimeout(injectButtons, 1500);
})();
