import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  message: { type: String, required: true },
  target: { type: String, enum: ['admin', 'users', 'all'], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);
