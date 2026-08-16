import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema({
  mobile: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  isVerified:{
    type:Boolean,
    default:false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

export const Otp = mongoose.model("Otp", otpSchema);
