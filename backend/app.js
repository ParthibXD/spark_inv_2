import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

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

import userRouter from "./src/routes/user.router.js"
app.use("/api/v1/users",userRouter)

import chatRouter from "./src/routes/chat.router.js"
app.use("/api/v1/chats",chatRouter)




export { app };
