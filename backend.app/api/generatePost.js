// src/pages/api/generatePost.js
import fetch from "node-fetch";

// Replace with your Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

// ✅ Handle preflight OPTIONS request
if (req.method === "OPTIONS") {
  res.status(204).end(); // 204 No Content is best for preflight
  return;
}


  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

    // ✅ Safely parse body (Vercel may send string)
  let body;
  try {
    body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
  } catch (err) {
    return res.status(400).json({ success: false, error: "Invalid JSON body" });
  }
  
  const { news, socials } = req.body;

 // After
if (!news || typeof news !== "object" || !Array.isArray(socials) || socials.length === 0) {
  return res.status(400).json({ success: false, error: "Missing news object or socials array" });
}

  try {
    // Construct Gemini prompt
const prompt = `
You are a social media content creator for a Connect-Gen AI page, specializing in professional and engaging tech content.

Create posts for the following news article on the two requested platforms: LinkedIn and X.

**News Article Data:**
Title: ${news.title}
Content: ${news.content || ""}
URL: ${news.readMoreUrl || news.url || ""}

**Output Requirements:**
1.  Return a JSON object with keys as platforms ("LinkedIn" and "X") and values as the final, copy-paste-ready post text.
2.  **For the LinkedIn Post (HIGHLY ENGAGING and PROFESSIONAL):**
    * Start with a **bold headline** that captures the reader's attention and includes relevant emojis.
    * Use generous line breaks (empty lines) instead of /n to make the post highly scannable and easy to read.
    * Use emojis appropriately to enhance the message.
    * Maintain a professional yet conversational tone, talking directly to the reader (e.g., "Hello, #LinkedIn community!").
    * Include a prompt for professional engagement/discussion (e.g., "What does Apple's accelerated retail footprint mean...").
    * **Crucially, end the post with the required CTAs for the Connect-Gen AI page:**
        * A CTA for the full news story (using the URL from the news data).
        * A CTA to connect/deep dive into industry trends related to Gen AI/tech.
    * Use relevant hashtags, including #ConnectGenAI.
3.  **For the X Post (CONCISE and Viral):**
    * Be brief, concise, and catchy.
    * Use relevant emojis.
    * Include the news URL (Read more link).
    * Use relevant, trending hashtags.

Platforms: LinkedIn, X

Return a JSON object with keys as platforms and values as the post text.
`;

    const geminiResponse = await fetch("https://gemini.api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        input: prompt
      })
    });

    const data = await geminiResponse.json();

    // Assuming Gemini response returns content in data.output_text or similar
    // You may need to adjust depending on Gemini API response structure
    const text = data.output_text || data.output?.[0]?.content?.[0]?.text || "";

    // Parse JSON from Gemini if it returns JSON text
    let posts = {};
    try {
      posts = JSON.parse(text);
    } catch (err) {
      // fallback: return entire generated text as "generic"
      posts = { generic: text };
    }

    res.status(200).json({ success: true, posts });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ success: false, error: "Gemini API Error", message: err.message });
  }
}
