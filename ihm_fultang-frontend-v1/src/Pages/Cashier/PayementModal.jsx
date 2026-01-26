import { useState, useEffect } from "react";
import { X, Printer, Save, AlertCircle } from "lucide-react";
import PropTypes from "prop-types";
import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant.js";
import { useAuthentication } from "../../Utils/Provider.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import { formatDateOnly } from "../../Utils/formatDateMethods.js";

export function PaymentModal({ isOpen, onClose, consultationData }) {
  PaymentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    consultationData: PropTypes.object.isRequired,
  };

  const [selectedFinancialOperation, setSelectedFinancialOperation] =
    useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [billNumber, setBillNumber] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [financialOperations, setFinancialOperations] = useState([]);
  const { userData } = useAuthentication();
  const [error, setError] = useState("");
  const [bill, setBill] = useState();

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  function handleClose() {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsProcessing(true);
    let billData = {
      bill_items: [
        {
          designation: "consultation",
          consultation: consultationData?.id,
        },
      ],
      // ensure numeric ids when possible
      patient: consultationData?.idPatient?.id
        ? Number(consultationData.idPatient.id)
        : undefined,
      operation: selectedFinancialOperation
        ? Number(selectedFinancialOperation)
        : undefined,
      operator: userData?.id ? Number(userData.id) : undefined,
    };
    try {
      console.log(billData);
      const response = await axiosInstance.post("/bill/", billData);

      setIsProcessing(false);
      if (response.status === 201) {
        setBill(response?.data);
        console.log(response.data);
        setBillNumber(response?.data?.id);
        setIsSuccess(true);
        setError(null);
      }
    } catch (error) {
      setIsProcessing(false);
      console.error("Create bill error:", error);
      // Extract meaningful message from server response when available
      let messageText =
        "Une erreur est survenue lors de la création de la facture.";
      if (error.response && error.response.data) {
        const data = error.response.data;
        console.log("Server response data:", data);
        if (typeof data === "string") {
          messageText = data;
        } else if (data.detail) {
          messageText = data.detail;
        } else if (data.details) {
          messageText = data.details;
        } else if (data.bill_items) {
          // serializer errors for bill_items
          messageText = JSON.stringify(data);
        } else {
          messageText = JSON.stringify(data);
        }
      } else if (error.message) {
        messageText = error.message;
      }
      setError(messageText);
    }
  }

  useEffect(() => {
    async function fetchFinancialOperation() {
      try {
        const response = await axiosInstanceAccountant.get(
          "/financial-operation/"
        );
        if (response.status === 200) {
          console.log("financial operation", response);
          setFinancialOperations(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchFinancialOperation();
  }, []);

  const handlePrint = () => {
    // Génère un HTML dédié pour l'impression, comme dans FinancialReport
    const patientName =
      consultationData?.idPatient?.firstName +
      " " +
      consultationData?.idPatient?.lastName;
    const phone = consultationData?.idPatient?.phoneNumber || "Non spécifié";
    const price = consultationData?.consultationPrice?.toLocaleString() || "";
    const date = consultationData?.consultationDate
      ? formatDateOnly(consultationData?.consultationDate)
      : "Non spécifié";
    const html = `
      <html>
        <head>
          <title>Facture Consultation</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #111 }
            table { border-collapse: collapse; width: 100%; font-size: 14px }
            th, td { padding: 8px; border: 1px solid #ddd; }
            th { background: #f3f4f6; }
            h2 { font-size: 18px }
            .meta { font-size: 12px; color: #555; margin-bottom: 10px }
          </style>
        </head>
        <body>
          <h2>Facture de consultation</h2>
          <div class="meta">Généré le: ${new Date().toLocaleString()}</div>
          <table>
            <tbody>
              <tr><th>Patient</th><td>${patientName}</td></tr>
              <tr><th>Téléphone</th><td>${phone}</td></tr>
              <tr><th>Date</th><td>${date}</td></tr>
              <tr><th>Prix</th><td>${price} FCFA</td></tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      alert(
        "Impossible d'ouvrir une nouvelle fenêtre. Désactive le bloqueur de popups ou autorise le site."
      );
      return;
    }
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.focus();
      win.print();
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
      <div
        className={`fixed inset-0 bg-black  transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-70"
        }`}
        onClick={handleClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all duration-300 ${
            isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold ">Invoice Creation</h2>
            <button
              onClick={handleClose}
              className="rounded-full p-1 hover:bg-red-100 transition-colors duration-500"
            >
              <X className="h-7 w-7 text-red-500" />
            </button>
          </div>

          {error && (
            <p className="m-4 font-bold text-md text-red-500">{error}</p>
          )}

          <div className="px-6 py-4">
            {isSuccess ? (
              <div className="space-y-6">
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-green-600" />
                    <p className="ml-3 text-green-700">
                      Invoice created successfully! Invoice number: {billNumber}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 space-y-4">
                  <div id="invoice" className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Patient</p>
                      <p className="font-medium">
                        {consultationData.idPatient.firstName +
                          " " +
                          consultationData.idPatient.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">
                        {consultationData.idPatient.phoneNumber ||
                          "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium">
                        {consultationData.consultationPrice.toLocaleString()}{" "}
                        FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {new Date(
                          consultationData.consultationDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium">
                        {consultationData.consultationPrice.toLocaleString()}{" "}
                        FCFA
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimer la facture
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient
                      </label>
                      <input
                        type="text"
                        value={
                          consultationData?.idPatient?.firstName +
                          " " +
                          consultationData?.idPatient?.lastName
                        }
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={consultationData?.idPatient?.phoneNumber || ""}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="text"
                        value={`${consultationData?.consultationPrice} FCFA`}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="text"
                        value={
                          consultationData?.consultationDate
                            ? formatDateOnly(consultationData?.consultationDate)
                            : "Not Specified"
                        }
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type of financial transaction
                    </label>
                    <select
                      value={selectedFinancialOperation}
                      onChange={(e) =>
                        setSelectedFinancialOperation(e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-2  focus:border-primary-end"
                    >
                      <option value="">Select operation type</option>
                      {(() => {
                        const preferred = ["orange", "mtn", "uba"];
                        const ops = Array.isArray(financialOperations)
                          ? financialOperations
                          : [];
                        const preferredOps = preferred
                          .map((name) =>
                            ops.find(
                              (operation) =>
                                operation?.name?.toLowerCase?.() === name
                            )
                          )
                          .filter(Boolean);
                        const otherOps = ops.filter(
                          (operation) =>
                            !preferred.includes(
                              operation?.name?.toLowerCase?.()
                            )
                        );
                        return [...preferredOps, ...otherOps].map(
                          (operation) => (
                            <option key={operation?.id} value={operation?.id}>
                              {operation?.name}
                            </option>
                          )
                        );
                      })()}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2  bg-red-400  font-bold  rounded-md text-white hover:bg-red-600 transition-all duration-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !selectedFinancialOperation}
                    className={`px-4 py-2 rounded-md text-white font-bold flex items-center transition-colors ${
                      isProcessing || !selectedFinancialOperation
                        ? "bg-primary-end/70 cursor-not-allowed"
                        : "bg-primary-end hover:bg-indigo-700"
                    }`}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    <p className={`${isProcessing ? "animate-pulse" : ""}`}>
                      {isProcessing
                        ? "Creation in progress..."
                        : "Create the invoice"}
                    </p>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
