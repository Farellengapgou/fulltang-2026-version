import { FaCog, FaEnvelope, FaSignOutAlt } from "react-icons/fa";
import { Tooltip, Modal, Input, message } from "antd";
import { useAuthentication } from "../../Utils/Provider.jsx";
import userIcon from "../../assets/userIcon.png";
import { AppRoutesPaths } from "../../Router/appRouterPaths.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

export function CashierNavBar() {
  const { logout, userData } = useAuthentication();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: userData?.username || "",
    email: userData?.email || "",
  });

  const applyNavLinkBtnStyle = () => {
    return " w-12 h-10 mt-1 border-2 bg-gray-100 flex justify-center items-center rounded-xl shadow-xl hover:bg-secondary text-secondary text-xl hover:text-white transition-all duration-300";
  };

  return (
    <>
      <div className="border-b-2 m-3  border-b-gray-300">
        <div className="w-full h-[70px] flex justify-between">
          <h1 className="ml-3 text-4xl text-secondary mt-3.5 font-bold">
            Cashier
          </h1>
          <div className="flex gap-3 mt-3.5 mb-4 mr-5">
            <Tooltip placement={"top"} title={"settings"}>
              <button
                onClick={() => {
                  // open settings modal
                  setProfileForm({
                    username: userData?.username || "",
                    email: userData?.email || "",
                  });
                  setIsSettingsOpen(true);
                }}
                className={applyNavLinkBtnStyle()}
              >
                <FaCog />
              </button>
            </Tooltip>

            <Tooltip placement={"top"} title={"Messages"}>
              <button
                onClick={() => {
                  // Navigate to the help center / messages page
                  navigate(AppRoutesPaths.helpCenter);
                }}
                className={applyNavLinkBtnStyle()}
              >
                <FaEnvelope />
              </button>
            </Tooltip>
            <Tooltip placement={"top"} title={"LogOut"}>
              <button
                onClick={() => {
                  logout();
                }}
                className={
                  " w-12 h-10 mt-1 border-2 bg-red-400 flex justify-center items-center rounded-xl shadow-xl hover:bg-white text-white text-xl hover:text-red-500 transition-all duration-300"
                }
              >
                <FaSignOutAlt />
              </button>
            </Tooltip>
            <Tooltip placement={"top"} title={"Profile"}>
              <button className="ml-3 flex">
                <p className="font-bold text-secondary text-xl mt-2">
                  {"Hello " + userData?.username + "!"}
                </p>
                <img
                  src={userIcon}
                  alt={"user-icon"}
                  className="w-12 h-12 ml-2 mr-3"
                />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
      {/* Settings modal */}
      <Modal
        title="Settings"
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        onOk={async () => {
          // Save profile changes
          const token = localStorage.getItem("token_key_fultang");
          try {
            const payload = {
              username: profileForm.username,
              email: profileForm.email,
            };
            const response = await axios.patch(
              "http://127.0.0.1:8009/api/v1/auth/me/",
              payload,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200 || response.status === 204) {
              message.success("Profile updated. Reloading...");
              // Refresh app state: reload to let Provider fetch latest user
              setTimeout(() => window.location.reload(), 800);
            } else {
              message.error("Unable to update profile");
            }
          } catch (err) {
            console.error(err);
            message.error("Error updating profile");
          }
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <Input
              value={profileForm.username}
              onChange={(e) =>
                setProfileForm((s) => ({ ...s, username: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm((s) => ({ ...s, email: e.target.value }))
              }
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
