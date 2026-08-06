import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
});

connectDB()
    .then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`⚙️  Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MONGODB connection failed: ", err);
        process.exit(1);
    });