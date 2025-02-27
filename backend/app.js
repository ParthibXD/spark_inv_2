import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import morgan from "morgan";
const app = express();
import dotenv from "dotenv";
dotenv.config();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //simply urlencoded() will also work
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(bodyParser.json());

//routes import
<<<<<<< HEAD
//import userRouter from "./routes/user.routes.js";
//import apiRoutes from "./routes/api.routes.js";
/*
const PYTHON_API_URL = "http://localhost:5001";

app.post("/chat", async (req, res) => {
  const response = await axios.post(`${PYTHON_API_URL}/chat`, req.body);
  res.json(response.data);
});

app.post("/sentiment", async (req, res) => {
  const response = await axios.post(`${PYTHON_API_URL}/sentiment`, req.body);
  res.json(response.data);
});

app.post("/recommend", async (req, res) => {
  const response = await axios.post(`${PYTHON_API_URL}/recommend`, req.body);
  res.json(response.data);
});

app.post("/moderate", async (req, res) => {
  const response = await axios.post(`${PYTHON_API_URL}/moderate`, req.body);
  res.json(response.data);
});
*/

app.post("/api/gemini", async (req, res) => {
  const { contents } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    apiKey;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

//routes declaration
//app.use("/api/v1/users", userRouter);
//app.use("/api", apiRoutes);
=======
import userRouter from "./src/routes/user.router.js";
import chatRouter from "./src/routes/chat.router.js";


//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);
>>>>>>> 045a98e (block chain and database integration)

export { app };
