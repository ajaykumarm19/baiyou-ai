const chat = document.getElementById("chat");
const prompt = document.getElementById("prompt");
const send = document.getElementById("send");
const newChat = document.getElementById("newChat");

function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = "message " + type;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
    const message = prompt.value.trim();

    if (!message) return;

    addMessage(message, "user");
    prompt.value = "";

    const thinking = document.createElement("div");
    thinking.className = "message ai";
    thinking.textContent = "Thinking...";
    chat.appendChild(thinking);

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message
            })
        });

        const data = await response.json();

        thinking.textContent = data.reply || data.error;

    } catch (err) {

        thinking.textContent =
            "Error: " + err.message;

    }

    chat.scrollTop = chat.scrollHeight;
}

send.onclick = sendMessage;

prompt.addEventListener("keydown", e => {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

});

newChat.onclick = async () => {

    await fetch("/api/new", {

        method: "POST"

    });

    chat.innerHTML = "";

    addMessage(
        "Hello! I'm Baiyou AI. How can I help you today?",
        "ai"
    );

};

