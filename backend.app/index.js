export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html");

  res.status(200).send(`
    <html>
      <head>
        <title>Inshorts News API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: #fafafa;
          }
          code {
            background: #eee;
            padding: 4px 6px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <h1>Inshorts News API</h1>
        <p>Welcome! Use the API endpoint below to fetch news:</p>
        
        <p>
          <strong>GET:</strong> 
          <code>/api/news?category=all</code>
        </p>

        <p>Available categories include:
          <code>all</code>, <code>technology</code>, <code>sports</code>, 
          <code>business</code>, <code>world</code>, <code>politics</code>, etc.
        </p>

        <p>Example:</p>
        <code>https://your-vercel-app.vercel.app/api/news?category=technology</code>

        <br><br>
        <p>🚀 Hosted on Vercel</p>
      </body>
    </html>
  `);
}
