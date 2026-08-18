import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client.js";

export default function QrDisplay() {
  const { vehicleId } = useParams();
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchQr() {
      try {
        const res = await api.getVehicleQr(vehicleId);
        if (!cancelled && res?.data?.qrCode) {
          setQrCode(res.data.qrCode);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchQr();
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center justify-center">
      <div className="max-w-sm w-full text-center">
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">
          You're all set
        </h1>
        <p className="text-ink/60 text-sm mb-6">
          Print or screenshot this QR code and stick it on your car's windshield.
        </p>

        {loading && (
          <div className="py-16 text-ink/50">Generating your QR code…</div>
        )}

        {error && (
          <div className="text-sm text-emergency bg-emergency/10 border border-emergency/30 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {qrCode && (
          <div className="bg-white border-2 border-ink/10 rounded-2xl p-6 inline-block">
            <img src={qrCode} alt="Vehicle QR code" className="w-56 h-56 mx-auto" />
          </div>
        )}

        {qrCode && (
          <a
            href={qrCode}
            download="vehiqr-code.png"
            className="block w-full mt-6 bg-primary text-white font-medium py-4 rounded-xl text-lg text-center active:scale-[0.98] transition"
          >
            Download QR code
          </a>
        )}
      </div>
    </main>
  );
}