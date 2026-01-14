import {
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaSearch,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import { Tooltip } from "antd";
import { useEffect, useState } from "react";
import { SuccessModal } from "../Modals/SuccessModal.jsx";
import Wait from "../Modals/wait.jsx";
import { ErrorModal } from "../Modals/ErrorModal.jsx";
import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant.js";
import { ConfirmationModal } from "../Modals/ConfirmAction.Modal.jsx";
import { useNavigate } from "react-router-dom";
import { AccountantNavLink } from "./AccountantNavLink";
import { AccountantDashBoard } from "./Components/AccountantDashboard";
import { AddAccountModal } from "./Components/AddAccountModal.jsx";
import { AccountantNavBar } from "./Components/AccountantNavBar";

export function AccountList() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
  const [canOpenErrorMessageModal, setCanOpenErrorMessageModal] = useState(false);
  const [canOpenConfirmActionModal, setCanOpenConfirmActionModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState({});
  const [canOpenAddAccountModal, setCanOpenAddAccountModal] = useState(false);
  const [accountList, setAccountList] = useState([]);
  const [numberOfAccounts, setNumberOfAccounts] = useState(0);
  const [nextUrlForRenderAccountList, setNextUrlForRenderAccountList] = useState("");
  const [previousUrlForRenderAccountList, setPreviousUrlForRenderAccountList] = useState("");
  const [actualPageNumber, setActualPageNumber] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleViewAccountDetails = (account) => {
    navigate(`/accountant/account-details/${account.id}`, {
      state: { account },
    });
  };

  const ITEMS_PER_PAGE = 20; // Assuming API pagination size

  function calculateNumberOfSlide() {
    return Math.ceil(numberOfAccounts / ITEMS_PER_PAGE) || 1;
  }

  function updateActualPageNumber(action) {
    if (action === "next") {
      if (actualPageNumber < calculateNumberOfSlide()) {
        setActualPageNumber(actualPageNumber + 1);
      }
    } else {
      if (actualPageNumber > 1) {
        setActualPageNumber(actualPageNumber - 1);
      }
    }
  }

  async function fetchAccountList() {
    setIsLoading(true);
    try {
      // Changed to fetch from the new OHADA Chart of Accounts endpoint
      const response = await axiosInstanceAccountant.get("/chart-of-accounts/");
      console.log(response);
      if (response.status === 200) {
        setAccountList(response.data.results);
        setNumberOfAccounts(response.data.count);
        setNextUrlForRenderAccountList(response.data.next);
        setPreviousUrlForRenderAccountList(response.data.previous);
      }
    } catch (error) {
      setAccountList([]);
      setNumberOfAccounts(0);
      setNextUrlForRenderAccountList("");
      setPreviousUrlForRenderAccountList("");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAccountList();
  }, []);

  async function fetchNextOrPreviousAccountList(url) {
    if (url) {
      setIsLoading(true);
      try {
        const response = await axiosInstanceAccountant.get(url);
        if (response.status === 200) {
          setAccountList(response.data.results);
          setNumberOfAccounts(response.data.count);
          setNextUrlForRenderAccountList(response.data.next);
          setPreviousUrlForRenderAccountList(response.data.previous);
        }
      } catch (error) {
        setAccountList([]);
        setNumberOfAccounts(0);
        setPreviousUrlForRenderAccountList("");
        setNextUrlForRenderAccountList("");
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  }

  async function deleteAccount(accountId) {
    setIsLoading(true);
    try {
      const response = await axiosInstanceAccountant.delete(`/chart-of-accounts/${accountId}/`);
      if (response.status === 204) {
        setSuccessMessage("Account deleted successfully!");
        setErrorMessage("");
        setCanOpenErrorMessageModal(false);
        setCanOpenSuccessModal(true);
      }
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(error.response?.data?.detail || "Error deleting account");
      setCanOpenSuccessModal(false);
      setCanOpenErrorMessageModal(true);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
    }).format(amount || 0);
  };

  return (
    <AccountantDashBoard requiredRole={"Accountant"} linkList={AccountantNavLink}>
      <AccountantNavBar />
      <div className="mt-5 flex flex-col relative h-full">
        {/* Header content with search bar */}
        <div className="flex justify-between mb-5 px-5">
          <p className="font-bold text-xl mt-2">Plan Comptable OHADA</p>
          <div className="flex">
            <div className="flex w-[300px] h-10 border-2 border-secondary rounded-lg bg-white">
              <FaSearch className="text-xl text-secondary m-2" />
              <input
                type="text"
                placeholder="Search account (Code or Label)"
                className="border-none focus:outline-none focus:ring-0 w-full rounded-r-lg"
              />
            </div>
            <button className="ml-2 w-20 h-10 text-white bg-secondary rounded-lg shadow-md hover:bg-secondary-dark transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* List of registered accounts */}
        <div className="px-5 flex-1 overflow-auto pb-24">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gradient-to-l from-primary-start to-primary-end shadow-md">
                <th className="text-center text-white p-4 text-lg font-bold rounded-l-2xl">Code</th>
                <th className="text-left text-white p-4 text-lg font-bold">Label</th>
                <th className="text-center text-white p-4 text-lg font-bold">Type</th>
                <th className="text-right text-white p-4 text-lg font-bold">Balance</th>
                <th className="text-center text-white p-4 text-lg font-bold rounded-r-2xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accountList && accountList.length > 0 ? (
                accountList.map((account, index) => (
                  <tr key={account.id || index} className="bg-white hover:bg-gray-50 shadow-sm transition-colors">
                    <td className="p-4 text-md font-mono font-bold text-blue-900 rounded-l-lg text-center">
                      {account.code}
                    </td>
                    <td className="p-4 text-md text-gray-800 font-medium">
                      {account.label}
                    </td>
                    <td className="p-4 text-md text-center text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        account.account_type === 'asset' || account.account_type === 'expense' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {account.account_type || 'General'}
                      </span>
                    </td>
                    <td className={`p-4 text-md text-right font-mono font-bold ${
                      (account.balance || 0) < 0 ? 'text-red-600' : 'text-gray-800'
                    }`}>
                      {formatAmount(account.balance)}
                    </td>
                    <td className="p-4 rounded-r-lg">
                      <div className="flex items-center justify-center gap-4">
                        <Tooltip placement="top" title="View details">
                          <button
                            onClick={() => handleViewAccountDetails(account)}
                            className="text-primary-end hover:text-primary-start hover:bg-blue-50 p-2 rounded-full transition-all"
                          >
                            <FaEye className="text-xl" />
                          </button>
                        </Tooltip>

                        <Tooltip placement="top" title="Delete">
                          <button
                            onClick={() => {
                              setAccountToDelete(account);
                              setCanOpenConfirmActionModal(true);
                            }}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all"
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 italic">
                    {isLoading ? "Loading accounts..." : "No accounts found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination content */}
        <div className="fixed bottom-0 w-full bg-white bg-opacity-90 backdrop-blur-sm p-4 border-t border-gray-200 flex justify-center items-center z-10">
           <div className="flex items-center gap-6">
              <Tooltip placement="top" title="Previous page">
                <button
                  disabled={!previousUrlForRenderAccountList}
                  onClick={async () => {
                    await fetchNextOrPreviousAccountList(previousUrlForRenderAccountList);
                    updateActualPageNumber("prev");
                  }}
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    !previousUrlForRenderAccountList 
                      ? "border-gray-300 text-gray-300 cursor-not-allowed" 
                      : "border-secondary text-secondary hover:bg-secondary hover:text-white shadow-lg"
                  }`}
                >
                  <FaArrowLeft />
                </button>
              </Tooltip>
              
              <span className="text-secondary text-lg font-bold">
                Page {actualPageNumber} / {calculateNumberOfSlide()}
              </span>
              
              <Tooltip placement="top" title="Next page">
                <button
                  disabled={!nextUrlForRenderAccountList}
                  onClick={async () => {
                    await fetchNextOrPreviousAccountList(nextUrlForRenderAccountList);
                    updateActualPageNumber("next");
                  }}
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    !nextUrlForRenderAccountList 
                      ? "border-gray-300 text-gray-300 cursor-not-allowed" 
                      : "border-secondary text-secondary hover:bg-secondary hover:text-white shadow-lg"
                  }`}
                >
                  <FaArrowRight />
                </button>
              </Tooltip>
            </div>
        </div>

        {/* Add new account button */}
        <Tooltip placement="left" title="Add New Account">
          <button
            onClick={() => setCanOpenAddAccountModal(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-transform duration-300 z-20"
          >
            <FaPlus />
          </button>
        </Tooltip>

        {/* Modals content */}
        <AddAccountModal
          isOpen={canOpenAddAccountModal}
          onClose={() => setCanOpenAddAccountModal(false)}
          setCanOpenSuccessModal={setCanOpenSuccessModal}
          setSuccessMessage={setSuccessMessage}
          setIsLoading={setIsLoading}
          // Assuming AddAccountModal needs update to handle ChartOfAccounts, but that's a separate task if it manages 'budget accounts'
        />
        <SuccessModal
          isOpen={canOpenSuccessModal}
          message={successMessage}
          canOpenSuccessModal={setCanOpenSuccessModal}
          makeAction={async () => {
            await fetchAccountList();
            setCanOpenSuccessModal(false);
          }}
        />
        <ErrorModal
          isOpen={canOpenErrorMessageModal}
          onCloseErrorModal={() => setCanOpenErrorMessageModal(false)}
          message={errorMessage}
        />
        
        {isLoading && <Wait />}
        
        <ConfirmationModal
          isOpen={canOpenConfirmActionModal}
          onClose={() => setCanOpenConfirmActionModal(false)}
          onConfirm={async () => await deleteAccount(accountToDelete.id)}
          title="Delete Account"
          message={`Are you sure you want to delete the account ${accountToDelete?.code} - ${accountToDelete?.label}?`}
        />
      </div>
    </AccountantDashBoard>
  );
}
