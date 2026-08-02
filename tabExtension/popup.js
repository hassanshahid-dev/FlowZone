// popup.js - TabFlow Extension Master Initialization & Event Controller

(async function () {
    let currentWorkspaces = [];
    let currentOpenTabs = [];
    let selectedTag = 'Indigo';

    // =========================================================================
    // 1. INITIALIZATION & CONNECTION CHECK
    // =========================================================================
    async function initApp() {
        // Check User Session
        const session = await Auth.getUser();
        updateUserMenu(session);

        // Check Server Connection
        const isOnline = await API.checkHealth();
        updateConnectionStatus(isOnline);

        // Load Workspaces (Backend primary, local fallback)
        try {
            if (session.token && isOnline) {
                const backendWorkspaces = await API.getWorkspaces();
                if (Array.isArray(backendWorkspaces)) {
                    currentWorkspaces = backendWorkspaces;
                    await Storage.saveWorkspaces(backendWorkspaces);
                } else {
                    currentWorkspaces = await Storage.getWorkspaces();
                }
            } else {
                currentWorkspaces = await Storage.getWorkspaces();
            }
        } catch (err) {
            currentWorkspaces = await Storage.getWorkspaces();
        }

        // Render Workspaces
        UI.displayWorkspaces(currentWorkspaces);

        // Pre-fetch Open Tabs
        getTabs(tabs => {
            currentOpenTabs = tabs;
        });

        setupEventListeners();
    }

    function updateConnectionStatus(isOnline) {
        const dot = document.querySelector('#connectionStatus .status-dot');
        const text = document.getElementById('statusText');
        const backendStatus = document.getElementById('settingsBackendStatus');

        if (isOnline) {
            if (dot) { dot.className = 'status-dot online'; }
            if (text) { text.textContent = 'Cloud Sync On'; }
            if (backendStatus) {
                backendStatus.textContent = 'Connected (http://localhost:5000/api)';
                backendStatus.style.color = 'var(--accent-emerald)';
            }
        } else {
            if (dot) { dot.className = 'status-dot offline'; }
            if (text) { text.textContent = 'Offline Mode'; }
            if (backendStatus) {
                backendStatus.textContent = 'Disconnected (Local Mode)';
                backendStatus.style.color = 'var(--accent-amber)';
            }
        }
    }

    function updateUserMenu(session) {
        const emailEl = document.getElementById('dropdownEmail');
        const planEl = document.getElementById('dropdownPlan');
        const authBtnText = document.getElementById('dropdownAuthText');
        const avatarChar = document.getElementById('userAvatarChar');

        if (session.token && session.user) {
            if (emailEl) emailEl.textContent = session.user.email || 'Logged In User';
            if (planEl) planEl.textContent = session.user.plan || 'Pro Member';
            if (authBtnText) authBtnText.textContent = 'Log Out';
            if (avatarChar) avatarChar.textContent = (session.user.email || 'U').charAt(0).toUpperCase();
        } else {
            if (emailEl) emailEl.textContent = 'Guest User (Offline)';
            if (planEl) planEl.textContent = 'Free Tier';
            if (authBtnText) authBtnText.textContent = 'Log In / Register';
            if (avatarChar) avatarChar.textContent = 'G';
        }
    }

    // =========================================================================
    // 2. EVENT LISTENERS & ROUTING
    // =========================================================================
    function setupEventListeners() {
        // Navigation Tabs Routing
        document.querySelectorAll('.nav-tab').forEach(tabBtn => {
            tabBtn.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;
                document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));

                e.currentTarget.classList.add('active');
                const viewEl = document.getElementById(`view-${targetTab}`);
                if (viewEl) viewEl.classList.add('active');

                // Trigger specific view loads
                if (targetTab === 'openTabs') {
                    getTabs(tabs => {
                        currentOpenTabs = tabs;
                        UI.renderOpenTabs(tabs);
                    });
                } else if (targetTab === 'aiGroup') {
                    getTabs(tabs => {
                        currentOpenTabs = tabs;
                        UI.renderAiCategorization(tabs);
                    });
                } else if (targetTab === 'workspaces') {
                    Storage.getWorkspaces().then(ws => {
                        currentWorkspaces = ws;
                        UI.displayWorkspaces(ws, getFilterValue(), getSearchValue());
                    });
                }
            });
        });

        // Search Input Filter
        const searchInput = document.getElementById('searchInput');
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        const filterSelect = document.getElementById('filterSelect');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                if (clearSearchBtn) clearSearchBtn.style.display = query ? 'block' : 'none';
                
                const activeNav = document.querySelector('.nav-tab.active')?.dataset.tab;
                if (activeNav === 'openTabs') {
                    UI.renderOpenTabs(currentOpenTabs, query);
                } else {
                    UI.displayWorkspaces(currentWorkspaces, getFilterValue(), query);
                }
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    clearSearchBtn.style.display = 'none';
                    UI.displayWorkspaces(currentWorkspaces, getFilterValue(), '');
                }
            });
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                UI.displayWorkspaces(currentWorkspaces, getFilterValue(), getSearchValue());
            });
        }

        // Quick Sync Button
        document.getElementById('quickSyncBtn')?.addEventListener('click', async () => {
            UI.showToast('Syncing with backend cloud...', 'info');
            const isOnline = await API.checkHealth();
            updateConnectionStatus(isOnline);
            if (isOnline) {
                const backendWorkspaces = await API.getWorkspaces();
                if (Array.isArray(backendWorkspaces)) {
                    currentWorkspaces = backendWorkspaces;
                    await Storage.saveWorkspaces(backendWorkspaces);
                    UI.displayWorkspaces(backendWorkspaces);
                    UI.showToast('Synced successfully with cloud!', 'success');
                }
            } else {
                UI.showToast('Server unreachable. Running in local mode.', 'info');
            }
        });

        // User Dropdown & Auth Modal
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        const dropdownAuthBtn = document.getElementById('dropdownAuthBtn');
        const authOverlay = document.getElementById('authOverlay');
        const closeAuthOverlayBtn = document.getElementById('closeAuthOverlayBtn');

        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });

            document.addEventListener('click', () => userDropdown.classList.remove('show'));
        }

        if (dropdownAuthBtn) {
            dropdownAuthBtn.addEventListener('click', async () => {
                userDropdown.classList.remove('show');
                const session = await Auth.getUser();
                if (session.token) {
                    await Auth.clearSession();
                    updateUserMenu({ token: null, user: null });
                    UI.showToast('Logged out of cloud account', 'info');
                } else {
                    if (authOverlay) authOverlay.style.display = 'flex';
                }
            });
        }

        if (closeAuthOverlayBtn && authOverlay) {
            closeAuthOverlayBtn.addEventListener('click', () => {
                authOverlay.style.display = 'none';
            });
        }

        // Auth Submit Form Handler inside Modal
        const authForm = document.getElementById('authForm');
        let authMode = 'login';

        document.getElementById('authModeLoginBtn')?.addEventListener('click', () => {
            authMode = 'login';
            document.getElementById('authModeLoginBtn').classList.add('active');
            document.getElementById('authModeRegisterBtn').classList.remove('active');
            document.getElementById('authSubmitBtn').textContent = 'Sign In';
        });

        document.getElementById('authModeRegisterBtn')?.addEventListener('click', () => {
            authMode = 'register';
            document.getElementById('authModeRegisterBtn').classList.add('active');
            document.getElementById('authModeLoginBtn').classList.remove('active');
            document.getElementById('authSubmitBtn').textContent = 'Create Account';
        });

        if (authForm) {
            authForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('authEmail').value.trim();
                const password = document.getElementById('authPassword').value.trim();
                const errorMsg = document.getElementById('authErrorMsg');

                if (errorMsg) errorMsg.style.display = 'none';
                const res = await Auth.handleAuth(authMode, email, password);

                if (res.error) {
                    if (errorMsg) {
                        errorMsg.textContent = res.error;
                        errorMsg.style.display = 'block';
                    }
                } else {
                    if (authOverlay) authOverlay.style.display = 'none';
                    updateUserMenu(res);
                    UI.showToast(`Successfully logged in as ${res.user.email}`, 'success');
                    
                    // Fetch cloud workspaces
                    const backendWorkspaces = await API.getWorkspaces();
                    if (Array.isArray(backendWorkspaces)) {
                        currentWorkspaces = backendWorkspaces;
                        await Storage.saveWorkspaces(backendWorkspaces);
                        UI.displayWorkspaces(backendWorkspaces);
                    }
                }
            });
        }

        // =========================================================================
        // 3. CREATE WORKSPACE MODAL
        // =========================================================================
        const createModal = document.getElementById('createWorkspaceModal');
        const openCreateModalBtn = document.getElementById('openCreateModalBtn');
        const closeCreateModalBtn = document.getElementById('closeCreateModalBtn');
        const cancelCreateModalBtn = document.getElementById('cancelCreateModalBtn');
        const confirmCreateWorkspaceBtn = document.getElementById('confirmCreateWorkspaceBtn');

        if (openCreateModalBtn) {
            openCreateModalBtn.addEventListener('click', () => {
                populateCreateModalTabs();
                if (createModal) createModal.style.display = 'flex';
            });
        }

        if (closeCreateModalBtn) closeCreateModalBtn.addEventListener('click', () => createModal.style.display = 'none');
        if (cancelCreateModalBtn) cancelCreateModalBtn.addEventListener('click', () => createModal.style.display = 'none');

        // Color Tag Picker
        document.querySelectorAll('.tag-opt').forEach(opt => {
            opt.addEventListener('click', (e) => {
                document.querySelectorAll('.tag-opt').forEach(o => o.classList.remove('active'));
                e.currentTarget.classList.add('active');
                selectedTag = e.currentTarget.dataset.tag || 'Indigo';
            });
        });

        // Confirm Create Workspace
        if (confirmCreateWorkspaceBtn) {
            confirmCreateWorkspaceBtn.addEventListener('click', async () => {
                const nameInput = document.getElementById('newWsNameInput');
                const wsName = nameInput.value.trim() || 'My Workspace';

                // Read selected tabs safely
                const selectedTabs = [];
                document.querySelectorAll('.modal-tab-checkbox:checked').forEach(cb => {
                    const tabUrl = cb.getAttribute('data-url') || cb.dataset.url || '';
                    const tabTitle = cb.getAttribute('data-title') || cb.dataset.title || tabUrl || 'New Tab';
                    if (tabUrl) {
                        selectedTabs.push({
                            title: tabTitle,
                            url: tabUrl,
                            favIconUrl: getFaviconFromUrl(tabUrl)
                        });
                    }
                });

                if (selectedTabs.length === 0) {
                    UI.showToast('Please select at least one tab to include in workspace', 'error');
                    return;
                }

                // Create via API with robust local fallback
                let created = await API.createWorkspace(wsName, selectedTabs, selectedTag);
                if (!created || created.error || !created.name || !Array.isArray(created.tabs)) {
                    created = {
                        _id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                        name: wsName,
                        tabs: selectedTabs,
                        tag: selectedTag || 'Indigo',
                        isActive: true,
                        isPinned: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                }

                await Storage.addWorkspace(created);

                currentWorkspaces = await Storage.getWorkspaces();
                UI.displayWorkspaces(currentWorkspaces);

                if (createModal) createModal.style.display = 'none';
                nameInput.value = '';
                UI.showToast(`Workspace "${wsName}" created!`, 'success');
            });
        }

        // =========================================================================
        // 4. OPEN TABS VIEW ACTIONS
        // =========================================================================
        document.getElementById('saveSelectedAsWorkspaceBtn')?.addEventListener('click', async () => {
            const selected = [];
            document.querySelectorAll('.tab-checkbox:checked').forEach(cb => {
                const tabUrl = cb.getAttribute('data-url') || cb.dataset.url || '';
                const tabTitle = cb.getAttribute('data-title') || cb.dataset.title || tabUrl || 'New Tab';
                if (tabUrl) {
                    selected.push({
                        title: tabTitle,
                        url: tabUrl,
                        favIconUrl: getFaviconFromUrl(tabUrl)
                    });
                }
            });

            if (selected.length === 0) {
                UI.showToast('No open tabs selected', 'error');
                return;
            }

            const wsName = `Saved Session (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
            let created = await API.createWorkspace(wsName, selected, 'Emerald');
            if (!created || created.error || !created.name || !Array.isArray(created.tabs)) {
                created = {
                    _id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    name: wsName,
                    tabs: selected,
                    tag: 'Emerald',
                    isActive: true,
                    isPinned: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }

            await Storage.addWorkspace(created);

            currentWorkspaces = await Storage.getWorkspaces();
            UI.displayWorkspaces(currentWorkspaces);

            // Switch to workspaces tab
            document.querySelector('.nav-tab[data-tab="workspaces"]')?.click();
            UI.showToast(`Saved ${selected.length} tabs into "${wsName}"`, 'success');
        });

        document.getElementById('selectAllOpenTabsBtn')?.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.tab-checkbox');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => cb.checked = !allChecked);
        });

        // AI Auto-Group Trigger
        document.getElementById('runAiGroupingBtn')?.addEventListener('click', () => {
            getTabs(tabs => {
                UI.renderAiCategorization(tabs);
                UI.showToast('Categorized open tabs into smart groups', 'success');
            });
        });

        // =========================================================================
        // 5. IMPORT / EXPORT BACKUP
        // =========================================================================
        document.getElementById('exportBackupBtn')?.addEventListener('click', async () => {
            const dataStr = await Storage.exportJSON();
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `tabflow_backup_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            UI.showToast('Exported workspaces JSON backup', 'success');
        });

        const importInput = document.getElementById('importJsonFileInput');
        document.getElementById('triggerImportJsonBtn')?.addEventListener('click', () => {
            if (importInput) importInput.click();
        });

        if (importInput) {
            importInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const jsonArray = JSON.parse(event.target.result);
                        const imported = await Storage.importJSON(jsonArray);
                        currentWorkspaces = imported;
                        UI.displayWorkspaces(imported);
                        UI.showToast(`Imported ${jsonArray.length} workspaces!`, 'success');
                    } catch (err) {
                        UI.showToast('Failed to import JSON: ' + err.message, 'error');
                    }
                };
                reader.readAsText(file);
            });
        }

        document.getElementById('clearLocalDataBtn')?.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear local storage cache?')) {
                await Storage.saveWorkspaces([]);
                currentWorkspaces = [];
                UI.displayWorkspaces([]);
                UI.showToast('Local cache cleared', 'info');
            }
        });
    }

    function populateCreateModalTabs() {
        const container = document.getElementById('modalTabChecklist');
        const countLabel = document.getElementById('modalSelectedTabsCount');
        if (!container) return;

        container.innerHTML = '';
        getTabs(tabs => {
            if (countLabel) countLabel.textContent = `${tabs.length} selected`;

            tabs.forEach(tab => {
                const row = document.createElement('label');
                row.className = 'tab-item-row';
                row.style.cursor = 'pointer';
                row.innerHTML = `
                    <div class="tab-info">
                        <input type="checkbox" class="modal-tab-checkbox" data-url="${UI.escapeHTML(tab.url)}" data-title="${UI.escapeHTML(tab.title)}" checked />
                        <img class="tab-favicon" src="${tab.favIconUrl || getFaviconFromUrl(tab.url)}" />
                        <span class="tab-title-text">${UI.escapeHTML(tab.title)}</span>
                    </div>
                `;

                row.querySelector('input').addEventListener('change', () => {
                    const checkedCount = document.querySelectorAll('.modal-tab-checkbox:checked').length;
                    if (countLabel) countLabel.textContent = `${checkedCount} selected`;
                });

                container.appendChild(row);
            });
        });
    }

    function getSearchValue() {
        return document.getElementById('searchInput')?.value || '';
    }

    function getFilterValue() {
        return document.getElementById('filterSelect')?.value || 'all';
    }

    // Start App
    document.addEventListener('DOMContentLoaded', initApp);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initApp();
    }
})();
