// content.js - Automatic Session & Workspace Sync with TabFlow Web Dashboard
(function syncTabFlowSession() {
    function checkAndSync() {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (token && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const userObj = userStr ? JSON.parse(userStr) : null;
                chrome.storage.local.get(['token', 'user'], (data) => {
                    if (data.token !== token || JSON.stringify(data.user) !== JSON.stringify(userObj)) {
                        chrome.storage.local.set({
                            token: token,
                            user: userObj || { plan: 'free' }
                        }, () => {
                            console.log('✅ TabFlow Extension Session Synced with Dashboard!');
                        });
                    }
                });
            }
        } catch (e) {}
    }

    // Initial check on load
    checkAndSync();

    // Listen for login/register message events from web page
    window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'TABFLOW_SYNC_SESSION') {
            checkAndSync();
        }
    });

    // Periodically poll for session changes while dashboard tab is open
    setInterval(checkAndSync, 2000);
})();
