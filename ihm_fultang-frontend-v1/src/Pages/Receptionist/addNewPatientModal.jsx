import {XIcon} from "lucide-react";
import {useState} from "react";
import PropTypes from "prop-types";
import axiosInstance from "../../Utils/axiosInstance.js";
import {useAuthentication} from "../../Utils/Provider.jsx";


export function AddNewPatientModal({isOpen, onClose, setCanOpenSuccessModal, setSuccessMessage, setIsLoading})
{
    AddNewPatientModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        setCanOpenSuccessModal: PropTypes.func.isRequired,
        setSuccessMessage: PropTypes.func.isRequired,
        setIsLoading: PropTypes.func.isRequired
    }

    const {userData} = useAuthentication();
     const [formData, setFormData] = useState({
            firstName: '',
            lastName: '',
            birthDate: '',
            gender: 'Male',
            address: '',
            cniNumber: '',
            phoneNumber: '',
            email: '',
            idMedicalStaff:'',
        });
    const [error, setError] = useState("");
    const [isYears, setIsYears] = useState(false);
    const [isMonth, setIsMonth] = useState(false);
    const [isWeeks, setIsWeeks] = useState(false);
    const [isDay, setIsDay] = useState(false);
    const [age, setAge] = useState(0);
    const [dateError, setDateError] =useState("");





    function calculateAge(birthDate)
    {
        const today = new Date();
        const birth = new Date(birthDate);
        const diffTime = Math.abs(today - birth);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 7) {
            setIsDay(true);
            setIsWeeks(false);
            setIsMonth(false);
            setIsYears(false);
            return Math.floor(diffDays);
        }
        else if (diffDays < 30) {
            setIsDay(false);
            setIsWeeks(true);
            setIsMonth(false);
            setIsYears(false);
            return Math.floor(diffDays / 7);
        }
        else if (diffDays < 365) {
            setIsDay(false);
            setIsWeeks(false);
            setIsMonth(true);
            setIsYears(false);
            return Math.floor(diffDays / 30);
        } else {
            setIsDay(false);
            setIsWeeks(false);
            setIsMonth(false);
            setIsYears(true);
            let _age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                _age--;
            }
            return _age;
        }
    }


    function handleChange(e) {
        const { name, value } = e.target;
        if (name === 'birthDate') {
            const selectedDate = new Date(value);
            const today = new Date();
            if (selectedDate > today) {
                setDateError('The birth date cannot be in the future');
                setFormData({
                    firstName: '',
                    lastName: '',
                    birthDate: '',
                    gender: 'Male',
                    address: '',
                    cniNumber: '',
                    phoneNumber: '',
                    email: '',
                });
            } else {
                setDateError('');
                setFormData(prevData => ({ ...prevData, [name]: value}));
                setAge(calculateAge(value));
            }
        }
        else {
            setFormData(prevData => ({ ...prevData, [name]: value }));
        }
    }




    async function handleSubmit (e)  {
        e.preventDefault();
        setIsLoading(true);
        if(!dateError)
        {
            formData.idMedicalStaff = userData.id;
            console.log(formData);
            console.log(userData);
            try
            {
                const response = await axiosInstance.post("/patient/", formData);
                if (response.status === 201)
                {
                    setIsLoading(false);
                    setSuccessMessage("Patient added successfully !");
                    setCanOpenSuccessModal(true);
                    onClose();
                }
            }
            catch (error)
            {
                setIsLoading(false);
                setSuccessMessage("");
                setCanOpenSuccessModal(false);
               // setError(error.response.data.email);
                setError("something went wrong, try later please !");
                console.log(error);
            }
        }
    }

    function applyFormStyle()
    {
        return "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-2 focus:border-primary-end";
    }

    function applyAgeStyle()
    {
        return "w-1/4 text-gray-500 text-md mr-1";
    }


    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
                    <div className="bg-gradient-to-r from-primary-end to-primary-start px-6 py-4 rounded-t-lg flex-col flex justify-center items-center">
                        <h3 className="text-4xl font-bold text-white">Add New Patient</h3>
                    </div>

                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <XIcon className="w-6 h-6"/>
                    </button>

                    {dateError && <p className="text-red-500  font-bold text-md ml-4">Error : {dateError}</p>}
                    {error && <p className="text-red-500  font-bold text-md ml-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="p-4 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName"
                                       className="block text-sm font-medium text-gray-700 mb-1">Firstname</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    placeholder={"enter patient's first name"}
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={applyFormStyle()}
                                    required={true}
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName"
                                       className="block text-sm font-medium text-gray-700 mb-1">Lastname</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    placeholder={"enter patient's last name"}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={applyFormStyle()}
                                    required={true}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">Birth
                                    Date</label>
                                    <input
                                        type="date"
                                        id="birthDate"
                                        name="birthDate"
                                        placeholder={"enter patient's birth date"}
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={true}
                                    />
                            </div>
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                <div className={`${applyFormStyle()} flex justify-between`}>
                                    <input
                                        id="age"
                                        name="age"
                                        value={age}
                                        readOnly={true}
                                        className={"w-3/4 outline-none focus:outline-none ring-0 focus:ring-0 "}
                                    />
                                    {isDay && <p className={applyAgeStyle()}> Day(s)</p>}
                                    {isWeeks && <p className={applyAgeStyle()}> Week(s)</p>}
                                    {isMonth && <p className={applyAgeStyle()}> Mount(s)</p>}
                                    {isYears && <p className={applyAgeStyle()}> Year(s)</p>}
                                </div>

                            </div>
                            <div>
                                <label htmlFor="gender"
                                       className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className={applyFormStyle()}
                                    required={true}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    placeholder={"enter patient's address"}
                                    onChange={handleChange}
                                    className={applyFormStyle()}
                                    required={true}
                                />
                            </div>
                            <div className="col-span-2">
                                <label htmlFor="email"
                                       className="block text-sm font-medium text-gray-700 mb-1">Identity Card Number</label>
                                <input
                                    type="text"
                                    id="idNumber"
                                    name="cniNumber"
                                    value={formData.cniNumber}
                                    placeholder={"enter patient's identity card number"}
                                    onChange={handleChange}
                                    className={applyFormStyle()}
                                    required={false}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone
                                    Number</label>
                                <input
                                    type="number"
                                    id="phone"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    placeholder={"enter patient's phone number"}
                                    onChange={handleChange}
                                    className={applyFormStyle()}
                                    required={true}
                                />
                            </div>
                            <div>
                                <label htmlFor="email"
                                       className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    placeholder={"enter patient's email"}
                                    onChange={handleChange}
                                    className={applyFormStyle()}
                                    required={false}
                                />
                            </div>
                        </div>

                        <div className="px-6 py-1 flex justify-center space-x-6">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary-end  hover:text-xl text-md text-white rounded-lg font-bold transition-all duration-300"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border bg-red-400 text-md hover:text-xl hover:bg-red-500 text-white font-bold rounded-lg  transition-all duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}