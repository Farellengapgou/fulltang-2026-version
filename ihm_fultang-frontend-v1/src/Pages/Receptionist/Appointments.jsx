import {DashBoard} from "../../GlobalComponents/DashBoard.jsx";
import {receptionistNavLink} from "./receptionistNavLink.js";
import {ReceptionistNavBar} from "./ReceptionistNavBar.jsx";
import {FaArrowLeft, FaArrowRight, FaSearch} from "react-icons/fa";
import {Tooltip} from "antd";


export const ScheduledAppointments =[
    {
        id: 1,
        doctor: "Dr. Emily Thompson",
        patient: "John Smith",
        reason: "Routine Checkup",
        atDate: "2024-03-15 10:30",
        requirements: "No specific requirements"
    },
    {
        id: 2,
        doctor: "Dr. Michael Rodriguez",
        patient: "Sarah Johnson",
        reason: "Cardiology Consultation",
        atDate: "2024-03-16 14:45",
        requirements: "Fasting required, bring recent ECG results"
    },
    {
         id: 3,
        doctor: "Dr. Alexandra Kim",
        patient: "David Lee",
        reason: "Orthopedic Evaluation",
        atDate: "2024-03-17 11:15",
        requirements: "X-ray images from previous visit"
    },
    {
        id: 4,
        doctor: "Dr. Robert Chen",
        patient: "Emma Wilson",
        reason: "Dermatology Follow-up",
        atDate: "2024-03-18 09:00",
        requirements: "Bring current medication list"
    },
    {
        id: 5,
        doctor: "Dr. Maria Garcia",
        patient: "Thomas Brown",
        reason: "Pediatric Wellness Check",
        atDate: "2024-03-19 13:20",
        requirements: "Child's vaccination record"
    },
    {
        id: 6,
        doctor: "Dr. Maria Garcia",
        patient: "Thomas Brown",
        reason: "Pediatric Wellness Check",
        atDate: "2024-03-19 13:20",
        requirements: "Child's vaccination record"
    },
];

export function Appointments() {
    return (
        <DashBoard requiredRole={"Receptionist"} linkList={receptionistNavLink}>
            <ReceptionistNavBar/>

            {/*Header content with search bar*/}
            <div className="flex justify-between mb-8 mt-5">
                <p className="font-bold text-xl mt-2 ml-5"> List Of Scheduled Appointments </p>
                <div className="flex mr-5">
                    <div className="flex w-[300px] h-10 border-2 border-secondary rounded-lg">
                        <FaSearch className="text-xl text-secondary m-2"/>
                        <input
                            type="text"
                            placeholder={"search for a specific appointment"}
                            className="w-full mr-2 border-none focus:outline-none focus:ring-0"
                        />
                    </div>
                    <button className="ml-2 w-20 h-10 text-white bg-secondary rounded-lg">
                        Search
                    </button>
                </div>
            </div>


            {/*List of scheduled  appointments*/}

            <div className="ml-5 mr-5 ">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                    <tr className=" ">
                        <th className="text-center text-white p-4 text-xl font-bold bg-primary-end   rounded-l-2xl ">No</th>
                        <th className="text-center text-white p-4 text-xl font-bold bg-primary-end ">Doctor</th>
                        <th className="text-center text-white p-4 text-xl font-bold  bg-primary-end ">Patient
                        </th>
                        <th className="text-center text-white p-4 text-xl font-bold bg-primary-end  ">Reason</th>
                        <th className="text-center text-white p-4 text-xl font-bold bg-primary-end  ">Scheduled Time
                        </th>
                        <th className="text-center text-white p-4 text-xl font-bold bg-primary-end flex-col rounded-r-2xl">
                            <p>Requirements</p>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {ScheduledAppointments.map((patient, index) => (
                        <tr key={patient.id || index} className="">
                            <td className="p-4 text-md text-blue-900 rounded-l-lg bg-gray-100 text-center">{index + 1}</td>
                            <td className="p-4 text-md text-center bg-gray-100 font-bold">{patient.doctor}</td>
                            <td className="p-4 text-md  bg-gray-100 text-center">{patient.patient}</td>
                            <td className="p-4 text-md bg-gray-100 text-center">{patient.reason}</td>
                            <td className="p-4 text-center bg-gray-100 text-md">{patient.atDate}</td>
                            <td className="p-4 relative bg-gray-100 rounded-r-lg">
                                <div className="w-full items-center justify-center flex gap-6">
                                    <p>{patient.requirements}</p>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>


                {/*Pagination content */}
                <div className="justify-center flex mt-6 mb-4">
                    <div className="flex gap-4">
                        <Tooltip placement={"left"} title={"previous slide"}>
                            <button
                                onClick={async ()=> {}}
                                className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2">
                                <FaArrowLeft/>
                            </button>
                        </Tooltip>
                        <p className="text-secondary text-2xl font-bold mt-4">1/10</p>
                        <Tooltip placement={"right"} title={"next slide"}>
                            <button
                                onClick={async ()=> {}}
                                className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2">
                                <FaArrowRight/>
                            </button>
                        </Tooltip>
                    </div>
                </div>
                  </div>
        </DashBoard>
    )
}