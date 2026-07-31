import http from "http";
import { GoogleGenAI } from "@google/genai";

const PORT = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

let chat = ai.chats.create({
  model: "gemini-3.6-flash",
  config: {
    systemInstruction:
      "Your name is baiyou AI. You are a helpful, intelligent and friendly personal AI assistant."
  }
});

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#171a21">
<link rel="manifest" href="/manifest.json">
<title>baiyou AI</title>

<style>
* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #0f1115;
  color: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  padding: 15px;
  background: #171a21;
  border-bottom: 1px solid #292d36;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

button {
  border: 0;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
}

#new {
  background: #292e38;
  color: white;
}

#messages {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
}

.msg {
  max-width: 85%;
  padding: 12px 15px;
  margin: 10px 0;
  border-radius: 16px;
  white-space: pre-wrap;
  line-height: 1.5;
}

.user {
  margin-left: auto;
  background: #315efb;
}

.ai {
  margin-right: auto;
  background: #1d222b;
}

#bottom {
  padding: 12px;
  background: #171a21;
  display: flex;
  gap: 8px;
}

#input {
  flex: 1;
  resize: none;
  border: 1px solid #343a46;
  background: #0f1115;
  color: white;
  border-radius: 14px;
  padding: 12px;
  font-size: 16px;
  min-height: 48px;
}

#send {
  background: #315efb;
  color: white;
  min-width: 70px;
}

.typing {
  opacity: .7;
}
</style>
</head>

<body>

<header>
  <div class="logo">🤖 baiyou AI</div>
  <button id="new">New Chat</button>
</header>

<div id="messages">
  <div class="msg ai">Hello! I'm baiyou AI. How can I help you?</div>
</div>

<div id="bottom">
  <textarea id="input" placeholder="Message baiyou AI..."></textarea>
  <button id="send">Send</button>
</div>

<script>
const messages = document.getElementById("messages");
const input = document.getElementById("input");
const send = document.getElementById("send");
const newChat = document.getElementById("new");

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

async function sendMessage() {
  const text = input.value.trim();

  if (!text) return;

  input.value = "";
  addMessage(text, "user");

  const thinking = addMessage("Thinking...", "ai typing");
  send.disabled = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    thinking.textContent = data.reply;
    thinking.className = "msg ai";

  } catch (error) {
    thinking.textContent = "Error: " + error.message;
    thinking.className = "msg ai";
  }

  send.disabled = false;
  input.focus();
}

send.addEventListener("click", sendMessage);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

newChat.addEventListener("click", async () => {
  await fetch("/api/new", {
    method: "POST"
  });

  messages.innerHTML = "";
  addMessage("New conversation started. 👋", "ai");
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
</script>

</body>
</html>`;

const server = http.createServer(async (req, res) => {

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8"
    });

    res.end(html);
    return;
  }

  if (req.method === "GET" && req.url === "/manifest.json") {
    res.writeHead(200, {
      "Content-Type": "application/manifest+json"
    });

    res.end(JSON.stringify({
      name: "baiyou AI",
      short_name: "baiyou",
      start_url: "/",
      display: "standalone",
      background_color: "#0f1115",
      theme_color: "#171a21",
      description: "baiyou AI personal assistant"
    }));

    return;
  }

  if (req.method === "GET" && req.url === "/sw.js") {
    res.writeHead(200, {
      "Content-Type": "application/javascript"
    });

    res.end(`
      const CACHE = "baiyou-v1";

      self.addEventListener("install", event => {
        event.waitUntil(
          caches.open(CACHE).then(cache => cache.addAll(["/"]))
        );
      });

      self.addEventListener("fetch", event => {
        event.respondWith(
          caches.match(event.request)
            .then(cached => cached || fetch(event.request))
        );
      });
    `);

    return;
  }

  if (req.method === "POST" && req.url === "/api/new") {
    chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction:
          "Your name is baiyou AI. You are a helpful, intelligent and friendly personal AI assistant."
      }
    });

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
        const data = JSON.parse(body);
        const message = data.message?.trim();

        if (!message) {
          throw new Error("Message is empty.");
        }

        const response = await chat.sendMessage({
          message
        });

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          reply: response.text
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
  res.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("========================================");
  console.log("       🤖 baiyou AI Web App");
  console.log("========================================");
  console.log("Open:");
  console.log("http://127.0.0.1:" + PORT);
  console.log("========================================");
});
