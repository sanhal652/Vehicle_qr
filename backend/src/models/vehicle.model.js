import mongoose, { Schema } from "mongoose";

const vehicleSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    mobile:{
        type:String,
        required:true
    },
    licenseNumber:{
        type:String,
        required:true,
        unique: true,
        trim: true,
        uppercase: true,
        index: true
    },
    vehicleNumberPlate:{
        type:String,
        required:true,
        unique: true,
      trim: true,
      uppercase: true,
      index: true
    },

  },
  { timestamps: true },
);

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
