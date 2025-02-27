// models/post.model.js
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 }
}, { timestamps: true });

postSchema.methods.upvote = async function() {
    this.upvotes += 1;
    await this.save();

    const user = await mongoose.model('User').findById(this.author);
    user.reputation += 10;
    await user.save();
};

export const Post = mongoose.model('Post', postSchema);