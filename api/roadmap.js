export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, academicLevel, careerGoal, tenure, github, detectedSkills } = req.body;

  if (!name || !careerGoal || !tenure) {
    return res.status(400).json({ error: 'Missing required student parameters' });
  }

  const OMNIROUTE_BASE_URL = process.env.OMNIROUTE_BASE_URL || 'https://api.omniroute.ai/v1';
  const OMNIROUTE_API_KEY = process.env.OMNIROUTE_API_KEY || '';

  const systemPrompt = `You are an elite academic curriculum architect and technical hiring gap analyzer. 
Analyze the candidate profile and return STRICT RAW JSON ONLY (no markdown backticks, no wrapping text).
Output schema MUST match this format exactly:
{
  "readiness": <integer 25-50 based on entry level>,
  "curriculumMastery": <integer 20-45>,
  "conceptDeficits": <integer 55-80>,
  "matchedSkills": ["<skill1>", "<skill2>", "<skill3>"],
  "missingSkills": [
    {
      "name": "<skill name>",
      "tag": "Critical Void",
      "capstoneTitle": "<title>",
      "capstoneDesc": "<2 sentence lab blueprint>"
    }
  ],
  "radar": {
    "categories": ["Frontend", "Backend APIs", "System Design", "Databases", "DevOps", "Testing"],
    "candidate": [<s1>, <s2>, <s3>, <s4>, <s5>, <s6>],
    "benchmark": [90, 85, 80, 85, 75, 75]
  },
  "phases": [
    {
      "phaseTitle": "Phase 1: Core Fundamentals & Prerequisite Labs",
      "milestones": [
        { "id": "m1", "title": "<milestone task>", "hours": "8 hrs", "resource": "<doc or repo>", "completed": false, "xp": 100 }
      ]
    },
    {
      "phaseTitle": "Phase 2: Production Implementations & Architecture",
      "milestones": [
        { "id": "m2", "title": "<milestone task>", "hours": "14 hrs", "resource": "<doc or repo>", "completed": false, "xp": 150 }
      ]
    }
  ]
}`;

  const userPrompt = `Candidate: ${name}
Current Academic Level: ${academicLevel}
Career Goal: ${careerGoal}
Tenure / Urgency Window: ${tenure}
GitHub Profile: ${github || 'None'}
Verified Codebase Skills: ${detectedSkills && detectedSkills.length ? detectedSkills.join(', ') : 'Standard Academic Foundation'}

Construct their tailored phased roadmap now. Output raw JSON only.`;

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
    let raw = completion.choices?.[0]?.message?.content || '{}';
    raw = raw.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    return res.status(200).json(JSON.parse(raw));
  } catch (err) {
    return res.status(500).json({ error: 'AI Gateway Error', details: err.message });
  }
}
