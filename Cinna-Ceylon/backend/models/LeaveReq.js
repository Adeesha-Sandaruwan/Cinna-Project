const mongoose = require('mongoose');

const leaveReqSchema = new mongoose.Schema({
    Leave_ID: { type: String, required: true, unique: true, index: true },
    Official: { type: Boolean },
    Medical: { type: Boolean },
    Personal: { type: Boolean },
    Start_time: { type: Date },
    Reason: { type: String },
    End_time: { type: Date },
    Status: { type: String },
    Emp_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const LeaveReq = mongoose.model('Leave_Req', leaveReqSchema);

module.exports = LeaveReq;