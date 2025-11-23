import { useState } from "react";
import axiosInstance from "../../Utils/axiosInstance";

export function AddCategoryModal({ isOpen, onClose, onCategoryCreated }) {

    const [categoryData, setCategoryData] = useState({
        name: "",
        description: "",
        parent: null,
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategoryData(prev => ({ ...prev, [name]: value }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosInstance.post("/category-product/", categoryData);

            if (response.status === 201) {
                onCategoryCreated(response.data); // envoie la nouvelle catégorie au parent
                onClose(); // ferme la modal
            }
        } catch (error) {
            console.error("Error creating category:", error);
        }

        setLoading(false);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-[450px] shadow-lg">
                <h2 className="text-xl font-bold mb-4">Add New Category</h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block font-semibold mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={categoryData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Description</label>
                        <textarea
                            name="description"
                            value={categoryData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-secondary text-white rounded"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
