import { useState, useEffect, useRef } from "react";
import ChatBotIcon from "./ChatBotIcon";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hey there! 👋 How can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Cleanup timeout on component unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const generateBotResponse = async (userMessage) => {
    // Set a timeout to handle stuck requests
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev.filter((msg) => !msg.isTemporary),
          {
            sender: "bot",
            text: "I'm sorry, the request is taking too long. Please check your API configuration or try again later.",
          },
        ]);
      }
    }, 10000); // 10 second timeout

    try {
      // Format history for Gemini API
      const history = messages
        .filter((msg) => !msg.isTemporary)
        .map((msg) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }));

      // Add the new user message
      history.push({
        role: "user",
        parts: [{ text: userMessage }],
      });

      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_API_KEY;

      // Check if we have a complete API key
      if (!apiKey || apiKey.includes("$")) {
        throw new Error("API key is missing or invalid in .env file");
      }

      // Create proper URL for Gemini API
      const baseUrl =
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";
      const url = `${baseUrl}?key=${apiKey}`;

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: history,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
        }),
      };

      console.log("Sending request to Gemini API...");

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response received");

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        throw new Error("Unexpected response format from API");
      }

      const apiResponseText = data.candidates[0].content.parts[0].text.trim();

      // Clear timeout since we got a response
      clearTimeout(timeoutRef.current);

      // Remove the temporary "thinking" message and add the real response
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isTemporary),
        { sender: "bot", text: apiResponseText },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error);

      // Clear timeout since we're handling the error
      clearTimeout(timeoutRef.current);

      // Replace the "thinking" message with an error message
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isTemporary),
        {
          sender: "bot",
          text: `I couldn't process your request. ${
            error.message || "Please check your API configuration."
          }`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      const userMessage = message.trim();

      // Add user message to chat
      setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);

      // Clear input field
      setMessage("");

      // Add a temporary "thinking" message
      setIsLoading(true);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Thinking...", isTemporary: true },
      ]);

      // Generate bot response
      generateBotResponse(userMessage);
    }
  };

  // Fallback for development/testing when API is not configured
  const handleFallbackResponse = () => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Thinking...", isTemporary: true },
    ]);

    // Simulate API delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isTemporary),
        {
          sender: "bot",
          text: "This is a fallback response. Please set up your API key in the .env file to connect to Gemini.",
        },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 shadow-xl rounded-2xl overflow-hidden bg-white border border-purple-100">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-white rounded-full shadow-md">
            <ChatBotIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-white font-bold text-lg">Spark Assistant</h2>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:bg-white/20 rounded-full p-1 transition-all duration-200"
        >
          <span className="material-symbols-rounded">
            {isOpen ? "keyboard_arrow_down" : "keyboard_arrow_up"}
          </span>
        </button>
      </div>

      {/* Chat Body */}
      {isOpen && (
        <div className="flex flex-col h-96 overflow-y-auto p-4 bg-gradient-to-b from-indigo-50 to-purple-50 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              } animate-fade-in`}
            >
              <div
                className={`
                  max-w-[80%] rounded-2xl p-3 shadow-sm
                  ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-tr-none"
                      : msg.isTemporary
                      ? "bg-white/80 rounded-tl-none border border-purple-100"
                      : "bg-white rounded-tl-none border border-purple-100"
                  }
                `}
              >
                {msg.sender === "bot" && (
                  <div className="flex items-center mb-1">
                    <div className="p-1 bg-purple-100 rounded-full mr-2">
                      <ChatBotIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-purple-600">
                      {msg.isTemporary ? "Thinking..." : "Assistant"}
                    </span>
                  </div>
                )}
                <p
                  className={`text-sm ${
                    msg.sender === "user" ? "text-white" : "text-gray-700"
                  }`}
                >
                  {msg.text}
                </p>
                <div className="text-right">
                  <span
                    className={`text-xs ${
                      msg.sender === "user"
                        ? "text-purple-200"
                        : "text-gray-400"
                    }`}
                  >
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Chat Footer */}
      {isOpen && (
        <div className="bg-white border-t border-purple-100 p-3">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-purple-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 text-sm"
              disabled={isLoading}
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`${
                isLoading
                  ? "bg-gray-400"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg"
              } text-white p-2 rounded-full shadow-md transition-all duration-200`}
            >
              <span className="material-symbols-rounded">
                {isLoading ? "more_horiz" : "arrow_upward"}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* API Status Indicator */}
      {isOpen && (
        <div
          className={`p-2 text-xs border-t ${
            !import.meta.env.VITE_API_KEY ||
            import.meta.env.VITE_API_KEY.includes("$")
              ? "bg-red-100 text-red-800 border-red-200"
              : "bg-green-100 text-green-800 border-green-200"
          }`}
        >
          <strong>Status:</strong>{" "}
          {!import.meta.env.VITE_API_KEY ||
          import.meta.env.VITE_API_KEY.includes("$")
            ? "API key not properly configured in .env file"
            : "API connected"}
        </div>
      )}
    </div>
  );
};

export default ChatBot;
