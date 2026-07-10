import axios from "axios";

const API_BASE_URL = "https://ai-chatbot-server-ygx2.onrender.com";

/**
 * Sends a message + conversation history + optional file to the backend and
 * returns the assistant's reply text.
 */
export async function sendMessage(message, history, file = null) {
  const response = await axios.post(`${API_BASE_URL}/chat`, {
    message,
    history,
    file,
  });
  return response.data.reply;
}
