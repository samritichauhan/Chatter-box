import { useState, useRef } from "react";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Avatar from "../common/Avatar";
import useAuthStore from "../../store/useAuthStore";
import api from "../../lib/api";
import toast from "react-hot-toast";

const ProfilePage = ({ onBack }) => {
  const { user, updateUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [about, setAbout] = useState(user?.about || "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/users/profile", { fullName, about });
      updateUser(res.data);
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.put("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(res.data);
      toast.success("Avatar updated");
    } catch (error) {
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", damping: 25 }}
      className="w-full md:w-[380px] h-full bg-[#1e1b4b] border-r border-white/5 flex flex-col"
    >
      <div className="flex items-center gap-4 px-4 py-3.5 border-b border-white/8 bg-[#1a1740]">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-white/8 text-indigo-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-heading font-semibold text-white">Profile</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center py-8 bg-gradient-to-b from-purple-900/30 to-transparent">
          <div className="relative">
            <Avatar src={user?.avatar} name={user?.fullName} size="2xl" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 transition-transform hover:scale-105"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="px-6 space-y-6">
          <div>
            <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Your Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-2 px-0 py-2.5 bg-transparent border-b border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              About
            </label>
            <input
              type="text"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full mt-2 px-0 py-2.5 bg-transparent border-b border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Email
            </label>
            <p className="mt-2 py-2.5 text-indigo-300/60">{user?.email}</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Username
            </label>
            <p className="mt-2 py-2.5 text-indigo-300/60">@{user?.username}</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
