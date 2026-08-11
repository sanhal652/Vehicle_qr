import { ApiError } from "./ApiError.js";

const sid = process.env.EXOTEL_SID;
const apiKey = process.env.EXOTEL_API_KEY;
const apiToken = process.env.EXOTEL_API_TOKEN;
const subdomain = process.env.EXOTEL_SUBDOMAIN;
const callerId = process.env.EXOTEL_CALLER_ID;

export const initiateMaskedCall = async (bystanderMobile, ownerMobile) => {
    if (!bystanderMobile || !ownerMobile) {
        throw new ApiError(400, "Both bystander and owner mobile numbers are required");
    }

    // MOCK MODE — used for demo until Exotel KYC is complete
    if (process.env.CALL_MODE === "mock") {
        console.log(`[MOCK CALL] Connecting bystander ${bystanderMobile} → owner (masked) via ${callerId || "TEST_CALLER_ID"}`);
        return {
            status: "simulated",
            message: "Mock call — real telephony pending Exotel KYC approval",
            from: bystanderMobile,
            callerId: callerId || "TEST_CALLER_ID",
        };
    }

    // REAL MODE — Exotel API
    const url = `https://${subdomain}/v1/Accounts/${sid}/Calls/connect.json`;
    const params = new URLSearchParams({
        From: `0${bystanderMobile.slice(-10)}`,
        To: `0${ownerMobile.slice(-10)}`,
        CallerId: callerId,
        CallType: "trans",
    });
    const auth = Buffer.from(`${apiKey}:${apiToken}`).toString("base64");

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new ApiError(response.status, data?.RestException?.Message || "Failed to initiate masked call");
        }
        return data;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, error.message || "Failed to initiate masked call");
    }
};