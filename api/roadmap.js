import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, name, academicLevel, careerGoal, currentKnowledge, tenure, github } = req.body || {};
  if (!name || !careerGoal || !currentKnowledge) {
    return res.status(400).json({ error: "Missing required student telemetry." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured in Vercel." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 4096,
        temperature: 0.2
      }
    });

    const prompt = `You are the chief academic curriculum architect for Align-X Academy.
Create an in-depth, rigorous, comprehensive multi-phase curriculum roadmap for a candidate learning: "${careerGoal}".

Student Profile:
- Full Name: ${name}
- Current Education / Degree: ${academicLevel || "Undergraduate"}
- Target Dream Career: ${careerGoal}
- Current Knowledge Baseline: "${currentKnowledge}"
- Target Duration: ${tenure || "12 Months"}
- GitHub: ${github || "None"}

MANDATORY STRUCTURAL RULES (STRICTLY ENFORCED):
1. You MUST generate between 4 to 5 sequential phases.
2. Every single phase MUST contain AT LEAST 5 TO 7 DISTINCT, IN-DEPTH MILESTONES / TOPICS. Never generate only 1, 2, or 3 milestones per phase.
3. Every milestone must have:
   - "id": unique string like "m1-1", "m1-2", etc.
   - "title": Highly specific domain topic name (not generic).
   - "hours": Realistic study target (e.g., "14 hrs", "20 hrs").
   - "desc": Concrete description of theory, lab exercises, and specific clinical/technical deliverables.
   - "completed": false
   - "xp": Integer between 100 and 300.
4. "radar": Provide 6 specific domain competency categories tailored directly to "${careerGoal}".
5. Set "curriculumMastery" to 0, "conceptDeficits" to 100, and "readiness" to 0.

Output strictly valid JSON matching this schema:
{
  "curriculumMastery": 0,
  "conceptDeficits": 100,
  "readiness": 0,
  "targetPace": 0,
  "radar": {
    "categories": ["Domain 1", "Domain 2", "Domain 3", "Domain 4", "Domain 5", "Domain 6"],
    "candidate": [20, 15, 10, 15, 10, 15],
    "benchmark": [95, 90, 90, 85, 80, 90]
  },
  "phases": [
    {
      "phaseTitle": "Phase 1: Foundations & Core Theoretical Mechanisms",
      "milestones": [
        { "id": "m1-1", "title": "Topic 1", "hours": "14 hrs", "desc": "Detailed explanation and practical lab.", "completed": false, "xp": 120 },
        { "id": "m1-2", "title": "Topic 2", "hours": "16 hrs", "desc": "Detailed explanation and practical lab.", "completed": false, "xp": 140 },
        { "id": "m1-3", "title": "Topic 3", "hours": "12 hrs", "desc": "Detailed explanation and practical lab.", "completed": false, "xp": 120 },
        { "id": "m1-4", "title": "Topic 4", "hours": "18 hrs", "desc": "Detailed explanation and practical lab.", "completed": false, "xp": 150 },
        { "id": "m1-5", "title": "Topic 5", "hours": "15 hrs", "desc": "Detailed explanation and practical lab.", "completed": false, "xp": 130 },
        { "id": "m1-6", "title": "Topic 6", "hours": "20 hrs", "desc": "Detailed explanation and practical lab.", "completed": false, "xp": 160 }
      ]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text() || "{}";
    rawText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const generated = JSON.parse(rawText);

    // Persist into Supabase server-side if configured
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey && email) {
      try {
        const studentRecord = {
          email: email,
          name: name,
          academic_level: academicLevel,
          career_goal: careerGoal,
          current_knowledge: currentKnowledge,
          tenure: tenure,
          github: github || "",
          readiness: 0,
          curriculum_mastery: 0,
          concept_deficits: 100,
          target_pace: 0,
          radar: generated.radar,
          phases: generated.phases,
          xp: 0,
          level: 1
        };

        await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/students`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Prefer": "resolution=merge-duplicates"
          },
          body: JSON.stringify(studentRecord)
        });
      } catch (dbErr) {
        console.warn("Supabase server sync warning:", dbErr.message);
      }
    }

    return res.status(200).json(generated);
  } catch (err) {
    console.error("Gemini Roadmap Generation Error:", err);
    return res.status(500).json({ error: "Gemini synthesis error", details: err.message });
  }
}
