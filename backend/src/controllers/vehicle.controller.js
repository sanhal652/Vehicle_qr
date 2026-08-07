import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import QRCode from "qrcode";
import { Vehicle } from "../models/vehicle.model.js";

//register vehicle
const registerVehicle = asyncHandler(async (req, res) => {
  //get the details
  const { fullName, mobile, licenseNumber, vehicleNumberPlate } = req.body;

  //verify all the fields
  if (
    [fullName, mobile, licenseNumber, vehicleNumberPlate].some(
      (field) => !field || field.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  //check already registered or not
  const existingVehicle = await Vehicle.findOne({
    $or: [{ licenseNumber }, { vehicleNumberPlate }],
  });
  if (existingVehicle) {
    throw new ApiError(409, "Vehicle already registered");
  }

  const vehicle = await Vehicle.create({
    fullName,
    mobile,
    licenseNumber,
    vehicleNumberPlate,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, vehicle, "Vehicle registered successfully"));
});

//getting  vehicle for scan for bystanders
const getVehicleQr = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const getVehicle = await Vehicle.findById(vehicleId).select("-licenseNumber -mobile");

  if (!getVehicle) {
    throw new ApiError(404, "Vehicle Qr code not found");
  }
  return res.status(200)
    .json(new ApiResponse(200, getVehicle, "Vehicle qr code fetched successfully"),);
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

export { registerVehicle, getVehicleQr, generateVehicleQR };
