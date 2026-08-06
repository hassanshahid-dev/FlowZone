// content.js - Automatic Bidirectional Session & Workspace Sync for FlowZone
(function syncFlowZoneSession() {
    function checkAndSync() {
        try {
            const webToken = localStorage.getItem('token');
            const webUserStr = localStorage.getItem('user');

            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['token', 'user', 'workSpaces'], (extData) => {
                    const extToken = extData.token;

                    // 1. Sync Extension session to Web Dashboard if Web has no token
                    if (extToken && !webToken) {
                        localStorage.setItem('token', extToken);
                        if (extData.user) localStorage.setItem('user', JSON.stringify(extData.user));
                        window.postMessage({ type: 'FLOWZONE_SYNC_SESSION_DONE' }, '*');
                        window.postMessage({ type: 'TABFLOW_SYNC_SESSION_DONE' }, '*');
                    }
                    // 2. Sync Web session to Extension if Web has token but Extension does not
                    else if (webToken && (!extToken || extToken !== webToken)) {
                        const webUser = webUserStr ? JSON.parse(webUserStr) : null;
                        chrome.storage.local.set({ token: webToken, user: webUser });
                    }
                    // 3. Logout sync: if Web logged out, remove Extension token
                    else if (!webToken && extToken) {
                        chrome.storage.local.remove(['token', 'user']);
                    }

                    // Sync local workspaces to Web localStorage & post message for real-time dashboard render
                    if (extData.workSpaces && Array.isArray(extData.workSpaces) && extData.workSpaces.length > 0) {
                        const currentLocal = localStorage.getItem('workSpaces');
                        const newStr = JSON.stringify(extData.workSpaces);
                        if (currentLocal !== newStr) {
                            localStorage.setItem('workSpaces', newStr);
                            window.postMessage({ type: 'FLOWZONE_SYNC_WORKSPACES' }, '*');
                            window.postMessage({ type: 'TABFLOW_SYNC_WORKSPACES' }, '*');
                        }
                    }
                });
            }
        } catch (e) {}
    }

    checkAndSync();

    window.addEventListener('message', (e) => {
        if (!e.data) return;

        if (e.data.type === 'FLOWZONE_ACTION_EVENT' || e.data.type === 'TABFLOW_ACTION_EVENT') {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    type: 'FLOWZONE_EXECUTE_ACTION',
                    action: e.data.action,
                    workspaceId: e.data.workspaceId,
                    data: e.data.data
                });
            }
        }

        if (e.data.type === 'FLOWZONE_SYNC_SESSION' || e.data.type === 'TABFLOW_SYNC_SESSION' || e.data.type === 'FLOWZONE_LOGOUT_EVENT' || e.data.type === 'TABFLOW_LOGOUT_EVENT') {
            if (e.data.type === 'FLOWZONE_LOGOUT_EVENT' || e.data.type === 'TABFLOW_LOGOUT_EVENT') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.remove(['token', 'user']);
                }
            }
            checkAndSync();
        }
    });

    setInterval(checkAndSync, 1000);
})();
