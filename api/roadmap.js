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
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are the chief academic curriculum architect for Align-X Academy.
Create an extensive, professional, comprehensive academic curriculum roadmap for a candidate transitioning from their background into their dream job.

Student Telemetry:
- Full Name: ${name}
- Current Education / Degree: ${academicLevel || "Undergraduate"}
- Target Goal / Dream Job: ${careerGoal}
- Current Knowledge & Baseline: "${currentKnowledge}"
- Target Timeline / Tenure: ${tenure || "12 Months"}
- GitHub: ${github || "None"}

CRITICAL STRUCTURAL CONSTRAINTS:
1. Generate between 4 to 6 sequential phases (e.g., Phase 1: Core Prerequisite Foundations, Phase 2: Intermediate Systems & Diagnostics, Phase 3: Applied Industry Workflows, Phase 4: Production Hardening, Phase 5: Capstone Certification / Benchmark).
2. Each phase MUST contain between 4 to 6 detailed, practical, actionable milestones. NEVER return fewer than 4 milestones per phase.
3. Every milestone must have an explicit realistic study duration (e.g., "12 hrs", "18 hrs", "24 hrs") and a concrete deliverable description.
4. Select 6 domain categories for the skills radar specific to "${careerGoal}".
5. Set curriculumMastery to 0, conceptDeficits to 100, and readiness to 0.

Output strictly raw, valid JSON matching this schema:
{
  "curriculumMastery": 0,
  "conceptDeficits": 100,
  "readiness": 0,
  "targetPace": 0,
  "radar": {
    "categories": ["Domain 1", "Domain 2", "Domain 3", "Domain 4", "Domain 5", "Domain 6"],
    "candidate": [20, 15, 10, 15, 10, 15],
    "benchmark": [90, 85, 85, 90, 80, 85]
  },
  "phases": [
    {
      "phaseTitle": "Phase 1: Foundational Prerequisites",
      "milestones": [
        { "id": "p1-1", "title": "Milestone 1 Title", "hours": "14 hrs", "desc": "Concrete description of theoretical and applied focus.", "completed": false, "xp": 120 },
        { "id": "p1-2", "title": "Milestone 2 Title", "hours": "16 hrs", "desc": "Concrete description of practical drill and lab.", "completed": false, "xp: 140 },
        { "id": "p1-3", "title": "Milestone 3 Title", "hours": "12 hrs", "desc": "Core methodology validation and diagnostics.", "completed": false, "xp": 120 },
        { "id": "p1-4", "title": "Milestone 4 Title", "hours": "18 hrs", "desc": "Initial synthesis deliverable and review.", "completed": false, "xp": 150 }
      ]
    },
    {
      "phaseTitle": "Phase 2: Core Domain Practice",
      "milestones": [
        { "id": "p2-1", "title": "Milestone 1 Title", "hours": "16 hrs", "desc": "Applied intermediate frameworks.", "completed": false, "xp": 180 },
        { "id": "p2-2", "title": "Milestone 2 Title", "hours": "20 hrs", "desc": "Systemic procedures and protocols.", "completed": false, "xp": 200 },
        { "id": "p2-3", "title": "Milestone 3 Title", "hours": "18 hrs", "desc": "Failure analysis and stress mitigation.", "completed": false, "xp": 190 },
        { "id": "p2-4", "title": "Milestone 4 Title", "hours": "22 hrs", "desc": "Integrated case review and portfolio item.", "completed": false, "xp": 220 }
      ]
    },
    {
      "phaseTitle": "Phase 3: Advanced Systems & Integration",
      "milestones": [
        { "id": "p3-1", "title": "Milestone 1 Title", "hours": "20 hrs", "desc": "Deep clinical/technical evaluation.", "completed": false, "xp": 240 },
        { "id": "p3-2", "title": "Milestone 2 Title", "hours": "24 hrs", "desc": "Complex cross-domain workflows.", "completed": false, "xp": 260 },
        { "id": "p3-3", "title": "Milestone 3 Title", "hours": "18 hrs", "desc": "Quality assurance and protocol audits.", "completed": false, "xp": 220 },
        { "id": "p3-4", "title": "Milestone 4 Title", "hours": "22 hrs", "desc": "End-to-end integration project.", "completed": false, "xp": 250 }
      ]
    },
    {
      "phaseTitle": "Phase 4: Production & Benchmark Clearance",
      "milestones": [
        { "id": "p4-1", "title": "Milestone 1 Title", "hours": "24 hrs", "desc": "Simulated board/hiring assessment.", "completed": false, "xp": 280 },
        { "id": "p4-2", "title": "Milestone 2 Title", "hours": "28 hrs", "desc": "Production-grade deliverable under time pressure.", "completed": false, "xp: 320 },
        { "id": "p4-3", "title": "Milestone 3 Title", "hours": "20 hrs", "desc": "Comprehensive gap closure documentation.", "completed": false, "xp": 250 },
        { "id": "p4-4", "title": "Milestone 4 Title", "hours": "30 hrs", "desc": "Capstone verification ready for hiring clearance.", "completed": false, "xp": 350 }
      ]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text() || "{}";
    rawText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const generated = JSON.parse(rawText);

    // Persist into Supabase
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
