// Service API pour la Comptabilité Matière
// Centralise tous les appels API avec possibilité d'utiliser des mock data

const API_BASE_URL = '/api/v1/material-accounting';
const USE_MOCK_DATA = true; // Switch to false when backend is ready

// ==================== PERSISTENCE HELPERS ====================

const STORAGE_KEYS = {
    CATEGORIES: 'fulltang_mock_categories',
    WAREHOUSES: 'fulltang_mock_warehouses',
    SUPPLIERS: 'fulltang_mock_suppliers',
    STOCK_LEVELS: 'fulltang_mock_stock_levels',
    BATCHES: 'fulltang_mock_batches',
    MOVEMENTS: 'fulltang_mock_movements',
    GOODS_RECEIPTS: 'fulltang_mock_goods_receipts',
    GOODS_ISSUES: 'fulltang_mock_goods_issues',
    TRANSFERS: 'fulltang_mock_transfers',
    PHYSICAL_INVENTORIES: 'fulltang_mock_inventories'
};

const getFromStorage = (key, defaultValue) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
};

const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Error saving to storage: ${key}`, e);
    }
};

// ==================== MOCK DATA ====================

const initialCategories = [
    { id: 1, code: "MED", name: "Médicaments", description: "Produits pharmaceutiques", parent: null, is_active: true, article_count: 85 },
    { id: 2, code: "CONS", name: "Consommables", description: "Matériel médical consommable", parent: null, is_active: true, article_count: 210 },
    { id: 3, code: "EQUIP", name: "Équipements", description: "Équipements médicaux", parent: null, is_active: true, article_count: 45 },
    { id: 4, code: "MED-ANT", name: "Antibiotiques", description: "Médicaments antibiotiques", parent: 1, is_active: true, article_count: 25 },
    { id: 5, code: "RAD", name: "Radiologie", description: "Films et produits de contraste", parent: null, is_active: true, article_count: 12 },
    { id: 6, code: "CHIR", name: "Chirurgie", description: "Instruments chirurgicaux", parent: null, is_active: true, article_count: 56 },
    { id: 7, code: "HYG", name: "Hygiène", description: "Produits de nettoyage et désinfection", parent: null, is_active: true, article_count: 34 },
];

const initialWarehouses = [
    { id: 1, code: "PHAR01", name: "Pharmacie principale", warehouse_type: "PHARMACY", location: "Bâtiment A - RDC", is_active: true, is_main_warehouse: true, total_value: 45500000, article_count: 250 },
    { id: 2, code: "BLOC", name: "Bloc opératoire", warehouse_type: "OPERATING_ROOM", location: "Bâtiment B - 1er", is_active: true, is_main_warehouse: false, total_value: 12200000, article_count: 85 },
    { id: 3, code: "LAB", name: "Laboratoire", warehouse_type: "LABORATORY", location: "Bâtiment A - 2ème", is_active: true, is_main_warehouse: false, total_value: 8800000, article_count: 68 },
    { id: 4, code: "URG", name: "Urgences", warehouse_type: "EMERGENCY", location: "Bâtiment C - RDC", is_active: true, is_main_warehouse: false, total_value: 15400000, article_count: 120 },
    { id: 5, code: "DEP-N", name: "Dépôt Nord", warehouse_type: "STORAGE", location: "Bâtiment Annexe", is_active: true, is_main_warehouse: false, total_value: 25800000, article_count: 180 },
];

const initialSuppliers = [
    { id: 1, code: "FOURNPHARMA01", name: "Laboratoire Pharmacia", supplier_type: "PHARMA", city: "Douala", country: "Cameroun", phone: "+237 233 XX XX XX", email: "contact@pharmacia.cm", is_active: true, total_purchases: 28500000, last_purchase_date: "2024-06-15" },
    { id: 2, code: "MEDTECH", name: "Medical Technologies", supplier_type: "EQUIPMENT", city: "Yaoundé", country: "Cameroun", phone: "+237 222 XX XX XX", email: "info@medtech.cm", is_active: true, total_purchases: 42000000, last_purchase_date: "2024-06-05" },
    { id: 3, code: "GLOBE-MED", name: "Global Medical Supplies", supplier_type: "GENERAL", city: "Paris", country: "France", phone: "+33 1 XX XX XX XX", email: "sales@globemed.fr", is_active: true, total_purchases: 15500000, last_purchase_date: "2024-05-20" },
    { id: 4, code: "SANOFI-CM", name: "Sanofi Cameroun", supplier_type: "PHARMA", city: "Douala", country: "Cameroun", phone: "+237 244 XX XX XX", email: "contact.cm@sanofi.com", is_active: true, total_purchases: 35000000, last_purchase_date: "2024-06-12" },
];

const initialStockLevels = [
    { id: 1, article: { id: 1, code: "PARA500", name: "Paracétamol 500mg", category: "Médicaments" }, warehouse: { id: 1, code: "PHAR01", name: "Pharmacie principale" }, physical_quantity: 2500, theoretical_quantity: 2500, reserved_quantity: 150, minimum_stock: 500, weighted_average_price: 150, stock_value: 375000, alert_level: null },
    { id: 2, article: { id: 2, code: "AMOX250", name: "Amoxicilline 250mg", category: "Médicaments" }, warehouse: { id: 1, code: "PHAR01", name: "Pharmacie principale" }, physical_quantity: 350, theoretical_quantity: 350, reserved_quantity: 20, minimum_stock: 400, weighted_average_price: 300, stock_value: 105000, alert_level: "LOW_STOCK" },
    { id: 3, article: { id: 3, code: "GAUZ10", name: "Gaze stérile 10x10", category: "Consommables" }, warehouse: { id: 2, code: "BLOC", name: "Bloc opératoire" }, physical_quantity: 5000, theoretical_quantity: 5000, reserved_quantity: 1000, minimum_stock: 2000, weighted_average_price: 450, stock_value: 2250000, alert_level: null },
    { id: 4, article: { id: 4, code: "SER20", name: "Seringue 20ml", category: "Consommables" }, warehouse: { id: 1, code: "PHAR01", name: "Pharmacie principale" }, physical_quantity: 0, theoretical_quantity: 0, reserved_quantity: 0, minimum_stock: 1000, weighted_average_price: 120, stock_value: 0, alert_level: "OUT_OF_STOCK" },
    { id: 5, article: { id: 5, code: "BETA100", name: "Bétadine 100ml", category: "Hygiène" }, warehouse: { id: 4, code: "URG", name: "Urgences" }, physical_quantity: 120, theoretical_quantity: 120, reserved_quantity: 10, minimum_stock: 50, weighted_average_price: 1250, stock_value: 150000, alert_level: null },
    { id: 6, article: { id: 6, code: "GAN-L", name: "Gants Latex (M)", category: "Consommables" }, warehouse: { id: 1, code: "PHAR01", name: "Pharmacie principale" }, physical_quantity: 8500, theoretical_quantity: 8500, reserved_quantity: 500, minimum_stock: 2000, weighted_average_price: 85, stock_value: 722500, alert_level: null },
    { id: 7, article: { id: 7, code: "SPAS-A", name: "Spasfon Ampoules", category: "Médicaments" }, warehouse: { id: 4, code: "URG", name: "Urgences" }, physical_quantity: 45, theoretical_quantity: 45, reserved_quantity: 15, minimum_stock: 100, weighted_average_price: 2450, stock_value: 110250, alert_level: "LOW_STOCK" },
    { id: 8, article: { id: 8, code: "FILM-R", name: "Film Radio 35x43", category: "Radiologie" }, warehouse: { id: 3, code: "LAB", name: "Laboratoire" }, physical_quantity: 200, theoretical_quantity: 200, reserved_quantity: 0, minimum_stock: 50, weighted_average_price: 3500, stock_value: 700000, alert_level: null },
    { id: 9, article: { id: 9, code: "SUT-V", name: "Fil de suture Vicryl 2/0", category: "Chirurgie" }, warehouse: { id: 2, code: "BLOC", name: "Bloc opératoire" }, physical_quantity: 34, theoretical_quantity: 34, reserved_quantity: 10, minimum_stock: 100, weighted_average_price: 4800, stock_value: 163200, alert_level: "LOW_STOCK" },
    { id: 10, article: { id: 10, code: "ALC-90", name: "Alcool 90° 5L", category: "Hygiène" }, warehouse: { id: 5, code: "DEP-N", name: "Dépôt Nord" }, physical_quantity: 450, theoretical_quantity: 450, reserved_quantity: 0, minimum_stock: 100, weighted_average_price: 6500, stock_value: 2925000, alert_level: null },
    { id: 11, article: { id: 11, code: "DEX-5", name: "Dextrose 5% 500ml", category: "Médicaments" }, warehouse: { id: 1, code: "PHAR01", name: "Pharmacie principale" }, physical_quantity: 1200, theoretical_quantity: 1200, reserved_quantity: 200, minimum_stock: 500, weighted_average_price: 850, stock_value: 1020000, alert_level: null },
    { id: 12, article: { id: 12, code: "MASQ-C", name: "Masques Chirurgicaux (50)", category: "Consommables" }, warehouse: { id: 1, code: "PHAR01", name: "Pharmacie principale" }, physical_quantity: 150, theoretical_quantity: 150, reserved_quantity: 0, minimum_stock: 300, weighted_average_price: 2500, stock_value: 375000, alert_level: "LOW_STOCK" },
];

const initialBatches = [
    { id: 1, batch_number: "LOT202401001", article: { id: 1, code: "PARA500", name: "Paracétamol 500mg" }, warehouse: { id: 1, code: "PHAR01", name: "Pharmacie principale" }, manufacturing_date: "2024-01-15", expiry_date: "2026-01-15", initial_quantity: 2000, remaining_quantity: 1500, unit_cost: 145, is_blocked: false, days_until_expiry: 365 },
    { id: 2, batch_number: "LOT202312050", article: { id: 3, code: "GAUZ10", name: "Gaze stérile 10x10", category: "Consommables" }, warehouse: { id: 2, code: "BLOC", name: "Bloc opératoire" }, manufacturing_date: "2023-12-01", expiry_date: "2025-02-15", initial_quantity: 1000, remaining_quantity: 450, unit_cost: 450, is_blocked: false, days_until_expiry: 30 },
    { id: 3, batch_number: "LOT202306012", article: { id: 2, code: "AMOX250", name: "Amoxicilline 250mg" }, warehouse: { id: 1, code: "PHAR01", name: "Pharmacie principale" }, manufacturing_date: "2023-06-10", expiry_date: "2024-06-30", initial_quantity: 500, remaining_quantity: 120, unit_cost: 280, is_blocked: true, days_until_expiry: -15 },
    { id: 4, batch_number: "LOT202402115", article: { id: 5, code: "BETA100", name: "Bétadine 100ml" }, warehouse: { id: 4, code: "URG", name: "Urgences" }, manufacturing_date: "2024-02-01", expiry_date: "2026-02-01", initial_quantity: 200, remaining_quantity: 120, unit_cost: 1100, is_blocked: false, days_until_expiry: 380 },
    { id: 5, batch_number: "LOT202311005", article: { id: 11, code: "DEX-5", name: "Dextrose 5% 500ml" }, warehouse: { id: 1, code: "PHAR01", name: "Pharmacie principale" }, manufacturing_date: "2023-11-01", expiry_date: "2025-01-20", initial_quantity: 1500, remaining_quantity: 800, unit_cost: 800, is_blocked: false, days_until_expiry: 5 },
    { id: 6, batch_number: "LOT202212999", article: { id: 12, code: "MASQ-C", name: "Masques Chirurgicaux (50)" }, warehouse: { id: 1, code: "PHAR01", name: "Pharmacie principale" }, manufacturing_date: "2022-12-01", expiry_date: "2024-01-01", initial_quantity: 5000, remaining_quantity: 250, unit_cost: 1800, is_blocked: false, days_until_expiry: -195 },
];

const initialMovements = [
    { id: 1, movement_number: "MV202406001", movement_type: "IN", movement_reason: "PURCHASE", article: { code: "PARA500", name: "Paracétamol 500mg" }, batch: { batch_number: "LOT202401001" }, destination_warehouse: { code: "PHAR01", name: "Pharmacie principale" }, quantity: 2000, unit_price: 145, total_value: 290000, operation_date: "2024-06-01T10:30:00Z", status: "POSTED", created_by: { name: "Jean Pharmacien" } },
    { id: 2, movement_number: "MV202406002", movement_type: "OUT", movement_reason: "SALE", article: { code: "PARA500", name: "Paracétamol 500mg" }, batch: { batch_number: "LOT202401001" }, source_warehouse: { code: "PHAR01", name: "Pharmacie principale" }, quantity: 50, unit_price: 150, total_value: 7500, operation_date: "2024-06-05T14:15:00Z", status: "POSTED", created_by: { name: "Marie Caissière" } },
    { id: 3, movement_number: "MV202406003", movement_type: "TRANSFER", movement_reason: "INTERNAL_NEED", article: { code: "BETA100", name: "Bétadine 100ml" }, batch: { batch_number: "LOT202402115" }, source_warehouse: { code: "PHAR01", name: "Pharmacie principale" }, destination_warehouse: { code: "URG", name: "Urgences" }, quantity: 50, unit_price: 1250, total_value: 62500, operation_date: "2024-06-08T09:00:00Z", status: "POSTED", created_by: { name: "Paul Logistique" } },
    { id: 4, movement_number: "MV202406004", movement_type: "IN", movement_reason: "PURCHASE", article: { code: "ALC-90", name: "Alcool 90° 5L" }, batch: null, destination_warehouse: { code: "DEP-N", name: "Dépôt Nord" }, quantity: 100, unit_price: 6000, total_value: 600000, operation_date: "2024-06-10T11:00:00Z", status: "POSTED", created_by: { name: "Jean Pharmacien" } },
    { id: 5, movement_number: "MV202406005", movement_type: "OUT", movement_reason: "CONSUMPTION", article: { code: "GAUZ10", name: "Gaze stérile 10x10" }, batch: { batch_number: "LOT202312050" }, source_warehouse: { code: "BLOC", name: "Bloc opératoire" }, quantity: 10, unit_price: 450, total_value: 4500, operation_date: "2024-06-12T08:30:00Z", status: "POSTED", created_by: { name: "Dr. Ahmed" } },
    { id: 6, movement_number: "MV202406006", movement_type: "ADJUSTMENT", movement_reason: "INVENTORY_GAP", article: { code: "AMOX250", name: "Amoxicilline 250mg" }, batch: null, source_warehouse: { code: "PHAR01", name: "Pharmacie principale" }, quantity: 2, unit_price: 300, total_value: 600, operation_date: "2024-06-15T16:00:00Z", status: "POSTED", created_by: { name: "Jean Pharmacien" } },
];

const initialGoodsReceipts = [
    { id: 1, number: "BE202406001", date: "2024-06-01", supplier: "Laboratoire Pharmacia", warehouse: "Pharmacie principale", status: "POSTED", total_amount: 290000, line_count: 2 },
    { id: 2, number: "BE202406002", date: "2024-06-05", supplier: "Medical Technologies", warehouse: "Bloc opératoire", status: "VALIDATED", total_amount: 540000, line_count: 5 },
    { id: 3, number: "BE202406010", date: "2024-06-10", supplier: "Sanofi Cameroun", warehouse: "Pharmacie principale", status: "DRAFT", total_amount: 1250000, line_count: 12 },
    { id: 4, number: "BE202406015", date: "2024-06-15", supplier: "Global Medical Supplies", warehouse: "Dépôt Nord", status: "POSTED", total_amount: 8500000, line_count: 25 },
];

const initialGoodsIssues = [
    { id: 1, number: "BS202406001", date: "2024-06-05", type: "SALE", warehouse: "Pharmacie principale", status: "POSTED", total_amount: 7250, line_count: 1 },
    { id: 2, number: "BS202406002", date: "2024-06-08", type: "CONSUMPTION", warehouse: "Bloc opératoire", status: "VALIDATED", total_amount: 14602, line_count: 2 },
    { id: 3, number: "BS202406012", date: "2024-06-12", type: "CONSUMPTION", warehouse: "Urgences", status: "POSTED", total_amount: 85000, line_count: 8 },
    { id: 4, number: "BS20240618", date: "2024-06-18", type: "SALE", warehouse: "Pharmacie principale", status: "DRAFT", total_amount: 12500, line_count: 3 },
];

const initialTransfers = [
    { id: 1, number: "TR202406001", date: "2024-06-03", from_warehouse: "Pharmacie principale", to_warehouse: "Bloc opératoire", status: "RECEIVED", line_count: 2 },
    { id: 2, number: "TR202406002", date: "2024-06-08", from_warehouse: "Pharmacie principale", to_warehouse: "Laboratoire", status: "SENT", line_count: 1 },
    { id: 3, number: "TR20240610", date: "2024-06-10", from_warehouse: "Dépôt Nord", to_warehouse: "Pharmacie principale", status: "WAITING", line_count: 15 },
    { id: 4, number: "TR20240615", date: "2024-06-15", from_warehouse: "Pharmacie principale", to_warehouse: "Urgences", status: "RECEIVED", line_count: 5 },
];

const initialInventories = [
    { id: 1, number: "INV202406001", date: "2024-06-30", warehouse: "Pharmacie principale", status: "VALIDATED", article_count: 250, variance_value: -285000 },
    { id: 2, number: "INV202406002", date: "2024-06-30", warehouse: "Bloc opératoire", status: "IN_PROGRESS", article_count: 85, variance_value: 0 },
    { id: 3, number: "INV202406003", date: "2024-06-30", warehouse: "Urgences", status: "DRAFT", article_count: 120, variance_value: 0 },
    { id: 4, number: "INV202405001", date: "2024-05-31", warehouse: "Dépôt Nord", status: "VALIDATED", article_count: 180, variance_value: 125400 },
];

let mockCategories = getFromStorage(STORAGE_KEYS.CATEGORIES, initialCategories);
let mockWarehouses = getFromStorage(STORAGE_KEYS.WAREHOUSES, initialWarehouses);
let mockSuppliers = getFromStorage(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
let mockStockLevels = getFromStorage(STORAGE_KEYS.STOCK_LEVELS, initialStockLevels);
let mockBatches = getFromStorage(STORAGE_KEYS.BATCHES, initialBatches);
let mockMovements = getFromStorage(STORAGE_KEYS.MOVEMENTS, initialMovements);
let mockGoodsReceipts = getFromStorage(STORAGE_KEYS.GOODS_RECEIPTS, initialGoodsReceipts);
let mockGoodsIssues = getFromStorage(STORAGE_KEYS.GOODS_ISSUES, initialGoodsIssues);
let mockTransfers = getFromStorage(STORAGE_KEYS.TRANSFERS, initialTransfers);
let mockInventories = getFromStorage(STORAGE_KEYS.PHYSICAL_INVENTORIES, initialInventories);

// mockDashboardStats removed to be dynamic

// ==================== API FUNCTIONS ====================

// Helper pour simuler un délai réseau
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper pour les appels API réels
const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
};

// ==================== DASHBOARD ====================

export const getDashboardStats = async () => {
    if (USE_MOCK_DATA) {
        await delay(800);

        // Calcul dynamiques basés sur les données en mémoire
        const totalStockValue = mockStockLevels.reduce((sum, s) => sum + s.stock_value, 0);
        const lowStock = mockStockLevels.filter(s => s.alert_level === "LOW_STOCK").length;
        const outOfStock = mockStockLevels.filter(s => s.alert_level === "OUT_OF_STOCK").length;
        const expiringCount = mockBatches.filter(b => b.days_until_expiry < 30).length;

        return {
            total_stock_value: totalStockValue,
            total_articles: mockStockLevels.length,
            movements_this_month: mockMovements.length + 120,
            alerts_count: lowStock + outOfStock + expiringCount,
            low_stock_count: lowStock,
            expiring_soon_count: expiringCount,
            recent_movements: [...mockMovements].reverse().slice(0, 5),
            top_consuming_articles: [
                { article: "Paracétamol 500mg", quantity: 12500, value: 1875000 },
                { article: "Amoxicilline 250mg", quantity: 4500, value: 1350000 },
                { article: "Gaze stérile 10x10", quantity: 8200, value: 3690000 },
            ],
            stock_by_warehouse: mockWarehouses.map(w => ({
                name: w.name,
                value: w.total_value,
                article_count: w.article_count
            })),
            expiring_batches: mockBatches.filter(b => b.days_until_expiry < 90)
        };
    }
    return apiCall('/dashboard/overview/');
};

// ==================== CATEGORIES ====================

export const getCategories = async (params = {}) => {
    if (USE_MOCK_DATA) {
        await delay(600);
        return {
            count: mockCategories.length,
            results: mockCategories
        };
    }
    return apiCall('/categories/', { method: 'GET' });
};

export const getCategoryTree = async () => {
    if (USE_MOCK_DATA) {
        await delay(500);
        return mockCategories;
    }
    return apiCall('/categories/tree/');
};

export const createCategory = async (data) => {
    if (USE_MOCK_DATA) {
        await delay(700);
        const newCategory = { id: Date.now(), ...data, is_active: true, article_count: 0 };
        mockCategories.push(newCategory);
        saveToStorage(STORAGE_KEYS.CATEGORIES, mockCategories);
        return newCategory;
    }
    return apiCall('/categories/', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const updateCategory = async (id, data) => {
    if (USE_MOCK_DATA) {
        await delay(700);
        const index = mockCategories.findIndex(c => c.id === id);
        if (index !== -1) {
            mockCategories[index] = { ...mockCategories[index], ...data };
            saveToStorage(STORAGE_KEYS.CATEGORIES, mockCategories);
            return mockCategories[index];
        }
        return null;
    }
    return apiCall(`/categories/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export const deleteCategory = async (id) => {
    if (USE_MOCK_DATA) {
        await delay(500);
        mockCategories = mockCategories.filter(c => c.id !== id);
        saveToStorage(STORAGE_KEYS.CATEGORIES, mockCategories);
        return { success: true };
    }
    return apiCall(`/categories/${id}/`, { method: 'DELETE' });
};

