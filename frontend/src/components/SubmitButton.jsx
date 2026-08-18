export default function SubmitButton({ children, loading }) {
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