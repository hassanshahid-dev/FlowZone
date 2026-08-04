import express from 'express'
import { protect} from '../middleware/auth.js'
import Workspace from "../models/Workspace.js"

const router = express.Router();

router.use(protect);

// GET /api/workspaces/
router.get(`/`, async (req, res) => {
    try {
        const workspaces = await Workspace.find({ userId: req.user.id });
        res.status(200).json(workspaces);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/workspaces/ (Create single workspace)
router.post(`/`, async (req, res) => {
    try {
        const { name, tabs, tag } = req.body;
        const userPlan = req.user.plan || 'free';
        const existingCount = await Workspace.countDocuments({ userId: req.user.id });

        // Free tier enforces max 5 cloud workspaces
        if (userPlan === 'free' && existingCount >= 5) {
            return res.status(403).json({
                error: 'Free Tier is limited to 5 cloud-synced workspaces. Upgrade to Pro for Unlimited cloud sync!'
            });
        }

        const workspace = await Workspace.create({
            userId: req.user.id,
            name: name || 'Untitled Workspace',
            tabs: Array.isArray(tabs) ? tabs : [],
            tag: tag || 'Indigo'
        });

        res.status(201).json(workspace);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/workspaces/sync-local (Migrate & sync local storage workspaces to cloud)
router.post('/sync-local', async (req, res) => {
    try {
        const { workspaces } = req.body;
        if (!Array.isArray(workspaces)) {
            return res.status(400).json({ error: 'Workspaces array required' });
        }

        const userPlan = req.user.plan || 'free';
        let userWorkspaces = await Workspace.find({ userId: req.user.id });
        const existingNames = userWorkspaces.map(w => w.name.toLowerCase().trim());

        const createdList = [];
        for (const ws of workspaces) {
            if (!ws || !ws.name) continue;

            const nameNorm = ws.name.toLowerCase().trim();
            const existsInDb = existingNames.includes(nameNorm);

            if (!existsInDb) {
                // Check free tier limit (5 max)
                const currentTotal = userWorkspaces.length + createdList.length;
                if (userPlan === 'free' && currentTotal >= 5) {
                    continue; // Skip creating additional workspaces beyond free tier 5 limit
                }

                const newWs = await Workspace.create({
                    userId: req.user.id,
                    name: ws.name.trim(),
                    tabs: Array.isArray(ws.tabs) ? ws.tabs : [],
                    tag: ws.tag || 'Indigo'
                });
                createdList.push(newWs);
            } else {
                // Update existing workspace tabs if modified
                const existingWs = userWorkspaces.find(w => w.name.toLowerCase().trim() === nameNorm);
                if (existingWs && Array.isArray(ws.tabs) && ws.tabs.length > 0) {
                    existingWs.tabs = ws.tabs;
                    await existingWs.save();
                }
            }
        }

        const allWorkspaces = await Workspace.find({ userId: req.user.id });
        res.status(200).json({
            message: `Synced ${createdList.length} new workspaces`,
            workspaces: allWorkspaces
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/workspaces/:id
router.put(`/:id`, async (req, res) => {
    try {
        const workspace = await Workspace.findOneAndUpdate(
            { userId : req.user.id, _id : req.params.id },
            { ...req.body, updatedAt : Date.now() },
            { new : true}
        );

        if (!workspace) return res.status(404).json({ error: 'Not found' });
        res.status(200).json(workspace);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/workspace/:id
router.delete(`/:id`, async (req,res) => {
    try {
        const workspace = await Workspace.findOneAndDelete(
            { _id : req.params.id, userId : req.user.id }
        );
        if (!workspace) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;