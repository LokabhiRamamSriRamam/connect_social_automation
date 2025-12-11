export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send("<h1>Inshorts News API</h1>");
}
