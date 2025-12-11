// src/pages/api/generatePost.js
// --- REMOVE THIS LINE: import fetch from "node-fetch";

// Replace with your Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // ✅ Handle preflight OPTIONS request

  if (req.method === "OPTIONS") {
    res.status(204).end(); // 204 No Content is best for preflight
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  } // Safely parse body (Vercel may send string)

  let body;
  try {
    body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
  } catch (err) {
    return res.status(400).json({ success: false, error: "Invalid JSON body" });
  }
  const { news, socials } = body; // Use the safely parsed 'body' here // After

  if (
    !news ||
    typeof news !== "object" ||
    !Array.isArray(socials) ||
    socials.length === 0
  ) {
    return res
      .status(400)
      .json({ success: false, error: "Missing news object or socials array" });
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
1.  Return a JSON object with keys as platforms ("LinkedIn" and "X") and values as the final, copy-paste-ready post text.
2.  **For the LinkedIn Post (HIGHLY ENGAGING and PROFESSIONAL):**
    * Start with a **bold headline** that captures the reader's attention and includes relevant emojis.
    * Use generous line breaks (empty lines) instead of /n to make the post highly scannable and easy to read.
    * Use emojis appropriately to enhance the message.
    * Maintain a professional yet conversational tone, talking directly to the reader (e.g., "Hello, #LinkedIn community!").
    * Include a prompt for professional engagement/discussion (e.g., "What does Apple's accelerated retail footprint mean...").
    * **Crucially, end the post with the required CTAs for the Connect-Gen AI page:**
        * A CTA for the full news story (using the URL from the news data).
        * A CTA to connect/deep dive into industry trends related to Gen AI/tech.
    * Use relevant hashtags, including #ConnectGenAI.
3.  **For the X Post (CONCISE and Viral):**
    * Be brief, concise, and catchy.
    * Use relevant emojis.
    * Include the news URL (Read more link).
    * Use relevant, trending hashtags.

Platforms: LinkedIn, X

Return a JSON object with keys as platforms and values as the post text.
`; // --- UPDATED CODE FOR GEMINI API INTERACTION ---

    const GEMINI_MODEL = "gemini-2.5-flash"; // NOTE: Using the global 'fetch' function now

    const geminiResponse = await fetch(
      // 1. CORRECT ENDPOINT: Using the official Google AI endpoint with the API key in the query string
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // 3. CORRECT PAYLOAD STRUCTURE
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json", // Request JSON output
          },
        }),
      }
    ); // Check for non-200 status from the Gemini API itself

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({
        error: { message: "Failed to parse API error response." },
      }));
      console.error("External API Error:", errorData); // Throw a descriptive error to be caught by the outer catch block
      throw new Error(
        `Gemini API call failed with status ${geminiResponse.status}: ${
          errorData?.error?.message || "Unknown error"
        }`
      );
    }

    const data = await geminiResponse.json(); // 4. CORRECT RESPONSE PARSING: Extracting text from the official Gemini REST API format

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let posts = {};
    try {
      // Clean up text by removing potential markdown fences (```json...```)
      const cleanText = text
        .trim()
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
      posts = JSON.parse(cleanText);
    } catch (err) {
      console.error("JSON Parsing Error:", err); // fallback: return entire generated text as "generic" if JSON fails
      posts = {
        generic: text,
        error: "Failed to parse JSON response from AI.",
      };
    }

    res.status(200).json({ success: true, posts });
  } catch (err) {
    console.error("API Processing error:", err); // Send a 500 status with the error message from the try block
    res.status(500).json({
      success: false,
      error: "Internal Server Error during AI processing",
      message: err.message,
    });
  }
}
