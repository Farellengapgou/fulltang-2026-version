import { useEffect, useState } from 'react';
import { BedDouble, BedSingle, Search, Users, CheckCircle, Plus } from 'lucide-react';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { adminNavLink } from "./adminNavLink.js";
import { AdminNavBar } from "./AdminNavBar.jsx";
import { Tooltip } from "antd";
import { FaArrowLeft, FaArrowRight, FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { AddHospitalRoomModal } from "./AddHospitalRoomModal.jsx";
import { ViewRoomDetailsModal } from "./ViewRoomDetailsModal.jsx";
import { EditRoomModal } from "./EditRoomModal.jsx";
import { SuccessModal } from "../Modals/SuccessModal.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import { ErrorModal } from "../Modals/ErrorModal.jsx";
import { ConfirmationModal } from "../Modals/ConfirmAction.Modal.jsx";
import Wait from "../Modals/wait.jsx";

export function AdminHospitalRooms() {
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [canOpenAddNewRoomModal, setCanOpenAddNewRoomModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    // roomsList will hold the rooms fetched from the API. We map API fields
    // to the UI-friendly fields used in the table (number, bedNumber, status, admissionDate, price).
    // filteredRooms and stats are computed from `roomsList` so the UI updates
    // when we fetch new data (for example after creating a room).


    const [roomsList, setRoomList] = useState([]);
    const [nexUrlForRenderRooms, setNextUrlForRenderRooms] = useState(null);
    const [prevUrlForRenderRooms, setPrevUrlForRenderRooms] = useState(null);
    const [numberOfRooms, setNumberOfRooms] = useState(0);
    const [canOpenErrorModal, setCanOpenErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [actualPage, setActualPage] = useState(numberOfRooms > 0 ? 1 : 0);
    const [canOpenConfirmModal, setCanOpenConfirmModal] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState({});
    const [canOpenViewModal, setCanOpenViewModal] = useState(false);
    const [canOpenEditModal, setCanOpenEditModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);


    function calculateTotalPages() {
        if (numberOfRooms > 0) return Math.ceil(numberOfRooms / 5);
        else return 0;
    }

    // compute filteredRooms from roomsList (mapping already applied on fetch)
    const filteredRooms = roomsList.filter(room => {
        const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
        const matchesSearch = room.number && room.number.toString().toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const stats = {
        total: numberOfRooms || roomsList.length,
        available: roomsList.filter(r => r.status === 'available').length,
        occupied: roomsList.filter(r => r.status === 'occupied').length,
    };
    async function fetchHospitalRooms() {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get("/room/");
            if (response.status === 200) {
                setIsLoading(false);
                const results = response.data.results || response.data.result || [];
                const mapped = results.map(r => ({
                    id: r.id,
                    number: r.roomNumber || r.room_label || r.number || String(r.id),
                    bedNumber: r.beds || r.bedNumber || 1,
                    status: (typeof r.occupiedBeds !== 'undefined' && typeof r.beds !== 'undefined') ? (r.occupiedBeds >= r.beds ? 'occupied' : 'available') : (r.status || 'available'),
                    admissionDate: r.addDate || r.created_at || null,
                    price: r.price || 0,
                    raw: r,
                }));

                setRoomList(mapped);
                setNumberOfRooms(response.data.count || mapped.length);
                setNextUrlForRenderRooms(response.data.next);
                setPrevUrlForRenderRooms(response.data.previous);
                setErrorMessage("");
                setCanOpenErrorModal(false);
                setActualPage(1);
            }
        }
        catch (error) {
            setIsLoading(false);
            setSuccessMessage("");
            setErrorMessage("something went wrong, please try again later !");
            setCanOpenErrorModal(true);
            console.log(error);
        }
    }


    async function fetchNextOrPreviousRoomsList(url) {
        if (url) {
            try {
                const response = await axiosInstance.get(url);
                if (response.status === 200) {
                    // adjust page number depending on which url was requested
                    if (url === nexUrlForRenderRooms) setActualPage(p => p + 1);
                    else setActualPage(p => Math.max(1, p - 1));
                    const results = response.data.results || response.data.result || [];
                    const mapped = results.map(r => ({
                        id: r.id,
                        number: r.roomNumber || r.room_label || r.number || String(r.id),
                        bedNumber: r.beds || r.bedNumber || 1,
                        status: (typeof r.occupiedBeds !== 'undefined' && typeof r.beds !== 'undefined') ? (r.occupiedBeds >= r.beds ? 'occupied' : 'available') : (r.status || 'available'),
                        admissionDate: r.addDate || r.created_at || null,
                        price: r.price || 0,
                        raw: r,
                    }));

                    setRoomList(mapped);
                    setNumberOfRooms(response.data.count || mapped.length);
                    setNextUrlForRenderRooms(response.data.next);
                    setPrevUrlForRenderRooms(response.data.previous);
                    setErrorMessage("");
                    setSuccessMessage("");
                    setCanOpenSuccessModal(false);
                    setCanOpenErrorModal(false);
                }
            } catch (error) {
                setSuccessMessage("");
                setErrorMessage("something went wrong, please try again later !");
                setCanOpenSuccessModal(false);
                setCanOpenErrorModal(true);
                console.log(error);
            }
        }
    }


    async function handleDeleteRoom(roomId) {
        setIsLoading(true);
        try {
            const response = await axiosInstance.delete(`/room/${roomId}/`);
            if (response.status === 204) {
                setIsLoading(false);
                setSuccessMessage("room deleted successfully !");
                setErrorMessage("");
                setCanOpenSuccessModal(true);
                setCanOpenErrorModal(false);
            }
        }
        catch (error) {
            setIsLoading(false);
            setSuccessMessage("");
            setErrorMessage(`something went wrong when deleting the room ${roomToDelete.id}, try later please !`);
            setCanOpenSuccessModal(false);
            setCanOpenErrorModal(true);
            console.log(error);
        }
    }


    useEffect(() => {
        fetchHospitalRooms();
    }, []);


    return (
        <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
            <AdminNavBar />


            <div className="p-6 mx-auto relative">

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-secondary">Hospital room management</h1>
                    <button
                        className="font-bold flex items-center gap-2 bg-gradient-to-r from-primary-end to-primary-start text-white px-4 py-2 rounded-md transition-colors"
                        onClick={() => setCanOpenAddNewRoomModal(true)}>
                        <Plus size={20} />
                        Add A New Room
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-primary-end to-primary-start p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-semibold text-md">Total Rooms</p>
                                <h3 className="text-white text-3xl font-bold">{stats.total}</h3>
                            </div>
                            <BedDouble className="text-white h-12 w-12 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-300 to-green-500 p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-semibold text-md">Available Rooms</p>
                                <h3 className="text-white text-3xl font-bold">{stats.available}</h3>
                            </div>
                            <CheckCircle className="text-white h-12 w-12 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-300 to-orange-500 p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-semibold text-md">Occupied Rooms</p>
                                <h3 className="text-white text-3xl font-bold">{stats.occupied}</h3>
                            </div>
                            <Users className="text-white h-12 w-12 opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Search Bar and filters*/}
                <div className="flex flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="looking for a room..."
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none  focus:border-2  focus:border-primary-end"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-2 rounded-md ${filterStatus === 'all' ? 'bg-primary-end text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            onClick={() => setFilterStatus('all')}
                        >
                            ALL
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${filterStatus === 'available' ? 'bg-primary-end  text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            onClick={() => setFilterStatus('available')}
                        >
                            Available
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${filterStatus === 'occupied' ? 'bg-primary-end  text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            onClick={() => setFilterStatus('occupied')}
                        >
                            Occupied
                        </button>
                    </div>
                </div>

                <div>
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="bg-gradient-to-l from-primary-start to-primary-end ">
                                <th className="text-center text-white p-4 text-xl font-bold  border-gray-200 rounded-l-2xl ">Room
                                    Number
                                </th>
                                <th className="text-center text-white p-4 text-xl font-bold border-gray-200">Number Of
                                    Beds
                                </th>
                                <th className="text-center text-white p-4 text-xl font-bold  border-gray-200 ">Status</th>
                                <th className="text-center text-white p-4 text-xl font-bold  border-gray-200 ">Creation
                                    date
                                </th>
                                <th className="text-center text-white p-4 text-xl font-bold  border-gray-200 ">Price/Day</th>
                                <th className="text-center text-white p-4 text-xl font-bold  flex-col rounded-r-2xl">
                                    <p>Operations</p>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRooms.map((room, index) => (
                                <tr key={room.id || index} className="bg-gray-100 cursor-pointer hover:bg-gray-200 transition-all duration-300">
                                    <td className="px-6 py-4 rounded-l-xl">
                                        <div className="flex items-center justify-center">
                                            {room.bedNumber > 1 ? (
                                                <BedDouble className="h-5 w-5 text-gray-400 mr-2" />
                                            ) : (
                                                <BedSingle className="h-5 w-5 text-gray-400 mr-2" />
                                            )}
                                            {room.number}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold">{room.bedNumber}</td>
                                    <td className={`px-6 py-4 text-center font-semibold ${room.status === 'available' ? 'text-green-500' : 'text-orange-500'}`}>
                                        {room.status}
                                    </td>
                                    <td className="px-6 py-4 text-center">{room.admissionDate || '-'}</td>
                                    <td className="px-6 py-4 text-center">{room.price} FCFA</td>
                                    <td className="px-6 py-4 rounded-r-xl">
                                        <div className="w-full flex gap-4 items-center justify-center">
                                            <Tooltip placement={"left"} title={"view details"}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRoom(room);
                                                        setCanOpenViewModal(true);
                                                    }}
                                                    className="flex items-center justify-center w-9 h-9 text-primary-end text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                    <FaEye />
                                                </button>
                                            </Tooltip>
                                            <Tooltip placement={"right"} title={"Edit"}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRoom(room);
                                                        setCanOpenEditModal(true);
                                                    }}
                                                    className="flex items-center justify-center w-9 h-9 text-green-500 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                    <FaEdit />
                                                </button>
                                            </Tooltip>
                                            <Tooltip placement={"right"} title={"delete"}>
                                                <button
                                                    onClick={() => { setRoomToDelete(room), setCanOpenConfirmModal(true) }}
                                                    className="flex items-center justify-center w-9 h-9 text-red-500 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                    <FaTrash />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/*Pagination content */}
                    <div className="w-full justify-center flex mt-6 mb-4">
                        <div className="flex gap-4">
                            <Tooltip placement={"left"} title={"previous slide"}>
                                <button onClick={async () => { await fetchNextOrPreviousRoomsList(prevUrlForRenderRooms) }}
                                    className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2">
                                    <FaArrowLeft />
                                </button>
                            </Tooltip>
                            <p className="text-secondary text-2xl font-bold mt-4">{`${actualPage} / ${calculateTotalPages()}`}</p>
                            <Tooltip placement={"right"} title={"next slide"}>
                                <button onClick={async () => { await fetchNextOrPreviousRoomsList(nexUrlForRenderRooms) }}
                                    className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2">
                                    <FaArrowRight />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading && <Wait />}
            <AddHospitalRoomModal isOpen={canOpenAddNewRoomModal} onClose={setCanOpenAddNewRoomModal} setCanOpenSuccessModal={setCanOpenSuccessModal} setSuccessMessage={setSuccessMessage} />
            <ViewRoomDetailsModal isOpen={canOpenViewModal} onClose={setCanOpenViewModal} room={selectedRoom} />
            <EditRoomModal isOpen={canOpenEditModal} onClose={setCanOpenEditModal} room={selectedRoom} setCanOpenSuccessModal={setCanOpenSuccessModal} setSuccessMessage={setSuccessMessage} />
            <SuccessModal isOpen={canOpenSuccessModal} canOpenSuccessModal={setCanOpenSuccessModal} message={successMessage} makeAction={async () => { setCanOpenAddNewRoomModal(false); setCanOpenEditModal(false); await fetchHospitalRooms(); }} />
            <ErrorModal isOpen={canOpenErrorModal} onCloseErrorModal={setCanOpenErrorModal} message={errorMessage} />
            <ConfirmationModal isOpen={canOpenConfirmModal} onClose={() => setCanOpenConfirmModal(false)} onConfirm={async () => await handleDeleteRoom(roomToDelete.id)} title={`Delete room`} message={`Are you sure you want to delete the room ${roomToDelete.number} ?`} />
        </CustomDashboard>
    );
}

