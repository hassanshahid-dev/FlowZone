import express from 'express'
import { protect} from '../middleware/auth.js'
import Workspace from "../models/Workspace.js"

const router = express.Router();

router.use(protect);

// GET /api/workspaces/
router.get(`/`, async (req, res) => {
    try {
        const workspaces = await Workspace.find( {userId : req.user.id,} );
        res.status(201).json(workspaces);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// POST /api/workspaces/
router.post(`/`, async (req, res) => {
    try {
        const { name, tabs, tag } = req.body;
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