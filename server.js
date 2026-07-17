// server.js
// Run on Render.com as a Node "Web Service". One process serves both the
// website and the /api/claude endpoint — no serverless function folders,
// no special detection rules to get wrong.

const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); // serves index.html, robots.txt, sitemap.xml

app.post('/api/claude', async (req, res) => {
  console.log('[api/claude] request received');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[api/claude] ANTHROPIC_API_KEY is not set');
    return res.status(500).json({ error: { message: 'Server is missing ANTHROPIC_API_KEY. Set it in Render → Environment, then it will redeploy automatically.' } });
  }

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await anthropicResponse.json();
    console.log('[api/claude] Anthropic responded with status', anthropicResponse.status);
    res.status(anthropicResponse.status).json(data);
  } catch (err) {
    console.error('[api/claude] crashed:', err);
    res.status(500).json({ error: { message: 'Server error reaching Claude: ' + (err && err.message ? err.message : String(err)) } });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Stepstones server running on port ${PORT}`);
});
