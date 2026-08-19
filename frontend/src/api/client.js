const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

//reusable function
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return data;
}

export const api = {
  sendOtp: (mobile) =>
    request("/otp/send-otp", { method: "POST", body: JSON.stringify({ mobile }) }),

  verifyOtp: (mobile, otp) =>
    request("/otp/verify-otp", { method: "POST", body: JSON.stringify({ mobile, otp }) }),

  registerVehicle: (payload) =>
    request("/vehicle/register", { method: "POST", body: JSON.stringify(payload) }),

  getVehicleQr: (vehicleId) =>
    request(`/vehicle/generate-qr/${vehicleId}`),

  scanVehicle: (vehicleId, lastFourDigits) =>
    request(`/vehicle/scan/${vehicleId}?lastFourDigits=${lastFourDigits}`),

  maskedCall: (vehicleId, bystanderMobile) =>
    request(`/vehicle/masked-call/${vehicleId}`, {
      method: "POST",
      body: JSON.stringify({ bystanderMobile }),
    }),

  messageOwner: (vehicleId) =>
    request(`/vehicle/message-owner/${vehicleId}`, { method: "POST" }),

  emergencyAlert: (vehicleId, bystanderMobile) =>
    request(`/vehicle/emergency/${vehicleId}`, {
      method: "POST",
      body: JSON.stringify({ bystanderMobile }),
    }),
    getMyVehicle: (engineNumber, vehicleNumberPlate) =>
    request(`/vehicle/my-vehicle?engineNumber=${encodeURIComponent(engineNumber)}&vehicleNumberPlate=${encodeURIComponent(vehicleNumberPlate)}`),
    
};