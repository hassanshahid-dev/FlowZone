// storage.js - TabFlow Local Storage Controller

const Storage = {
    async getWorkspaces() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get("workSpaces", (data) => {
                    resolve(data.workSpaces || []);
                });
            } else {
                const stored = localStorage.getItem("workSpaces");
                resolve(stored ? JSON.parse(stored) : []);
            }
        });
    },

    async saveWorkspaces(workspaces) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ workSpaces: workspaces }, () => resolve(workspaces));
            } else {
                localStorage.setItem("workSpaces", JSON.stringify(workspaces));
                resolve(workspaces);
            }
        });
    },

    async addWorkspace(newWorkspace) {
        if (!newWorkspace || typeof newWorkspace !== 'object' || newWorkspace.error) {
            console.warn('[Storage] Ignored invalid workspace creation object:', newWorkspace);
            return await this.getWorkspaces();
        }
        const workspaces = await this.getWorkspaces();
        // Ensure standard fields
        const formatted = {
            _id: newWorkspace._id || newWorkspace.id || 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: newWorkspace.name || 'My Workspace',
            tabs: Array.isArray(newWorkspace.tabs) ? newWorkspace.tabs : [],
            isActive: newWorkspace.isActive !== undefined ? newWorkspace.isActive : true,
            isPinned: !!newWorkspace.isPinned,
            tag: newWorkspace.tag || 'Indigo',
            createdAt: newWorkspace.createdAt || new Date().toISOString(),
            updatedAt: newWorkspace.updatedAt || new Date().toISOString()
        };

        // Avoid duplicates by ID
        const filtered = workspaces.filter(ws => (ws._id || ws.id) !== formatted._id);
        filtered.unshift(formatted);
        await this.saveWorkspaces(filtered);
        return filtered;
    },

    async updateWorkspace(id, data) {
        const workspaces = await this.getWorkspaces();
        const updated = workspaces.map(ws => {
            if ((ws._id || ws.id) === id) {
                return { ...ws, ...data, updatedAt: new Date().toISOString() };
            }
            return ws;
        });
        await this.saveWorkspaces(updated);
        return updated;
    },

    async deleteWorkspace(id) {
        const workspaces = await this.getWorkspaces();
        const updated = workspaces.filter(ws => (ws._id || ws.id) !== id);
        await this.saveWorkspaces(updated);
        return updated;
    },

    async closeWorkspace(id) {
        return await this.updateWorkspace(id, { isActive: false });
    },

    async activateWorkspace(id) {
        return await this.updateWorkspace(id, { isActive: true });
    },

    async togglePinWorkspace(id) {
        const workspaces = await this.getWorkspaces();
        const target = workspaces.find(ws => (ws._id || ws.id) === id);
        if (!target) return workspaces;
        return await this.updateWorkspace(id, { isPinned: !target.isPinned });
    },

    async removeTabFromWorkspace(workspaceId, tabUrl) {
        const workspaces = await this.getWorkspaces();
        const target = workspaces.find(ws => (ws._id || ws.id) === workspaceId);
        if (!target) return workspaces;

        const updatedTabs = target.tabs.filter(t => t.url !== tabUrl);
        return await this.updateWorkspace(workspaceId, { tabs: updatedTabs });
    },

    async exportJSON() {
        const workspaces = await this.getWorkspaces();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workspaces, null, 2));
        return dataStr;
    },

    async importJSON(jsonArray) {
        if (!Array.isArray(jsonArray)) throw new Error('Invalid JSON format. Expected array of workspaces.');
        const current = await this.getWorkspaces();
        const merged = [...jsonArray, ...current];
        // Deduplicate by ID or name
        const unique = [];
        const seenIds = new Set();
        for (const ws of merged) {
            const id = ws._id || ws.id || ws.name;
            if (!seenIds.has(id)) {
                seenIds.add(id);
                unique.push({
                    _id: ws._id || ws.id || 'imp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                    name: ws.name || 'Imported Workspace',
                    tabs: Array.isArray(ws.tabs) ? ws.tabs : [],
                    isActive: ws.isActive !== undefined ? ws.isActive : false,
                    isPinned: !!ws.isPinned,
                    tag: ws.tag || 'Violet',
                    createdAt: ws.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
        }
        await this.saveWorkspaces(unique);
        return unique;
    }
};