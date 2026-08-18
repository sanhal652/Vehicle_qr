import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

const STEPS = { MOBILE: "mobile", OTP: "otp", DETAILS: "details" };

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.MOBILE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [vehicleNumberPlate, setVehicleNumberPlate] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      await api.sendOtp(mobile);
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      await api.verifyOtp(mobile, otp);
      setStep(STEPS.DETAILS);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !engineNumber.trim() || !vehicleNumberPlate.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.registerVehicle({
        fullName,
        mobile,
        engineNumber,
        vehicleNumberPlate,
        emergencyContact: emergencyContact.trim() || undefined,
      });
      navigate(`/qr/${res.data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center">
      <div className="max-w-sm w-full">
        <Steps current={step} />

        <h1 className="font-display text-2xl font-semibold text-ink mt-6 mb-1">
          {step === STEPS.MOBILE && "Verify your number"}
          {step === STEPS.OTP && "Enter the code"}
          {step === STEPS.DETAILS && "Your vehicle"}
        </h1>
        <p className="text-ink/60 text-sm mb-6">
          {step === STEPS.MOBILE && "We'll text you a one-time code."}
          {step === STEPS.OTP && `Sent to ${mobile}`}
          {step === STEPS.DETAILS && "This is what appears when someone scans your QR."}
        </p>

        {error && (
          <div className="mb-4 text-sm text-emergency bg-emergency/10 border border-emergency/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {step === STEPS.MOBILE && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <PlateInput
              label="Mobile number"
              value={mobile}
              onChange={(v) => setMobile(v.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
              inputMode="numeric"
            />
            <SubmitButton loading={loading}>Send code</SubmitButton>
          </form>
        )}

        {step === STEPS.OTP && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <PlateInput
              label="6-digit code"
              value={otp}
              onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
            />
            <SubmitButton loading={loading}>Verify</SubmitButton>
            <button
              type="button"
              onClick={() => setStep(STEPS.MOBILE)}
              className="w-full text-sm text-ink/50 py-2"
            >
              Wrong number? Go back
            </button>
          </form>
        )}

        {step === STEPS.DETAILS && (
          <form onSubmit={handleRegister} className="space-y-4">
            <TextInput label="Full name" value={fullName} onChange={setFullName} placeholder="your full name" />
            <TextInput label="Engine number" value={engineNumber} onChange={setEngineNumber} placeholder="74WSC51987GH5647DH" />
            <PlateInput
              label="Number plate"
              value={vehicleNumberPlate}
              onChange={(v) => setVehicleNumberPlate(v.toUpperCase())}
              placeholder="WB06AB1234"
            />
            <TextInput
              label="Emergency contact (optional)"
              value={emergencyContact}
              onChange={(v) => setEmergencyContact(v.replace(/\D/g, "").slice(0, 10))}
              placeholder="A family member's number"
              inputMode="numeric"
            />
            <SubmitButton loading={loading}>Register &amp; get my QR code</SubmitButton>
          </form>
        )}
      </div>
    </main>
  );
}

function Steps({ current }) {
  const order = [STEPS.MOBILE, STEPS.OTP, STEPS.DETAILS];
  const idx = order.indexOf(current);
  return (
    <div className="flex gap-2">
      {order.map((s, i) => (
        <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-primary" : "bg-line"}`} />
      ))}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, inputMode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink/70 mb-1.5">{label}</span>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-white px-4 py-3.5 text-ink text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
      />
    </label>
  );
}

function PlateInput({ label, value, onChange, placeholder, inputMode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink/70 mb-1.5">{label}</span>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-ink/15 bg-plate/15 px-4 py-3.5 font-plate text-ink text-lg tracking-[0.2em] uppercase focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
      />
    </label>
  );
}

function SubmitButton({ children, loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-primary disabled:opacity-60 text-white font-medium py-4 rounded-xl text-lg active:scale-[0.98] transition"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}