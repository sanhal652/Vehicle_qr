import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import QRCode from "qrcode";
import { Vehicle } from "../models/vehicle.model.js";
import { Otp } from "../models/otp.model.js";
import { initiateMaskedCall } from "../utils/sendMaskedCall.js";
import { sendSms } from "../utils/sendSms.js";

//register vehicle

const registerVehicle = asyncHandler(async (req, res) => {
  //get the details
  const { fullName, mobile, engineNumber, vehicleNumberPlate,emergencyContact } = req.body;

  //verify all the fields
  if (
    [fullName, mobile, engineNumber, vehicleNumberPlate].some(
      (field) => !field || field.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check OTP was verified for this mobile number
  const verifiedOtp = await Otp.findOne({ mobile, isVerified: true });
  if (!verifiedOtp) {
    throw new ApiError(403, "Please verify your mobile number with OTP before registering");
  }
  //check already registered or not
  const existingVehicle = await Vehicle.findOne({
    $or: [{ engineNumber }, { vehicleNumberPlate }],
  });
  if (existingVehicle) {
     if (existingVehicle.mobile === mobile) {
      return res
        .status(200)
        .json(new ApiResponse(200, existingVehicle, "Vehicle already registered — here's your QR"));
    }
    throw new ApiError(409, "Vehicle already registered");
  }

  const vehicle = await Vehicle.create({
    fullName,
    mobile,
    engineNumber,
    vehicleNumberPlate,
    emergencyContact
  });

   // clean up the OTP record after registration succeeded
  await Otp.deleteOne({ _id: verifiedOtp._id });
  return res
    .status(201)
    .json(new ApiResponse(201, vehicle, "Vehicle registered successfully"));
});


//getting vehicle for owner
const getMyVehicle= asyncHandler(async(req,res)=>{
  const {vehicleNumberPlate, engineNumber} = req.query
  if(!vehicleNumberPlate || !engineNumber){
    throw new ApiError(400,"Both vehicle number plate and engine number are required")
  }
  const vehicle= await Vehicle.findOne({
    vehicleNumberPlate:vehicleNumberPlate.trim().toUpperCase(),
     engineNumber:engineNumber.trim()
    }).select("-licenseNumber")

  if(!vehicle){
    throw new ApiError(404,"Vehicle not found")
  }
  return res.status(200).json(
    new ApiResponse(200, vehicle, "Vehicle retrieved successfully")
  )
})
//getting  vehicle for scan for bystanders
const getVehicleQr = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { lastFourDigits } = req.query;

  if (!lastFourDigits || lastFourDigits.trim() === "") {
    throw new ApiError(400, "Please enter the last 4 digits of the vehicle number plate");
  }

  const cleanDigits = lastFourDigits.trim();
  if (!/^\d{4}$/.test(cleanDigits)) {
    throw new ApiError(400, "Please enter exactly 4 digits");
  }
  const vehicle = await Vehicle.findById(vehicleId).select("vehicleNumberPlate fullName");
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }
  // extract last 4 digits from the stored plate 
  const plateDigitsOnly = vehicle.vehicleNumberPlate.replace(/\D/g, "");
  const actualLastFour = plateDigitsOnly.slice(-4);

  if (cleanDigits !== actualLastFour) {
    throw new ApiError(401, "Incorrect plate digits. Please check and try again.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, vehicle, "Vehicle verified successfully"));
});

//generating qr code for vehicle for owner

const generateVehicleQR = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const vehicle = await Vehicle.findById(vehicleId).select("-licenseNumber");
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }
  const scanURL = `${process.env.FRONTEND_URL || "http://localhost:5173"}/scan/${vehicleId}`;
  const qrCode = await QRCode.toDataURL(scanURL);

  if (!qrCode) {
    throw new ApiError(500, "Qr code generation failed");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { qrCode, scanURL },
        "Qr code generated successfully",
      ),
    );
});

//initiating masked call between owner and bystander
const maskedCall = asyncHandler(async (req, res) => {
    const { vehicleId } = req.params;
    const { bystanderMobile } = req.body || {};

    if (!bystanderMobile || bystanderMobile.trim() === "") {
        throw new ApiError(400, "Your mobile number is required");
    }

    const cleanNumber = bystanderMobile.trim().replace(/\D/g, "");
    if (cleanNumber.length !== 10) {
        throw new ApiError(400, "Please provide a valid 10-digit mobile number");
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        throw new ApiError(404, "Vehicle not found");
    }

    if (!vehicle.mobile || vehicle.mobile.trim() === "") {
        throw new ApiError(400, "Vehicle owner mobile number not found");
    }

    await initiateMaskedCall(cleanNumber, vehicle.mobile);

    return res.status(200).json(
    new ApiResponse(200, null, "Call initiated! Connecting you with the owner.")
);
});

//sending message to owner
const messageOwner= asyncHandler(async(req,res)=>{
  const {vehicleId} = req.params
  const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        throw new ApiError(404, "Vehicle not found");
    }
    await sendSms(vehicle.mobile,`Someone near your vehicle ${vehicle.vehicleNumberPlate} needs to reach you`,"message" )
    return res.status(200).json(
        new ApiResponse(200, null, "Message sent to the vehicle owner")
    );
})

//emergency option

const emergency= asyncHandler(async (req,res) => {
  const {vehicleId} = req.params
  const {bystanderMobile} = req.body || {}

  if (!bystanderMobile || bystanderMobile.trim() === "") {
        throw new ApiError(400, "Your mobile number is required");
    }

    const cleanNumber = bystanderMobile.trim().replace(/\D/g, "");
    if (cleanNumber.length !== 10) {
        throw new ApiError(400, "Please provide a valid 10-digit mobile number");
    }
  const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        throw new ApiError(404, "Vehicle not found");
    }
    if (!vehicle.mobile || vehicle.mobile.trim() === "") {
        throw new ApiError(400, "Vehicle owner mobile number not found");
    }

    const alertMessage = `EMERGENCY: Your vehicle (${vehicle.vehicleNumberPlate}) may be involved in an accident/incident. Someone nearby is trying to reach you urgently.`;
    
    const tasks = [
        initiateMaskedCall(cleanNumber, vehicle.mobile),
        sendSms(vehicle.mobile, alertMessage, "emergency"),
    ];

    // if owner is involved in the accident
    if (vehicle.emergencyContact && vehicle.emergencyContact.trim() !== "") {
        tasks.push(
            sendSms(
                vehicle.emergencyContact,
                `🚨 EMERGENCY: This is a backup alert. ${vehicle.fullName}'s vehicle (${vehicle.vehicleNumberPlate}) may be involved in an accident/incident. Please try to reach them or check on them.`,
                "emergency"
            )
        );
    }

    const results = await Promise.allSettled(tasks);

    const callFailed = results[0].status === "rejected";
    const ownerSmsFailed = results[1].status === "rejected";
    const contactSmsFailed = tasks.length > 2 ? results[2].status === "rejected" : null;

    if (callFailed && ownerSmsFailed && (contactSmsFailed === null || contactSmsFailed)) {
        throw new ApiError(500, "Failed to send emergency alert through any channel");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                callSent: !callFailed,
                ownerSmsSent: !ownerSmsFailed,
                emergencyContactSmsSent: contactSmsFailed === null ? null : !contactSmsFailed,
                emergencyNumber: "112", // India's unified emergency number
            },
            "Emergency alert sent. If this is a serious accident, please also call 112 immediately."
        )
    );
})



export { registerVehicle, getVehicleQr, generateVehicleQR, maskedCall, messageOwner,emergency,getMyVehicle };
