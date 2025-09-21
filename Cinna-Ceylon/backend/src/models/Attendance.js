import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['delivery manager', 'product manager', 'finance manager', 'user manager'], required: true },
  date: { type: Date, default: Date.now },
  otp: { type: String, required: true },
  status: { type: String, enum: ['present', 'absent'], default: 'present' }
});

export default mongoose.model('Attendance', attendanceSchema);
