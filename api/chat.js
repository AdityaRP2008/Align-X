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

    const dynamicPrompt = `You are the lead academic tutor and industry mentor at Align-X Academy.
Answer the student's question accurately, directly, and specifically for their target goal.

Student Profile:
- Student Name: ${studentContext?.name || "Student"}
- Educational Field / Degree: ${studentContext?.academic_level || "Undergraduate"}
- Target Goal / Dream Career: ${studentContext?.career_goal || "Professional"}
- Background Knowledge: "${studentContext?.current_knowledge || "Not specified"}"
- Active Phases & Milestones: ${activeMilestones || "Custom sprint"}
- Curriculum Mastery: ${studentContext?.curriculum_mastery || 0}%
- Career Readiness Score: ${studentContext?.readiness || 0}%

Student's Question:
"${message.trim()}"

Instructions:
1. Provide a clear, actionable, accurate explanation of the concept or answer to their question.
2. Relate the concept directly back to their target goal (${studentContext?.career_goal || "their career"}).
3. If they ask about terms like "cash burn", "B+ trees", "LLMs", or "market gaps", give concrete definitions, formulas/examples, and explain how it affects their sprint or milestones.
4. Keep the answer structured, concise, and easy to read using markdown bullet points or bold text where appropriate. Do not return generic one-liner placeholders.`;

    const result = await model.generateContent(dynamicPrompt);
    const candidate = result.response;
    const replyText = candidate.text();

    if (!replyText || !replyText.trim()) {
      return res.status(200).json({ reply: "I reviewed your syllabus milestone. Could you rephrase your question with any specific scenario?" });
    }

    return res.status(200).json({ reply: replyText });
  } catch (err) {
    console.error("Gemini Tutor Handler Error:", err);
    return res.status(500).json({ 
      error: "Gemini error", 
      details: err.message,
      reply: `Tutor connection error: ${err.message}. Please check that your GEMINI_API_KEY is active in Vercel.`
    });
  }
}
