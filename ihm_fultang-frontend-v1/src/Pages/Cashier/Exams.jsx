import { useEffect, useState } from "react"
import {AlertCircle, Search, Calendar, User, DollarSign, Filter, CheckCircle, Activity } from "lucide-react"
import axiosInstance from "../../Utils/axiosInstance.js";
import {PaymentModal} from "./PayementModal.jsx";


export default function Exams() {
  const [exams, setExams] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [canOpenPaymentModal, setCanOpenPaymentModal] = useState(false);

  const handlePayment = (exam) => {
    setSelectedExam(exam);
    setCanOpenPaymentModal(true);
  };

  const filteredExams = exams.filter((exam) => {
    const patientName = exam.idPatient 
      ? `${exam.idPatient.firstName} ${exam.idPatient.lastName}`.toLowerCase()
      : '';
    const examName = exam.idExam?.examName?.toLowerCase() || '';
    
    return (
      (patientName.includes(searchTerm.toLowerCase()) ||
       examName.includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || exam.examStatus === filterStatus)
    )
  })

  // Charger les examens
  useEffect(() => {
    async function fetchExams() {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/exam-request/");
        console.log("Exams Response:", response.data);  // Debug
        
        if (response.status === 200) {
          const examsData = response.data.results || response.data;
          console.log("Exams Data:", examsData);  // Debug
          setExams(examsData);
        }
      } catch (error) {
        console.error("Error fetching exams:", error);
        setError("Impossible de charger les examens");
        setExams([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExams();
  }, []);


  return (
    <div className="mx-auto p-6 rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Management of Exam Payments</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Rechercher un patient ou un examen"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex items-center space-x-4">
          <Filter className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All statuses</option>
            <option value="pending">On hold</option>
            <option value="paid">Payed</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Aucun examen disponible.</p>
            <p className="text-gray-400 text-sm mt-2">
              Les examens prescrits par les médecins apparaîtront ici.
            </p>
          </div>
        ) : (
          <table className="w-full bg-white">
            <thead className="bg-primary-end">
              <tr>
                <th className="px-6 py-5 text-center text-md font-semibold text-white uppercase rounded-l-lg">
                  Patient
                </th>
                <th className="px-6 py-5 text-center text-md font-semibold text-white uppercase">
                  Exam Type
                </th>
                <th className="px-6 py-5 text-center text-md font-semibold text-white uppercase">
                  Date
                </th>
                <th className="px-6 py-5 text-center text-md font-semibold text-white uppercase">
                  Patient Status
                </th>
                <th className="px-6 py-5 text-center text-md font-semibold text-white uppercase">
                  Status
                </th>
                <th className="px-6 py-5 text-center text-md font-semibold text-white uppercase rounded-r-lg">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExams.map((exam) => (
                <tr key={exam.id}>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-md font-semibold text-gray-900">
                        {exam.idPatient 
                          ? `${exam.idPatient.firstName} ${exam.idPatient.lastName}`
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center">
                      <Activity className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-md text-gray-900">
                        {exam.idExam?.examName || 'N/A'}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-md text-gray-900">
                        {new Date(exam.addDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center">
                      <div className="text-sm text-gray-900">{exam.patientStatus || 'N/A'}</div>
                    </div>
                  </td>

                  <td className="px-6 py-5 flex justify-center items-center">
                    <span className={`px-2 inline-flex text-center text-xs leading-5 font-semibold rounded-full ${
                      exam.examStatus === "paid" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {exam.examStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-center">
                    {exam.examStatus === "pending" && (
                      <button
                        onClick={() => handlePayment(exam.id)}
                        className="flex items-center text-green-600 hover:text-green-800 mx-auto"
                      >
                        <CheckCircle className="h-5 w-5 mr-1" />
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PaymentModal
        isOpen={canOpenPaymentModal}
        onClose={() => setCanOpenPaymentModal(false)}
        examData={selectedExam}
      />
    </div>
  )
}
