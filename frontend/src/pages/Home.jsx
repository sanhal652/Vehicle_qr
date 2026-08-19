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
          <b>"Honk less. Scan more."</b> Reach any car's owner instantly — privately, without exchanging numbers.
        </p>

        <Link
          to="/register"
          className="block w-full bg-primary text-white font-medium py-4 rounded-xl text-lg text-center active:scale-[0.98] transition"
        >
          Register your vehicle
        </Link>
        <Link
          to="/retrieve"
          className="block w-full mt-3 text-center text-primary font-medium py-3"
        >
          Already registered? Get your QR code
        </Link>
      </div>
    </main>
  );
}