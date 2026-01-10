import { useState, useEffect } from 'react';
import { BedDouble, DollarSign, Users, CheckCircle, X } from 'lucide-react';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { adminNavLink } from "./adminNavLink.js";
import { AdminNavBar } from "./AdminNavBar.jsx";
import PropTypes from "prop-types";
import axiosInstance from "../../Utils/axiosInstance.js";

export function EditRoomModal({ isOpen, onClose, room, setSuccessMessage, setCanOpenSuccessModal }) {

    EditRoomModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        room: PropTypes.object,
        setSuccessMessage: PropTypes.func.isRequired,
        setCanOpenSuccessModal: PropTypes.func.isRequired,
    }

    const [roomData, setRoomData] = useState({
        roomNumber: '',
        type: 'Simple',
        beds: 1,
        price: '',
        facilities: [],
    });
    const [error, setError] = useState("");
    const facilityOptions = ['Television', 'Air conditioning', 'Private bathroom', 'Mini fridge'];

    // Pre-populate form when room changes
    useEffect(() => {
        if (room && room.raw) {
            setRoomData({
                roomNumber: room.raw.roomNumber || room.number || '',
                type: room.raw.type || 'Simple',
                beds: room.raw.beds || room.bedNumber || 1,
                price: room.raw.price || room.price || '',
                facilities: room.raw.facilities || [],
            });
        }
    }, [room]);

    function handleChange(e) {
        const { name, value } = e.target;
        setRoomData(prev => (
            {
                ...prev,
                [name]: value
            }
        ));
    }

    function handleFacilityChange(facility) {
        setRoomData(prev => (
            {
                ...prev,
                facilities: prev.facilities.includes(facility)
                    ? prev.facilities.filter(f => f !== facility)
                    : [...prev.facilities, facility]
            }
        ));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!room || !room.id) {
            setError("Invalid room data");
            return;
        }

        try {
            const response = await axiosInstance.put(`/room/${room.id}/`, roomData);
            if (response.status === 200) {
                setSuccessMessage("Room updated successfully!");
                setError("");
                setCanOpenSuccessModal(true);
                onClose(false);
            }
        } catch (error) {
            // Extract specific error message from backend response
            if (error.response && error.response.data) {
                const errorData = error.response.data;

                // Handle field-specific errors
                if (errorData.roomNumber) {
                    // Room number validation error (duplicate)
                    setError(errorData.roomNumber[0] || "Room number error");
                } else if (errorData.beds) {
                    setError(errorData.beds[0] || "Invalid number of beds");
                } else if (errorData.price) {
                    setError(errorData.price[0] || "Invalid price");
                } else if (errorData.type) {
                    setError(errorData.type[0] || "Invalid room type");
                } else if (errorData.detail) {
                    // General error message
                    setError(errorData.detail);
                } else if (typeof errorData === 'string') {
                    setError(errorData);
                } else {
                    // If none of the specific fields, show generic message
                    setError("Something went wrong, try later please!");
                }
            } else {
                setError("Something went wrong, try later please!");
            }

            setCanOpenSuccessModal(false);
            setSuccessMessage("");
            console.log(error);
        }
    }

    if (!isOpen || !room) return null;

    return (
        <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
            <AdminNavBar />
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
                <div className="bg-white rounded-xl shadow-xl w-[800px]">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-end to-primary-start px-6 py-4 flex justify-between items-center">
                            <h1 className="text-3xl font-bold text-white">Edit Room</h1>
                            <button className="text-white hover:text-gray-200 transition-colors"
                                onClick={() => onClose(false)}>
                                <X size={30} />
                            </button>
                        </div>

                        {error && <p className="text-md text-red-500 m-2">{error}</p>}
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="number">Room Number</label>
                                    <input
                                        type="text"
                                        id="number"
                                        name="roomNumber"
                                        value={roomData.roomNumber}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none  focus:border-primary-end"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="type">Room Type</label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={roomData.type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary-end"
                                    >
                                        <option value="Simple">Simple</option>
                                        <option value="Double">Double</option>
                                        <option value="VIP">VIP</option>
                                        <option value="Multiple">Multiple</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="beds">Number Of Beds</label>
                                    <input
                                        type="number"
                                        id="beds"
                                        name="beds"
                                        value={roomData.beds}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md  focus:border-2  focus:border-primary-end"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="price">Price per night</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={roomData.price}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#4DB6AC] focus:border-[#4DB6AC]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Equipments</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {facilityOptions.map((facility) => (
                                        <label key={facility} className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-primary-end"
                                                checked={roomData.facilities.includes(facility)}
                                                onChange={() => handleFacilityChange(facility)}
                                            />
                                            <span className="ml-2 text-gray-700">{facility}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Room overview</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <BedDouble className="h-6 w-6 text-gray-400 mr-2" />
                                        <span className="text-gray-600">{roomData.beds} lit(s)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <DollarSign className="h-6 w-6 text-gray-400 mr-2" />
                                        <span className="text-gray-600">{roomData.price || 0} FCFA/nights</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="h-6 w-6 text-gray-400 mr-2" />
                                        <span className="text-gray-600">Capacity: {roomData.beds * 2} persons</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {roomData.facilities.map((facility) => (
                                        <span key={facility} className="bg-[#4DB6AC] text-white px-3 py-1 rounded-full text-sm">{facility}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => onClose(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary-end  text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
                                >
                                    <CheckCircle className="mr-2" size={20} />
                                    Update Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </CustomDashboard>
    );
}
