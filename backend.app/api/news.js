import { getNews } from "../utils/inshorts.js";

export default async function handler(req, res) {
  // ✅ Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { category = "all" } = req.query;

  try {
    const news = await getNews(category);
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: error.message
    });
  }
}
