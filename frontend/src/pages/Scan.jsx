import { useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client.js";
import PlateInput from "../components/PlateInput.jsx";
import SubmitButton from "../components/SubmitButton.jsx";

export default function Scan() {
    const { vehicleId } = useParams();
    const [verified, setVerified] = useState(false);
    const [vehicle, setVehicle] = useState(null);
    const [lastFour, setLastFour] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");
        if (!/^\d{4}$/.test(lastFour)) {
            setError("Enter exactly 4 digits.");
            return;
        }
        setLoading(true);
        try {
            const res = await api.scanVehicle(vehicleId, lastFour);
            setVehicle(res.data);
            setVerified(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!verified) {
        return (
            <main className="min-h-screen px-6 py-10 flex flex-col items-center justify-center">
                <div className="max-w-sm w-full">
                    <h1 className="font-display text-2xl font-semibold text-ink mb-1">
                        Confirm the vehicle
                    </h1>
                    <p className="text-ink/60 text-sm mb-6">
                        Enter the last 4 digits of the number plate to continue.
                    </p>

                    {error && (
                        <div className="mb-4 text-sm text-emergency bg-emergency/10 border border-emergency/30 rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-4">
                        <PlateInput
                            label="Last 4 digits"
                            value={lastFour}
                            onChange={(v) => setLastFour(v.replace(/\D/g, "").slice(0, 4))}
                            placeholder="1234"
                            inputMode="numeric"
                        />
                        <SubmitButton loading={loading}>Continue</SubmitButton>
                    </form>
                </div>
            </main>
        );
    }

    return <ActionScreen vehicleId={vehicleId} vehicle={vehicle} />;
}

function ActionScreen({ vehicleId, vehicle }) {
    const [mode, setMode] = useState(null); // null | "call" | "emergency"
    const [bystanderMobile, setBystanderMobile] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);
    const [emergencyResult, setEmergencyResult] = useState(null);

    const validateMobile = () => {
        if (!/^\d{10}$/.test(bystanderMobile)) {
            setError("Enter a valid 10-digit mobile number.");
            return false;
        }
        return true;
    };

    const handleCall = async (e) => {
        e.preventDefault();
        setError("");
        if (!validateMobile()) return;
        setLoading(true);
        try {
            await api.maskedCall(vehicleId, bystanderMobile);
            setSuccess("Connecting your call! Your phone will ring shortly.");
            setMode(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = async () => {
        setError("");
        setLoading(true);
        try {
            await api.messageOwner(vehicleId);
            setSuccess("Message sent to the vehicle owner.");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmergency = async (e) => {
        e.preventDefault();
        setError("");
        if (!validateMobile()) return;
        setLoading(true);
        try {
            const res = await api.emergencyAlert(vehicleId, bystanderMobile);
            setEmergencyResult(res.data);
            setMode(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen px-6 py-10 flex flex-col items-center">
            <div className="max-w-sm w-full">
                <h1 className="font-display text-2xl font-semibold text-ink mb-1">
                    {vehicle.fullName}'s vehicle
                </h1>
                <p className="font-plate text-lg tracking-[0.2em] text-ink/70 mb-6">
                    {vehicle.vehicleNumberPlate}
                </p>

                {error && (
                    <div className="mb-4 text-sm text-emergency bg-emergency/10 border border-emergency/30 rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 text-sm text-primary bg-primary/10 border border-primary/30 rounded-lg px-4 py-3">
                        {success}
                    </div>
                )}

                {emergencyResult && (
                    <div className="mb-4 text-sm bg-emergency/10 border border-emergency/30 rounded-lg px-4 py-3 space-y-2">
                        <p className="text-emergency font-medium">Emergency alert sent.</p>
                        <p className="text-ink/70">
                            If this is a serious accident, call emergency services immediately:
                        </p>

                        <a
                            href={`tel:${emergencyResult.emergencyNumber}`}
                            className="block text-center bg-emergency text-white font-semibold py-3 rounded-lg text-lg"
                        >
                            Call {emergencyResult.emergencyNumber}
                        </a>
                    </div>
                )}

                {mode === null && (
                    <div className="space-y-3">
                        <ActionButton onClick={() => { setMode("call"); setError(""); setSuccess(null); }}>
                            📞 Call the owner
                        </ActionButton>
                        <ActionButton onClick={handleMessage} disabled={loading}>
                            💬 Message the owner
                        </ActionButton>
                        <ActionButton
                            variant="emergency"
                            onClick={() => { setMode("emergency"); setError(""); setEmergencyResult(null); }}
                        >
                            🚨 Emergency
                        </ActionButton>
                    </div>
                )}

                {mode === "call" && (
                    <form onSubmit={handleCall} className="space-y-4">
                        <PlateInput
                            label="Your mobile number"
                            value={bystanderMobile}
                            onChange={(v) => setBystanderMobile(v.replace(/\D/g, "").slice(0, 10))}
                            placeholder="9876543210"
                            inputMode="numeric"
                        />
                        <SubmitButton loading={loading}>Start call</SubmitButton>
                        <button type="button" onClick={() => setMode(null)} className="w-full text-sm text-ink/50 py-2">
                            Cancel
                        </button>
                    </form>
                )}

                {mode === "emergency" && (
                    <form onSubmit={handleEmergency} className="space-y-4">
                        <p className="text-sm text-ink/60">
                            This will call and text the owner immediately. If it's serious, call 112 directly.
                        </p>
                        <PlateInput
                            label="Your mobile number"
                            value={bystanderMobile}
                            onChange={(v) => setBystanderMobile(v.replace(/\D/g, "").slice(0, 10))}
                            placeholder="9876543210"
                            inputMode="numeric"
                        />
                        <SubmitButton loading={loading}>Send emergency alert</SubmitButton>
                        <button type="button" onClick={() => setMode(null)} className="w-full text-sm text-ink/50 py-2">
                            Cancel
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}

function ActionButton({ children, onClick, disabled, variant = "default" }) {
    const styles =
        variant === "emergency"
            ? "bg-emergency text-white"
            : "bg-white border-2 border-line text-ink";
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`w-full ${styles} disabled:opacity-60 font-medium py-4 rounded-xl text-lg active:scale-[0.98] transition`}
        >
            {children}
        </button>
    );
}