import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, academicLevel, careerGoal, currentKnowledge, tenure, github } = req.body;
  if (!name || !careerGoal || !currentKnowledge) {
    return res.status(400).json({ error: 'Missing required profile telemetry.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are the lead academic curriculum architect for Align-X.
Create a personalized learning roadmap for a student from ANY educational background transitioning into their dream role.

Student Profile:
- Name: ${name}
- Academic Level: ${academicLevel}
- Dream Job / Target Role: ${careerGoal}
- Current Knowledge & Background: ${currentKnowledge}
- Timeline / Tenure: ${tenure}
- GitHub: ${github || 'None'}

Return ONLY a strict raw JSON object matching this schema (do not use markdown quotes):
{
  "curriculumMastery": 20,
  "conceptDeficits": 80,
  "readiness": 25,
  "targetPace": 75,
  "radar": {
    "categories": ["Domain 1", "Domain 2", "Domain 3", "Domain 4", "Domain 5", "Domain 6"],
    "candidate": [30, 25, 20, 35, 15, 25],
    "benchmark": [85, 85, 80, 90, 75, 80]
  },
  "phases": [
    {
      "phaseTitle": "Phase 1: Foundational Prerequisites",
      "milestones": [
        { "id": "m1-1", "title": "First Core Competency Milestone", "hours": "6 hrs", "desc": "Concrete concept breakdown.", "completed": false, "xp": 100 },
        { "id": "m1-2", "title": "Hands-on Practical Milestone", "hours": "8 hrs", "desc": "Applied project or lab exercise.", "completed": false, "xp": 150 }
      ]
    },
    {
      "phaseTitle": "Phase 2: Core Domain Mastery",
      "milestones": [
        { "id": "m2-1", "title": "Intermediate Advanced Practice", "hours": "10 hrs", "desc": "Building real-world portfolio piece.", "completed": false, "xp": 200 },
        { "id": "m2-2", "title": "Integration & Systems Evaluation", "hours": "12 hrs", "desc": "Stress testing or evaluation review.", "completed": false, "xp": 250 }
      ]
    },
    {
      "phaseTitle": "Phase 3: Production & Industry Benchmark",
      "milestones": [
        { "id": "m3-1", "title": "Capstone Industry Standard Project", "hours": "16 hrs", "desc": "End-to-end deliverable ready for hiring managers.", "completed": false, "xp": 300 }
      ]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text() || '{}';
    raw = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return res.status(200).json(JSON.parse(raw));
  } catch (err) {
    console.error('Gemini Roadmap Generation Error:', err);
    return res.status(500).json({ error: 'AI generation error', details: err.message });
  }
}
