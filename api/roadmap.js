import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // CORS & Method Check
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, name, academicLevel, careerGoal, currentKnowledge, tenure, github } = req.body || {};
  if (!name || !careerGoal || !currentKnowledge) {
    return res.status(400).json({ error: "Missing required student telemetry (name, careerGoal, currentKnowledge)." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured in Vercel." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are the lead academic curriculum architect for Align-X Academy.
Generate a tailored, professional, multi-phase academic curriculum and skill radar matrix for this student based on their educational background and target dream job.

Student Telemetry:
- Full Name: ${name}
- Current Education / Academic Field: ${academicLevel || "Undergraduate"}
- Target Dream Job: ${careerGoal}
- Current Knowledge & Skills (in their own words): "${currentKnowledge}"
- Target Sprint Timeline: ${tenure || "12 Months"}
- GitHub: ${github || "None"}

Requirements:
1. Create exactly 3 sequential phases relevant directly to "${careerGoal}", starting from what they know and advancing to production-ready skills.
2. Each phase must contain between 2 to 4 actionable, concrete milestones.
3. Choose 6 domain competencies for the radar matrix specific to "${careerGoal}".
4. Calculate curriculumMastery (0-30 based on what they already know), conceptDeficits (100 - mastery), and readiness (15-35).

Output strictly raw, valid JSON matching this schema:
{
  "curriculumMastery": 15,
  "conceptDeficits": 85,
  "readiness": 20,
  "targetPace": 75,
  "radar": {
    "categories": ["Domain 1", "Domain 2", "Domain 3", "Domain 4", "Domain 5", "Domain 6"],
    "candidate": [25, 20, 15, 10, 20, 15],
    "benchmark": [90, 85, 85, 80, 80, 75]
  },
  "phases": [
    {
      "phaseTitle": "Phase 1: Foundational Core",
      "milestones": [
        {
          "id": "m1-1",
          "title": "Milestone Title",
          "hours": "8 hrs",
          "desc": "Specific hands-on outcome.",
          "completed": false,
          "xp": 120
        }
      ]
    },
    {
      "phaseTitle": "Phase 2: Applied Systems",
      "milestones": [
        {
          "id": "m2-1",
          "title": "Milestone Title",
          "hours": "12 hrs",
          "desc": "Specific hands-on outcome.",
          "completed": false,
          "xp": 200
        }
      ]
    },
    {
      "phaseTitle": "Phase 3: Production & Industry Benchmark",
      "milestones": [
        {
          "id": "m3-1",
          "title": "Milestone Title",
          "hours": "16 hrs",
          "desc": "Specific hands-on outcome.",
          "completed": false,
          "xp": 300
        }
      ]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text() || "{}";
    rawText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const generated = JSON.parse(rawText);

    // Persist directly into Supabase via REST API if environment variables are present
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
          readiness: generated.readiness || 25,
          curriculum_mastery: generated.curriculumMastery || 0,
          concept_deficits: generated.conceptDeficits || 100,
          target_pace: generated.targetPace || 75,
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
        console.warn("Supabase server-side persist failed:", dbErr.message);
      }
    }

    return res.status(200).json(generated);
  } catch (err) {
    console.error("Gemini Roadmap Generation Error:", err);
    return res.status(500).json({ error: "Gemini synthesis error", details: err.message });
  }
}
