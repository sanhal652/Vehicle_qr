import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Otp} from "../models/otp.model.js";
import crypto from "crypto";
import { sendSms } from "../utils/sendSms.js";


const sendOtp=asyncHandler(async(req,res)=>{
    const {mobile}=req.body;
    if(!mobile || mobile.trim()===""){
        throw new ApiError(400,"Mobile number is required");
    }
    //delete any existing otp
    await  Otp.deleteMany({mobile});

    const generatedOtp= crypto.randomInt(100000,999999).toString();
    await Otp.create({
        mobile,
        otp:generatedOtp
    })

    //send the sms to the mobile
    await sendSms(mobile,generatedOtp,"otp");

    console.log(`OTP sent to ${mobile}: ${generatedOtp}`);

    return res.status(200).json(
        new ApiResponse(200, null, "OTP sent successfully to your mobile number")
    );
})

// verify otp and register vehicle
const verifyOtp=asyncHandler(async(req,res)=>{
    const {mobile,otp}=req.body;
    if(!mobile || mobile.trim()==="" || !otp || otp.trim()===""){
        throw new ApiError(400,"Mobile number and OTP are required");
    }

    const validOtp= await Otp.findOne({mobile,otp});
    if(!validOtp){
        throw new ApiError(400,"Invalid or expired OTP");
    }
    validOtp.isVerified=true;
    await validOtp.save();

    return res.status(200).json(
        new ApiResponse(200, { isVerified: true }, "OTP verified successfully")
    );


})

export {sendOtp,verifyOtp}