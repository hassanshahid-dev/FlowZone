// ui.js - TabFlow Clean UI Renderer Engine

const UI = {
    // =========================================================================
    // 1. WORKSPACES LIST RENDERER
    // =========================================================================
    displayWorkspaces(workspaces, filter = 'all', searchQuery = '') {
        const listContainer = document.getElementById('workspacesList');
        if (!listContainer) return;
        listContainer.innerHTML = '';

        if (!Array.isArray(workspaces) || workspaces.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📁</div>
                    <h4>No Workspaces Created</h4>
                    <p>Click "+ New" above to save your open tabs into a workspace.</p>
                </div>
            `;
            this.updateHeaderStats(0, 0, 0, 0);
            return;
        }

        // Apply Search Filter
        let filtered = workspaces;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(ws => {
                const nameMatch = ws.name && ws.name.toLowerCase().includes(q);
                const tabMatch = ws.tabs && ws.tabs.some(t => 
                    (t.title && t.title.toLowerCase().includes(q)) || 
                    (t.url && t.url.toLowerCase().includes(q))
                );
                return nameMatch || tabMatch;
            });
        }

        // Apply Filter Select
        if (filter === 'active') {
            filtered = filtered.filter(ws => ws.isActive);
        } else if (filter === 'closed') {
            filtered = filtered.filter(ws => !ws.isActive);
        } else if (filter === 'pinned') {
            filtered = filtered.filter(ws => ws.isPinned);
        }

        // Sort: Pinned first, then by updatedAt descending
        filtered.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
            return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
        });

        // Compute Hero Stats
        const activeCount = workspaces.filter(ws => ws.isActive).length;
        const closedCount = workspaces.filter(ws => !ws.isActive).length;
        let totalTabs = 0;
        let totalRamSavedMB = 0;

        workspaces.forEach(ws => {
            const count = (ws.tabs || []).length;
            totalTabs += count;
            if (!ws.isActive) {
                totalRamSavedMB += calculateWorkspaceRamInMb(ws.tabs);
            }
        });

        this.updateHeaderStats(totalRamSavedMB, activeCount, closedCount, totalTabs);

        if (filtered.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h4>No Matching Workspaces</h4>
                    <p>Try adjusting your search query or filter selection.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(ws => {
            const card = this.createWorkspaceCard(ws);
            listContainer.appendChild(card);
        });
    },

    updateHeaderStats(ramMB, activeCount, suspendedCount, totalTabs) {
        const ramEl = document.getElementById('totalRamSaved');
        const actEl = document.getElementById('statActiveCount');
        const suspEl = document.getElementById('statSuspendedCount');
        const tabEl = document.getElementById('statTabsCount');

        if (ramEl) ramEl.textContent = ramMB >= 1024 ? `${(ramMB / 1024).toFixed(1)} GB` : `${ramMB} MB`;
        if (actEl) actEl.textContent = activeCount;
        if (suspEl) suspEl.textContent = suspendedCount;
        if (tabEl) tabEl.textContent = totalTabs;

        const fillEl = document.getElementById('ramMeterFill');
        const pctEl = document.getElementById('ramMeterPercentage');
        if (fillEl && pctEl) {
            const pct = Math.min(100, Math.round((ramMB / 2000) * 100));
            fillEl.style.width = pct + '%';
            pctEl.textContent = `${pct}% Memory Efficient`;
        }
    },

    createWorkspaceCard(ws) {
        const id = ws._id || ws.id;
        const isClosed = !ws.isActive;
        const isPinned = !!ws.isPinned;
        const tag = ws.tag || 'Blue';
        const tagColors = {
            Blue: '#3B82F6', Green: '#10B981', Amber: '#F59E0B', Rose: '#EF4444'
        };
        const tagColor = tagColors[tag] || tagColors.Blue;
        const tabCount = (ws.tabs || []).length;
        const totalMb = calculateWorkspaceRamInMb(ws.tabs);
        const ramSavings = isClosed ? `💾 ~${totalMb}MB saved` : '';

        const card = document.createElement('div');
        card.className = `workspace-card ${isClosed ? 'closed' : 'active'} ${isPinned ? 'pinned' : ''}`;
        card.dataset.id = id;

        const tabsToDisplay = (ws.tabs || []).slice(0, 4);
        const hasMore = tabCount > 4;

        card.innerHTML = `
            <div class="card-header">
                <div class="card-title-group">
                    <span class="tag-dot" style="background:${tagColor};"></span>
                    <span class="ws-title">${this.escapeHTML(ws.name)}</span>
                    <span class="ws-status-badge ${isClosed ? 'closed' : 'active'}">
                        ${isClosed ? 'Suspended' : 'Active'}
                    </span>
                </div>
                <div class="ws-actions-top" style="display:flex; gap:4px; align-items:center;">
                    <button class="btn-icon-xs" title="Rename Workspace" data-action="rename-ws" data-id="${id}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    </button>
                    <button class="btn-icon-xs ${isPinned ? 'active-pin' : ''}" title="${isPinned ? 'Unpin' : 'Pin'}" data-action="pin">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="${isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                </div>
            </div>

            <div class="card-meta">
                <span>${tabCount} ${tabCount === 1 ? 'tab' : 'tabs'}</span>
                <span>•</span>
                <span>${this.formatDate(ws.updatedAt || ws.createdAt)}</span>
                ${ramSavings ? `<span>•</span><span class="ram-saved-tag">${ramSavings}</span>` : ''}
            </div>

            <div class="ws-tab-preview">
                ${tabsToDisplay.map(t => `
                    <div class="tab-item-row" data-url="${this.escapeHTML(t.url)}">
                        <div class="tab-info">
                            <img class="tab-favicon" src="${t.favIconUrl || getFaviconFromUrl(t.url)}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\'><circle cx=\'8\' cy=\'8\' r=\'6\' fill=\'%23555\'/></svg>'" />
                            <span class="tab-title-text" title="${this.escapeHTML(t.title || t.url)}">${this.escapeHTML(t.title || t.url)}</span>
                        </div>
                        <div class="tab-quick-actions">
                            <button class="btn-icon-xs" title="Open Tab" data-action="open-tab" data-url="${this.escapeHTML(t.url)}">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            </button>
                            <button class="btn-icon-xs" title="Copy URL" data-action="copy-tab" data-url="${this.escapeHTML(t.url)}">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            </button>
                            <button class="btn-icon-xs" title="Remove" data-action="remove-tab" data-url="${this.escapeHTML(t.url)}">&times;</button>
                        </div>
                    </div>
                `).join('')}
                ${hasMore ? `<div class="tab-item-row" style="color:var(--text-muted); font-size:11px; padding:4px 0;">+${tabCount - 4} more tabs</div>` : ''}
            </div>

            <div class="card-buttons">
                ${isClosed 
                    ? `<button class="btn-card-green" data-action="restore">Restore Workspace</button>`
                    : `<button class="btn-card-secondary" data-action="suspend">Close & Suspend</button>`
                }
                <button class="btn-card-secondary" data-action="add-current">Add Active Tab</button>
                <button class="btn-card-secondary" data-action="sync-live-tabs" title="Update workspace with all currently open browser tabs">Sync Open Tabs</button>
                <button class="btn-card-danger" data-action="delete" title="Delete Workspace">Delete</button>
            </div>
        `;

        card.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const targetUrl = btn.dataset.url;

            e.stopPropagation();

            if (action === 'rename-ws') {
                const renameModal = document.getElementById('renameWorkspaceModal');
                const renameInput = document.getElementById('renameWsNameInput');
                const renameIdInput = document.getElementById('renameWsIdInput');
                if (renameModal && renameInput && renameIdInput) {
                    renameIdInput.value = id;
                    renameInput.value = ws.name || '';
                    renameModal.style.display = 'flex';
                }
            } else if (action === 'pin') {
                await Storage.togglePinWorkspace(id);
                const updated = await Storage.getWorkspaces();
                this.displayWorkspaces(updated);
            } else if (action === 'suspend') {
                this.openSuspendModal(ws);
            } else if (action === 'restore') {
                await this.restoreWorkspace(ws);
            } else if (action === 'delete') {
                if (confirm(`Delete workspace "${ws.name}"?`)) {
                    await API.deleteWorkspace(id);
                    const updated = await Storage.deleteWorkspace(id);
                    this.displayWorkspaces(updated);
                    this.showToast(`Deleted "${ws.name}"`, 'info');
                }
            } else if (action === 'add-current') {
                getTabs(async (currentTabs) => {
                    const activeTab = currentTabs.find(t => t.active) || currentTabs[0];
                    if (activeTab) {
                        const exists = (ws.tabs || []).some(t => t.url === activeTab.url);
                        if (!exists) {
                            ws.tabs.push({ title: activeTab.title, url: activeTab.url, favIconUrl: activeTab.favIconUrl });
                            await Storage.updateWorkspace(id, { tabs: ws.tabs });
                            await API.updateWorkspace(id, { tabs: ws.tabs });
                            const updated = await Storage.getWorkspaces();
                            this.displayWorkspaces(updated);
                            this.showToast(`Added tab to "${ws.name}"`, 'success');
                        } else {
                            this.showToast('Tab already in workspace', 'info');
                        }
                    }
                });
            } else if (action === 'sync-live-tabs') {
                getTabs(async (currentTabs) => {
                    if (currentTabs && currentTabs.length > 0) {
                        const newTabsList = currentTabs.map(t => ({
                            title: t.title || t.url,
                            url: t.url,
                            favIconUrl: t.favIconUrl
                        })).filter(t => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'));

                        ws.tabs = newTabsList;
                        await Storage.updateWorkspace(id, { tabs: newTabsList });
                        await API.updateWorkspace(id, { tabs: newTabsList });
                        const updated = await Storage.getWorkspaces();
                        this.displayWorkspaces(updated);
                        this.showToast(`Updated "${ws.name}" with ${newTabsList.length} open tabs`, 'success');
                    }
                });
            } else if (action === 'open-tab' && targetUrl) {
                openTabs([targetUrl]);
            } else if (action === 'copy-tab' && targetUrl) {
                navigator.clipboard.writeText(targetUrl);
                this.showToast('URL copied to clipboard', 'success');
            } else if (action === 'remove-tab' && targetUrl) {
                const updated = await Storage.removeTabFromWorkspace(id, targetUrl);
                await API.updateWorkspace(id, { tabs: (ws.tabs || []).filter(t => t.url !== targetUrl) });
                this.displayWorkspaces(updated);
                this.showToast('Removed tab', 'info');
            }
        });

        return card;
    },

    openSuspendModal(ws) {
        const modal = document.getElementById('suspendWorkspaceModal');
        const suspendChecklist = document.getElementById('suspendTabChecklist');
        const deleteChecklist = document.getElementById('deleteTabChecklist');
        const idInput = document.getElementById('suspendWsIdInput');
        const countSpan = document.getElementById('suspendTabSelectedCount');
        const deleteCountSpan = document.getElementById('deleteTabSelectedCount');
        const selectAll = document.getElementById('selectAllSuspendTabs');

        if (!modal || !suspendChecklist || !idInput) return;

        idInput.value = ws._id || ws.id;
        suspendChecklist.innerHTML = '';
        if (deleteChecklist) deleteChecklist.innerHTML = '';

        // 1. Populate Delete Checkbox List (Saved tabs in workspace)
        (ws.tabs || []).forEach((tab) => {
            if (!deleteChecklist) return;
            const row = document.createElement('label');
            row.style.cssText = 'display:flex; align-items:center; gap:8px; font-size:11px; padding:5px 0; border-bottom:1px solid var(--border-subtle); cursor:pointer; overflow:hidden; white-space:nowrap;';
            row.innerHTML = `
                <input type="checkbox" class="delete-tab-cb" data-url="${this.escapeHTML(tab.url)}" />
                <span style="overflow:hidden; text-overflow:ellipsis; color:var(--text-secondary);" title="${this.escapeHTML(tab.title || tab.url)}">${this.escapeHTML(tab.title || tab.url)}</span>
            `;
            deleteChecklist.appendChild(row);
        });

        const updateDeleteCount = () => {
            if (!deleteChecklist || !deleteCountSpan) return;
            const checked = deleteChecklist.querySelectorAll('.delete-tab-cb:checked').length;
            deleteCountSpan.textContent = `${checked} to delete`;
        };
        if (deleteChecklist) {
            deleteChecklist.querySelectorAll('.delete-tab-cb').forEach(cb => cb.addEventListener('change', updateDeleteCount));
            updateDeleteCount();
        }

        // 2. Populate Suspend Checkbox List (Live/matching open browser tabs - default SELECT ALL)
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
            const targetUrls = (ws.tabs || []).map(t => t.url).filter(Boolean);
            chrome.tabs.query({ currentWindow: true }, (currentTabs) => {
                const matchingTabs = (currentTabs || []).filter(tab => tab.url && targetUrls.some(target => isUrlMatch(tab.url, target)));
                const tabsToRender = matchingTabs.length > 0 ? matchingTabs : (ws.tabs || []);

                tabsToRender.forEach((tab) => {
                    const row = document.createElement('label');
                    row.style.cssText = 'display:flex; align-items:center; gap:8px; font-size:11px; padding:5px 0; border-bottom:1px solid var(--border-subtle); cursor:pointer; overflow:hidden; white-space:nowrap;';
                    row.innerHTML = `
                        <input type="checkbox" class="suspend-tab-cb" data-tab-id="${tab.id || ''}" data-url="${this.escapeHTML(tab.url)}" checked />
                        <span style="overflow:hidden; text-overflow:ellipsis;" title="${this.escapeHTML(tab.title || tab.url)}">${this.escapeHTML(tab.title || tab.url)}</span>
                    `;
                    suspendChecklist.appendChild(row);
                });

                const updateCount = () => {
                    const checked = suspendChecklist.querySelectorAll('.suspend-tab-cb:checked').length;
                    if (countSpan) countSpan.textContent = `${checked} to close`;
                };

                suspendChecklist.querySelectorAll('.suspend-tab-cb').forEach(cb => cb.addEventListener('change', updateCount));
                if (selectAll) {
                    selectAll.checked = true;
                    selectAll.onchange = () => {
                        suspendChecklist.querySelectorAll('.suspend-tab-cb').forEach(cb => cb.checked = selectAll.checked);
                        updateCount();
                    };
                }
                updateCount();
                modal.style.display = 'flex';
            });
        } else {
            (ws.tabs || []).forEach((tab) => {
                const row = document.createElement('label');
                row.style.cssText = 'display:flex; align-items:center; gap:8px; font-size:11px; padding:5px 0; border-bottom:1px solid var(--border-subtle); cursor:pointer;';
                row.innerHTML = `
                    <input type="checkbox" class="suspend-tab-cb" data-url="${this.escapeHTML(tab.url)}" checked />
                    <span style="overflow:hidden; text-overflow:ellipsis;">${this.escapeHTML(tab.title || tab.url)}</span>
                `;
                suspendChecklist.appendChild(row);
            });
            modal.style.display = 'flex';
        }
    },

    async suspendWorkspace(ws) {
        const id = ws._id || ws.id;

        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
            chrome.tabs.query({ currentWindow: true }, async (currentTabs) => {
                const liveOpenTabs = (currentTabs || [])
                    .filter(t => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'))
                    .map(t => ({
                        title: t.title || t.url,
                        url: t.url,
                        favIconUrl: t.favIconUrl
                    }));

                // Update workspace tabs to capture all live open tab changes before suspending
                if (liveOpenTabs.length > 0) {
                    ws.tabs = liveOpenTabs;
                }

                const targetUrls = (ws.tabs || []).map(t => t.url).filter(Boolean);
                const tabsToClose = (currentTabs || [])
                    .filter(tab => tab.url && targetUrls.some(target => isUrlMatch(tab.url, target)))
                    .map(tab => tab.id)
                    .filter(tabId => typeof tabId === 'number');

                // Save updated tabs & isActive=false to local storage and MongoDB Cloud Atlas
                await Storage.updateWorkspace(id, { tabs: ws.tabs, isActive: false });
                await API.updateWorkspace(id, { tabs: ws.tabs, isActive: false });

                closeTabs(tabsToClose, async () => {
                    const updated = await Storage.getWorkspaces();
                    this.displayWorkspaces(updated);
                    const ramSaved = calculateWorkspaceRamInMb(ws.tabs);
                    const closedCount = tabsToClose.length;
                    this.showToast(`Saved & Suspended "${ws.name}" (${closedCount} tabs closed, ~${ramSaved}MB RAM saved)`, 'success');
                });
            });
        } else {
            await Storage.updateWorkspace(id, { isActive: false });
            await API.updateWorkspace(id, { isActive: false });
            const updated = await Storage.getWorkspaces();
            this.displayWorkspaces(updated);
        }
    },

    async restoreWorkspace(ws) {
        const id = ws._id || ws.id;
        const urlsToOpen = (ws.tabs || []).map(t => t.url).filter(Boolean);

        if (urlsToOpen.length > 0) {
            openTabs(urlsToOpen);
        }

        API.updateWorkspace(id, { isActive: true });
        Storage.activateWorkspace(id).then(updated => {
            this.displayWorkspaces(updated);
            this.showToast(`Restored "${ws.name}" (${urlsToOpen.length} tabs opened)`, 'success');
        });
    },

    renderOpenTabs(tabs, searchQuery = '') {
        const container = document.getElementById('openTabsList');
        const countBadge = document.getElementById('openTabsCount');
        if (!container) return;

        container.innerHTML = '';
        if (countBadge) countBadge.textContent = `${tabs.length} Tabs`;

        let filtered = tabs;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            filtered = tabs.filter(t => 
                (t.title && t.title.toLowerCase().includes(q)) || 
                (t.url && t.url.toLowerCase().includes(q))
            );
        }

        if (filtered.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>No open tabs match search query.</p></div>`;
            return;
        }

        filtered.forEach(tab => {
            const card = document.createElement('div');
            card.className = 'open-tab-card';
            card.innerHTML = `
                <div class="open-tab-left">
                    <input type="checkbox" class="tab-checkbox" data-url="${this.escapeHTML(tab.url)}" data-title="${this.escapeHTML(tab.title)}" checked />
                    <img class="tab-favicon" src="${tab.favIconUrl || getFaviconFromUrl(tab.url)}" />
                    <span class="tab-title-text" title="${this.escapeHTML(tab.title)}">${this.escapeHTML(tab.title)}</span>
                </div>
                <button class="btn-icon-xs" title="Close Tab" data-action="close-open-tab" data-id="${tab.id}">&times;</button>
            `;

            card.querySelector('[data-action="close-open-tab"]')?.addEventListener('click', () => {
                if (tab.id) {
                    closeTabs([tab.id], () => {
                        getTabs(updatedTabs => this.renderOpenTabs(updatedTabs));
                    });
                }
            });

            container.appendChild(card);
        });
    },

    async renderAiCategorization(tabs) {
        const container = document.getElementById('aiPreviewContainer');
        if (!container) return;
        container.innerHTML = '<div class="empty-state"><p>Analyzing tabs with AI Engine...</p></div>';

        if (!tabs || tabs.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>No open tabs available to analyze.</p></div>`;
            return;
        }

        const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
        const geminiApiKey = (typeof localStorage !== 'undefined' && localStorage.getItem('GEMINI_API_KEY')) || '';

        let categories = {
            'Code & Engineering': [],
            'Documentation & Docs': [],
            'Media & Entertainment': [],
            'Social & Messaging': [],
            'Shopping & Finance': [],
            'General Web': []
        };
        let isGeminiUsed = false;

        // Try Google Gemini 1.5 Flash API if online & key available
        if (isOnline && geminiApiKey) {
            try {
                const tabTitles = tabs.map(t => ({ id: t.id, title: t.title, url: t.url }));
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Categorize the following list of browser tabs into json categories ('Code & Engineering', 'Documentation & Docs', 'Media & Entertainment', 'Social & Messaging', 'Shopping & Finance', 'General Web'). Output raw JSON mapping tab index to category name.\nTabs: ${JSON.stringify(tabTitles)}`
                            }]
                        }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsedMap = JSON.parse(jsonMatch[0]);
                        tabs.forEach((tab, idx) => {
                            const cat = parsedMap[idx] || parsedMap[tab.title] || 'General Web';
                            if (!categories[cat]) categories[cat] = [];
                            categories[cat].push(tab);
                        });
                        isGeminiUsed = true;
                    }
                }
            } catch (err) {
                console.log('Gemini API fallback to offline rules:', err);
            }
        }

        // Offline Rule-based Local AI Fallback Engine
        if (!isGeminiUsed) {
            categories = {
                'Code & Engineering': [],
                'Documentation & Docs': [],
                'Media & Entertainment': [],
                'Social & Messaging': [],
                'Shopping & Finance': [],
                'General Web': []
            };

            tabs.forEach(tab => {
                const url = (tab.url || '').toLowerCase();
                if (url.includes('github') || url.includes('stackoverflow') || url.includes('react.dev') || url.includes('npm') || url.includes('gitlab')) {
                    categories['Code & Engineering'].push(tab);
                } else if (url.includes('wikipedia') || url.includes('medium') || url.includes('notion') || url.includes('docs.google') || url.includes('arxiv')) {
                    categories['Documentation & Docs'].push(tab);
                } else if (url.includes('youtube') || url.includes('netflix') || url.includes('spotify') || url.includes('twitch')) {
                    categories['Media & Entertainment'].push(tab);
                } else if (url.includes('twitter') || url.includes('x.com') || url.includes('reddit') || url.includes('discord') || url.includes('slack') || url.includes('linkedin')) {
                    categories['Social & Messaging'].push(tab);
                } else if (url.includes('amazon') || url.includes('ebay') || url.includes('stripe') || url.includes('paypal')) {
                    categories['Shopping & Finance'].push(tab);
                } else {
                    categories['General Web'].push(tab);
                }
            });
        }

        const session = await Auth.getUser();
        const isPro = session.user && session.user.plan === 'pro';

        if (!isPro) {
            container.innerHTML = `
                <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 24px 20px; text-align: center; margin: 12px 0;">
                    <div style="font-size: 28px; margin-bottom: 8px;">✨ 🔒</div>
                    <h3 style="color: #3B82F6; font-weight: 700; font-size: 15px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Pro Plan Required</h3>
                    <p style="color: #94A3B8; font-size: 12px; margin-bottom: 16px; line-height: 1.5;">
                        <strong>Unlimited AI Tab Categorization</strong> & <strong>Unlimited Cloud Workspace Sync</strong> are Pro Member features ($4.99/mo).
                    </p>
                    <button onclick="window.open('https://tabflow-dashboard-eight.vercel.app/upgrade', '_blank')" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: #FFF; font-weight: 800; border: none; padding: 12px 24px; border-radius: 9999px; cursor: pointer; font-size: 12px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                        Upgrade to Pro ($4.99/mo) ✨
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="margin-bottom: 12px; font-size: 11px; font-weight: 600; color: ${isGeminiUsed ? '#10B981' : '#3B82F6'}; font-family: monospace;">
                ${isGeminiUsed ? '✨ Powered by Gemini 1.5 Flash Cloud AI (Online)' : '⚡ Offline Local Rule AI Engine (0ms Latency)'}
            </div>
        `;

        Object.entries(categories).forEach(([catName, catTabs]) => {
            if (catTabs.length === 0) return;

            const card = document.createElement('div');
            card.className = 'workspace-card';
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title-group">
                        <span class="ws-title">${catName}</span>
                        <span class="ws-status-badge active">${catTabs.length} Tabs</span>
                    </div>
                    <button class="btn-primary-sm" data-action="save-ai-cat">Save Workspace</button>
                </div>
                <div class="ws-tab-preview">
                    ${catTabs.map(t => `
                        <div class="tab-item-row">
                            <div class="tab-info">
                                <img class="tab-favicon" src="${t.favIconUrl || getFaviconFromUrl(t.url)}" />
                                <span class="tab-title-text">${this.escapeHTML(t.title)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            card.querySelector('[data-action="save-ai-cat"]').addEventListener('click', async () => {
                let newWs = await API.createWorkspace(catName, catTabs, 'Blue');
                if (!newWs || newWs.error || !newWs.name || !Array.isArray(newWs.tabs)) {
                    newWs = {
                        _id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                        name: catName,
                        tabs: catTabs,
                        tag: 'Blue',
                        isActive: true,
                        isPinned: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                }
                await Storage.addWorkspace(newWs);
                const updated = await Storage.getWorkspaces();
                this.displayWorkspaces(updated);
                this.showToast(`Saved AI Workspace "${catName}"`, 'success');
            });

            container.appendChild(card);
        });
    },

    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${this.escapeHTML(message)}</span>
            <button style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:12px;">&times;</button>
        `;

        toast.querySelector('button').addEventListener('click', () => toast.remove());
        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, duration);
    },

    escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    formatDate(dateStr) {
        if (!dateStr) return 'Recently';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'Recently';
        const diffMs = Date.now() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return d.toLocaleDateString();
    }
};