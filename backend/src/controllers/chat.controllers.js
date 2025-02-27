import { Conversation } from "../models/Conversation.models.js";
import { Message } from "../models/Message.models.js";
import { Thread } from "../models/Thread.models.js";
import { Post } from "../models/Post.models.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";



// Start a one-on-one conversation
 const startConversation = async (req, res) => {
    const { participantId } = req.body;
    const currentUserId = req.user._id;
  
    const existingConversation = await Conversation.findOne({
      participants: { $all: [currentUserId, participantId] }
    });
  
    if (existingConversation) {
      return res.status(200).json(new ApiResponse(200, existingConversation, "Conversation already exists"));
    }
  
    const conversation = await Conversation.create({
      participants: [currentUserId, participantId]
    });
  
    return res.status(201).json(new ApiResponse(201, conversation, "Conversation started"));
  };
  

   const sendMessage = async (req, res) => {
    const { conversationId, text } = req.body;
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content:text,
      read:false,
    });
  
    return res.status(201).json(new ApiResponse(201, message, "Message sent"));
  };


  const readMessage = async (req, res) => {
    const { messageId } = req.params;
  
    const message = await Message.findById(messageId);
    
    if (!message) {
      throw new ApiError(404, "Message not found");
    }
  
    if (message.read) {
      return res.status(200).json(new ApiResponse(200, message, "Message already read"));
    }
  
    message.read = true;
    await message.save();
  
    return res.status(200).json(new ApiResponse(200, message, "Message marked as read"));
  };
  
  
  // Get messages in a conversation
 const getMessages = async (req, res) => {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId }).populate("sender", "fullName username");
  
    return res.status(200).json(new ApiResponse(200, messages, "Messages fetched"));
  };


  const createThread = async (req, res) => {
    const { title, description } = req.body;
    const thread = await Thread.create({
      title,
      description,
      author: req.user._id
    });
  
    return res.status(201).json(new ApiResponse(201, thread, "Thread created"));
  };

  
 const getThreads = async (req, res) => {
    const threads = await Thread.find().populate("creator", "fullName username");
  
    return res.status(200).json(new ApiResponse(200, threads, "Threads fetched"));
  };
  
  // Add a post to a thread
  const addPost = async (req, res) => {
    const { threadId, content } = req.body;
    const post = await Post.create({
      thread: threadId,
      author: req.user._id,
      content
    });
  
    return res.status(201).json(new ApiResponse(201, post, "Post added"));
  };
  
  // Upvote a post
  const upvotePost = async (req, res) => {
    const { postId } = req.body;
    const post = await Post.findById(postId);
  
    if (!post) {
      throw new ApiError(404, "Post not found");
    }
  
    post.upvotes += 1;
    await post.save();
  
    await User.findByIdAndUpdate(post.author, { $inc: { reputation: 10 } });
  
    return res.status(200).json(new ApiResponse(200, post, "Post upvoted"));
  };

  
  export {upvotePost,addPost,getThreads,createThread,getMessages,sendMessage,startConversation,readMessage}