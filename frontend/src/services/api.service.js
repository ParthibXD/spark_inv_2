const API_URL = "http://localhost:8000/api";

export const analyzeSentiment = async (text) => {
  const response = await fetch(`${API_URL}/sentiment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return response.json();
};

export const chatWithBot = async (message) => {
  const response = await fetch(`${API_URL}/chatbot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return response.json();
};

export const getRecommendations = async (interests) => {
  const response = await fetch(`${API_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interests }),
  });
  return response.json();
};
