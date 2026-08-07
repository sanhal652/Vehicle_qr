import axios from "axios";
import { ApiError } from "./ApiError.js";

export const sendSms= async(mobile,otp)=>{
    try{
       const response = await axios.post(
            "https://www.fast2sms.com/dev/bulkV2",
            {
                variables_values: otp, // OTP number
                route: "otp",          // Fast2SMS default OTP route
                numbers: mobile        // Target phone number
            },
            {
                headers: {
                    authorization: process.env.FAST2SMS_API_KEY
                }
            }
        );

        if (response.data.return !== true) {
            throw new ApiError(
                500, 
                response.data.message || "Failed to deliver SMS via Fast2SMS"
            );
        }

        return response.data;
    }catch(error){
        throw new ApiError(500, error?.response?.data?.message || error.message || "Error occurred while sending SMS"
        );
    }
}