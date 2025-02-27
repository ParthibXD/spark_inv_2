import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const sentimentAnalysis = async (text) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment",
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return null;
  }
};

export default sentimentAnalysis;
