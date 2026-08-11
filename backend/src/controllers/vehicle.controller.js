import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import QRCode from "qrcode";
import { Vehicle } from "../models/vehicle.model.js";
import { initiateMaskedCall } from "../utils/sendMaskedCall.js";

//register vehicle
const registerVehicle = asyncHandler(async (req, res) => {
  //get the details
  const { fullName, mobile, engineNumber, vehicleNumberPlate } = req.body;

  //verify all the fields
  if (
    [fullName, mobile, engineNumber, vehicleNumberPlate].some(
      (field) => !field || field.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  //check already registered or not
  const existingVehicle = await Vehicle.findOne({
    $or: [{ engineNumber }, { vehicleNumberPlate }],
  });
  if (existingVehicle) {
    throw new ApiError(409, "Vehicle already registered");
  }

  const vehicle = await Vehicle.create({
    fullName,
    mobile,
    engineNumber,
    vehicleNumberPlate,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, vehicle, "Vehicle registered successfully"));
});

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
  // extract last 4 digits from the stored plate (ignoring any non-digit chars)
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

export { registerVehicle, getVehicleQr, generateVehicleQR, maskedCall };