// ==================== WAREHOUSES ====================

export const getWarehouses = async (params = {}) => {
    if (USE_MOCK_DATA) {
        await delay(600);
        return {
            count: mockWarehouses.length,
            results: mockWarehouses
        };
    }
    return apiCall('/warehouses/', { method: 'GET' });
};

export const createWarehouse = async (data) => {
    if (USE_MOCK_DATA) {
        await delay(700);
        const newWarehouse = { id: Date.now(), ...data, is_active: true, total_value: 0, article_count: 0 };
        mockWarehouses.push(newWarehouse);
        saveToStorage(STORAGE_KEYS.WAREHOUSES, mockWarehouses);
        return newWarehouse;
    }
    return apiCall('/warehouses/', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const updateWarehouse = async (id, data) => {
    if (USE_MOCK_DATA) {
        await delay(700);
        const index = mockWarehouses.findIndex(w => w.id === id);
        if (index !== -1) {
            mockWarehouses[index] = { ...mockWarehouses[index], ...data };
            saveToStorage(STORAGE_KEYS.WAREHOUSES, mockWarehouses);
            return mockWarehouses[index];
        }
        return null;
    }
    return apiCall(`/warehouses/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export const deleteWarehouse = async (id) => {
    if (USE_MOCK_DATA) {
        await delay(500);
        mockWarehouses = mockWarehouses.filter(w => w.id !== id);
        saveToStorage(STORAGE_KEYS.WAREHOUSES, mockWarehouses);
        return { success: true };
    }
    return apiCall(`/warehouses/${id}/`, { method: 'DELETE' });
};

// ==================== SUPPLIERS ====================

export const getSuppliers = async (params = {}) => {
    if (USE_MOCK_DATA) {
        await delay(600);
        return {
            count: mockSuppliers.length,
            results: mockSuppliers
        };
    }
    return apiCall('/suppliers/', { method: 'GET' });
};

export const createSupplier = async (data) => {
    if (USE_MOCK_DATA) {
        await delay(700);
        const newSupplier = { id: Date.now(), ...data, is_active: true, total_purchases: 0 };
        mockSuppliers.push(newSupplier);
        saveToStorage(STORAGE_KEYS.SUPPLIERS, mockSuppliers);
        return newSupplier;
    }
    return apiCall('/suppliers/', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const updateSupplier = async (id, data) => {
    if (USE_MOCK_DATA) {
        await delay(700);
        const index = mockSuppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            mockSuppliers[index] = { ...mockSuppliers[index], ...data };
            saveToStorage(STORAGE_KEYS.SUPPLIERS, mockSuppliers);
            return mockSuppliers[index];
        }
        return null;
    }
    return apiCall(`/suppliers/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export const deleteSupplier = async (id) => {
    if (USE_MOCK_DATA) {
        await delay(500);
        mockSuppliers = mockSuppliers.filter(s => s.id !== id);
        saveToStorage(STORAGE_KEYS.SUPPLIERS, mockSuppliers);
        return { success: true };
    }
    return apiCall(`/suppliers/${id}/`, { method: 'DELETE' });
};

// ==================== STOCK LEVELS ====================

export const getStockLevels = async (params = {}) => {
    if (USE_MOCK_DATA) {
        await delay(700);
        let results = [...mockStockLevels];
        if (params.warehouse) results = results.filter(s => s.warehouse.id === parseInt(params.warehouse));
        if (params.category) results = results.filter(s => s.article.category === params.category);
        return {
            count: results.length,
            results: results
        };
    }
    return apiCall('/stock-levels/', { method: 'GET' });
};

// ==================== BATCHES ====================

export const getBatches = async (params = {}) => {
    if (USE_MOCK_DATA) {
        await delay(700);
        let results = [...mockBatches];
        if (params.warehouse) results = results.filter(b => b.warehouse.id === parseInt(params.warehouse));
        return {
            count: results.length,
            results: results
        };
    }
    return apiCall('/batches/', { method: 'GET' });
};

export const getExpiringBatches = async (days = 90) => {
    if (USE_MOCK_DATA) {
        await delay(600);
        return mockBatches.filter(b => b.days_until_expiry <= days);
    }
    return apiCall(`/batches/expiring-soon/?days=${days}`);
};

// ==================== MOVEMENTS ====================

export const getMovements = async (params = {}) => {
    if (USE_MOCK_DATA) {
        await delay(700);
        let results = [...mockMovements];
        if (params.warehouse) {
            results = results.filter(m =>
                m.source_warehouse?.code === params.warehouse ||
                m.destination_warehouse?.code === params.warehouse
            );
        }
        return {
            count: results.length,
            results: results.reverse()
        };
    }
    return apiCall('/movements/', { method: 'GET' });
};

// ==================== REPORTS & ANALYTICS ====================

export const getStockCard = async (articleId, warehouseId, dateFrom, dateTo) => {
    if (USE_MOCK_DATA) {
        await delay(800);
        return {
            results: [
                { date: "2024-01-15", reference: "BE202401001", description: "Achat initial Sanofi", entry_qty: 1500, entry_price: 140, entry_value: 210000, exit_qty: 0, exit_price: 0, exit_value: 0, balance_qty: 1500, pmp: 140, balance_value: 210000 },
                { date: "2024-02-10", reference: "BS202402012", description: "Vente Pharmacie", entry_qty: 0, entry_price: 0, entry_value: 0, exit_qty: 200, exit_price: 140, exit_value: 28000, balance_qty: 1300, pmp: 140, balance_value: 182000 },
                { date: "2024-03-05", reference: "BE202403005", description: "Réapprovisionnement Pharmacia", entry_qty: 1000, entry_price: 160, entry_value: 160000, exit_qty: 0, exit_price: 0, exit_value: 0, balance_qty: 2300, pmp: 148.69, balance_value: 342000 },
                { date: "2024-04-12", reference: "TR202404001", description: "Transfert vers Urgences", entry_qty: 0, entry_price: 0, entry_value: 0, exit_qty: 500, exit_price: 148.69, exit_value: 74345, balance_qty: 1800, pmp: 148.69, balance_value: 267655 },
                { date: "2024-05-20", reference: "BS202405088", description: "Vente Pharmacie", entry_qty: 0, entry_price: 0, entry_value: 0, exit_qty: 300, exit_price: 148.69, exit_value: 44607, balance_qty: 1500, pmp: 148.69, balance_value: 223048 },
            ]
        };
    }
    return apiCall(`/reports/stock-card/?article=${articleId}&warehouse=${warehouseId}`);
};

export const getPerpetualInventory = async (date) => {
    if (USE_MOCK_DATA) {
        await delay(800);
        return {
            date: date || "2024-06-30",
            totalValue: 108700000,
            categories: [
                {
                    code: "3311",
                    name: "Produits pharmaceutiques",
                    articles: [
                        { code: "PARA500", name: "Paracétamol 500mg", qty: 2500, pmp: 150, value: 375000 },
                        { code: "AMOX250", name: "Amoxicilline 250mg", qty: 350, pmp: 300, value: 105000 },
                        { code: "SPAS-A", name: "Spasfon Ampoules", qty: 45, pmp: 2450, value: 110250 },
                        { code: "DEX-5", name: "Dextrose 5% 500ml", qty: 1200, pmp: 850, value: 1020000 },
                    ],
                },
                {
                    code: "3312",
                    name: "Consommables médicaux",
                    articles: [
                        { code: "GAUZ10", name: "Gaze stérile 10x10", qty: 5000, pmp: 450, value: 2250000 },
                        { code: "GAN-L", name: "Gants Latex (M)", qty: 8500, pmp: 85, value: 722500 },
                        { code: "MASQ-C", name: "Masques Chirurgicaux (50)", qty: 150, pmp: 2500, value: 375000 },
                    ],
                },
                {
                    code: "3315",
                    name: "Produits d'hygiène",
                    articles: [
                        { code: "BETA100", name: "Bétadine 100ml", qty: 120, pmp: 1250, value: 150000 },
                        { code: "ALC-90", name: "Alcool 90° 5L", qty: 450, pmp: 6500, value: 2925000 },
                    ],
                }
            ]
        };
    }
    return apiCall(`/reports/perpetual-inventory/?date=${date}`);
};

export const getABCAnalysis = async () => {
    if (USE_MOCK_DATA) {
        await delay(800);
        return {
            classA: {
                percentage: 15, valuePercentage: 78, count: 12, articles: [
                    { code: "ALC-90", name: "Alcool 90° 5L", consumption: 5850000, class: "A", cumulativePercent: 25.4 },
                    { code: "GAUZ10", name: "Gaze stérile 10x10", consumption: 4250000, class: "A", cumulativePercent: 43.8 },
                    { code: "REAG-H", name: "Réactif Hémoglobine", consumption: 3800000, class: "A", cumulativePercent: 60.3 },
                    { code: "FILM-R", name: "Film Radio 35x43", consumption: 3200000, class: "A", cumulativePercent: 74.2 },
                ]
            },
            classB: {
                percentage: 25, valuePercentage: 17, articles: [
                    { code: "DEX-5", name: "Dextrose 5% 500ml", consumption: 1500000, class: "B", cumulativePercent: 80.7 },
                    { code: "PARA500", name: "Paracétamol 500mg", consumption: 1200000, class: "B", cumulativePercent: 85.9 },
                    { code: "GAN-L", name: "Gants Latex (M)", consumption: 950000, class: "B", cumulativePercent: 90.1 },
                ]
            },
            classC: {
                percentage: 60, valuePercentage: 5, articles: [
                    { code: "AMOX250", name: "Amoxicilline 250mg", consumption: 450000, class: "C", cumulativePercent: 92.0 },
                    { code: "SPAS-A", name: "Spasfon Ampoules", consumption: 320000, class: "C", cumulativePercent: 93.4 },
                    { code: "MASQ-C", name: "Masques Chirurgicaux (50)", consumption: 210000, class: "C", cumulativePercent: 94.3 },
                ]
            },
            totalConsumption: 23030450
        };
    }
    return apiCall('/reports/abc-analysis/');
};

export const getTurnoverRates = async () => {
    if (USE_MOCK_DATA) {
        await delay(800);
        return {
            results: [
                { article: "Paracétamol 500mg", rate: 15.6, days: 23 },
                { article: "Amoxicilline 250mg", rate: 8.2, days: 44 },
                { article: "Gaze stérile 10x10", rate: 22.4, days: 16 },
                { article: "Dextrose 5% 500ml", rate: 12.8, days: 28 },
                { article: "Gants Latex (M)", rate: 35.2, days: 10 },
                { article: "Alcool 90° 5L", rate: 5.4, days: 67 },
                { article: "Spasfon Ampoules", rate: 4.1, days: 89 },
            ]
        };
    }
    return apiCall('/reports/turnover-rates/');
};

export const getReconciliation = async () => {
    if (USE_MOCK_DATA) {
        await delay(800);
        return {
            results: [
                { category: "Médicaments", theoretical_value: 3250000, physical_value: 3225000, variance: -25000, status: "ADJUSTED", account: "3311" },
                { category: "Consommables", theoretical_value: 1850000, physical_value: 1850000, variance: 0, status: "BALANCED", account: "3312" },
                { category: "Hygiène", theoretical_value: 4500000, physical_value: 4480000, variance: -20000, status: "ADJUSTED", account: "3315" },
                { category: "Radiologie", theoretical_value: 1200000, accounting_value: 1200000, variance: 0, status: "BALANCED", account: "3316" },
            ]
        };
    }
    return apiCall('/reports/reconciliation/');
};

// ==================== OPERATIONS ====================

export const getGoodsReceipts = async () => {
    if (USE_MOCK_DATA) {
        await delay(700);
        return { results: mockGoodsReceipts };
    }
    return apiCall('/goods-receipts/');
};

export const getGoodsReceiptDetails = async (id) => {
    if (USE_MOCK_DATA) {
        await delay(500);
        const receipt = mockGoodsReceipts.find(r => r.id === parseInt(id));
        if (receipt) return receipt;
        return {
            id,
            number: "BE202406001",
            date: "2024-06-01",
            supplier: "Laboratoire Pharmacia",
            warehouse: "Pharmacie principale",
            status: "POSTED",
            lines: [
                { id: 101, article: "Paracétamol 500mg", quantity: 1000, unit_price: 150, total: 150000 },
                { id: 102, article: "Amoxicilline 250mg", quantity: 50, unit_price: 280, total: 14000 },
            ]
        };
    }
    return apiCall(`/goods-receipts/${id}/`);
};

export const createGoodsReceipt = async (data) => {
    if (USE_MOCK_DATA) {
        await delay(1000);
        const newReceipt = {
            id: Date.now(),
            ...data,
            number: `BE${Date.now()}`,
            status: "DRAFT",
            line_count: data.lines ? data.lines.length : 0,
            total_amount: data.lines ? data.lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0) : 0
        };
        mockGoodsReceipts.push(newReceipt);
        saveToStorage(STORAGE_KEYS.GOODS_RECEIPTS, mockGoodsReceipts);
        return newReceipt;
    }
    return apiCall('/goods-receipts/', { method: 'POST', body: JSON.stringify(data) });
};

export const getGoodsIssues = async () => {
    if (USE_MOCK_DATA) {
        await delay(700);
        return { results: mockGoodsIssues };
    }
    return apiCall('/goods-issues/');
};

export const createGoodsIssue = async (data) => {
    if (USE_MOCK_DATA) {
        await delay(1000);
        const newIssue = {
            id: Date.now(),
            ...data,
            number: `BS${Date.now()}`,
            status: "DRAFT",
            line_count: data.lines ? data.lines.length : 0,
            total_amount: data.lines ? data.lines.reduce((sum, line) => sum + (line.quantity * line.unit_price || 0), 0) : 0
        };
        mockGoodsIssues.push(newIssue);
        saveToStorage(STORAGE_KEYS.GOODS_ISSUES, mockGoodsIssues);
        return newIssue;
    }
    return apiCall('/goods-issues/', { method: 'POST', body: JSON.stringify(data) });
};

export const getTransfers = async () => {
    if (USE_MOCK_DATA) {
        await delay(700);
        return { results: mockTransfers };
    }
    return apiCall('/transfers/');
};

export const createTransfer = async (transferData) => {
    if (USE_MOCK_DATA) {
        await delay(1000);
        const newTransfer = {
            id: Date.now(),
            ...transferData,
            number: `TR${Date.now()}`,
            status: "DRAFT",
            line_count: transferData.lines ? transferData.lines.length : 0
        };
        mockTransfers.push(newTransfer);
        saveToStorage(STORAGE_KEYS.TRANSFERS, mockTransfers);
        return newTransfer;
    }
    return apiCall('/transfers/', { method: 'POST', body: JSON.stringify(transferData) });
};

export const getTransferDetails = async (id) => {
    if (USE_MOCK_DATA) {
        await delay(500);
        const transfer = mockTransfers.find(t => t.id === parseInt(id));
        if (transfer) return transfer;
        return {
            id,
            number: "TR202406001",
            date: "2024-06-03",
            from_warehouse: "Pharmacie principale",
            to_warehouse: "Bloc opératoire",
            status: "RECEIVED",
            lines: [
                { id: 101, article: "Paracétamol 500mg", quantity: 100, unit: "Boîtes" },
                { id: 102, article: "Amoxicilline 250mg", quantity: 50, unit: "Boîtes" },
            ]
        };
    }
    return apiCall(`/transfers/${id}/`);
};

export const getPhysicalInventories = async () => {
    if (USE_MOCK_DATA) {
        await delay(700);
        return { results: mockInventories };
    }
    return apiCall('/inventories/');
};

export default {
    // Dashboard
    getDashboardStats,

    // Categories
    getCategories,
    getCategoryTree,
    createCategory,
    updateCategory,
    deleteCategory,

    // Warehouses
    getWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,

    // Suppliers
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,

    // Stock
    getStockLevels,
    getBatches,
    getExpiringBatches,
    getMovements,

    // Reports
    getStockCard,
    getPerpetualInventory,
    getABCAnalysis,
    getTurnoverRates,
    getReconciliation,

    // Operations
    getGoodsReceipts,
    getGoodsReceiptDetails,
    createGoodsReceipt,
    getGoodsIssues,
    createGoodsIssue,
    getTransfers,
    createTransfer,
    getTransferDetails,
    getPhysicalInventories,
};
