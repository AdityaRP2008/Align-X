export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, email, studentData } = req.body || {};
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase environment variables not configured on server." });
  }

  const cleanUrl = supabaseUrl.replace(/\/$/, "");

  try {
    if (action === "get") {
      const response = await fetch(`${cleanUrl}/rest/v1/students?email=eq.${encodeURIComponent(email)}&select=*`, {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`
        }
      });
      const rows = await response.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return res.status(200).json({ student: rows[0] });
      }
      return res.status(404).json({ message: "Student record not found" });
    }

    if (action === "save" && studentData) {
      const response = await fetch(`${cleanUrl}/rest/v1/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(studentData)
      });
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error("Auth API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
