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
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

export const Otp = mongoose.model("Otp", otpSchema);
