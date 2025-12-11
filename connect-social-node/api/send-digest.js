import { getNews } from "./_utils/inshorts.js";
import { setCache } from "./_utils/cache.js";

export default async function handler(req, res) {
  const news = await getNews("technology");
  const list = news.data;

  if (!list.length) return res.status(200).json({ message: "No news found" });

  let message = "**Tech News Digest - Today's Headlines**\n\n";
  list.forEach((item, i) => {
    message += `**${i + 1}.** ${item.title}\n`;
  });

  message += "\n---\nReply with a number (e.g. *1*) to get the full article.";

  const tgRes = await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: message,
        parse_mode: "Markdown"
      })
    }
  );

  const json = await tgRes.json();
  const msgId = json?.result?.message_id;

  // Store in memory instead of Redis
  setCache(msgId, list);

  return res.status(200).json({ ok: true, messageId: msgId });
}
