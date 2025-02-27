const getRecommendations = async (userInterests) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
      { inputs: `Suggest alumni networking topics based on ${userInterests}` },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return null;
  }
};

export default getRecommendations;
