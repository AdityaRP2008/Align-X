import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, studentContext } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const systemPrompt = `You are the personal AI Academic Tutor and Career Mentor at Align-X Academy.
Your student is:
- Name: ${studentContext?.name || "Student"}
- Educational Field: ${studentContext?.academic_level || "Undergraduate"}
- Target Dream Job: ${studentContext?.career_goal || "AI / Software Specialist"}
- Background & Current Knowledge: "${studentContext?.current_knowledge || "Foundational knowledge"}"
- Curriculum Mastery: ${studentContext?.curriculum_mastery || 0}%
- Career Readiness: ${studentContext?.readiness || 0}%

Answer questions in a supportive, technical, and grounded tone. Provide direct, step-by-step guidance, code snippets if relevant, and practical next steps for their career goal. Keep responses concise and focused.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(message);
    const reply = result.response.text() || "I'm reviewing your curriculum milestones. What specific topic would you like to explore?";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Gemini Tutor Error:", err);
    return res.status(500).json({ error: "AI Tutor service error", details: err.message });
  }
}
