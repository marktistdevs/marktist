export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'OPENROUTER_API_KEY is not configured in Vercel Environment Variables.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { messages, model = "nvidia/nemotron-3.5-lightning:free", temperature = 0.7, max_tokens = 1800 } = await req.json();

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers.get("referer") || "https://mira.marktist.com",
        "X-Title": "MIRA Strategy Architect"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
        temperature: temperature,
        max_tokens: max_tokens
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      return new Response(errorText, {
        status: openRouterResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Stream the response back to client
    return new Response(openRouterResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
