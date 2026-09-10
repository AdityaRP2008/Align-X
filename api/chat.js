export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const OMNIROUTE_BASE_URL = process.env.OMNIROUTE_BASE_URL || 'https://api.omniroute.ai/v1';
  const OMNIROUTE_API_KEY = process.env.OMNIROUTE_API_KEY || '';

  const systemPrompt = `You are the Align-X AI Holographic Tutor. Provide concise, expert engineering guidance with code snippets or bullets.
Student: ${context?.name || 'Engineer'}, Target: ${context?.roleTitle || 'Full-Stack'}, Readiness: ${context?.readiness || 68}%.`;

  try {
    const response = await fetch(`${OMNIROUTE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OMNIROUTE_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OMNIROUTE_MODEL || 'auto',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) throw new Error(await response.text());
    const comp = await response.json();
    return res.status(200).json({ reply: comp.choices?.[0]?.message?.content || "No response." });
  } catch (err) {
    return res.status(500).json({ error: 'Tutor Error', details: err.message });
  }
}
