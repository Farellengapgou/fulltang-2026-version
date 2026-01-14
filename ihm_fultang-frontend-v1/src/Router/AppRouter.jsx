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
  const ReceptionistPage = React.lazy(async () => ({
    default: (await import("../Pages/Receptionist/Receptionist.jsx"))
      .Receptionist,
  }));
  const DoctorPage = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/Doctor.jsx")).Doctor,
  }));
  /*const LaboratoryAssistantPage = React.lazy(async () => ({default: (await import("../Pages/Laboratory/LaboratoryAssistant.jsx")).LaboratoryAssistant}));*/
  const SpecialistPage = React.lazy(async () => ({
    default: (await import("../Pages/Doctor/Specialist.jsx")).Specialist,
  }));
  const CashierPage = React.lazy(async () => ({
    default: (await import("../Pages/Cashier/Cashier.jsx")).Cashier,
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
  const HelpCenter = React.lazy(async () => ({
    default: (await import("../GlobalComponents/HelpCenter.jsx")).HelpCenter,
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
  /*const CurrentExamsLaboratoryPage = React.lazy(async () => ({default: (await import("../Pages/Laboratory/CurrentExams.jsx")).CurrentExams}));
    const ExamsHistoryLaboratoryPage = React.lazy(async () => ({default: (await import("../Pages/Laboratory/ExamsHistory.jsx")).ExamHistory}));*/
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
  const CreateFactureAccountant = React.lazy(async () => ({
    default: (await import("../Pages/Accountant/CreateFacture.jsx"))
      .CreateFacturePage,
  }));
  const JournalEntryList = React.lazy(async () => ({
    default: (await import("../Pages/Accountant/JournalEntryList.jsx")).default,
  }));
  // const CreateJournalEntry = React.lazy(async () => ({default: (await import("../Pages/Accountant/CreateJournalEntry.jsx")).default,}));

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
  const LaboratoryNotifications = React.lazy(async () => ({
    default: (await import("../Pages/Laboratory/Notification.jsx"))
      .Notification,
  }));

  const FinancialAccountantHome = React.lazy(async () => ({
    default: (await import("../Pages/AccountantNew/Home/HomePage.jsx"))
      .FinancialAccountantHomePage,
  }));
  const FinancialAccountantChartOfAccount = React.lazy(async () => ({
    default: (
      await import(
        "../Pages/AccountantNew/Comptabilité de Base/PlanComptable.jsx"
      )
    ).ChartOfAccounts,
  }));
  const FinancialAccountantJournalEntries = React.lazy(async () => ({
    default: (
      await import(
        "../Pages/AccountantNew/Comptabilité de Base/JournalsEntries.jsx"
      )
    ).JournalEntries,
  }));
  const FinancialAccountingJournal = React.lazy(async () => ({
    default: (
      await import(
        "../Pages/AccountantNew/Comptabilité de Base/AccountingJornal.jsx"
      )
    ).JournauxComptables,
  }));
  const FinancialGrandLivre = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Comptabilité de Base/GrandLivre.jsx")
    ).GrandLivreBalance,
  }));
  const FinancialPayrollJournal = React.lazy(async () => ({
    default: (
      await import(
        "../Pages/AccountantNew/Payroll & Social Charge/PayrollJournal.jsx"
      )
    ).SocialChargesCalculator,
  }));
  const FinancialCostAnalytic = React.lazy(async () => ({
    default: (
      await import(
        "../Pages/AccountantNew/Payroll & Social Charge/CostAnalytic.jsx"
      )
    ).HRAnalyticsDashboard,
  }));

  const FinancialBilling = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Revenue & Receivables/Billing.jsx")
    ).Billing,
  }));
  const FinancialRevenueByService = React.lazy(async () => ({
    default: (
      await import(
        "../Pages/AccountantNew/Revenue & Receivables/RevenueByService.jsx"
      )
    ).RevenueByService,
  }));
  const FinancialAccountsReceivable = React.lazy(async () => ({
    default: (
      await import(
        "../Pages/AccountantNew/Revenue & Receivables/AccountsReceivable.jsx"
      )
    ).AccountsReceivable,
  }));
  const suppliers = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Suppliers & Payables/Suppliers.jsx")
    ).Suppliers,
  }));
  const supplierInvoices = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Suppliers & Payables/SupplierInvoices.jsx")
    ).SupplierInvoices,
  }));
  const payables = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Suppliers & Payables/Payables.jsx")
    ).Payables,
  }));
  const cashPositions = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Cash Management/CashPositions.jsx")
    ).CashPositions,
  }));
  const bankReconciliation = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Cash Management/BankReconciliation.jsx")
    ).BankReconciliation,
  }));
  const cashFlowForecast = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Cash Management/CashFlowForecast.jsx")
    ).CashFlowForecast,
  }));
  const fixedAssetsRegister = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Fixed Assets/FixedAssetsRegister.jsx")
    ).CashFlowForecast,
  }));
  const depreciation = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Fixed Assets/Depreciation.jsx")
    ).Depreciation,
  }));
  const inventoryValuation = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Inventory & Stock/InventoryValuation.jsx")
    ).InventoryValuation,
  }));
  const abcAnalysis = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Inventory & Stock/AbcAnalysis.jsx")
    ).AbcAnalysis,
  }));
  const physicalInventory = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Inventory & Stock/PhysicalInventory.jsx")
    ).PhysicalInventory,
  }));
    const vatCalculation = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/VAT & Taxation/VatCalculation.jsx")
    ).VatCalculation,
  }));
  const taxDeclarations = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/VAT & Taxation/TaxDeclarations.jsx")
    ).TaxDeclarations,
  }));
  const taxCalendar = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/VAT & Taxation/TaxCalendar.jsx")
    ).TaxCalendar,
  }));
  const financialRatios = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Financial Analysis/FinancialRatios.jsx")
    ).FinancialRatios,
  }));
  const profitabilityAnalysis = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Financial Analysis/ProfitabilityAnalysis.jsx")
    ).ProfitabilityAnalysis,
  }));
  const executiveDashboard = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Financial Analysis/ExecutiveDashboard.jsx")
    ).ExecutiveDashboard,
  }));
  const budgetAlerts = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Budget & Control/BudgetAlerts.jsx")
    ).BudgetAlerts,
  }));
  const budgetVariances = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Budget & Control/BudgetVariance.jsx")
    ).BudgetVariances,
  }));
  const budgetEntrys = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Budget & Control/BudgetEntry.jsx")
    ).BudgetEntrys,
  }));
  const periodClose = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Closing & Reporting/PeriodClose.jsx")
    ).PeriodClose,
  }));
  const financialStatements = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Closing & Reporting/FinancialStatements.jsx")
    ).FinancialStatements,
  }));
  const customReports = React.lazy(async () => ({
    default: (
      await import("../Pages/AccountantNew/Closing & Reporting/CustomReports.jsx")
    ).CustomReports,
  }));

  return (
    <React.Suspense fallback={<Loading />}>
      <Routes>
        <Route path={AppRoutesPaths.welcomePage} element={<LandingPage />} />
        <Route path={AppRoutesPaths.loginPage} element={<LoginPage />} />
        <Route
          path={AppRoutesPaths.forgottenPasswordPage}
          element={<ForgottenPage />}
        />
        <Route path={AppRoutesPaths.nursePage} element={<NursePage />} />
        <Route path={AppRoutesPaths.pharmacyPage} element={<PharmacyPage />} />
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
        <Route path={AppRoutesPaths.examsList} element={<ExamsList />} />
        <Route
          path={AppRoutesPaths.hospitalisations}
          element={<Hospitalisations />}
        />
        <Route
          path={AppRoutesPaths.financialReport}
          element={<FinancialReport />}
        />
        <Route path={AppRoutesPaths.helpCenter} element={<HelpCenter />} />
        <Route
          path={AppRoutesPaths.receptionistPage}
          element={<ReceptionistPage />}
        />
        <Route path={AppRoutesPaths.doctorPage} element={<DoctorPage />} />
        {/*<Route path={AppRoutesPaths.laboratoryAssistantPage} element={<LaboratoryAssistantPage />} />*/}
        <Route
          path={AppRoutesPaths.specialistPage}
          element={<SpecialistPage />}
        />
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
        {/*<Route path={AppRoutesPaths.laboratoryHistory} element={<ExamsHistoryLaboratoryPage />} />*/}
        {/*<Route path={AppRoutesPaths.laboratoryCurrent} element={<CurrentExamsLaboratoryPage />} />*/}
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
          path={AppRoutesPaths.PharmacyMedication}
          element={<PharmacyMedication />}
        />
        <Route
          path={AppRoutesPaths.createFactureAccountant}
          element={<CreateFactureAccountant />}
        />
        <Route
          path={AppRoutesPaths.journalEntryList}
          element={<JournalEntryList />}
        />
        {/* <Route path={AppRoutesPaths.createJournalEntry} element={<CreateJournalEntry/>}/> */}

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
          path={AppRoutesPaths.laboratoryNotification}
          element={<LaboratoryNotifications />}
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
        <Route
          path={AppRoutesPaths.financialAccountantAccountingGrandLivre}
          element={<FinancialGrandLivre />}
        />
        <Route
          path={AppRoutesPaths.financialAccountPayroll}
          element={<FinancialPayrollJournal />}
        />
        <Route
          path={AppRoutesPaths.financialAccountantCostAnalytic}
          element={<FinancialCostAnalytic />}
        />

        <Route path={AppRoutesPaths.billing} element={<FinancialBilling />} />
        <Route
          path={AppRoutesPaths.revenueByService}
          element={<FinancialRevenueByService />}
        />
        <Route
          path={AppRoutesPaths.accountsReceivable}
          element={<FinancialAccountsReceivable />}
        />
        <Route path={AppRoutesPaths.suppliers} element={<suppliers />} />
        <Route
          path={AppRoutesPaths.supplierInvoices}
          element={<supplierInvoices />}
        />
        <Route path={AppRoutesPaths.payables} element={<payables />} />
        <Route
          path={AppRoutesPaths.cashPositions}
          element={<cashPositions />}
        />
        <Route
          path={AppRoutesPaths.bankReconciliation}
          element={<bankReconciliation />}
        />
        <Route
          path={AppRoutesPaths.cashFlowForecast}
          element={<cashFlowForecast />}
        />
        <Route
          path={AppRoutesPaths.fixedAssetsRegister}
          element={<fixedAssetsRegister />}
        />
        <Route
          path={AppRoutesPaths.depreciation}
          element={<depreciation />}
        />
        <Route
          path={AppRoutesPaths.inventoryValuation}
          element={<inventoryValuation />}
        />
        <Route
          path={AppRoutesPaths.abcAnalysis}
          element={<abcAnalysis />}
        />
        <Route
          path={AppRoutesPaths.physicalInventory}
          element={<physicalInventory />}
        />
        <Route
          path={AppRoutesPaths.vatCalculation}
          element={<vatCalculation />}
        />
        <Route
          path={AppRoutesPaths.taxDeclarations}
          element={<taxDeclarations />}
        />
        <Route
          path={AppRoutesPaths.taxCalendar}
          element={<taxCalendar />}
        />
        <Route
          path={AppRoutesPaths.financialRatios}
          element={<financialRatios />}
        />
        <Route
          path={AppRoutesPaths.profitabilityAnalysis}
          element={<profitabilityAnalysis />}
        />
        <Route
          path={AppRoutesPaths.executiveDashboard}
          element={<executiveDashboard />}
        />
        <Route
          path={AppRoutesPaths.budgetAlerts}
          element={<budgetAlerts />}
        />
        <Route
          path={AppRoutesPaths.budgetVariance}
          element={<budgetVariances />}
        />
        <Route
          path={AppRoutesPaths.budgetEntry}
          element={<budgetEntrys />}
        />
        <Route
          path={AppRoutesPaths.periodClose}
          element={<periodClose />}
        />
        <Route
          path={AppRoutesPaths.financialStatements}
          element={<financialStatements />}
        />
        <Route
          path={AppRoutesPaths.customReports}
          element={<customReports />}
        />

      </Routes>

    </React.Suspense>
  );
}
