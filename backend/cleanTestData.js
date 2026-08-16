import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/vehiqr`);
        console.log("Connected to database. Cleaning up...");

        const vehicleResult = await mongoose.connection.collection("vehicles").deleteMany({});
        console.log(`✅ Deleted ${vehicleResult.deletedCount} vehicle(s)`);

        const otpResult = await mongoose.connection.collection("otps").deleteMany({});
        console.log(`✅ Deleted ${otpResult.deletedCount} OTP record(s)`);

        console.log("🎉 Fresh start ready.");
    } catch (err) {
        console.error("❌ Failed:", err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

run();