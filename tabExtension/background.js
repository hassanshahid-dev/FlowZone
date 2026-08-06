// background.js - FlowZone Extension Background Service Worker (Manifest V3)

// Configure side panel behavior on installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('FlowZone AI Workspace & Tab Manager Installed');

    // Automatically open Chrome Side Panel when clicking toolbar action icon (Apollo-style)
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
            .catch((error) => console.error('Failed to set panel behavior:', error));
    }

    // Create Context Menu Item for Right-Click on web pages
    if (chrome.contextMenus) {
        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                id: 'save-page-to-flowzone',
                title: 'Save page to FlowZone Workspace',
                contexts: ['page']
            });
        });
    }
});

// Fallback click listener for side panel opening
chrome.action.onClicked.addListener((tab) => {
    if (chrome.sidePanel && chrome.sidePanel.open && tab.id) {
        chrome.sidePanel.open({ tabId: tab.id }).catch(() => {
            chrome.sidePanel.open({ windowId: tab.windowId });
        });
    }
});

// Context Menu Action Listener
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if ((info.menuItemId === 'save-page-to-flowzone' || info.menuItemId === 'save-page-to-tabflow') && tab) {
        chrome.storage.local.get('workSpaces', (data) => {
            const workspaces = data.workSpaces || [];
            let quickWs = workspaces.find(ws => ws.name === 'Quick Saved Pages');

            if (!quickWs) {
                quickWs = {
                    _id: 'local_quick_' + Date.now(),
                    name: 'Quick Saved Pages',
                    tabs: [{ title: tab.title || tab.url, url: tab.url }],
                    isActive: true,
                    isPinned: true,
                    tag: 'Blue',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                workspaces.unshift(quickWs);
            } else {
                quickWs.tabs.push({ title: tab.title || tab.url, url: tab.url });
                quickWs.updatedAt = new Date().toISOString();
            }

            chrome.storage.local.set({ workSpaces: workspaces }, () => {
                chrome.action.setBadgeText({ text: '+' });
                chrome.action.setBadgeBackgroundColor({ color: '#3B82F6' });
                setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
            });
        });
    }
});

// =========================================================================
// AUTOMATIC LIVE ACTIVE WORKSPACE SYNC
// =========================================================================
function normalizeUrl(url) {
    if (!url) return '';
    try {
        const u = new URL(url);
        return (u.origin + u.pathname).replace(/\/$/, '').toLowerCase();
    } catch {
        return url.trim().replace(/\/$/, '').toLowerCase();
    }
}

let autoSyncDebounceTimer = null;

function autoSyncActiveWorkspace() {
    if (autoSyncDebounceTimer) clearTimeout(autoSyncDebounceTimer);
    autoSyncDebounceTimer = setTimeout(() => {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local || !chrome.tabs) return;

        chrome.storage.local.get(['workSpaces', 'token'], (data) => {
            const workspaces = data.workSpaces || [];
            if (workspaces.length === 0) return;

            // Target explicit active workspace or fallback to primary workspace
            const activeWs = workspaces.find(ws => ws.isActive) || workspaces[0];
            if (!activeWs) return;

            chrome.tabs.query({}, (tabs) => {
                if (!tabs || tabs.length === 0) return;

                const liveTabsList = tabs
                    .filter(t => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://') && t.url !== 'about:blank' && !t.url.includes('newtab') && !t.url.includes('new-tab-page'))
                    .map(t => ({
                        title: t.title || t.url,
                        url: t.url,
                        favIconUrl: t.favIconUrl
                    }));

                if (liveTabsList.length === 0) return;

                const existingTabs = Array.isArray(activeWs.tabs) ? [...activeWs.tabs] : [];

                // Merge newly opened tabs and update existing tab titles/urls
                liveTabsList.forEach(liveTab => {
                    const normLive = normalizeUrl(liveTab.url);
                    const matchIndex = existingTabs.findIndex(t => normalizeUrl(t.url) === normLive);
                    if (matchIndex >= 0) {
                        if (liveTab.title && liveTab.title !== liveTab.url) {
                            existingTabs[matchIndex].title = liveTab.title;
                        }
                        if (liveTab.favIconUrl) {
                            existingTabs[matchIndex].favIconUrl = liveTab.favIconUrl;
                        }
                    } else {
                        // Newly opened browser tab -> append to active workspace!
                        existingTabs.push(liveTab);
                    }
                });

                activeWs.tabs = existingTabs;
                activeWs.isActive = true;
                activeWs.updatedAt = new Date().toISOString();

                chrome.storage.local.set({ workSpaces: workspaces }, () => {
                    if (data.token && activeWs._id && !activeWs._id.startsWith('local_')) {
                        fetch(`https://flowzone-backend-api.vercel.app/api/workspaces/${activeWs._id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${data.token}`
                            },
                            body: JSON.stringify({ tabs: existingTabs })
                        }).catch(() => fetch(`https://tabflow-backend-api.vercel.app/api/workspaces/${activeWs._id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${data.token}`
                            },
                            body: JSON.stringify({ tabs: existingTabs })
                        })).catch(() => {});
                    }
                });
            });
        });
    }, 300);
}

