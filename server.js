import http from "http";



import fs from "fs";
import Groq from "groq-sdk";

const PORT = process.env.PORT || 3000;

if (!process.env.GROQ_API_KEY) {
  console.log("Missing GROQ_API_KEY");
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

let messages = [
  {
    role: "system",
    content:
      "Your name is baiyou AI. You are a helpful, intelligent and friendly personal AI assistant."
  }
];

const server = http.createServer(async (req, res) => {

  if (req.method === "GET" && req.url === "/") {
    const html = fs.readFileSync("./index.html");
    res.writeHead(200, {
      "Content-Type": "text/html"
    });
    res.end(html);
    return;
  }

  if (req.method === "GET" && req.url === "/style.css") {
    const css = fs.readFileSync("./style.css");
    res.writeHead(200, {
      "Content-Type": "text/css"
    });
    res.end(css);
    return;
  }

  if (req.method === "GET" && req.url === "/app.js") {
    const js = fs.readFileSync("./app.js");
    res.writeHead(200, {
      "Content-Type": "application/javascript"
    });
    res.end(js);
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const { message } = JSON.parse(body);

        messages.push({
          role: "user",
          content: message
        });

        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages
        });

        const reply = completion.choices[0].message.content;

        messages.push({
          role: "assistant",
          content: reply
        });

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          reply
        }));

      } catch (error) {
        res.writeHead(500, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          error: error.message
        }));
      }
    });

    return;
  }

  res.writeHead(404);
  res.end("Not Found");

});


server.listen(PORT, () => {
  console.log("==============================");
  console.log("🤖 Baiyou AI Started");
  console.log("Port:", PORT);
  console.log("==============================");
});
