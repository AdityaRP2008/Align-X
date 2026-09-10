import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, studentContext } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required.' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const systemInstruction = `You are the Align-X AI Tutor and Mentor.
Guide the student clearly and practically toward their target dream job.
Student Context:
- Name: ${studentContext?.name || 'Scholar'}
- Dream Job: ${studentContext?.career_goal || 'Professional Specialist'}
- Background: ${studentContext?.current_knowledge || 'Undergraduate'}
- Curriculum Mastery: ${studentContext?.curriculum_mastery || 0}%
- Career Readiness: ${studentContext?.readiness || 0}%
Answer questions directly with actionable insights, step-by-step guidance, and real-world clarity.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction
    });

    const result = await model.generateContent(message);
    const reply = result.response.text() || "Keep up your focused study cadence!";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Gemini Tutor Error:', err);
    return res.status(500).json({ error: 'AI Tutor service error', details: err.message });
  }
}
