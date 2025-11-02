// File: /api/mira.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({
      error: 'Missing OPENROUTER_API_KEY environment variable in Vercel settings.'
    });
  }

  try {
    // Parse request body (works for both Vercel Edge + Node environments)
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
export default async function handler(req, res) {
  // ✅ Allow requests from anywhere (for now)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ... your existing code below
}

    // Send request to OpenRouter
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        // 👇 REQUIRED by OpenRouter for all apps
        'HTTP-Referer': req.headers.origin || 'https://marktist.vercel.app',
        'X-Title': 'MIRA Marketing Assistant',
        'User-Agent': 'MIRA-App/1.0 (https://marktist.vercel.app)'
      },
      body: JSON.stringify(body)
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter API error:', errorText);
      return res.status(openRouterResponse.status).json({
        error: `OpenRouter API error ${openRouterResponse.status}`,
        details: errorText
      });
    }

    const data = await openRouterResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('MIRA API internal error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
