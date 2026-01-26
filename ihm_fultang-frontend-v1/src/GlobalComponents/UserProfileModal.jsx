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
    // Fetch profile data on load
    useEffect(() => {
        if (isOpen) {
            fetchProfileData();
            setActiveTab('info');
        }
    }, [isOpen]);
    /**
     * Fetches profile data from the API
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
                
                // Pre-fill the edit form
                editForm.setFieldsValue({
                    first_name: response.data.first_name || '',
                    last_name: response.data.last_name || '',
                    email: response.data.email || '',
                    phoneNumber: response.data.phoneNumber || '',
                    address: response.data.address || '',
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            message.error('Error loading data');
        } finally {
            setIsLoading(false);
        }
    };
    /**
     * Handles profile update
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
                message.success('Profile updated successfully');
                await fetchProfileData();
                if (refreshUserData) {
                    await refreshUserData();
                }
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response?.data) {
                Object.keys(error.response.data).forEach(key => {
                    if (key !== 'message') {
                        message.error(`${key}: ${error.response.data[key]}`);
                    }
                });
            } else {
                message.error('Error updating profile');
            }
        } finally {
            setIsUpdating(false);
        }
    };
    /**
     * Handles password change
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
                message.success('Password changed successfully');
                passwordForm.resetFields();
            }
        } catch (error) {
            console.error('Error changing password:', error);
            if (error.response?.data) {
                Object.keys(error.response.data).forEach(key => {
                    message.error(`${error.response.data[key]}`);
                });
            } else {
                message.error('Error changing password');
            }
        } finally {
            setIsChangingPassword(false);
        }
    };
    /**
     * Handles profile photo upload
     */
    const handlePhotoUpload = async (file) => {
        try {
            // Client-side validation
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                message.error('Unsupported format. Use JPG or PNG.');
                return false;
            }
            
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                message.error('File is too large (max 5MB)');
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
                message.success('Photo updated successfully');
                setPreviewUrl(response.data.profilePicture);
                await fetchProfileData();
                if (refreshUserData) {
                    await refreshUserData();
                }
            }
        } catch (error) {
            console.error('Error during upload:', error);
            message.error('Error uploading photo');
        }
        
        return false; // Prevent automatic upload
    };
    /**
     * Handles profile photo deletion
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
                message.success('Photo deleted successfully');
                setPreviewUrl(null);
                await fetchProfileData();
                if (refreshUserData) {
                    await refreshUserData();
                }
            }
        } catch (error) {
            console.error('Error deleting photo:', error);
            if (error.response?.status === 404) {
                message.warning('No photo to delete');
            } else {
                message.error('Error deleting photo');
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
                    {/* Header with photo and name */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 -mt-6 -mx-6 mb-6 rounded-t-lg">
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
                                <p className="text-blue-100">{profileData?.role}</p>
                                <p className="text-sm text-blue-200">{profileData?.email}</p>
                            </div>
                        </div>
                    </div>
                    {/* Tabs */}
                    <Tabs activeKey={activeTab} onChange={setActiveTab}>
                        {/* TAB 1: INFORMATION */}
                        <TabPane tab="📋 Information" key="info">
                            <div className="space-y-4">
                                <InfoRow icon={<UserOutlined />} label="Username" value={profileData?.username} />
                                <InfoRow icon={<UserOutlined />} label="First name" value={profileData?.first_name || 'Not provided'} />
                                <InfoRow icon={<UserOutlined />} label="Last name" value={profileData?.last_name || 'Not provided'} />
                                <InfoRow icon={<MailOutlined />} label="Email" value={profileData?.email} />
                                <InfoRow icon={<PhoneOutlined />} label="Phone" value={profileData?.phoneNumber} />
                                <InfoRow icon={<HomeOutlined />} label="Address" value={profileData?.address} />
                                <InfoRow icon={<UserOutlined />} label="Gender" value={profileData?.gender} />
                                <InfoRow icon={<UserOutlined />} label="National ID" value={profileData?.cniNumber} />
                                <InfoRow icon={<UserOutlined />} label="Date of birth" value={profileData?.birthDate} />
                                <InfoRow icon={<UserOutlined />} label="Role" value={profileData?.role} />
                                <InfoRow icon={<UserOutlined />} label="Type" value={profileData?.userType} />
                            </div>
                        </TabPane>
                        {/* TAB 2: EDIT PROFILE */}
                        <TabPane tab="✏️ Edit Profile" key="edit">
                            <div className="space-y-6">
                                {/* Photo section */}
                                <div className="border-b pb-4">
                                    <h3 className="text-lg font-semibold mb-3">Profile photo</h3>
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
                                                    Change photo
                                                </Button>
                                            </Upload>
                                            
                                            {(profileData?.profilePicture || previewUrl) && (
                                                <Button
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={handleDeletePhoto}
                                                    loading={isDeletingPhoto}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Edit form */}
                                <Form
                                    form={editForm}
                                    layout="vertical"
                                    onFinish={handleProfileUpdate}
                                >
                                    <Form.Item
                                        label="First name"
                                        name="first_name"
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="First name" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Last name"
                                        name="last_name"
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Last name" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            { type: 'email', message: 'Invalid email' },
                                            { required: true, message: 'Email is required' }
                                        ]}
                                    >
                                        <Input prefix={<MailOutlined />} placeholder="Email" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Work phone"
                                        name="phoneNumber"
                                    >
                                        <Input prefix={<PhoneOutlined />} placeholder="Phone" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Address"
                                        name="address"
                                    >
                                        <Input prefix={<HomeOutlined />} placeholder="Address" />
                                    </Form.Item>
                                    <Form.Item>
                                        <div className="flex gap-2 justify-end">
                                            <Button onClick={() => editForm.resetFields()}>
                                                Cancel
                                            </Button>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                icon={<SaveOutlined />}
                                                loading={isUpdating}
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </Form.Item>
                                </Form>
                            </div>
                        </TabPane>
                        {/* TAB 3: SECURITY */}
                        <TabPane tab="🔒 Security" key="security">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Change password</h3>
                                <Form
                                    form={passwordForm}
                                    layout="vertical"
                                    onFinish={handlePasswordChange}
                                >
                                    <Form.Item
                                        label="Current password"
                                        name="current_password"
                                        rules={[{ required: true, message: 'Required' }]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>
                                    <Form.Item
                                        label="New password"
                                        name="new_password"
                                        rules={[
                                            { required: true, message: 'Required' },
                                            { min: 8, message: 'Minimum 8 characters' }
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>
                                    <Form.Item
                                        label="Confirm password"
                                        name="confirm_password"
                                        rules={[
                                            { required: true, message: 'Required' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('new_password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Passwords do not match'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>
                                    <Form.Item>
                                        <div className="flex gap-2 justify-end">
                                            <Button onClick={() => passwordForm.resetFields()}>
                                                Cancel
                                            </Button>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                icon={<LockOutlined />}
                                                loading={isChangingPassword}
                                            >
                                                Change password
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
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
/**
 * Component to display an information row
 */
function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="text-blue-600 mt-1">{icon}</div>
            <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-gray-900 font-semibold">{value || 'Not provided'}</p>
            </div>
        </div>
    );
}
InfoRow.propTypes = {
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.any,
};
