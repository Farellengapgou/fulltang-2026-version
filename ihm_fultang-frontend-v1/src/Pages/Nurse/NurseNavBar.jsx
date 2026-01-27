import React, { useState } from "react"; // <-- Ajout de useState
import { FaFlag, FaBell, FaEnvelope, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuthentication } from "../../Utils/Provider.jsx";
import { Tooltip } from "antd";
import PropTypes from "prop-types";
import userIcon from "../../assets/userIcon.png";
import { useNavigate } from "react-router-dom";
import { useMessageBadge } from "../../Utils/useMessageBadge.js";
import { UserProfileModal } from '../../GlobalComponents/UserProfileModal.jsx';

export function NurseNavBar({ children }) {
    const { logout, userData } = useAuthentication();
    const navigate = useNavigate();
    const messageCount = useMessageBadge();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const applyNavLinkBtnStyle = () =>
        "w-12 h-10 border-2 bg-gray-100 flex justify-center items-center rounded-xl shadow-xl hover:bg-secondary text-secondary text-xl hover:text-white transition-all duration-300";

    return (
        <div>
            <div className="border-b-2 m-3 border-b-gray-300">
                <div className="h-[70px] w-full flex justify-between">
                    <div className="text-5xl font-bold mt-3 ml-5">
                        <span>Nurse</span>
                    </div>
                    <div className="flex gap-2 mt-5 mb-4 mr-5">
                        {/* Messages */}
                        <div className="relative">
                            <Tooltip placement="top" title="Messages">
                                <button
                                    onClick={() => navigate("/nurse/messages")}
                                    className={applyNavLinkBtnStyle()}
                                >
                                    <FaEnvelope />
                                </button>
                            </Tooltip>
                            {messageCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse pointer-events-none">
                                    {messageCount > 99 ? "99+" : messageCount}
                                </span>
                            )}
                        </div>

                        {/* Logout */}
                        <Tooltip placement="top" title="LogOut">
                            <button
                                onClick={logout}
                                className="w-12 h-10 border-2 bg-red-500 flex justify-center items-center rounded-xl shadow-xl hover:bg-white text-white text-xl hover:text-red-500 transition-all duration-300"
                            >
                                <FaSignOutAlt />
                            </button>
                        </Tooltip>

                        {/* Profile */}
                        <Tooltip placement="top" title="Profile">
                            <div
                                className="ml-3 flex cursor-pointer"
                                onClick={() => setIsProfileOpen(true)}
                            >
                                <p className="font-bold text-secondary text-xl mt-2">
                                    {"Hello " + userData?.username + "!"}
                                </p>
                                <img
                                    src={userData?.profilePicture || userIcon}
                                    alt="user-icon"
                                    className="w-12 h-12 ml-2 mr-3 rounded-full object-cover border-2 border-gray-200"
                                />
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-screen mt-5">
                {children}
            </div>

            {/* Modal de profil */}
            <UserProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    );
}

NurseNavBar.propTypes = {
    children: PropTypes.node.isRequired,
};
