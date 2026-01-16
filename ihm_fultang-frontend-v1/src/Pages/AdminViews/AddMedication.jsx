import { useState, useEffect } from "react";
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import {adminNavLink} from "./adminNavLink.js";
import {AdminNavBar} from "./AdminNavBar.jsx";
import medicationImage from "../../assets/medication.jpeg"
import axiosInstance from "../../Utils/axiosInstance.js";
import {SuccessModal} from "../Modals/SuccessModal.jsx";
import {ErrorModal} from "../Modals/ErrorModal.jsx";
import Wait from "../Modals/wait.jsx";
import { AddCategoryModal } from "./AddCategoryModal.jsx";


export function AddMedication()
{
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [canOpenErrorModal, setCanOpenErrorModal] = useState(false);
    const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [medicationData, setMedicationData] = useState({
        category: '',
        name: '',
        generic_name: '',
        brand: '',
        description: '',
        price: 0,
        current_stock: 0,
        min_stock_level: 10,
        requires_prescription: false,
        expiry_date: '',
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString(),
    });

    async function fetchCategories() {
        try {
            const response = await axiosInstance.get("/category-product/");
            const categoriesData = response.data.results || [];
            setCategories(categoriesData);
            console.log("Categories:", categoriesData);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    function handleChange (e) {
        const { name, value, type, checked } = e.target;
        setMedicationData(prevData => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value
        }));
    }

    async function handleSubmit (e) {
        e.preventDefault();
        setIsLoading(true);

        const finalData = {
            ...medicationData,
            category: Number(medicationData.category),
            current_stock: Number(medicationData.current_stock),
            price: Number(medicationData.price),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        console.log("Sending data:", finalData);

        try
        {
            const response = await axiosInstance.post("/product/", finalData);
            if (response.status === 201)
            {
                setIsLoading(false);
                setErrorMessage("");
                setSuccessMessage(`The product ${finalData.name} created successfully`);
                setCanOpenSuccessModal(true);
                setCanOpenErrorModal(false);
            }
        }
        catch (error)
        {
            setIsLoading(false);
            console.log(error);
            setSuccessMessage("");
            setErrorMessage(`Error when registering the product ${finalData.name} please retry !`);
            setCanOpenSuccessModal(false);
            setCanOpenErrorModal(true);
        }
    }

    function applyInputStyle()
    {
        return "w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none  focus:border-2  focus:border-primary-end";
    }

    function applyLabelStyle()
    {
        return "block text-md font-semibold text-gray-600 mb-1";
    }

    return(
        <>
            <AddCategoryModal
                isOpen={showAddCategoryModal}
                onClose={() => setShowAddCategoryModal(false)}
                onCategoryCreated={(newCat) => {
                    setCategories(prev => [...prev, newCat]); // ajoute à la liste
                    setMedicationData(prev => ({ ...prev, category: newCat.id })); // sélectionne auto
                }}
            />
            <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
                <AdminNavBar/>
                <div className="flex m-5">
                    <div className="w-1/2 mr-6 flex flex-col items-center justify-center">
                        <h1 className="text-4xl font-bold text-secondary mb-4">Add a new medication</h1>
                        <p className="text-justify text-secondary font-normal text-md mb-5">Please complete all
                            fields below to add a new product to Fultang Clinic.</p>
                        <img src={medicationImage} alt={"image"} className={"w-[700px] h-[500px] rounded-2xl"}/>
                    </div>

                    <div className="w-1/2 p-6 mt-8 flex items-center justify-center">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className={applyLabelStyle()}>
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={medicationData.name}
                                        onChange={handleChange}
                                        className={applyInputStyle()}
                                        placeholder="Enter the product's name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={applyLabelStyle()}>
                                        Generic name
                                    </label>
                                    <input
                                        type="text"
                                        name="generic_name"
                                        value={medicationData.generic_name}
                                        onChange={handleChange}
                                        className={applyInputStyle()}
                                        placeholder="Enter the product's generic name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className={applyLabelStyle()}>
                                        Category
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            name="category"
                                            value={medicationData.category}
                                            onChange={handleChange}
                                            className={applyInputStyle()}
                                            required
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                    
                                        {/* Bouton + */}
                                        <button
                                            type="button"
                                            onClick={() => setShowAddCategoryModal(true)}
                                            className="bg-secondary text-white w-10 h-10 rounded-lg text-xl font-bold"
                                            title="Add a new category"

                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={applyLabelStyle()}>
                                        Brand
                                    </label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={medicationData.brand}
                                        onChange={handleChange}
                                        className={applyInputStyle()}
                                        placeholder="Enter the product's brand"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className={applyLabelStyle()}>
                                        Price (FCFA)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={medicationData.price}
                                        onChange={handleChange}
                                        className={applyInputStyle()}
                                        placeholder={0}
                                        min={0}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={applyLabelStyle()}>
                                        Stock
                                    </label>
                                    <input
                                        type="number"
                                        name="current_stock"
                                        value={medicationData.current_stock}
                                        onChange={handleChange}
                                        className={applyInputStyle()}
                                        placeholder={0}
                                        min={0}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={applyLabelStyle()}>
                                        Expiry date
                                    </label>
                                    <input
                                        type="date"
                                        name="expiry_date"
                                        value={medicationData.expiry_date}
                                        onChange={handleChange}
                                        className={applyInputStyle()}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={applyLabelStyle()}>
                                    Description
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    value={medicationData.description}
                                    onChange={handleChange}
                                    className="w-full h-20 px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none  focus:border-2  focus:border-primary-end"
                                    placeholder="Enter product's description"
                                    required
                                />
                            </div>

                            <div className="flex flex-row">
                                <label className={applyLabelStyle()}>
                                    Requires prescription ?
                                </label>
                                <input
                                    type="checkbox"
                                    name="requires_prescription"
                                    checked={medicationData.requires_prescription}
                                    onChange={handleChange}
                                    className="ml-2 w-5 h-5"
                                />
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button
                                    type="submit"
                                    className="bg-secondary text-white py-2 px-12 font-bold rounded-lg hover:bg-[#3d9d94] transition-colors duration-300"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <SuccessModal isOpen={canOpenSuccessModal} canOpenSuccessModal={setCanOpenSuccessModal} message={successMessage}/>
                <ErrorModal isOpen={canOpenErrorModal} onCloseErrorModal={setCanOpenErrorModal} message={errorMessage}/>
                {isLoading && <Wait/>}
            </CustomDashboard>
        </>
    )
}