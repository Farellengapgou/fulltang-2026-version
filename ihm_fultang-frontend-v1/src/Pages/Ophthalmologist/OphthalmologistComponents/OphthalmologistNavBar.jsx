import {FaEnvelope, FaSignOutAlt} from "react-icons/fa";
import {Tooltip} from "antd";
import {useAuthentication} from "../../../Utils/Provider.jsx";
import userIcon from "../../../assets/userIcon.png";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { useMessageBadge } from "../../../Utils/useMessageBadge.js";

export function OphthalmologistNavBar({ messageCount }) {
    const navigate = useNavigate();
    const liveCount = useMessageBadge();
    const displayCount = messageCount ?? liveCount;

    const {logout , userData} = useAuthentication();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const applyNavLinkBtnStyle = () => {
        return " w-12 h-10 mt-1 border-2 bg-gray-100 flex justify-center items-center rounded-xl shadow-xl hover:bg-secondary text-secondary text-xl hover:text-white transition-all duration-300";
    }

    return (
        <>
            <div className="border-b-2 m-3  border-b-gray-300">
                <div className="w-full h-[70px] flex justify-between">
                    <h1 className="ml-3 text-4xl text-secondary mt-3.5 font-bold">
                       Ophthalmologist
                    </h1>
                    <div className="flex gap-3 mt-3.5 mb-4 mr-5">
                        <div className="relative">
                            <Tooltip placement={"top"} title={"Notifications"}>
                                <button
                                    onClick={() => navigate("/ophthalmologist/messages")}
                                    className={applyNavLinkBtnStyle()}
                                >
                                    <FaEnvelope />
                                </button>
                            </Tooltip>
                            {displayCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse pointer-events-none">
                                    {displayCount > 99 ? "99+" : displayCount}
                                </span>
                            )}
                        </div>

                        <Tooltip placement={"top"} title={"LogOut"}>
                            <button
                                onClick={() => {logout()}}
                                className={" w-12 h-10 mt-1 border-2 bg-red-400 flex justify-center items-center rounded-xl shadow-xl hover:bg-white text-white text-xl hover:text-red-500 transition-all duration-300"}>
                                <FaSignOutAlt/>
                            </button>
                        </Tooltip>
                        
                        <Tooltip placement={"top"} title={"Mon Profil"}>
                            <div 
                                className="ml-3 flex cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setIsProfileModalOpen(true)}
                            >
                                <p className="font-bold text-secondary text-xl mt-2">{"Hello " + userData?.username + "!"}</p>
                                <img 
                                    src={userData?.profilePicture || userIcon} 
                                    alt={"user-icon"} 
                                    className="w-12 h-12 ml-2 mr-3 rounded-full object-cover border-2 border-gray-200"
                                />
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </>
    )
}
OphthalmologistNavBar.propTypes = {
    messageCount: PropTypes.number,
};
