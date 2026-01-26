import PropTypes from "prop-types";
import { BedDouble, DollarSign, Users, X, Calendar, Home } from 'lucide-react';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { adminNavLink } from "./adminNavLink.js";
import { AdminNavBar } from "./AdminNavBar.jsx";

export function ViewRoomDetailsModal({ isOpen, onClose, room }) {

    ViewRoomDetailsModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        room: PropTypes.object,
    }

    if (!isOpen || !room) return null;

    return (
        <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
            <AdminNavBar />
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
                <div className="bg-white rounded-xl shadow-xl w-[700px]">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-end to-primary-start px-6 py-4 flex justify-between items-center">
                            <h1 className="text-3xl font-bold text-white">Room Details</h1>
                            <button
                                className="text-white hover:text-gray-200 transition-colors"
                                onClick={() => onClose(false)}
                            >
                                <X size={30} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Room Number and Type */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <Home className="h-5 w-5 text-primary-end mr-2" />
                                        <p className="text-sm font-medium text-gray-500">Room Number</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{room.number}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <BedDouble className="h-5 w-5 text-primary-end mr-2" />
                                        <p className="text-sm font-medium text-gray-500">Room Type</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{room.raw?.type || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Beds and Price */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <BedDouble className="h-5 w-5 text-primary-end mr-2" />
                                        <p className="text-sm font-medium text-gray-500">Number of Beds</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{room.bedNumber}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <DollarSign className="h-5 w-5 text-primary-end mr-2" />
                                        <p className="text-sm font-medium text-gray-500">Price per Day</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{room.price} FCFA</p>
                                </div>
                            </div>

                            {/* Status and Creation Date */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <Users className="h-5 w-5 text-primary-end mr-2" />
                                        <p className="text-sm font-medium text-gray-500">Status</p>
                                    </div>
                                    <p className={`text-xl font-bold ${room.status === 'available' ? 'text-green-500' : 'text-orange-500'}`}>
                                        {room.status === 'available' ? 'Available' : 'Occupied'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <Calendar className="h-5 w-5 text-primary-end mr-2" />
                                        <p className="text-sm font-medium text-gray-500">Created On</p>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">{room.admissionDate || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Facilities */}
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-700 mb-3">Facilities & Amenities</p>
                                <div className="flex flex-wrap gap-2">
                                    {room.raw?.facilities && room.raw.facilities.length > 0 ? (
                                        room.raw.facilities.map((facility, index) => (
                                            <span
                                                key={index}
                                                className="bg-primary-end text-white px-3 py-1 rounded-full text-sm font-medium"
                                            >
                                                {facility}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 italic">No facilities listed</span>
                                    )}
                                </div>
                            </div>

                            {/* Capacity Info */}
                            <div className="bg-gradient-to-r from-primary-end/10 to-primary-start/10 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <Users className="h-6 w-6 text-primary-end mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-600">Estimated Capacity</p>
                                        <p className="text-lg font-bold text-gray-900">{room.bedNumber * 2} persons</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => onClose(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-md transition-colors duration-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomDashboard>
    );
}
