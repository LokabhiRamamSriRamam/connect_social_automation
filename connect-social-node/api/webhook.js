// api/webhook.js
import { getNews } from "./_utils/inshorts.js";
import { getCache, setCache } from "./_utils/cache.js";

export default async function handler(req, res) {
  console.log("Webhook hit! Body:", JSON.stringify(req.body, null, 2));
  const update = req.body;

  // If this is a normal user message
  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text?.trim();

    // 1️⃣ USER ASKED FOR NEWS
    if (text === "!news") {
      const news = await getNews("technology");
      const list = news.data;

      if (!list.length) {
        await sendTelegram(chatId, "No news found today.");
        return res.status(200).json({ ok: true });
      }

      let message = "*Tech News — Today's Top Headlines*\n\n";
      list.forEach((item, i) => {
        message += `*${i + 1}.* ${item.title}\n`;
      });

      message += "\nReply with a number to read the full article.";

      const tgRes = await sendTelegram(chatId, message);
      const json = await tgRes.json();

      const msgId = json?.result?.message_id;

      // Cache headlines for reply-to
      setCache(msgId, list);

      return res.status(200).json({ ok: true });
    }

    // 2️⃣ HANDLE REPLY MESSAGE (USER SENT A NUMBER)
    if (update.message.reply_to_message) {
      const repliedMsgId = update.message.reply_to_message.message_id;
      const list = getCache(repliedMsgId);

      if (!list) {
        await sendTelegram(chatId, "Sorry, this digest has expired.");
        return res.status(200).json({ status: "expired" });
      }

      const index = parseInt(text) - 1;

      if (isNaN(index) || index < 0 || index >= list.length) {
        await sendTelegram(chatId, "Invalid number. Please send a valid headline number.");
        return res.status(200).json({ status: "invalid" });
      }

      const item = list[index];
      const fullText = `*${item.title}*\n\n${item.content}\n\n_Read more: ${item.readMoreUrl}_`;

      await sendTelegram(chatId, fullText);

      return res.status(200).json({ ok: true });
    }
  }

  // No relevant message → ignore
  return res.status(200).json({ status: "ignored" });
}


// Send Telegram Message
async function sendTelegram(chatId, text) {
  return fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown"
      })
    }
  );
}
