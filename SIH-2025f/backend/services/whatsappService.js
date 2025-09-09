const client = require("../utils/twilioClient");

async function sendWhatsAppMessage(to, body) {
  try {
    const message = await client.messages.create({
      from: "whatsapp:+14155238886", 
      to: `whatsapp:${to}`,     // recipient's number
      body,
    });

    console.log("✅ WhatsApp message sent:", message.sid);
    return message;
  } catch (error) {
    console.error("❌ WhatsApp send error:", error.message);
    throw error;
  }
}

module.exports = { sendWhatsAppMessage };
