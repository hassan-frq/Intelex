import { useState } from "react";
import Button from "../../components/common/Button/Button";
import Card from "../../components/common/Card/Card";
import Input from "../../components/common/Input/Input";
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
      setProfileMessage({ type: "success", text: "Profile updated successfully." });
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
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
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

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <div>
        <h2 className="text-lg font-semibold text-white">Profile</h2>
        <p className="mt-1 text-sm text-zinc-400">Update your name and email address.</p>
      </div>

      <Card>
        <form className="space-y-5" onSubmit={handleProfileSubmit}>
          {profileMessage && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                profileMessage.type === "success"
                  ? "border-green-800 bg-green-950/50 text-green-400"
                  : "border-red-800 bg-red-950/50 text-red-400"
              }`}
            >
              {profileMessage.text}
            </div>
          )}

          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button type="submit" className={isSavingProfile ? "opacity-60" : ""}>
            {isSavingProfile ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-white">Change Password</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Choose a strong password you don't use elsewhere.
        </p>
      </div>

      <Card>
        <form className="space-y-5" onSubmit={handlePasswordSubmit}>
          {passwordMessage && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                passwordMessage.type === "success"
                  ? "border-green-800 bg-green-950/50 text-green-400"
                  : "border-red-800 bg-red-950/50 text-red-400"
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button type="submit" className={isSavingPassword ? "opacity-60" : ""}>
            {isSavingPassword ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default Settings;