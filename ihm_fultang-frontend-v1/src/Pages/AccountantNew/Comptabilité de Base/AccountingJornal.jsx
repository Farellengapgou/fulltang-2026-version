import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw, Download, Eye, Edit2, Trash2, Filter, Book, AlertCircle } from "lucide-react";
import { AccountantNavBar } from "../../Accountant/Components/AccountantNavBar.jsx";
import { AccountantDashBoard } from "../../Accountant/Components/AccountantDashboard.jsx";
import { FinancialAccountantNavLink } from "../NavLink.js";
import journalService from "../../../Services/Accounting/journalService";
import { Tooltip, Modal, Form, Input, Select, Button, message } from 'antd';

const { Option } = Select;

export function AccountingJornal() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    
    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingJournal, setEditingJournal] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const journals = await journalService.getAllJournals();
            setData(journals);
            setErrorMessage("");
        } catch (error) {
            console.error("Erreur:", error);
            setErrorMessage("Erreur lors du chargement des journaux.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateOrUpdate = async (values) => {
        setSubmitting(true);
        try {
            if (editingJournal) {
                await journalService.updateJournal(editingJournal.id, values);
                message.success("Journal mis à jour avec succès");
            } else {
                await journalService.createJournal(values);
                message.success("Journal créé avec succès");
            }
            setIsModalVisible(false);
            form.resetFields();
            setEditingJournal(null);
            loadData();
        } catch (error) {
            console.error("Erreur sauvegarde:", error);
            message.error("Erreur lors de la sauvegarde du journal");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Êtes-vous sûr ?',
            content: 'Cette action est irréversible.',
            okText: 'Oui, supprimer',
            okType: 'danger',
            cancelText: 'Annuler',
            onOk: async () => {
                try {
                    await journalService.deleteJournal(id);
                    message.success("Journal supprimé");
                    loadData();
                } catch (error) {
                    message.error("Erreur lors de la suppression");
                }
            }
        });
    };

    const openModal = (journal = null) => {
        setEditingJournal(journal);
        if (journal) {
            form.setFieldsValue(journal);
        } else {
            form.resetFields();
            form.setFieldsValue({ is_active: true });
        }
        setIsModalVisible(true);
    };

    // Filter logic
    const filteredData = data.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const journalTypes = {
        'SALES': 'Ventes',
        'PURCHASES': 'Achats',
        'BANK': 'Banque',
        'CASH': 'Caisse',
        'GENERAL': 'Général',
        'MISC': 'Divers'
    };

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="mx-auto p-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Journaux Comptables</h1>
                        <p className="text-gray-600 mt-1">Gérez vos journaux auxiliaires</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={loadData} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <RefreshCw className="h-5 w-5 mr-2" />
                            Actualiser
                        </button>
                        <button onClick={() => openModal()} className="flex items-center px-4 py-2 bg-primary-end text-white rounded-lg hover:bg-teal-700 transition-colors">
                            <Plus className="h-5 w-5 mr-2" />
                            Nouveau Journal
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher par code ou nom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-end"></div>
                    </div>
                ) : errorMessage ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {errorMessage}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {filteredData.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom du Journal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredData.map((journal) => (
                                        <tr key={journal.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{journal.code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                                                <Book className="h-4 w-4 text-gray-400" />
                                                {journal.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    {journalTypes[journal.journal_type] || journal.journal_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${journal.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {journal.is_active ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-3">
                                                    <Tooltip title="Modifier">
                                                        <button onClick={() => openModal(journal)} className="text-indigo-600 hover:text-indigo-900 transition-colors">
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip title="Supprimer">
                                                        <button onClick={() => handleDelete(journal.id)} className="text-red-600 hover:text-red-900 transition-colors">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                                <Book className="h-12 w-12 text-gray-300 mb-4" />
                                <p className="text-lg">Aucun journal trouvé</p>
                                <button onClick={() => openModal()} className="mt-4 text-primary-end hover:underline">
                                    Créer votre premier journal
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal
                title={editingJournal ? "Modifier le journal" : "Nouveau journal"}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateOrUpdate}
                >
                    <Form.Item
                        name="code"
                        label="Code Journal"
                        rules={[{ required: true, message: 'Le code est requis' }]}
                    >
                        <Input placeholder="Ex: VEN, ACH, BQ1" />
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Nom du Journal"
                        rules={[{ required: true, message: 'Le nom est requis' }]}
                    >
                        <Input placeholder="Ex: Journal des ventes" />
                    </Form.Item>

                    <Form.Item
                        name="journal_type"
                        label="Type de Journal"
                        rules={[{ required: true, message: 'Le type est requis' }]}
                    >
                        <Select placeholder="Sélectionnez un type">
                            <Option value="SALES">Journal des ventes</Option>
                            <Option value="PURCHASES">Journal des achats</Option>
                            <Option value="BANK">Journal de banque</Option>
                            <Option value="CASH">Journal de caisse</Option>
                            <Option value="GENERAL">Journal général</Option>
                            <Option value="MISC">Opérations diverses</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        valuePropName="checked"
                        initialValue={true}
                    >
                       <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="form-checkbox text-primary-end rounded" />
                            <span>Journal Actif</span>
                        </label>
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setIsModalVisible(false)}>Annuler</Button>
                        <Button type="primary" htmlType="submit" loading={submitting} className="bg-primary-end">
                            Enregistrer
                        </Button>
                    </div>
                </Form>
            </Modal>
        </AccountantDashBoard>
    );
}
