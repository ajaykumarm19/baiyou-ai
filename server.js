import http from "http";
import fs from "fs";
import path from "path";
import Groq from "groq-sdk";

const PORT = process.env.PORT || 3000;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

let chatHistory = [
  {
    role: "system",
    content: "Your name is Baiyou AI. You are a helpful, intelligent and friendly AI assistant."
  }
];

function sendFile(file, type, res) {
  fs.readFile(path.join(process.cwd(), file), (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": type
    });

    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {

  if (req.method === "GET" && req.url === "/") {
    return sendFile("index.html", "text/html", res);
  }

  if (req.method === "GET" && req.url === "/style.css") {
    return sendFile("style.css", "text/css", res);
  }

  if (req.method === "GET" && req.url === "/app.js") {
    return sendFile("app.js", "application/javascript", res);
  }

  if (req.method === "GET" && req.url === "/manifest.json") {
    return sendFile("manifest.json", "application/json", res);
  }

  if (req.method === "GET" && req.url === "/sw.js") {
    return sendFile("sw.js", "application/javascript", res);
  }

  if (req.method === "POST" && req.url === "/api/new") {

    chatHistory = [
      {
        role: "system",
        content:
          "Your name is Baiyou AI. You are a helpful, intelligent and friendly AI assistant."
      }
    ];

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      ok: true
    }));

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

        chatHistory.push({
          role: "user",
          content: message
        });

        const completion =
          await groq.chat.completions.create({

            model: "llama-3.3-70b-versatile",

            messages: chatHistory,

            temperature: 0.7

          });

        const reply =
          completion.choices[0].message.content;

        chatHistory.push({
          role: "assistant",
          content: reply
        });

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          reply
        }));

      } catch (err) {

        console.error(err);

        res.writeHead(500, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          error: err.message
        }));

      }

    });

    return;
  }


  res.writeHead(404, {
    "Content-Type": "text/plain"
  });

  res.end("404 - Not Found");

});

server.listen(PORT, "0.0.0.0", () => {
  console.log("================================");
  console.log("🤖 Baiyou AI Started");
  console.log("http://127.0.0.1:" + PORT);
  console.log("================================");
});
