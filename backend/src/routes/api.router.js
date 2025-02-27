import express from "express";
import sentimentAnalysis from "../services/sentiment.service.js";
import chatWithAI from "../services/chatbot.service.js";
import getRecommendations from "../services/recommendation.service.js";

const router = express.Router();

// Sentiment Analysis Route
router.post("/sentiment", async (req, res) => {
  const { text } = req.body;
  const sentiment = await sentimentAnalysis(text);
  res.json(sentiment);
});

// Chatbot Route
router.post("/chatbot", async (req, res) => {
  const { message } = req.body;
  const response = await chatWithAI(message);
  res.json(response);
});

// Recommendation Route
router.post("/recommend", async (req, res) => {
  const { interests } = req.body;
  const recommendations = await getRecommendations(interests);
  res.json(recommendations);
});

export default router;
