const chatWithAI = async (message) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
      {
        inputs: {
          past_user_inputs: [],
          generated_responses: [],
          text: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in chatbot response:", error);
    return null;
  }
};

export default chatWithAI;
