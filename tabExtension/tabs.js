// tabs.js - Chrome Tabs API Wrapper & Helpers

function getTabs(callback) {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ lastFocusedWindow: true }, (tabs) => {
            if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
                chrome.tabs.query({}, (allTabs) => parseAndReturnTabs(allTabs, callback));
            } else {
                parseAndReturnTabs(tabs, callback);
            }
        });
    } else {
        // Fallback for non-extension preview environment
        callback([
            { id: 1, title: 'GitHub - FlowZone Repository', url: 'https://github.com', favIconUrl: 'https://www.google.com/s2/favicons?domain=github.com', active: true },
            { id: 2, title: 'React Documentation', url: 'https://react.dev', favIconUrl: 'https://www.google.com/s2/favicons?domain=react.dev', active: false },
            { id: 3, title: 'Stack Overflow', url: 'https://stackoverflow.com', favIconUrl: 'https://www.google.com/s2/favicons?domain=stackoverflow.com', active: false }
        ]);
    }
}

function parseAndReturnTabs(tabs, callback) {
    const rawTabs = (tabs || [])
        .filter(tab => tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://'));

    const parsed = rawTabs.map(tab => {
        let memoryMb = 120; // Baseline memory allocation
        if (tab.url) {
            const u = tab.url.toLowerCase();
            if (u.includes('youtube') || u.includes('video') || u.includes('netflix') || u.includes('twitch')) memoryMb = 380;
            else if (u.includes('figma') || u.includes('canva') || u.includes('docs.google') || u.includes('sheets.google')) memoryMb = 290;
            else if (u.includes('gmail') || u.includes('github') || u.includes('linkedin') || u.includes('salesforce')) memoryMb = 210;
        }

        return {
            id: tab.id,
            title: tab.title || tab.url,
            url: tab.url,
            favIconUrl: tab.favIconUrl || getFaviconFromUrl(tab.url),
            pinned: tab.pinned || false,
            active: tab.active || false,
            memoryMb: memoryMb
        };
    });
    callback(parsed);
}

function calculateWorkspaceRamInMb(workspaceTabs) {
    if (!Array.isArray(workspaceTabs) || workspaceTabs.length === 0) return 0;
    
    let totalMB = 0;
    workspaceTabs.forEach(t => {
        if (t.memoryMb && typeof t.memoryMb === 'number') {
            totalMB += t.memoryMb;
            return;
        }

        let tabMB = 120;
        if (t.url) {
            const u = t.url.toLowerCase();
            if (u.includes('youtube') || u.includes('video') || u.includes('netflix')) tabMB = 380;
            else if (u.includes('figma') || u.includes('canva') || u.includes('docs.google')) tabMB = 290;
            else if (u.includes('gmail') || u.includes('github') || u.includes('linkedin')) tabMB = 210;
        }
        totalMB += tabMB;
    });

    return totalMB;
}

function getFaviconFromUrl(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
        return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23888888" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>';
    }
}

function closeTabs(tabIds, callback) {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.remove && Array.isArray(tabIds) && tabIds.length > 0) {
        const validIds = tabIds.filter(id => typeof id === 'number');
        if (validIds.length > 0) {
            chrome.tabs.remove(validIds, () => {
                const err = chrome.runtime.lastError;
                if (err) console.warn('Chrome tab removal notice:', err.message);
                if (callback) callback();
            });
        } else if (callback) {
            callback();
        }
    } else if (callback) {
        callback();
    }
}

function openTabs(urls) {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        urls.forEach((url, idx) => {
            chrome.tabs.create({ url, active: idx === 0 });
        });
    } else {
        urls.forEach(url => window.open(url, '_blank'));
    }
}

function normalizeUrl(url) {
    if (!url) return '';
    try {
        const u = new URL(url);
        let href = (u.origin + u.pathname).toLowerCase();
        if (href.endsWith('/')) href = href.slice(0, -1);
        return href;
    } catch {
        return url.trim().toLowerCase().replace(/\/$/, '');
    }
}

function isUrlMatch(url1, url2) {
    const norm1 = normalizeUrl(url1);
    const norm2 = normalizeUrl(url2);
    if (!norm1 || !norm2) return false;
    if (norm1 === norm2) return true;
    if (norm1.startsWith(norm2) || norm2.startsWith(norm1)) return true;
    return false;
}
