import axios from "axios";
import { ApiError } from "./ApiError.js";

export const sendSms = async (mobile, message, type = "otp") => {
    //MOCK SIDE
    if (process.env.SMS_MODE === "mock") {
        console.log(`[MOCK SMS] To ${mobile} (${type}): ${message}`);
        return { status: "simulated", mobile, message, type };
    }

    try {
        let payload;

        if (type === "otp") {
            // Fast2SMS OTP route — message here is just the OTP code
            payload = {
                variables_values: message,
                route: "otp",
                numbers: mobile,
            };
        } else {
            // General/quick SMS route — for message/emergency alerts
            payload = {
                message: message,
                route: "q",
                numbers: mobile,
            };
        }

        const response = await axios.post(
            "https://www.fast2sms.com/dev/bulkV2",
            payload,
            {
                headers: {
                    authorization: process.env.FAST2SMS_API_KEY,
                },
            }
        );

        if (response.data.return !== true) {
            throw new ApiError(500, response.data.message || "Failed to deliver SMS");
        }

        return response.data;
    } catch (error) {
        throw new ApiError(
            500,
            error?.response?.data?.message || error.message || "Error occurred while sending SMS"
        );
    }
};
