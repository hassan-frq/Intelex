import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.error || "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left — form */}
      <div className="flex flex-col justify-center bg-[#f5f4ef] px-8 py-14 sm:px-14">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-serif text-3xl text-zinc-900">Create account</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Get started with Intelex and equip your firm with AI tools.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Full name <span className="text-orange-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Haider Khan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Work email <span className="text-orange-600">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="name@firm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Password <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Confirm password <span className="text-orange-600">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#1c2a4a] py-3 text-sm font-medium text-white transition hover:bg-[#243356] disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-amber-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>

          <p className="mt-8 text-center font-mono text-[10px] leading-relaxed text-zinc-400">
            SOC 2 TYPE II AUDIT IN PROGRESS
            <br />
            AES-256 CASE-DATA ENCRYPTION AT REST
          </p>
        </div>
      </div>

      {/* Right — brand panel */}
      <div className="hidden flex-col bg-[#0f1b33] px-11 py-10 md:flex">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#c9902e] font-serif text-[15px] font-bold text-[#0f1b33]">
              I
            </div>
            <span className="font-serif text-lg text-white">Intelex</span>
          </div>
          <span className="font-mono text-[10px] tracking-wide text-[#8a93a8]">
            SYS: ACTIVE // SESSION_ID: IX-2026.08.08
          </span>
        </div>

        <span className="mb-2.5 font-mono text-[11px] uppercase tracking-widest text-[#c9902e]">
          Ambient transcript synthesis
        </span>
        <h2 className="mb-8 font-serif text-[27px] leading-snug text-white">
          Documenting truth.
          <br />
          Constructing legal authority.
        </h2>

        <div className="mb-8 rounded-xl bg-[#16223e] px-5 py-4">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#4a5674]" />
              <span className="h-2 w-2 rounded-full bg-[#4a5674]" />
              <span className="h-2 w-2 rounded-full bg-[#4a5674]" />
            </div>
            <span className="font-mono text-[10px] text-[#6b7590]">
              deposition_exhibit_a.rtf
            </span>
            <span className="rounded bg-[#c9902e] px-2 py-0.5 font-mono text-[9px] font-semibold text-[#0f1b33]">
              LIVE FEED
            </span>
          </div>
          <p className="font-mono text-xs italic text-[#6b7590]">
            Listening for testimony...
          </p>
        </div>

        <div className="mt-auto">
          <span className="rounded bg-[#1c2a4a] px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-[#c9902e]">
            CASE LAW
          </span>
          <p className="mb-1 mt-2.5 font-serif text-base text-white">
            All state and federal precedents
          </p>
          <p className="text-xs text-[#7a839c]">
            Instant retrieval of relevant citations and holdings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;