
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { app } from "./app.js";
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`⚙️ Server running and accessible on network:`);
      console.log(`   ➜ Local:   http://localhost:${PORT}`);
      console.log(`   ➜ Network: http://192.168.1.6:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });