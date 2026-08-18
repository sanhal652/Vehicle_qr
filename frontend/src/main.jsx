import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import QrDisplay from "./pages/QrDisplay.jsx";
import Scan from "./pages/Scan.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/qr/:vehicleId" element={<QrDisplay />} />
        <Route path="/scan/:vehicleId" element={<Scan />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
