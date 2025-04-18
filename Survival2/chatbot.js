document.getElementById("chatbot-btn").addEventListener("click", function() {
    let chatbox = document.getElementById("chatbox");
    chatbox.style.display = (chatbox.style.display === "none") ? "block" : "none";
});

async function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput) return;

    // عرض رسالة المستخدم
    let chatContent = document.getElementById("chat-content");
    chatContent.innerHTML += <p><strong>You:</strong> ${userInput}</p>;

    // استدعاء Dialogflow API
    let response = await fetch("https://dialogflow.googleapis.com/v2/projects/nomadic-rush-453320-k1/agent/sessions/12345:detectIntent", {
        method: "POST",
        headers: {
            "Authorization": "https://oauth2.googleapis.com/token",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            queryInput: {
                text: { text: userInput, languageCode: "en" }
            }
        })
    });

    let data = await response.json();
    let botResponse = data.queryResult.fulfillmentText;

    // عرض رد البوت
    chatContent.innerHTML += <p><strong>Bot:</strong> ${botResponse}</p>;
    
    // مسح الحقل بعد الإرسال
    document.getElementById("user-input").value = "";
}