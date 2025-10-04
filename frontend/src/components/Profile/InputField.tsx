export default function InputField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-green-900 font-medium text-sm">
        {label}
      </label>
      <input
        type="text"
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-xl border p-3 outline-none ${
          disabled
            ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-100/70 border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-400 text-green-900"
        }`}
      />
    </div>
  );
}
