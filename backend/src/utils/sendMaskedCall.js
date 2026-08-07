import twilio from "twilio";
import { ApiError } from "./ApiError.js";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const virtualNumber = process.env.TWILIO_PHONE_NUMBER;

// Authenticate using API Key & Secret
const client = twilio(apiKey, apiSecret, { accountSid });


 //Initiates a masked call connecting bystander and vehicle owner

export const initiateMaskedCall = async (bystanderMobile, ownerMobile) => {
    try {
        const call = await client.calls.create({
            twiml: `<Response><Dial callerId="${virtualNumber}">+91${ownerMobile.slice(-10)}</Dial></Response>`,
            to: `+91${bystanderMobile.slice(-10)}`,
            from: virtualNumber,
        });

        return call;
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to initiate masked call");
    }
};