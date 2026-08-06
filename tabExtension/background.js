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

// Window closure listener to automatically suspend workspaces when their Chrome window is closed
if (typeof chrome !== 'undefined' && chrome.windows && chrome.windows.onRemoved) {
    chrome.windows.onRemoved.addListener((closedWinId) => {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
        chrome.storage.local.get(['workSpaces', 'token'], (data) => {
            const workspaces = data.workSpaces || [];
            let updated = false;

            workspaces.forEach(ws => {
                if (ws.windowId === closedWinId) {
                    ws.isActive = false;
                    ws.windowId = undefined;
                    updated = true;

                    if (data.token && ws._id && !ws._id.startsWith('local_')) {
                        fetch(`https://flowzone-backend-api.vercel.app/api/workspaces/${ws._id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${data.token}`
                            },
                            body: JSON.stringify({ isActive: false })
                        }).catch(() => {});
                    }
                }
            });

            if (updated) {
                chrome.storage.local.set({ workSpaces: workspaces });
            }
        });
    });
}

const tabCache = new Map();

function updateTabCache() {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;
    chrome.tabs.query({}, (tabs) => {
        if (!tabs) return;
        tabs.forEach(t => {
            if (t.id && t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://') && t.url !== 'about:blank') {
                tabCache.set(t.id, { title: t.title || t.url, url: t.url, windowId: t.windowId });
            }
        });
    });
}

updateTabCache();

if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.onCreated.addListener((tab) => {
        if (tab.id && tab.url) tabCache.set(tab.id, { title: tab.title || tab.url, url: tab.url, windowId: tab.windowId });
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (tab && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://') && tab.url !== 'about:blank') {
            tabCache.set(tabId, { title: tab.title || tab.url, url: tab.url, windowId: tab.windowId });
        }
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
        tabCache.delete(tabId);
    });
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
                const queryFilter = (targetWs && targetWs.windowId) ? { windowId: targetWs.windowId } : { currentWindow: true };
                chrome.tabs.query(queryFilter, (tabs) => {
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