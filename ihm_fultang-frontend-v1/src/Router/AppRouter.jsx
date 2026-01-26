import React from "react";
import { Route, Routes } from "react-router-dom";
import { Loading } from "../GlobalComponents/Loading.jsx";
import { AppRoutesPaths } from "./appRouterPaths.js";

export function AppRoute() {
  const LoginPage = React.lazy(async () => ({
    default: (await import("../Pages/Authentication/Login.jsx")).LoginPage,
  }));
  const ForgottenPage = React.lazy(async () => ({
    default: (await import("../Pages/Authentication/ForgottenPassword.jsx"))
      .ForgottenPassword,
  }));
  const LandingPage = React.lazy(async () => ({
    default: (await import("../Pages/LandingPage/LandingPage.jsx")).LandingPage,
  }));
  const NursePage = React.lazy(async () => ({
    default: (await import("../Pages/Nurse/Nurse.jsx")).Nurse,
  }));
  const NotFoundPage = React.lazy(async () => ({
    default: (await import("../GlobalComponents/NotFound.jsx")).NotFound,
  }));
  const NurseMedicalStaffsPage = React.lazy(async () => ({
    default: (await import("../Pages/Nurse/MedicalStaffs.jsx")).MedicalStaffs,
  }));
  const ConsultationHistoryPage = React.lazy(async () => ({
    default: (await import("../Pages/Nurse/ConsultationHistory.jsx"))
      .ConsultationHistory,
  }));
  const HelpCenterPage = React.lazy(async () => ({
    default: (await import("../Pages/HelpCenter/HelpCenter.jsx")).HelpCenter,
  }));

  const PatientDetailsPage = React.lazy(async () => ({
    default: (await import("../Pages/Nurse/PatientParameters.jsx"))
      .PatientParameters,
  }));
  const PharmacyPage = React.lazy(async () => ({
    default: (await import("../Pages/Pharmacy/Pharmacy.jsx")).Pharmacy,
  }));
  const PharmacyMessages = React.lazy(async () => ({
    default: (await import("../Pages/Pharmacy/PharmacyMessagePage.jsx"))
      .PharmacyMessagePage,
  }));
  const ReceptionistPage = React.lazy(async () => ({
    default: (await import("../Pages/Receptionist/Receptionist.jsx"))
      .Receptionist,
  }));
  const DoctorPage = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/Doctor.jsx")).Doctor,
  }));
  const SpecialistPage = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/Specialist.jsx")).Specialist,
  }));
  const CashierPage = React.lazy(async () => ({
    default: (await import("../Pages/Cashier/Cashier.jsx")).Cashier,
  }));
  const CashierMessages = React.lazy(async () => ({
    default: (await import("../Pages/Cashier/CashierMessagePage.jsx"))
      .CashierMessagePage,
  }));
  const ExamsList = React.lazy(async () => ({
    default: (await import("../Pages/Cashier/ExamsList.jsx")).ExamsList,
  }));
  const Hospitalisations = React.lazy(async () => ({
    default: (await import("../Pages/Cashier/Hospitalisations.jsx"))
      .Hospitalisations,
  }));
  const FinancialReport = React.lazy(async () => ({
    default: (await import("../Pages/Cashier/FinancialReport.jsx"))
      .FinancialReport,
  }));
  const AccountantMessages = React.lazy(async () => ({
    default: (await import("../Pages/Accountant/AccountantMessagePage.jsx"))
      .AccountantMessagePage,
  }));
  const MaterialAccountantMessages = React.lazy(async () => ({
    default: (
      await import(
        "../Pages/MaterialAccounting/MaterialAccountantMessagePage.jsx"
      )
    ).MaterialAccountantMessagePage,
  }));
  const AdminHomePage = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/AdminHomePage.jsx"))
      .AdminHomePage,
  }));
  const ReceptionistMedicalStaffsPage = React.lazy(async () => ({
    default: (
      await import("../Pages/Receptionist/ReceptionistMedicalStaffs.jsx")
    ).ReceptionistMedicalStaffs,
  }));
  const ReceptionistAppointmentsPage = React.lazy(async () => ({
    default: (await import("../Pages/Receptionist/Appointments.jsx"))
      .Appointments,
  }));
  const AdminPatientListPage = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/AdminPatientList.jsx"))
      .AdminPatientList,
  }));
  const AddMedicalStaffPage = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/AddMedicalStaff.jsx"))
      .AddMedicalStaff,
  }));
  const AdminMedicalStaffListPage = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/AdminMedicalStaffList.jsx"))
      .AdminMedicalStaffList,
  }));
  const AdminConsultationListPage = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/AdminConsultationList.jsx"))
      .AdminConsultationList,
  }));
  const AdminAppointmentsListPage = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/AdminAppointmentsList.jsx"))
      .AdminAppointmentsList,
  }));
  const AddExamPage = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/AddExam.jsx")).AddExam,
  }));
  const AdminExamsListPage = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/AdminExamsList.jsx"))
      .AdminExamsList,
  }));
  const AddMedicationPage = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/AddMedication.jsx"))
      .AddMedication,
  }));
  const AdminMedicationsListPage = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/AdminMedicationsList.jsx"))
      .AdminMedicationsList,
  }));
  const AdminHospitalRoomPage = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/AdminHospitalRooms.jsx"))
      .AdminHospitalRooms,
  }));
  const AdminFinancialReportsPage = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/AdminFinancialReports.jsx"))
      .AdminFinancialReports,
  }));
  const AccountantPage = React.lazy(async () => ({
    default: (await import("../Pages/Accountant/Accountant.jsx")).Accountant,
  }));
  const AdminConsultationDetails = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/ConsultationDetails.jsx"))
      .ConsultationDetails,
  }));
  const FinancialHistory = React.lazy(async () => ({
    default: (await import("../Pages/Cashier/FinancialHistory.jsx"))
      .FinancialHistory,
  }));
  const AccountDetailsPage = React.lazy(async () => ({
    default: (await import("../Pages/Accountant/AccountDetailsPage.jsx"))
      .AccountDetailsPage,
  }));
  const AccountList = React.lazy(async () => ({
    default: (await import("../Pages/Accountant/AccountList.jsx")).AccountList,
  }));

  const DoctorPatientList = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/DoctorPatientList.jsx"))
      .DoctorPatientList,
  }));
  const DoctorConsultationList = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/DoctorConsultationList.jsx"))
      .DoctorConsultationList,
  }));
  const DoctorAppointments = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/AppointmentList.jsx"))
      .AppointmentList,
  }));
  const DoctorMessages = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/DoctorMessagePage.jsx"))
      .DoctorMessagePage,
  }));
  const SpecialistMessages = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/SpecialistMessagePage.jsx"))
      .SpecialistMessagePage,
  }));
  const DentistMessages = React.lazy(async () => ({
    default: (await import("../Pages/Dentist/DentistMessagePage.jsx"))
      .DentistMessagePage,
  }));
  const NurseMessages = React.lazy(async () => ({
    default: (await import("../Pages/Nurse/NurseMessagePage.jsx"))
      .NurseMessagePage,
  }));
  const ReceptionistMessages = React.lazy(async () => ({
    default: (await import("../Pages/Receptionist/ReceptionistMessagePage.jsx"))
      .ReceptionistMessagePage,
  }));
  const LaboratoryMessages = React.lazy(async () => ({
    default: (await import("../Pages/Laboratory/LaboratoryMessagePage.jsx"))
      .LaboratoryMessagePage,
  }));
  const AdminMessages = React.lazy(async () => ({
    default: (await import("../Pages/AdminViews/AdminMessagePage.jsx"))
      .AdminMessagePage,
  }));

  const DoctorConsultationHistory = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/ConsultationHistory.jsx"))
      .ConsultationHistory,
  }));
  const DoctorConsultationDetails = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/DoctorConsultationDetail.jsx"))
      .DoctorConsultationDetails,
  }));
  const DoctorConsultationHistoryDetails = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/ConsultationHistoryDetails.jsx"))
      .ConsultationHistoryDetails,
  }));
  const DoctorExamList = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/DoctorExamsList.jsx"))
      .DoctorExamsList,
  }));
  const DoctorPatientMedicalFolder = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/PatientMedicalFolder.jsx"))
      .PatientMedicalFolder,
  }));

  const OphthalmologistPage = React.lazy(async () => ({
    default: (await import("../Pages/Ophthalmologist/Opthalmologist.jsx"))
      .Ophthalmologist,
  }));
  const OphthaConsultationList = React.lazy(async () => ({
    default: (
      await import("../Pages/Ophthalmologist/OphthalmologistConsultationList.jsx")
    ).OphthaConsultationList,
  }));
  const OphthaConsultationHistory = React.lazy(async () => ({
    default: (await import("../Pages/Ophthalmologist/ConsultationHistory.jsx"))
      .OphthaConsultationHistory,
  }));
  const OphthaPatientList = React.lazy(async () => ({
    default: (
      await import("../Pages/Ophthalmologist/OphthalmologistPatientList.jsx")
    ).OphthaPatientList,
  }));
  const OphthaAppointment = React.lazy(async () => ({
    default: (await import("../Pages/Ophthalmologist/AppointmentList.jsx"))
      .AppointmentList,
  }));
  const OphthaMessage = React.lazy(async () => ({
    default: (
      await import("../Pages/Ophthalmologist/OphthalmologistMessagePage.jsx")
    ).OphthaMessage,
  }));

  const DentistPage = React.lazy(async () => ({
    default: (await import("../Pages/Dentist/Dentist.jsx"))
      .Dentist,
  }));
  const DentistConsultationList = React.lazy(async () => ({
    default: (
      await import("../Pages/Dentist/DentistConsultationList.jsx")
    ).DentistConsultationList,
  }));
  const DentistConsultationHistory = React.lazy(async () => ({
    default: (await import("../Pages/Dentist/ConsultationHistory.jsx"))
      .DentistConsultationHistory,
  }));
  const DentistPatientList = React.lazy(async () => ({
    default: (
      await import("../Pages/Dentist/DentistPatientList.jsx")
    ).DentistPatientList,
  }));
  const DentistAppointment = React.lazy(async () => ({
    default: (await import("../Pages/Dentist/AppointmentList.jsx"))
      .AppointmentList,
  }));
  const DentistMessage = React.lazy(async () => ({
    default: (
      await import("../Pages/Dentist/DentistMessagePage.jsx")
    ).DentistMessagePage,
  }));

  const FinancialContributions = React.lazy(async () => ({
    default: (await import("../Pages/Accountant/FinancialContribution.jsx"))
      .FinancialContributions,
  }));
  const FinancialReportsAccountant = React.lazy(async () => ({
    default: (await import("../Pages/Accountant/FinancialReports.jsx"))
      .FinancialReports,
  }));
  const PharmacyMedication = React.lazy(async () => ({
    default: (await import("../Pages/Pharmacy/PharmacyMedication.jsx"))
      .PharmacyMedication,
  }));
  const PharmacistPage = React.lazy(async () => ({
    default: (await import("../Pages/Pharmacy/PharmacyList.jsx"))
      .PharmacistPage,
  }));

  const CreateFactureAccountant = React.lazy(async () => ({
    default: (await import("../Pages/Accountant/CreateFacture.jsx"))
      .CreateFacturePage,
  }));

  const LaboratoryHomePage = React.lazy(async () => ({
    default: (await import("../Pages/Laboratory/LaboratoryHomePage.jsx"))
      .LaboratoryHomePage,
  }));
  const LaboratoryPatientList = React.lazy(async () => ({
    default: (await import("../Pages/Laboratory/LaboratoryPatientList.jsx"))
      .LaboratoryPatientList,
  }));
  const LaboratoryExamenList = React.lazy(async () => ({
    default: (await import("../Pages/Laboratory/LaboratoryExamList.jsx"))
      .LaboratoryExamList,
  }));
  const LaboratoryExamenDetails = React.lazy(async () => ({
    default: (await import("../Pages/Laboratory/ExamenDetails.jsx"))
      .ExamDetails,
  }));
  const LaboratoryExamenHistories = React.lazy(async () => ({
    default: (await import("../Pages/Laboratory/LaboratoryExamHistory.jsx"))
      .ExamHistory,
  }));
  const LaboratoryExamResulDetails = React.lazy(async () => ({
    default: (await import("../Pages/Laboratory/ExamResultDetail.jsx"))
      .ExamResultDetails,
  }));

  const FinancialAccountantHome = React.lazy(async () => ({
    default: (await import("../Pages/AccountantNew/Home/HomePage.jsx"))
      .DashBoard,
  }));
  const FinancialAccountantChartOfAccount = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Comptabilité de Base/PlanComptable.jsx")
    ).ChartOfAccounts,
  }));
  const FinancialAccountantJournalEntries = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Comptabilité de Base/JournalsEntries.jsx")
    ).JournalEntries,
  }));
  const FinancialAccountingJournal = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Comptabilité de Base/AccountingJournals.jsx")
    ).AccountingJournals,
  }));

  // ✅ HELP CENTER - IMPORTS CORRIGÉS
  const HelpConsultations = React.lazy(async () => ({
    default: (await import("../Pages/ConsultationAppointments.jsx")).default,
  }));
  const HelpPayments = React.lazy(async () => ({
    default: (await import("../Pages/PaymentsBilling.jsx")).default,
  }));
  const HelpTechnical = React.lazy(async () => ({
    default: (await import("../Pages/TechnicalIssues.jsx")).default,
  }));
  const HelpFAQ = React.lazy(async () => ({
    default: (await import("../Pages/FAQ.jsx")).default,
  }));

  // COMPTABILITE FINANCIERE
  const FinancialAccountantCustomers = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Suppliers & Customers/Customers.jsx")
    ).Customers,
  }));
  const FinancialAccountantSuppliers = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Suppliers & Customers/Suppliers.jsx")
    ).Suppliers,
  }));
  const FixedAssetsRegister = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Inventory & Stock/Assets.jsx")
    ).Assets,
  }));
  const InventoryValuationPage = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Inventory & Stock/Inventory.jsx")
    ).Inventory,
  }));
  const FinancialAccountantPayrollPage = React.lazy(async () => ({
    default: (await import("../Pages/AccountantNew/Payroll/Payroll.jsx"))
      .Payroll,
  }));
  const VATCalculationPage = React.lazy(async () => ({
    default: (await import("../Pages/AccountantNew/VAT & Taxation/VAT.jsx"))
      .VAT,
  }));
  const TaxDeclarationsPage = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/VAT & Taxation/TaxDeclarations.jsx")
    ).TaxDeclarations,
  }));
  const TaxRatesPage = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/VAT & Taxation/TaxRates.jsx")
    ).TaxRates,
  }));
  const CashPositions = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Cash Management/BankAccounts.jsx")
    ).BankAccounts,
  }));
  const BankReconciliationPage = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Cash Management/BankReconciliation.jsx")
    ).BankReconciliation,
  }));
  const BudgetEntryPage = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Budget & Control/Budget.jsx")
    ).Budget,
  }));
  const PeriodClose = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Comptabilité de Base/AccountingPeriods.jsx")
    ).Periods,
  }));
  const FinancialRatiosPage = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Financial Analysis/FinancialRatios.jsx")
    ).FinancialRatios,
  }));
  const ProfitabilityAnalysis = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Financial Analysis/AnalyticAccounts.jsx")
    ).AnalyticAccounts,
  }));
  const FinancialStatements = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Cloture & Reports/FinancialReports.jsx")
    ).FinancialReports,
  }));

  // COMPTABILITE MATIERE
  const MaterialAccountingDashboard = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Dashboard/MaterialDashboard.jsx")
    ).MaterialDashboard,
  }));
  const MaterialCategories = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Configuration/Categories.jsx")
    ).Categories,
  }));
  const MaterialArticles = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Configuration/Articles.jsx")
    ).Articles,
  }));
  const MaterialWarehouses = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Configuration/Warehouses.jsx")
    ).Warehouses,
  }));
  const MaterialSuppliers = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Configuration/Suppliers.jsx")
    ).Suppliers,
  }));
  const MaterialFamilies = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Configuration/Families.jsx")
    ).Families,
  }));

  const MaterialStockLevels = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Stock/StockLevels.jsx")
    ).StockLevels,
  }));
  const MaterialBatches = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Stock/Batches.jsx")
    ).Batches,
  }));
  const MaterialMovements = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Stock/Movements.jsx")
    ).Movements,
  }));

  const MaterialReceipts = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Operations/GoodsReceipts.jsx")
    ).GoodsReceipts,
  }));
  const MaterialIssues = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Operations/GoodsIssues.jsx")
    ).GoodsIssues,
  }));
  const MaterialTransfers = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Operations/Transfers.jsx")
    ).Transfers,
  }));

  const PhysicalInventory = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Inventory/PhysicalInventory.jsx")
    ).PhysicalInventory,
  }));

  const MaterialStockCard = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Reports/StockCard.jsx")
    ).StockCard,
  }));
  const MaterialPerpetualInventory = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Reports/PerpetualInventory.jsx")
    ).PerpetualInventory,
  }));
  const MaterialABCAnalysis = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Reports/ABCAnalysis.jsx")
    ).ABCAnalysis,
  }));
  const MaterialTurnoverRate = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Reports/StockTurnoverRate.jsx")
    ).StockTurnoverRate,
  }));
  const MaterialReconciliation = React.lazy(async () => ({
    default: (
      await import("../Pages/MaterialAccounting/Reports/StockAccountingReconciliation.jsx")
    ).StockAccountingReconciliation,
  }));

  return (
    <React.Suspense fallback={<Loading />}>
      <Routes>
        <Route
          path={AppRoutesPaths.ophthalmologistPage}
          element={<OphthalmologistPage />}
        />
        <Route
          path={AppRoutesPaths.ophthaConsultationList}
          element={<OphthaConsultationList />}
        />
        <Route
          path={AppRoutesPaths.ophthaConsultationHistory}
          element={<OphthaConsultationHistory />}
        />
        <Route
          path={AppRoutesPaths.ophthaPatientList}
          element={<OphthaPatientList />}
        />
        <Route
          path={AppRoutesPaths.ophthaAppointment}
          element={<OphthaAppointment />}
        />
        <Route
          path={AppRoutesPaths.ophthaMessage}
          element={<OphthaMessage />}
        />

        <Route
          path={AppRoutesPaths.dentistPage}
          element={<DentistPage />}
        />
        <Route
          path={AppRoutesPaths.dentistConsultationList}
          element={<DentistConsultationList />}
        />
        <Route
          path={AppRoutesPaths.dentistConsultationHistory}
          element={<DentistConsultationHistory />}
        />
        <Route
          path={AppRoutesPaths.dentistPatientList}
          element={<DentistPatientList />}
        />
        <Route
          path={AppRoutesPaths.dentistAppointment}
          element={<DentistAppointment />}
        />
        <Route
          path={AppRoutesPaths.dentistMessage}
          element={<DentistMessage />}
        />

        <Route path={AppRoutesPaths.welcomePage} element={<LandingPage />} />
        <Route path={AppRoutesPaths.loginPage} element={<LoginPage />} />
        <Route
          path={AppRoutesPaths.forgottenPasswordPage}
          element={<ForgottenPage />}
        />
        <Route path={AppRoutesPaths.nursePage} element={<NursePage />} />
        <Route path={AppRoutesPaths.pharmacyPage} element={<PharmacyPage />} />
        <Route
          path={AppRoutesPaths.pharmacyMessage}
          element={<PharmacyMessages />}
        />
        <Route
          path={AppRoutesPaths.PharmacistPage}
          element={<PharmacistPage />}
        />
        <Route
          path={AppRoutesPaths.PharmacyMedication}
          element={<PharmacyMedication />}
        />
        <Route
          path={AppRoutesPaths.nurseMedicalStaffsPage}
          element={<NurseMedicalStaffsPage />}
        />
        <Route
          path={AppRoutesPaths.consultationHistoryPage}
          element={<ConsultationHistoryPage />}
        />
        <Route
          path={AppRoutesPaths.helpCenterPage}
          element={<HelpCenterPage />}
        />
        <Route
          path={AppRoutesPaths.patientDetailsPage}
          element={<PatientDetailsPage />}
        />
        <Route path={AppRoutesPaths.cashierPage} element={<CashierPage />} />
        <Route
          path={AppRoutesPaths.cashierMessage}
          element={<CashierMessages />}
        />
        <Route path={AppRoutesPaths.examsList} element={<ExamsList />} />
        <Route
          path={AppRoutesPaths.hospitalisations}
          element={<Hospitalisations />}
        />
        <Route
          path={AppRoutesPaths.financialReport}
          element={<FinancialReport />}
        />
        <Route
          path={AppRoutesPaths.accountantMessage}
          element={<AccountantMessages />}
        />
        <Route
          path={AppRoutesPaths.materialAccountantMessage}
          element={<MaterialAccountantMessages />}
        />
        <Route
          path={AppRoutesPaths.receptionistPage}
          element={<ReceptionistPage />}
        />
        <Route path={AppRoutesPaths.doctorPage} element={<DoctorPage />} />
        <Route
          path={AppRoutesPaths.specialistPage}
          element={<SpecialistPage />}
        />
        <Route path={AppRoutesPaths.dentistPage} element={<DentistPage />} />
        <Route
          path={AppRoutesPaths.adminHomePage}
          element={<AdminHomePage />}
        />
        <Route
          path={AppRoutesPaths.receptionistMedicalStaffsPage}
          element={<ReceptionistMedicalStaffsPage />}
        />
        <Route
          path={AppRoutesPaths.appointmentsPage}
          element={<ReceptionistAppointmentsPage />}
        />
        <Route
          path={AppRoutesPaths.adminPatientListPage}
          element={<AdminPatientListPage />}
        />
        <Route
          path={AppRoutesPaths.addMedicalStaff}
          element={<AddMedicalStaffPage />}
        />
        <Route
          path={AppRoutesPaths.adminMedicalStaffListPage}
          element={<AdminMedicalStaffListPage />}
        />
        <Route
          path={AppRoutesPaths.adminConsultationListPage}
          element={<AdminConsultationListPage />}
        />
        <Route
          path={AppRoutesPaths.adminAppointmentsListPage}
          element={<AdminAppointmentsListPage />}
        />
        <Route path={AppRoutesPaths.addExam} element={<AddExamPage />} />
        <Route
          path={AppRoutesPaths.adminExamsListPage}
          element={<AdminExamsListPage />}
        />
        <Route
          path={AppRoutesPaths.addMedication}
          element={<AddMedicationPage />}
        />
        <Route
          path={AppRoutesPaths.adminMedicationsListPage}
          element={<AdminMedicationsListPage />}
        />
        <Route
          path={AppRoutesPaths.adminHospitalRoomPage}
          element={<AdminHospitalRoomPage />}
        />
        <Route
          path={AppRoutesPaths.adminFinancialReportsPage}
          element={<AdminFinancialReportsPage />}
        />
        <Route
          path={AppRoutesPaths.accountantPage}
          element={<AccountantPage />}
        />
        <Route
          path={AppRoutesPaths.adminConsultationDetailsPage}
          element={<AdminConsultationDetails />}
        />
        <Route
          path={AppRoutesPaths.financialHistory}
          element={<FinancialHistory />}
        />
        <Route
          path={AppRoutesPaths.accountDetails}
          element={<AccountDetailsPage />}
        />
        <Route path={AppRoutesPaths.accountList} element={<AccountList />} />
        <Route path={AppRoutesPaths.notFound} element={<NotFoundPage />} />

        <Route
          path={AppRoutesPaths.doctorExamList}
          element={<DoctorExamList />}
        />
        <Route
          path={AppRoutesPaths.doctorConsultationHistory}
          element={<DoctorConsultationHistory />}
        />
        <Route
          path={AppRoutesPaths.doctorAppointment}
          element={<DoctorAppointments />}
        />
        <Route
          path={AppRoutesPaths.doctorMessage}
          element={<DoctorMessages />}
        />
        <Route
          path={AppRoutesPaths.specialistMessage}
          element={<SpecialistMessages />}
        />
        <Route
          path={AppRoutesPaths.dentistMessage}
          element={<DentistMessages />}
        />
        <Route path={AppRoutesPaths.nurseMessage} element={<NurseMessages />} />
        <Route
          path={AppRoutesPaths.receptionistMessage}
          element={<ReceptionistMessages />}
        />
        <Route
          path={AppRoutesPaths.laboratoryMessage}
          element={<LaboratoryMessages />}
        />
        <Route path={AppRoutesPaths.adminMessage} element={<AdminMessages />} />
        <Route
          path={AppRoutesPaths.doctorPatientList}
          element={<DoctorPatientList />}
        />
        <Route
          path={AppRoutesPaths.doctorConsultationList}
          element={<DoctorConsultationList />}
        />
        <Route
          path={AppRoutesPaths.doctorConsultationDetailsPage}
          element={<DoctorConsultationDetails />}
        />
        <Route
          path={AppRoutesPaths.doctorConsultationHistoryDetails}
          element={<DoctorConsultationHistoryDetails />}
        />
        <Route
          path={AppRoutesPaths.doctorPatientMedicalFolderPage}
          element={<DoctorPatientMedicalFolder />}
        />

        <Route
          path={AppRoutesPaths.financialContributions}
          element={<FinancialContributions />}
        />
        <Route
          path={AppRoutesPaths.financialReportsAccountant}
          element={<FinancialReportsAccountant />}
        />
        <Route
          path={AppRoutesPaths.createFactureAccountant}
          element={<CreateFactureAccountant />}
        />

        <Route
          path={AppRoutesPaths.laboratoryAssistantPage}
          element={<LaboratoryHomePage />}
        />
        <Route
          path={AppRoutesPaths.laboratoryPatientList}
          element={<LaboratoryPatientList />}
        />
        <Route
          path={AppRoutesPaths.laboratoryExamenList}
          element={<LaboratoryExamenList />}
        />
        <Route
          path={AppRoutesPaths.laboratoryExamenDetail}
          element={<LaboratoryExamenDetails />}
        />
        <Route
          path={AppRoutesPaths.laboratoryExamenHistories}
          element={<LaboratoryExamenHistories />}
        />
        <Route
          path={AppRoutesPaths.laboratoryExamResultDetails}
          element={<LaboratoryExamResulDetails />}
        />

        <Route
          path={AppRoutesPaths.financialAccountantHome}
          element={<FinancialAccountantHome />}
        />
        <Route
          path={AppRoutesPaths.financialAccountantChartOfAccount}
          element={<FinancialAccountantChartOfAccount />}
        />
        <Route
          path={AppRoutesPaths.financialAccountantJournalEntries}
          element={<FinancialAccountantJournalEntries />}
        />
        <Route
          path={AppRoutesPaths.financialAccountantAccountingJournals}
          element={<FinancialAccountingJournal />}
        />

        {/* ✅ HELP CENTER ROUTES - CORRIGÉES */}
        <Route
          path={AppRoutesPaths.consultationAppointments}
          element={<HelpConsultations />}
        />
        <Route
          path={AppRoutesPaths.paymentsBilling}
          element={<HelpPayments />}
        />
        <Route
          path={AppRoutesPaths.technicalIssues}
          element={<HelpTechnical />}
        />
        <Route path={AppRoutesPaths.faq} element={<HelpFAQ />} />

        {/* COMPTABILITE FINANCIERE */}

        <Route
          path="/accountant-financial/customers"
          element={<FinancialAccountantCustomers />}
        />

        {/* Financial Accountant - Suppliers & Payables */}
        <Route
          path="/accountant-financial/suppliers"
          element={<FinancialAccountantSuppliers />}
        />

        {/* Financial Accountant - Fixed Assets */}
        <Route
          path="/accountant-financial/fixed-assets-register"
          element={<FixedAssetsRegister />}
        />

        {/* Financial Accountant - Inventory & Stock */}
        <Route
          path="/accountant-financial/inventory-valuation"
          element={<InventoryValuationPage />}
        />

        {/* Financial Accountant - Payroll & Social Charges */}
        <Route
          path="/accountant-financial/payroll"
          element={<FinancialAccountantPayrollPage />}
        />

        {/* Financial Accountant - VAT & Taxation */}
        <Route
          path="/accountant-financial/tva"
          element={<VATCalculationPage />}
        />
        <Route
          path="/accountant-financial/tax-declaration"
          element={<TaxDeclarationsPage />}
        />
        <Route
          path="/accountant-financial/tax-calendar"
          element={<TaxRatesPage />}
        />

        {/* Financial Accountant - Bank & Treasury */}
        <Route
          path="/accountant-financial/cash-positions"
          element={<CashPositions />}
        />
        <Route
          path="/accountant-financial/bank-reconciliation"
          element={<BankReconciliationPage />}
        />

        {/* Financial Accountant - Budget & Control */}
        <Route
          path="/accountant-financial/budget-entry"
          element={<BudgetEntryPage />}
        />

        {/* Financial Accountant - Closing & Reporting */}
        <Route
          path="/accountant-financial/period-close"
          element={<PeriodClose />}
        />

        {/* Financial Accountant - Analysis & Ratios */}
        <Route
          path="/accountant-financial/financial-ratios"
          element={<FinancialRatiosPage />}
        />
        <Route
          path="/accountant-financial/profitability-analysis"
          element={<ProfitabilityAnalysis />}
        />

        {/* Financial Accountant - Financial Statements */}
        <Route
          path="/accountant-financial/financial-statements"
          element={<FinancialStatements />}
        />

        {/** MATERIAL ACCOUNTING ROUTES */}
        <Route
          path = {AppRoutesPaths.materialAccountingDashboard}
          element = {<MaterialAccountingDashboard />}
        />

        <Route
          path = {AppRoutesPaths.materialCategories}
          element={<MaterialCategories />}
        />
        <Route
          path = {AppRoutesPaths.materialArticles}
          element={<MaterialArticles />}
        />
        <Route
          path = {AppRoutesPaths.materialWarehouses}
          element={<MaterialWarehouses />}
        />
        <Route
          path={AppRoutesPaths.materialSuppliers}
          element={<MaterialSuppliers />}
        />
        <Route
          path={AppRoutesPaths.materialFamilies}
          element={<MaterialFamilies />}
        />
        
        <Route
          path = {AppRoutesPaths.materialStockLevels}
          element={<MaterialStockLevels />}
        />
        <Route
          path = {AppRoutesPaths.materialBatches}
          element={<MaterialBatches />}
        />
        <Route
          path = {AppRoutesPaths.materialMovements}
          element={<MaterialMovements />}
        />
        
        <Route
          path = {AppRoutesPaths.materialReceipts}
          element={<MaterialReceipts />}
        />
        <Route
          path = {AppRoutesPaths.materialIssues}
          element={<MaterialIssues />}
        />
        <Route
          path = {AppRoutesPaths.materialTransfers}
          element={<MaterialTransfers />}
        />

        <Route
          path = {AppRoutesPaths.materialInventories}
          element={<PhysicalInventory />}
        />

        <Route
          path = {AppRoutesPaths.materialStockCard}
          element={<MaterialStockCard />}
        />
        <Route
          path = {AppRoutesPaths.materialPerpetualInventory}
          element={<MaterialPerpetualInventory />}
        />
        <Route
          path = {AppRoutesPaths.materialABCAnalysis}
          element={<MaterialABCAnalysis />}
        />
        <Route
          path = {AppRoutesPaths.materialTurnoverRate}
          element={<MaterialTurnoverRate />}
        />
        <Route
          path = {AppRoutesPaths.materialReconciliation}
          element={<MaterialReconciliation />}
        />
      </Routes>
    </React.Suspense>
  );
}
