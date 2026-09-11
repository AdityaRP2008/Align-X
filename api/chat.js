import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, studentContext } = req.body || {};
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "A message string is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on Vercel." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    const activeMilestones = (studentContext?.phases || [])
      .map((p, idx) => `Phase ${idx + 1} (${p.phaseTitle}): ${(p.milestones || []).map(m => m.title).join(", ")}`)
      .join(" | ");

    const dynamicPrompt = `You are the specialized academic career mentor and technical tutor for Align-X Academy.

Student Profile:
- Name: ${studentContext?.name || "Student"}
- Career Goal: ${studentContext?.career_goal || "Professional"}
- Background Knowledge: "${studentContext?.current_knowledge || "Not specified"}"
- Active Syllabus Milestones: ${activeMilestones || "Custom track"}

CRITICAL OUT-OF-CONTEXT GUARDRAIL RULE:
- Evaluate the student's question: "${message.trim()}".
- If the question is NOT directly related to their career goal (${studentContext?.career_goal || "their technical domain"}), academic concepts, engineering/medical topics, software architecture, study habits, or professional roadmaps (for example: cooking recipes, pop culture, entertainment, video games, jokes, general small talk, politics, sports, celebrity gossip):
  DO NOT answer the question.
  DO NOT attempt to forcefully link, relate, or construct analogies connecting the unrelated query to ${studentContext?.career_goal || "their course"}.
  Respond ONLY with:
  "I am your specialized career tutor for ${studentContext?.career_goal || "your academic track"}. I can only assist with technical concepts, syllabus milestones, and career preparation related to your goal. Please ask a topic related to your coursework."

IN-CONTEXT RESPONSE GUIDELINES:
1. If the question IS relevant, provide a concise, rigorous, technical, and educational response.
2. Provide step-by-step clarity, formulas, code snippets, or clinical diagnostics when applicable.
3. Keep answers formatted cleanly using bold headers and markdown bullets.`;

    const result = await model.generateContent(dynamicPrompt);
    const replyText = result.response.text();

    return res.status(200).json({ reply: replyText || "Could you please rephrase your academic question?" });
  } catch (err) {
    console.error("Gemini Tutor Handler Error:", err);
    return res.status(500).json({ 
      error: "Gemini error", 
      details: err.message,
      reply: "Tutor service temporarily unavailable. Please verify connection."
    });
  }
}
