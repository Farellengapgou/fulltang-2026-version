import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Tabs, Form, Input, Button, Upload, message, Spin } from 'antd';
import { 
    UserOutlined, 
    MailOutlined, 
    PhoneOutlined, 
    HomeOutlined,
    UploadOutlined,
    DeleteOutlined,
    LockOutlined,
    SaveOutlined,
    CloseOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useAuthentication } from '../Utils/Provider';
import userIcon from '../assets/userIcon.png';
const { TabPane } = Tabs;
export function UserProfileModal({ isOpen, onClose }) {
    UserProfileModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
    };
    const { userData, refreshUserData } = useAuthentication();
    
    const [activeTab, setActiveTab] = useState('info');
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    const [editForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    // Récupérer les données du profil au chargement
    useEffect(() => {
        if (isOpen) {
            fetchProfileData();
            setActiveTab('info');
        }
    }, [isOpen]);
    /**
     * Récupère les données du profil depuis l'API
     */
    const fetchProfileData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token_key_fultang');
            
            const response = await axios.get(
                'http://127.0.0.1:8009/api/v1/auth/me/',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.status === 200) {
                setProfileData(response.data);
                setPreviewUrl(response.data.profilePicture);
                
                // Pré-remplir le formulaire d'édition
                editForm.setFieldsValue({
                    first_name: response.data.first_name || '',
                    last_name: response.data.last_name || '',
                    email: response.data.email || '',
                    phoneNumber: response.data.phoneNumber || '',
                    address: response.data.address || '',
                });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            message.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };
    /**
     * Gère la mise à jour du profil
     */
    const handleProfileUpdate = async (values) => {
        try {
            setIsUpdating(true);
            const token = localStorage.getItem('token_key_fultang');
            
            const response = await axios.patch(
                'http://127.0.0.1:8009/api/v1/auth/profile/update/',
                values,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.status === 200) {
                message.success('Profil mis à jour avec succès');
                await fetchProfileData();
                if (refreshUserData) {
                    await refreshUserData();
                }
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            if (error.response?.data) {
                Object.keys(error.response.data).forEach(key => {
                    if (key !== 'message') {
                        message.error(`${key}: ${error.response.data[key]}`);
                    }
                });
            } else {
                message.error('Erreur lors de la mise à jour du profil');
            }
        } finally {
            setIsUpdating(false);
        }
    };
    /**
     * Gère le changement de mot de passe
     */
    const handlePasswordChange = async (values) => {
        try {
            setIsChangingPassword(true);
            const token = localStorage.getItem('token_key_fultang');
            
            const response = await axios.post(
                'http://127.0.0.1:8009/api/v1/auth/profile/change-password/',
                values,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.status === 200) {
                message.success('Mot de passe changé avec succès');
                passwordForm.resetFields();
            }
        } catch (error) {
            console.error('Erreur lors du changement de mot de passe:', error);
            if (error.response?.data) {
                Object.keys(error.response.data).forEach(key => {
                    message.error(`${error.response.data[key]}`);
                });
            } else {
                message.error('Erreur lors du changement de mot de passe');
            }
        } finally {
            setIsChangingPassword(false);
        }
    };
    /**
     * Gère l'upload de la photo de profil
     */
    const handlePhotoUpload = async (file) => {
        try {
            // Validation côté client
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                message.error('Format non supporté. Utilisez JPG ou PNG');
                return false;
            }
            
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                message.error('Le fichier est trop volumineux (max 5MB)');
                return false;
            }
            
            const token = localStorage.getItem('token_key_fultang');
            const formData = new FormData();
            formData.append('profilePicture', file);
            
            const response = await axios.post(
                'http://127.0.0.1:8009/api/v1/auth/profile/upload-picture/',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            
            if (response.status === 200) {
                message.success('Photo mise à jour avec succès');
                setPreviewUrl(response.data.profilePicture);
                await fetchProfileData();
                if (refreshUserData) {
                    await refreshUserData();
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            message.error('Erreur lors de l\'upload de la photo');
        }
        
        return false; // Empêcher l'upload automatique
    };
    /**
     * Gère la suppression de la photo de profil
     */
    const handleDeletePhoto = async () => {
        try {
            setIsDeletingPhoto(true);
            const token = localStorage.getItem('token_key_fultang');
            
            const response = await axios.delete(
                'http://127.0.0.1:8009/api/v1/auth/profile/delete-picture/',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.status === 200) {
                message.success('Photo supprimée avec succès');
                setPreviewUrl(null);
                await fetchProfileData();
                if (refreshUserData) {
                    await refreshUserData();
                }
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            if (error.response?.status === 404) {
                message.warning('Aucune photo à supprimer');
            } else {
                message.error('Erreur lors de la suppression de la photo');
            }
        } finally {
            setIsDeletingPhoto(false);
        }
    };
    if (!isOpen) return null;
    return (
        <Modal
            title={null}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={800}
            destroyOnClose
        >
            {isLoading ? (
                <div className="flex justify-center items-center h-96">
                    <Spin size="large" />
                </div>
            ) : (
                <div>
                    {/* Header avec photo et nom */}
                    <div className="bg-gradient-to-r from-teal-500 to-blue-500 p6 -mt-6 -mx-6 mb-6 rounded-t-lg">
                        <div className="flex items-center gap-4">
                            <img
                                src={previewUrl || userIcon}
                                alt="Profile"
                                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                            />
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">
                                    {profileData?.first_name && profileData?.last_name
                                        ? `${profileData.first_name} ${profileData.last_name}`
                                        : profileData?.username}
                                </h2>
                                <p className="text-teal-100">{profileData?.role}</p>
                                <p className="text-sm text-teal-100">{profileData?.email}</p>
                            </div>
                        </div>
                    </div>
                    {/* Onglets */}
                    <Tabs activeKey={activeTab} onChange={setActiveTab}>
                        {/* ONGLET 1: INFORMATIONS */}
                        <TabPane tab="📋 Informations" key="info">
                            <div className="space-y-4">
                                <InfoRow icon={<UserOutlined />} label="Nom d'utilisateur" value={profileData?.username} />
                                <InfoRow icon={<UserOutlined />} label="Prénom" value={profileData?.first_name || 'Non renseigné'} />
                                <InfoRow icon={<UserOutlined />} label="Nom" value={profileData?.last_name || 'Non renseigné'} />
                                <InfoRow icon={<MailOutlined />} label="Email" value={profileData?.email} />
                                <InfoRow icon={<PhoneOutlined />} label="Téléphone" value={profileData?.phoneNumber} />
                                <InfoRow icon={<HomeOutlined />} label="Adresse" value={profileData?.address} />
                                <InfoRow icon={<UserOutlined />} label="Genre" value={profileData?.gender} />
                                <InfoRow icon={<UserOutlined />} label="CNI" value={profileData?.cniNumber} />
                                <InfoRow icon={<UserOutlined />} label="Date de naissance" value={profileData?.birthDate} />
                                <InfoRow icon={<UserOutlined />} label="Rôle" value={profileData?.role} />
                                <InfoRow icon={<UserOutlined />} label="Type" value={profileData?.userType} />
                            </div>
                        </TabPane>
                        {/* ONGLET 2: MODIFIER LE PROFIL */}
                        <TabPane tab="✏️ Modifier le Profil" key="edit">
                            <div className="space-y-6">
                                {/* Section Photo */}
                                <div className="border-b pb-4">
                                    <h3 className="text-lg font-semibold mb-3">Photo de profil</h3>
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={previewUrl || userIcon}
                                            alt="Preview"
                                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                                        />
                                        <div className="flex gap-2">
                                            <Upload
                                                beforeUpload={handlePhotoUpload}
                                                showUploadList={false}
                                                accept="image/png,image/jpeg,image/jpg"
                                            >
                                                <Button icon={<UploadOutlined />}>
                                                    Changer la photo
                                                </Button>
                                            </Upload>
                                            
                                            {(profileData?.profilePicture || previewUrl) && (
                                                <Button
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={handleDeletePhoto}
                                                    loading={isDeletingPhoto}
                                                >
                                                    Supprimer
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Formulaire d'édition */}
                                <Form
                                    form={editForm}
                                    layout="vertical"
                                    onFinish={handleProfileUpdate}
                                >
                                    <Form.Item
                                        label="Prénom"
                                        name="first_name"
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Prénom" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Nom"
                                        name="last_name"
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Nom" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            { type: 'email', message: 'Email invalide' },
                                            { required: true, message: 'Email requis' }
                                        ]}
                                    >
                                        <Input prefix={<MailOutlined />} placeholder="Email" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Téléphone professionnel"
                                        name="phoneNumber"
                                    >
                                        <Input prefix={<PhoneOutlined />} placeholder="Téléphone" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Adresse"
                                        name="address"
                                    >
                                        <Input prefix={<HomeOutlined />} placeholder="Adresse" />
                                    </Form.Item>
                                    <Form.Item>
                                        <div className="flex gap-2 justify-end">
                                            <Button onClick={() => editForm.resetFields()}>
                                                Annuler
                                            </Button>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                icon={<SaveOutlined />}
                                                loading={isUpdating}
                                            >
                                                Enregistrer
                                            </Button>
                                        </div>
                                    </Form.Item>
                                </Form>
                            </div>
                        </TabPane>
                        {/* ONGLET 3: SÉCURITÉ */}
                        <TabPane tab="🔒 Sécurité" key="security">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Changer le mot de passe</h3>
                                <Form
                                    form={passwordForm}
                                    layout="vertical"
                                    onFinish={handlePasswordChange}
                                >
                                    <Form.Item
                                        label="Mot de passe actuel"
                                        name="current_password"
                                        rules={[{ required: true, message: 'Requis' }]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>
                                    <Form.Item
                                        label="Nouveau mot de passe"
                                        name="new_password"
                                        rules={[
                                            { required: true, message: 'Requis' },
                                            { min: 8, message: 'Minimum 8 caractères' }
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>
                                    <Form.Item
                                        label="Confirmer le mot de passe"
                                        name="confirm_password"
                                        rules={[
                                            { required: true, message: 'Requis' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('new_password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>
                                    <Form.Item>
                                        <div className="flex gap-2 justify-end">
                                            <Button onClick={() => passwordForm.resetFields()}>
                                                Annuler
                                            </Button>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                icon={<LockOutlined />}
                                                loading={isChangingPassword}
                                            >
                                                Changer le mot de passe
                                            </Button>
                                        </div>
                                    </Form.Item>
                                </Form>
                            </div>
                        </TabPane>
                    </Tabs>
                    {/* Footer */}
                    <div className="flex justify-end mt-6 pt-4 border-t">
                        <Button icon={<CloseOutlined />} onClick={onClose}>
                            Fermer
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
/**
 * Composant pour afficher une ligne d'information
 */
function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="text-blue-600 mt-1">{icon}</div>
            <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-gray-900 font-semibold">{value || 'Non renseigné'}</p>
            </div>
        </div>
    );
}
InfoRow.propTypes = {
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.any,
};
