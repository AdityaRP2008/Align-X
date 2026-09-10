export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fullName, targetRole, degree, semester, horizon, skills, github } = req.body;

  if (!fullName || !targetRole) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const OMNIROUTE_BASE_URL = process.env.OMNIROUTE_BASE_URL || 'https://api.omniroute.ai/v1';
  const OMNIROUTE_API_KEY = process.env.OMNIROUTE_API_KEY || '';

  const systemPrompt = `You are a technical career gap analyzer. Analyze the candidate and return STRICT RAW JSON ONLY (no backticks, no markdown codeblocks).
The output must match this exact schema:
{
  "readiness": <integer 0-100>,
  "matchedSkills": ["<skill1>", "<skill2>"],
  "missingSkills": [
    {
      "name": "<skill name>",
      "tag": "<e.g. Critical Void | High Priority>",
      "capstoneTitle": "<title of portfolio project>",
      "capstoneDesc": "<2-sentence implementation blueprint>"
    }
  ],
  "radar": {
    "categories": ["Frontend", "Backend APIs", "System Design", "Databases", "DevOps", "Testing"],
    "candidate": [<score 0-100>, <score 0-100>, <score 0-100>, <score 0-100>, <score 0-100>, <score 0-100>],
    "benchmark": [90, 85, 80, 85, 75, 75]
  },
  "phases": [
    {
      "phaseTitle": "Phase 1: Bridge Core Voids (Weeks 1-4)",
      "milestones": [
        { "id": "m1", "title": "<task description>", "hours": "<e.g. 8 hrs>", "resource": "<docs or reference>" }
      ]
    }
  ]
}`;

  const userPrompt = `Student: ${fullName}
Degree: ${degree} (${semester})
Target Role: ${targetRole}
Urgency Window: ${horizon}
GitHub: ${github || 'N/A'}
Self-Reported/Git Skills: ${skills || 'HTML, CSS, JavaScript, Basic Python'}

Generate the gap analysis and structured phased roadmap now. Return ONLY valid raw JSON.`;

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OmniRoute error (${response.status}): ${errText}`);
    }

    const completion = await response.json();
    let rawContent = completion.choices?.[0]?.message?.content || '{}';

    rawContent = rawContent.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsedData = JSON.parse(rawContent);

    return res.status(200).json(parsedData);
  } catch (err) {
    console.error('OmniRoute Execution Error:', err);
    return res.status(500).json({
      error: 'Failed to process roadmap via OmniRoute gateway',
      details: err.message
    });
  }
}
