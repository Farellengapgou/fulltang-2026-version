import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import axiosInstance from "../../Utils/axiosInstance.js";

export function EditDrugInfosModal ({ isOpen, onClose, setCanOpenSuccessModal, setSuccessMessage, setIsLoading, drugData }) {
    EditDrugInfosModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        setCanOpenSuccessModal: PropTypes.func.isRequired,
        setSuccessMessage: PropTypes.func.isRequired,
        setIsLoading: PropTypes.func.isRequired,
        drugData: PropTypes.object.isRequired
    };

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name:'',
        generic_name: '',
        category: '',
        brand: '',
        price: 0,
        current_stock: 0,
        expiry_date: '',
        description: '',
        requires_prescription: false,
        updated_at: new Date().toISOString(),

    });
    const [error, setError] = useState("");
    const [checkedFields, setCheckedFields] = useState({
        name: false,
        generic_name: false,
        category: false,
        brand: false,
        price: false,
        current_stock: false,
        expiry_date: false,
        description: false,
        requires_prescription: false,
        updated_at: false,
        
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

    useEffect(() => {
        if (drugData) {
            setFormData(prev => ({
                ...prev,
                ...drugData   // fill only provided fields
            }));
        }
    }, [drugData]);



    function handleChange (e) {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value
        }));
    }

    function handleCheckboxChange(e) {
        const { name, checked } = e.target;
        setCheckedFields(prev => ({ ...prev, [name]: checked }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
            const updatedData = Object.keys(checkedFields).reduce((acc, key) => {
                if (checkedFields[key]) {
                    acc[key] = formData[key];
                }
                return acc;
            }, {});

            try {
                const response = await axiosInstance.patch(`/product/${drugData.id}/`, updatedData);
                if (response.status === 200) {
                    setIsLoading(false);
                    setSuccessMessage(`${drugData.name} 's information has been updated successfully!`);
                    setCanOpenSuccessModal(true);
                    onClose();
                }
            } catch (error) {
                setIsLoading(false);
                setSuccessMessage("");
                setCanOpenSuccessModal(false);
                setError("Something went wrong, please try again later!");
                console.log(error);
            }
        setIsLoading(false);
    }

    function applyFormStyle() {
        return "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-2 focus:border-primary-end";
    }


    function applyCheckboxStyle() {
        return "form-checkbox h-3 w-3 mt-4 text-primary-end";
    }


    function formatDate(date) {
        if (!date) return "";
        const d = new Date(date);
        if (isNaN(d)) return "";
        return d.toISOString().split("T")[0];
    }

    if (!isOpen) return null;

return (
    <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                    <div className="bg-gradient-to-r from-primary-end to-primary-start px-6 py-4 rounded-t-lg flex-col flex justify-center items-center">
                        <h3 className="text-4xl font-bold text-white">Edit Medication Information</h3>
                        <div className="flex mt-3">
                            <p className="text-white font-semibold ml-3 italic">(Please check the fields you want to modify)</p>
                        </div>
                    </div>
                    {error && <p className="text-red-500 font-bold text-md ml-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="p-4 space-y-6">
                        <div className="flex space-x-3">
                            <div className="w-2/3 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="Name"
                                    name="name"
                                    checked={checkedFields.name}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="Name"
                                           className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Enter drug's name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.name}
                                        disabled={!checkedFields.name}
                                    />
                                </div>
                            </div>

                            <div className="w-2/3 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="Generic_name"
                                    name="generic_name"
                                    checked={checkedFields.generic_name}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="Generic_name"
                                           className="block text-sm font-medium text-gray-700 mb-1">Generic name</label>
                                    <input
                                        type="text"
                                        id="generic_name"
                                        name="generic_name"
                                        placeholder="Enter drug's generic name"
                                        value={formData.generic_name}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.generic_name}
                                        disabled={!checkedFields.generic_name}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <div className="w-2/3 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="Category"
                                    name="category"
                                    checked={checkedFields.category}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="Category"
                                        className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <div className="flex gap-2">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className={applyFormStyle()}
                                            required={checkedFields.category}
                                            disabled={!checkedFields.category}
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="w-2/3 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="Brand"
                                    name="brand"
                                    checked={checkedFields.brand}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="Brand"
                                        className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                    <input
                                        type="text"
                                        id="brand"
                                        name="brand"
                                        placeholder="Enter medication's brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.brand}
                                        disabled={!checkedFields.brand}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <div className="w-1/3 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="Price"
                                    name="price"
                                    checked={checkedFields.price}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="Price"
                                        className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        placeholder="Enter drug's price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.price}
                                        disabled={!checkedFields.price}
                                        />
                                </div>
                            </div>

                            <div className="w-1/3 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="Current_stock"
                                    name="current_stock"
                                    checked={checkedFields.current_stock}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="Current_stock"
                                        className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        id="current_stock"
                                        name="current_stock"
                                        placeholder="Enter drug's stock"
                                        value={formData.current_stock}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.current_stock}
                                        disabled={!checkedFields.current_stock}
                                        />
                                </div>
                            </div>

                            <div className="w-1/3 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="expiry_date"
                                    name="expiry_date"
                                    checked={checkedFields.expiry_date}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="lastName"
                                        className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        id="expiry_date"
                                        name="expiry_date"
                                        value={formatDate(formData.expiry_date)}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={formatDate(checkedFields.expiry_date)}
                                        disabled={!checkedFields.expiry_date}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <div className="w-3/4 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="description"
                                    name="description"
                                    checked={checkedFields.description}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="description"
                                        className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        id="description"
                                        name="description"
                                        placeholder="Enter drug's description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.description}
                                        disabled={!checkedFields.description}
                                    />
                                </div>
                            </div>

                            <div className="w-1/4 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="Requires_prescription"
                                    name="requires_prescription"
                                    checked={checkedFields.requires_prescription}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="Requires_prescription"
                                        className="block text-sm font-medium text-gray-700 mb-1">On prescription?</label>
                                    <div className="flex gap-2">
                                        <select
                                            name="requires_prescription"
                                            value={String(formData.requires_prescription)}  // Important
                                            onChange={(e) => {
                                                handleChange({
                                                    target: {
                                                        name: "requires_prescription",
                                                        value: e.target.value === "true",
                                                    }
                                                });
                                            }}
                                            className={applyFormStyle()}
                                            required={checkedFields.requires_prescription}
                                            disabled={!checkedFields.requires_prescription}
                                        >
                                            <option value="true">true</option>
                                            <option value="false">false</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-1 flex justify-center space-x-6">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary-end hover:text-xl text-md text-white rounded-lg font-bold transition-all duration-300"
                            >
                                Update
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setError(""),
                                    onClose()
                                }}
                                className="px-4 py-2 border bg-red-400 text-md hover:text-xl hover:bg-red-500 text-white font-bold rounded-lg transition-all duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
    </>
)
}