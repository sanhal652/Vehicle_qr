import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Otp} from "../models/otp.model.js";
import crypto from "crypto";

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
    await sendSms(mobile,generatedOtp);

    console.log(`OTP sent to ${mobile}: ${generatedOtp}`);

    return res.status(200).json(
        new ApiResponse(200, null, "OTP sent successfully to your mobile number")
    );
})