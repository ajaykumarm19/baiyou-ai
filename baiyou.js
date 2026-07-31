import { GoogleGenAI } from "@google/genai";
import readline from "readline";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const chat = ai.chats.create({
  model: "gemini-3.6-flash",
  config: {
    systemInstruction:
      "Your name is baiyou AI. You are a helpful, intelligent and friendly personal AI assistant."
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("========================================");
console.log("          🤖 baiyou AI Ready!");
console.log("========================================");
console.log("Type exit to stop.");

function ask() {
  rl.question("\nYou: ", async (message) => {
    const text = message.trim();

    if (text.toLowerCase() === "exit") {
      console.log("baiyou AI: Goodbye!");
      rl.close();
      return;
    }

    if (!text) {
      ask();
      return;
    }

    try {
      const response = await chat.sendMessage({
        message: text
      });

      console.log("\nbaiyou AI:", response.text);
    } catch (error) {
      console.error("\nAPI Error:", error.message);
    }

    ask();
  });
}

ask();
