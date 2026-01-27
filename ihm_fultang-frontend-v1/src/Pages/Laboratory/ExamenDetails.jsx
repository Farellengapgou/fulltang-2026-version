"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../Utils/axiosInstance.js";
import { LaboratoryNavBar } from "./LaboratoryNavBar.jsx";
import { LaboratoryDashBoard } from "./LaboratoryDashBoard.jsx";
import {
  ArrowLeft,
  Printer,
  Calendar,
  User,
  Stethoscope,
  FileText,
  Upload,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { laboratoryNavLink } from "./LaboratoryNavLink.js";

export function ExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [labNotes, setLabNotes] = useState("");
  const [newExamStatus, setNewExamStatus] = useState("Completed");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function fetchExamDetails() {
      try {
        const response = await axiosInstance.get(`/exam-request/${id}/`);
        if (response.status === 200) {
          // Vérifier si l'examen est déjà complété
          if (response.data.examStatus === "Completed") {
            setError("This exam has already been completed");
            // Optionnel: rediriger automatiquement après 2 secondes
            setTimeout(() => {
              navigate(-1);
            }, 2000);
            return;
          }

          setExamData(response.data);
          setLabNotes(response.data.notes || "");
          setNewExamStatus(response.data.examStatus || "Not Completed");
        }
      } catch (err) {
        setError("Error loading exam details");
      } finally {
        setIsLoading(false);
      }
    }
    fetchExamDetails();
  }, [id, navigate]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await axiosInstance.put(`/exam-request/${id}/`, {
        examName: examData.examName || examData.idExam?.examName || "Exam",
        examStatus: "Completed",
        patientStatus: examData.patientStatus || "Invalid",
        notes: examData.notes || "",
        idExam: examData.idExam?.id || examData.idExam,
        idConsultation: examData.idConsultation?.id || examData.idConsultation,
        idPatient: examData.idPatient?.id || examData.idPatient,
        idMedicalStaff: examData.idMedicalStaff?.id || examData.idMedicalStaff,
      });

      const formData = new FormData();
      formData.append("notes", labNotes);
      if (uploadedFile) {
        formData.append("examFile", uploadedFile);
      }
      formData.append("idExamRequest", examData.id);
      formData.append("idMedicalFolderPage", examData.idMedicalFolder || 1);
      formData.append("idPatient", examData.idPatient?.id);
      formData.append("idMedicalStaff", examData.idMedicalStaff?.id);

      const response = await axiosInstance.post(`/exam-result/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 201 || response.status === 200) {
        setSaveSuccess(true);
      }
    } catch (err) {
      setSaveError("Error saving changes");
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    const margin = 15;

    // En-tête
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 45, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, "bold");
    doc.text(`Nom de l'examen : ${examName}`, centerX, 20, { align: "center" });
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text(`Patient: ${patientName}`, centerX, 30, { align: "center" });
    doc.text(`Prescrit par: ${doctorName}`, centerX, 37, { align: "center" });

    let yPos = 55;
    doc.setTextColor(0, 0, 0);

    // Tableau des détails de l'examen
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Détails de l'examen", centerX, yPos, { align: "center" });
    yPos += 8;

    // Bordure du tableau
    const tableWidth = pageWidth - 2 * margin;
    const rowHeight = 12;

    // En-tête du tableau
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, tableWidth, rowHeight, "F");
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPos, tableWidth, rowHeight);

    // Données du tableau
    const examDetails = [
      { label: "Date d'ajout", value: new Date(addDate).toLocaleString() },
      { label: "Patient", value: patientName },
      { label: "Médecin prescripteur", value: doctorName },
      { label: "Statut", value: newExamStatus },
    ];

    doc.setFontSize(10);
    examDetails.forEach((detail, index) => {
      const currentY = yPos + index * rowHeight;

      // Ligne de séparation
      if (index > 0) {
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, currentY, pageWidth - margin, currentY);
      }

      // Cellule gauche (label)
      doc.setFont(undefined, "bold");
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, currentY, tableWidth / 2, rowHeight, "F");
      doc.setTextColor(60, 60, 60);
      doc.text(detail.label, margin + 5, currentY + 8);

      // Ligne verticale
      doc.setDrawColor(200, 200, 200);
      doc.line(
        margin + tableWidth / 2,
        currentY,
        margin + tableWidth / 2,
        currentY + rowHeight,
      );

      // Cellule droite (valeur)
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(detail.value, margin + tableWidth / 2 + 5, currentY + 8);
    });

    // Bordure finale du tableau
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPos, tableWidth, rowHeight * examDetails.length);

    yPos += rowHeight * examDetails.length + 15;

    // Description de l'examen
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setFillColor(41, 128, 185);
    doc.rect(margin, yPos, tableWidth, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("Description de l'examen", margin + 5, yPos + 7);
    yPos += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPos, tableWidth, 25);
    const descLines = doc.splitTextToSize(examDescription, tableWidth - 10);
    doc.text(descLines, margin + 5, yPos + 7);
    yPos += 30;

    // Notes du médecin
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setFillColor(41, 128, 185);
    doc.rect(margin, yPos, tableWidth, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("Notes du médecin", margin + 5, yPos + 7);
    yPos += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    const doctorNotes = examData.notes || "Aucune note disponible.";
    const splitDoctorNotes = doc.splitTextToSize(doctorNotes, tableWidth - 10);
    const doctorNotesHeight = Math.max(splitDoctorNotes.length * 5 + 10, 20);
    doc.rect(margin, yPos, tableWidth, doctorNotesHeight);
    doc.text(splitDoctorNotes, margin + 5, yPos + 7);
    yPos += doctorNotesHeight + 5;

    // Notes du technicien de laboratoire
    if (labNotes) {
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.setFillColor(46, 204, 113);
      doc.rect(margin, yPos, tableWidth, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.text("Notes du technicien de laboratoire", margin + 5, yPos + 7);
      yPos += 10;

      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "normal");
      doc.setFontSize(10);
      const splitLabNotes = doc.splitTextToSize(labNotes, tableWidth - 10);
      const labNotesHeight = Math.max(splitLabNotes.length * 5 + 10, 20);
      doc.rect(margin, yPos, tableWidth, labNotesHeight);
      doc.text(splitLabNotes, margin + 5, yPos + 7);
      yPos += labNotesHeight + 5;
    }

    // Fichier uploadé
    if (uploadedFile) {
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.setFillColor(230, 126, 34);
      doc.rect(margin, yPos, tableWidth, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.text("Fichier joint", margin + 5, yPos + 7);
      yPos += 10;

      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "normal");
      doc.setFontSize(10);
      doc.rect(margin, yPos, tableWidth, 12);
      doc.text(`${uploadedFile.name}`, margin + 5, yPos + 8);
    }

    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, 280, pageWidth - margin, 280);
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.setFont(undefined, "normal");
      doc.text(`Page ${i} sur ${pageCount}`, centerX, 285, { align: "center" });
      doc.text(`Généré le ${new Date().toLocaleString()}`, centerX, 290, {
        align: "center",
      });
    }

    // Sauvegarder le PDF
    doc.save(`Examen_${examName}_${patientName.replace(/\s+/g, "_")}.pdf`);
  };

  if (isLoading) {
    return (
      <LaboratoryDashBoard
        linkList={laboratoryNavLink}
        requiredRole={"Labtech"}
      >
        <LaboratoryNavBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-end"></div>
        </div>
      </LaboratoryDashBoard>
    );
  }

  if (error || !examData) {
    return (
      <LaboratoryDashBoard
        linkList={laboratoryNavLink}
        requiredRole={"Labtech"}
      >
        <LaboratoryNavBar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {error || "No exam data found."}
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-2 bg-primary-end text-white rounded-md hover:bg-primary-start transition-colors duration-300"
            >
              Back
            </button>
          </div>
        </div>
      </LaboratoryDashBoard>
    );
  }

  const examName =
    examData.idExam?.examName || examData.examName || "Unnamed Exam";
  const patientName = examData.idPatient
    ? `${examData.idPatient.firstName} ${examData.idPatient.lastName}`
    : "Unknown Patient";
  const doctorName = examData.idMedicalStaff
    ? `${examData.idMedicalStaff.first_name} ${examData.idMedicalStaff.last_name}`
    : "Unknown Doctor";
  const addDate = examData.addDate;
  const examDescription =
    examData.idExam?.examDescription || "No description available";

  return (
    <LaboratoryDashBoard linkList={laboratoryNavLink} requiredRole={"Labtech"}>
      <LaboratoryNavBar />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-xl text-white p-8 mb-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-2">{examName}</h1>
            <p className="opacity-90">
              Exam details for {patientName} prescribed by {doctorName}.
            </p>
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate(-1)}
                className="text-primary-end hover:text-primary-start transition-colors duration-300 font-bold flex items-center"
              >
                <ArrowLeft className="mr-2" />
                Back to Exam List
              </button>
              <button
                onClick={handlePrintPDF}
                className="bg-secondary hover:bg-primary-end transition-colors duration-300 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Printer className="mr-2" />
                Print
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Exam Details */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Exam Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  icon={Calendar}
                  label="Date Added"
                  value={new Date(addDate).toLocaleString()}
                />
                <DetailItem icon={User} label="Patient" value={patientName} />
                <DetailItem
                  icon={Stethoscope}
                  label="Doctor"
                  value={doctorName}
                />
                <DetailItem
                  icon={FileText}
                  label="Description"
                  value={examDescription}
                />
              </div>
            </div>

            {/* Doctor's Notes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Doctor's Notes
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {examData.notes || "No notes available."}
              </p>
            </div>
          </div>

          {/* Lab Technician Actions */}
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Lab Technician Actions
            </h2>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Results
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${dragActive ? "border-primary-end bg-primary-50" : "border-gray-300 hover:border-primary-end hover:bg-gray-50"}`}
                onClick={() =>
                  document.querySelector('input[type="file"]').click()
                }
              >
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                {uploadedFile ? (
                  <p className="text-primary-end font-medium">
                    {uploadedFile.name}
                  </p>
                ) : (
                  <p className="text-gray-500">
                    Drag and drop your file here or click to select
                  </p>
                )}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Lab Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lab Technician Notes
              </label>
              <textarea
                value={labNotes}
                onChange={(e) => setLabNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-primary-end transition-all duration-300"
                rows="6"
                placeholder="Enter your observations..."
              ></textarea>
            </div>

            {/* Save Messages */}
            {saveError && (
              <p className="mt-4 text-red-600 font-medium">{saveError}</p>
            )}
            {saveSuccess && (
              <div
                className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <CheckCircle className="inline-block mr-2" />
                <span className="font-medium">Results sent successfully!</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-primary-end text-white rounded-md hover:bg-primary-start transition-colors duration-300 flex items-center"
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" />
                    Send Exam Results
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </LaboratoryDashBoard>
  );
}

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center space-x-3">
    <Icon className="w-5 h-5 text-primary-end" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  </div>
);