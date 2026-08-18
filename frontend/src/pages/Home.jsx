import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
          <span className="font-plate text-plate text-2xl tracking-widest">Q</span>
        </div>

        <h1 className="font-display text-3xl font-semibold text-ink mb-3">VehiQR</h1>

        <p className="text-ink/70 mb-8 leading-relaxed">
          Stick a QR code on your car. If someone ever needs to reach you about
          it, they scan it and you get notified — your number is never shared.
        </p>

        <Link
          to="/register"
          className="block w-full bg-primary text-white font-medium py-4 rounded-xl text-lg text-center active:scale-[0.98] transition"
        >
          Register your vehicle
        </Link>
      </div>
    </main>
  );
}