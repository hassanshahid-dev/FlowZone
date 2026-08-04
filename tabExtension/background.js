// background.js - TabFlow Extension Background Service Worker (Manifest V3)

// Configure side panel behavior on installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('TabFlow AI Workspace & Tab Manager Installed');

    // Automatically open Chrome Side Panel when clicking toolbar action icon (Apollo-style)
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
            .catch((error) => console.error('Failed to set panel behavior:', error));
    }

    // Create Context Menu Item for Right-Click on web pages
    if (chrome.contextMenus) {
        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                id: 'save-page-to-tabflow',
                title: 'Save page to TabFlow Workspace',
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
    if (info.menuItemId === 'save-page-to-tabflow' && tab) {
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
let autoSyncDebounceTimer = null;

function autoSyncActiveWorkspace() {
    if (autoSyncDebounceTimer) clearTimeout(autoSyncDebounceTimer);
    autoSyncDebounceTimer = setTimeout(() => {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local || !chrome.tabs) return;

        chrome.storage.local.get(['workSpaces', 'token'], (data) => {
            const workspaces = data.workSpaces || [];
            const activeWs = workspaces.find(ws => ws.isActive);

            if (!activeWs) return;

            chrome.tabs.query({ currentWindow: true }, (tabs) => {
                if (!tabs || tabs.length === 0) return;

                const liveTabsList = tabs
                    .filter(t => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'))
                    .map(t => ({
                        title: t.title || t.url,
                        url: t.url,
                        favIconUrl: t.favIconUrl
                    }));

                if (liveTabsList.length === 0) return;

                activeWs.tabs = liveTabsList;
                activeWs.updatedAt = new Date().toISOString();

                chrome.storage.local.set({ workSpaces: workspaces }, () => {
                    if (data.token && activeWs._id && !activeWs._id.startsWith('local_')) {
                        fetch(`https://tabflow-backend-api.vercel.app/api/workspaces/${activeWs._id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${data.token}`
                            },
                            body: JSON.stringify({ tabs: liveTabsList })
                        }).catch(() => {});
                    }
                });
            });
        });
    }, 1500);
}

if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.onCreated.addListener(autoSyncActiveWorkspace);
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (changeInfo.url || changeInfo.title) {
            autoSyncActiveWorkspace();
        }
    });
    chrome.tabs.onRemoved.addListener(autoSyncActiveWorkspace);
}