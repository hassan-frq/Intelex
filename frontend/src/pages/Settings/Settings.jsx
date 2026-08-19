import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, changePassword } from "../../services/userService";

function Settings() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileMessage, setProfileMessage] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileMessage(null);
    setIsSavingProfile(true);
    try {
      const updated = await updateProfile({ name, email });
      updateUser(updated);
      setProfileMessage({ type: "success", text: "Profile updated." });
    } catch (err) {
      const text = err.response?.data?.error || "Something went wrong. Please try again.";
      setProfileMessage({ type: "error", text });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    setIsSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMessage({ type: "success", text: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const text = err.response?.data?.error || "Something went wrong. Please try again.";
      setPasswordMessage({ type: "error", text });
    } finally {
      setIsSavingPassword(false);
    }
  }

  const inputStyle = {
    width: "100%",
    background: "#0a1420",
    border: "1px solid #1e2d3d",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#8a9baa",
    fontSize: 13,
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontSize: 10,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#4d6070",
    marginBottom: 8,
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl">

      {/* Page header */}
      <div className="mb-2">
        <p className="text-xs font-medium uppercase mb-1" style={{ color: "#c9a84c", letterSpacing: "0.15em" }}>
          Account Management
        </p>
        <h1 className="text-2xl font-semibold" style={{ color: "#e8e0d0" }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "#4d6070" }}>
          Manage your profile and account security.
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-xl p-5" style={{ background: "#111c27", border: "1px solid #1e2d3d" }}>
        <p className="text-xs font-medium uppercase mb-4" style={{ color: "#4d6070", letterSpacing: "0.12em" }}>
          Profile
        </p>

        <form className="space-y-4" onSubmit={handleProfileSubmit}>
          {profileMessage && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                background: profileMessage.type === "success" ? "rgba(45, 74, 62, 0.3)" : "rgba(224, 85, 85, 0.1)",
                border: profileMessage.type === "success" ? "1px solid #2d4a3e" : "1px solid rgba(224, 85, 85, 0.3)",
                color: profileMessage.type === "success" ? "#4caf82" : "#e05555",
              }}
            >
              {profileMessage.text}
            </div>
          )}

          <div>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
              onBlur={(e) => (e.target.style.borderColor = "#1e2d3d")}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
              onBlur={(e) => (e.target.style.borderColor = "#1e2d3d")}
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center rounded-lg py-3 text-sm font-medium transition-all"
            style={{
              background: "rgba(201, 168, 76, 0.08)",
              border: "1px solid rgba(201, 168, 76, 0.3)",
              color: isSavingProfile ? "#4d6070" : "#c9a84c",
              letterSpacing: "0.03em",
              opacity: isSavingProfile ? 0.6 : 1,
              cursor: "pointer",
            }}
          >
            {isSavingProfile ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>

      {/* Change password card */}
      <div className="rounded-xl p-5" style={{ background: "#111c27", border: "1px solid #1e2d3d" }}>
        <p className="text-xs font-medium uppercase mb-4" style={{ color: "#4d6070", letterSpacing: "0.12em" }}>
          Change Password
        </p>

        <form className="space-y-4" onSubmit={handlePasswordSubmit}>
          {passwordMessage && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                background: passwordMessage.type === "success" ? "rgba(45, 74, 62, 0.3)" : "rgba(224, 85, 85, 0.1)",
                border: passwordMessage.type === "success" ? "1px solid #2d4a3e" : "1px solid rgba(224, 85, 85, 0.3)",
                color: passwordMessage.type === "success" ? "#4caf82" : "#e05555",
              }}
            >
              {passwordMessage.text}
            </div>
          )}

          <div>
            <label style={labelStyle}>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
              onBlur={(e) => (e.target.style.borderColor = "#1e2d3d")}
            />
          </div>

          <div>
            <label style={labelStyle}>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
              onBlur={(e) => (e.target.style.borderColor = "#1e2d3d")}
            />
          </div>

          <div>
            <label style={labelStyle}>Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
              onBlur={(e) => (e.target.style.borderColor = "#1e2d3d")}
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center rounded-lg py-3 text-sm font-medium transition-all"
            style={{
              background: "rgba(201, 168, 76, 0.08)",
              border: "1px solid rgba(201, 168, 76, 0.3)",
              color: isSavingPassword ? "#4d6070" : "#c9a84c",
              letterSpacing: "0.03em",
              opacity: isSavingPassword ? 0.6 : 1,
              cursor: "pointer",
            }}
          >
            {isSavingPassword ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>

    </div>
  );
}

export default Settings;