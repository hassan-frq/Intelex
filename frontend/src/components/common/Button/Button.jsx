function Button({
  children,
  type = "button",
  onClick,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full rounded-xl bg-blue-600 px-4 py-3 text-white font-medium transition hover:bg-blue-700 ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;