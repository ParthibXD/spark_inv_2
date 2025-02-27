import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
    title: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: { type: String },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Thread = mongoose.model('Thread', threadSchema);