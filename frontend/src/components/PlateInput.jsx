export default function PlateInput({ label, value, onChange, placeholder, inputMode }) {
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