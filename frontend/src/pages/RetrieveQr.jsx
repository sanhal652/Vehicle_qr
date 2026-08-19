import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client.js";
import TextInput from "../components/TextInput.jsx";
import PlateInput from "../components/PlateInput.jsx";
import SubmitButton from "../components/SubmitButton.jsx";

export default function RetrieveQr() {
  const navigate = useNavigate();
  const [engineNumber, setEngineNumber] = useState("");
  const [vehicleNumberPlate, setVehicleNumberPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!engineNumber.trim() || !vehicleNumberPlate.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.getMyVehicle(engineNumber.trim(), vehicleNumberPlate.trim());
      navigate(`/qr/${res.data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center justify-center">
      <div className="max-w-sm w-full">
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">
          Retrieve your QR code
        </h1>
        <p className="text-ink/60 text-sm mb-6">
          Enter the details you registered with to get your QR code again.
        </p>

        {error && (
          <div className="mb-4 text-sm text-emergency bg-emergency/10 border border-emergency/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Engine number"
            value={engineNumber}
            onChange={setEngineNumber}
            placeholder="74WSC51987"
          />
          <PlateInput
            label="Number plate"
            value={vehicleNumberPlate}
            onChange={(v) => setVehicleNumberPlate(v.toUpperCase())}
            placeholder="WB06AB1234"
          />
          <SubmitButton loading={loading}>Find my QR code</SubmitButton>
        </form>

        <Link to="/register" className="block text-center text-sm text-ink/50 mt-6">
          Haven't registered yet? Register instead
        </Link>
      </div>
    </main>
  );
}