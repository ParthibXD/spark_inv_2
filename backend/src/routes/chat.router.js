import { Router } from "express";
import {upvotePost,addPost,getThreads,createThread,getMessages,sendMessage,startConversation,readMessage} from "../controllers/chat.controllers.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


// One-on-one chat routes
router.post("/conversations", verifyJWT, startConversation);
router.post("/messages", verifyJWT, sendMessage);
router.get("/messages/:conversationId", verifyJWT, getMessages);
router.patch('/messages/:messageId/read',verifyJWT, readMessage);


// Forum routes
router.post("/threads", verifyJWT, createThread);
router.get("/threads", verifyJWT, getThreads);
router.post("/posts", verifyJWT, addPost);
router.post("/posts/upvote", verifyJWT, upvotePost);

export default router;