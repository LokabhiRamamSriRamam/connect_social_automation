import { getNews } from "../utils/inshorts.js";

export default async function handler(req, res) {
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
