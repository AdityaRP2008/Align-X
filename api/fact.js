import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { careerGoal, currentKnowledge, academicLevel } = req.body || {};
  const goal = careerGoal || "Cardiologist";
  const knowledge = currentKnowledge || "Core curriculum";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured on Vercel." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const prompt = `You are the lead academic knowledge architect at Align-X Academy.
Provide exactly ONE fascinating, surprising, highly specific, and authoritative industry insight, historical breakthrough, or practical rule-of-thumb specifically for someone studying to become a "${goal}".

Student Background Context:
- Background Knowledge: "${knowledge}"
- Academic Level: "${academicLevel || 'Student'}"

Guidelines:
- Length: 1 to 2 concise sentences (max 35 words).
- Make it punchy, technical, and educational for "${goal}".
- Do not add quotes, markdown formatting, or prefaces like "Did you know". Just output the raw statement.`;

    const result = await model.generateContent(prompt);
    const factText = result.response.text().trim();

    return res.status(200).json({ fact: factText });
  } catch (err) {
    console.error("Gemini Fact API Error:", err);
    return res.status(500).json({ 
      error: "Fact generation failed", 
      details: err.message 
    });
  }
}
