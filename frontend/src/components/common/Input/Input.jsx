function Input({
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-blue-500"
    />
  );
}

export default Input;