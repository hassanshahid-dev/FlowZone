import express from 'express';

const router = express.Router();

// AI Auto-Grouping Endpoint using Backend-managed Groq API key
router.post('/categorize', async (req, res) => {
    try {
        const { tabs } = req.body;
        if (!Array.isArray(tabs) || tabs.length === 0) {
            return res.status(400).json({ error: 'Tabs array is required and cannot be empty.' });
        }

        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            return res.status(500).json({ error: 'GROQ_API_KEY environment variable is not configured on server.' });
        }

        const tabPayload = tabs.map((t, idx) => ({
            index: typeof t.index === 'number' ? t.index : idx,
            title: t.title || t.url || 'Untitled Tab',
            url: t.url || ''
        }));

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                response_format: { type: "json_object" },
                temperature: 0.1,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI tab classifier. Categorize tabs into json mapping each tab index (0, 1, 2...) to one of these exact category names: "Code & Engineering", "Documentation & Docs", "Media & Entertainment", "Social & Messaging", "Shopping & Finance", "General Web". Return JSON format: {"0": "Category Name", "1": "Category Name"}'
                    },
                    {
                        role: 'user',
                        content: `Categorize these tabs: ${JSON.stringify(tabPayload)}`
                    }
                ]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Groq API Error from backend:', errText);
            return res.status(502).json({ error: 'Groq AI service temporarily unavailable', details: errText });
        }

        const data = await response.json();
        const contentStr = data?.choices?.[0]?.message?.content || '{}';
        const parsedMap = JSON.parse(contentStr);

        return res.json({
            success: true,
            engine: 'Groq Llama 3.1 AI Cloud (Free)',
            categories: parsedMap
        });
    } catch (err) {
        console.error('Backend AI Categorization Error:', err);
        return res.status(500).json({ error: 'Failed to process AI categorization', message: err.message });
    }
});

export default router;
