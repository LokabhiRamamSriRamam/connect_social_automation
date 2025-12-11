// api/_utils/inshorts.js
import fetch from "node-fetch";

export async function getNews(category) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Content-Type": "application/json",
    "Referer": "https://inshorts.com/en/read",
  };

  const params = new URLSearchParams({
    category: "top_stories",
    max_limit: "50",
    include_card_data: "true"
  });

  let url = "";

  if (category === "all") {
    url = "https://inshorts.com/api/en/news?category=all_news&max_limit=10&include_card_data=true";
  } else {
    url = `https://inshorts.com/api/en/search/trending_topics/${category}?${params.toString()}`;
  }

  const response = await fetch(url, { headers });
  const data = await response.json();

  const newsList = data?.data?.news_list;
  if (!newsList) {
    return {
      success: false,
      category,
      error: "Invalid Category",
      data: []
    };
  }

  const parsed = [];

  for (const entry of newsList) {
    try {
      const n = entry.news_obj;

      const timestamp = n.created_at / 1000;
      const dateObj = new Date(timestamp * 1000);

      const ist = dateObj.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const time = dateObj.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      parsed.push({
        id: crypto.randomUUID(),
        title: n.title,
        imageUrl: n.image_url,
        url: n.shortened_url,
        content: n.content,
        author: n.author_name,
        date: ist,
        time: time.toLowerCase(),
        readMoreUrl: n.source_url,
      });
    } catch (err) {
      console.log("Parsing error:", err);
    }
  }

  return {
    success: true,
    category,
    data: parsed
  };
}
