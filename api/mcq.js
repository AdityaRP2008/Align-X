import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { careerGoal, currentTopic, completedCount } = req.body || {};
  const goal = careerGoal || "Specialist";
  const topic = currentTopic || "Foundational Principles";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.4-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an expert examination examiner creating certification-grade assessment questions.
Create exactly ONE challenging multiple-choice question tailored specifically to the career goal "${goal}" and focused on the topic "${topic}".
Difficulty level: Question index #${(completedCount || 0) + 1}.

Requirements:
- The question must be deeply technical, clinical, or domain-specific to "${goal}".
- 3 plausible options labeled index 0, 1, and 2.
- Identify the correct option index (0, 1, or 2).
- Provide a rigorous, educational explanation of the correct concept.

Output ONLY a raw JSON object matching this schema (no markdown, no backticks):
{
  "q": "Detailed technical or clinical question text?",
  "topic": "${topic}",
  "options": [
    "Plausible option A",
    "Plausible option B",
    "Plausible option C"
  ],
  "correct": 0,
  "explanation": "Concrete technical explanation of why this option is correct."
}`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text() || "{}";
    rawText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(rawText);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("MCQ Generation Error:", err);
    return res.status(500).json({
      error: "AI MCQ generation failed",
      details: err.message
    });
  }
}
