// api/news.js
import { getNews } from "./_utils/inshorts.js";

export default async function handler(req, res) {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({
      error: "Please add category in query params"
    });
  }

  const data = await getNews(category);
  return res.status(200).json(data);
}