if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.onCreated.addListener(autoSyncActiveWorkspace);
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (changeInfo.url || changeInfo.title || changeInfo.status === 'complete') {
            autoSyncActiveWorkspace();
        }
    });

    chrome.tabs.onRemoved.addListener(() => {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local || !chrome.tabs) return;

        chrome.storage.local.get(['workSpaces', 'token'], (data) => {
            const workspaces = data.workSpaces || [];
            if (workspaces.length === 0) return;

            const activeWs = workspaces.find(ws => ws.isActive) || workspaces[0];
            if (!activeWs || !Array.isArray(activeWs.tabs) || activeWs.tabs.length === 0) return;

            chrome.tabs.query({}, (tabs) => {
                const liveUrls = new Set(
                    (tabs || [])
                        .filter(t => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://') && t.url !== 'about:blank' && !t.url.includes('newtab') && !t.url.includes('new-tab-page'))
                        .map(t => normalizeUrl(t.url))
                );

                const originalCount = activeWs.tabs.length;
                activeWs.tabs = activeWs.tabs.filter(t => liveUrls.has(normalizeUrl(t.url)));

                if (activeWs.tabs.length !== originalCount) {
                    activeWs.updatedAt = new Date().toISOString();

                    chrome.storage.local.set({ workSpaces: workspaces }, () => {
                        if (data.token && activeWs._id && !activeWs._id.startsWith('local_')) {
                            fetch(`https://flowzone-backend-api.vercel.app/api/workspaces/${activeWs._id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${data.token}`
                                },
                                body: JSON.stringify({ tabs: activeWs.tabs })
                            }).catch(() => fetch(`https://tabflow-backend-api.vercel.app/api/workspaces/${activeWs._id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${data.token}`
                                },
                                body: JSON.stringify({ tabs: activeWs.tabs })
                            })).catch(() => {});
                        }

                        chrome.action.setBadgeText({ text: '✓' });
                        chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
                        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 1500);
                    });
                }
            });
        });
    });

    chrome.tabs.onReplaced.addListener(autoSyncActiveWorkspace);
}

// =========================================================================
// REAL-TIME DASHBOARD ACTION EXECUTION BRIDGE
// =========================================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && (message.type === 'FLOWZONE_EXECUTE_ACTION' || message.type === 'TABFLOW_EXECUTE_ACTION')) {
        const { action, workspaceId, data } = message;

        chrome.storage.local.get(['workSpaces'], (storageData) => {
            const workspaces = storageData.workSpaces || [];
            const targetWs = workspaces.find(ws => (ws._id || ws.id) === workspaceId || (data?.name && ws.name.toLowerCase().trim() === data.name.toLowerCase().trim()));

            if (action === 'suspend') {
                // Suspend Action: Close matching open browser tabs
                chrome.tabs.query({ currentWindow: true }, (tabs) => {
                    if (tabs && tabs.length > 0 && targetWs && Array.isArray(targetWs.tabs)) {
                        const targetUrls = targetWs.tabs.map(t => t.url).filter(Boolean);
                        const tabIdsToRemove = tabs
                            .filter(t => t.url && targetUrls.some(u => isUrlMatch(t.url, u)))
                            .map(t => t.id);

                        if (tabIdsToRemove.length > 0) {
                            chrome.tabs.remove(tabIdsToRemove);
                        }
                    }
                });

                if (targetWs) {
                    targetWs.isActive = false;
                    chrome.storage.local.set({ workSpaces: workspaces });
                }
            } else if (action === 'restore') {
                // Restore Action: Open workspace tabs in browser
                if (targetWs && Array.isArray(targetWs.tabs) && targetWs.tabs.length > 0) {
                    targetWs.tabs.forEach(t => {
                        if (t.url) chrome.tabs.create({ url: t.url, active: false });
                    });
                    targetWs.isActive = true;
                    chrome.storage.local.set({ workSpaces: workspaces });
                }
            } else if (action === 'rename' && data && data.name) {
                if (targetWs) {
                    targetWs.name = data.name;
                    chrome.storage.local.set({ workSpaces: workspaces });
                }
            } else if (action === 'delete') {
                const updated = workspaces.filter(ws => (ws._id || ws.id) !== workspaceId);
                chrome.storage.local.set({ workSpaces: updated });
            }
        });
    }
});

function isUrlMatch(url1, url2) {
    if (!url1 || !url2) return false;
    try {
        const u1 = new URL(url1);
        const u2 = new URL(url2);
        return u1.origin === u2.origin && u1.pathname === u2.pathname;
    } catch {
        return url1 === url2;
    }
}