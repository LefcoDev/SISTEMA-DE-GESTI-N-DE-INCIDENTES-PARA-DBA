import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useModal } from '../../context/ModalContext';
import { useMenu, MenuItem } from '../../context/MenuContext';
import { UserCircleIcon, ShieldCheckIcon, ComputerDesktopIcon, TagIcon, ArchiveBoxIcon, TrashIcon, ArrowPathIcon, CameraIcon, CheckCircleIcon, XCircleIcon, UsersIcon, PlusIcon, PencilSquareIcon, Bars3Icon, ChevronUpIcon, ChevronDownIcon, KeyIcon } from '@heroicons/react/24/outline';
import PasswordInput from '../../components/PasswordInput';
import { tagService, Tag } from '../../services/tag.service';
import { backupService, Backup } from '../../services/backup.service';
import { userService, User as UserType } from '../../services/user.service';
import { formatDate } from '../../lib/dateUtils';
import api from '../../lib/axios';
import { Dialog } from '@headlessui/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableMenuItem({ item, toggleVisibility }: { item: MenuItem; toggleVisibility: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg ${isDragging ? 'shadow-lg ring-2 ring-indigo-500 opacity-80' : ''}`}
    >
      <div className="flex items-center space-x-3 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <Bars3Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
        {item.required && <span className="text-xs text-gray-400 italic">(Requerido)</span>}
      </div>
      
      <button
        type="button"
        onClick={() => !item.required && toggleVisibility(item.id)}
        disabled={item.required}
        className={`${
          item.visible ? 'bg-indigo-600' : 'bg-gray-200'
        } ${item.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        role="switch"
        aria-checked={item.visible}
      >
        <span
          className={`${
            item.visible ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showModal } = useModal();
  const { menuItems, toggleVisibility, reorderItems, resetMenu } = useMenu();
  const [activeTab, setActiveTab] = useState('profile');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = menuItems.findIndex((item) => item.id === active.id);
      const newIndex = menuItems.findIndex((item) => item.id === over.id);
      
      reorderItems(arrayMove(menuItems, oldIndex, newIndex));
    }
  };

  
  // Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    role: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: (user as any).phone_number || '',
        role: user.role || ''
      });
      // @ts-ignore
      if (user.profile_picture) {
        const baseUrl = (import.meta.env?.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');
        // @ts-ignore
        const filename = user.profile_picture;
        
        // Si ya contiene 'uploads', usar tal cual
        if (filename.includes('uploads')) {
          setAvatarPreview(`${baseUrl}/${filename.replace(/\\/g, '/')}`);
        } else {
          // Si es solo el nombre del archivo, agregar la ruta completa
          setAvatarPreview(`${baseUrl}/uploads/avatars/${filename}`);
        }
      }
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('full_name', profileData.full_name);
      formData.append('email', profileData.email);
      formData.append('phone_number', profileData.phone_number);
      // Role is not updated here for security, only admin can change roles via User Management
      if (avatar) {
        formData.append('avatar', avatar);
      }

      await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      showModal({
        title: '¡Éxito!',
        message: 'Tu perfil ha sido actualizado correctamente.',
        type: 'success',
        onConfirm: () => window.location.reload()
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const message = error.response?.data?.message || 'Error al actualizar el perfil';
      console.error(message);
      showModal({
        title: 'Error',
        message: message,
        type: 'error'
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      showModal({
        title: 'Error',
        message: 'Las contraseñas nuevas no coinciden',
        type: 'error'
      });
      return;
    }

    try {
      await api.post('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      showModal({
        title: '¡Éxito!',
        message: 'Contraseña actualizada correctamente',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      showModal({
        title: 'Error',
        message: error.response?.data?.message || 'Error al cambiar la contraseña',
        type: 'error'
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Tags State
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6' });
  const [loadingTags, setLoadingTags] = useState(false);

  // Backups State
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState<string | null>(null);

  // Users State
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [userFormData, setUserFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    role: 'junior_dba'
  });

  useEffect(() => {
    if (activeTab === 'tags') fetchTags();
    if (activeTab === 'backups') fetchBackups();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenUserModal = (user?: UserType) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        full_name: user.full_name,
        email: user.email,
        password: '', // Empty for updates unless changing
        phone_number: user.phone_number || '',
        role: user.role
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        full_name: '',
        email: '',
        password: '',
        phone_number: '',
        role: 'junior_dba'
      });
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          full_name: userFormData.full_name,
          email: userFormData.email,
          phone_number: userFormData.phone_number,
          role: userFormData.role
        };
        if (userFormData.password) {
          updateData.password = userFormData.password;
        }
        
        await api.put(`/users/${editingUser.id}`, updateData);
        showModal({
          title: 'Éxito',
          message: 'Usuario actualizado correctamente',
          type: 'success'
        });
      } else {
        // Create new user
        await userService.create(userFormData);
        showModal({
          title: 'Éxito',
          message: 'Usuario creado correctamente',
          type: 'success'
        });
      }
      
      setIsUserModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      showModal({
        title: 'Error',
        message: error.response?.data?.message || 'Error al guardar usuario',
        type: 'error'
      });
    }
  };

  const handleToggleUserStatus = async (user: UserType) => {
    try {
      await userService.toggleStatus(user.id);
      fetchUsers();
      showModal({
        title: 'Éxito',
        message: `Usuario ${user.is_active ? 'desactivado' : 'activado'} correctamente`,
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      showModal({
        title: 'Error',
        message: error.response?.data?.message || 'Error al cambiar estado del usuario',
        type: 'error'
      });
    }
  };

  const handleDeleteUser = async (user: UserType) => {
    showModal({
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de eliminar al usuario ${user.full_name}? Esta acción no se puede deshacer.`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          await userService.delete(user.id);
          fetchUsers();
          showModal({
            title: 'Éxito',
            message: 'Usuario eliminado correctamente',
            type: 'success'
          });
        } catch (error: any) {
          console.error('Error deleting user:', error);
          showModal({
            title: 'Error',
            message: error.response?.data?.message || 'Error al eliminar usuario',
            type: 'error'
          });
        }
      }
    });
  };

  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      const data = await tagService.getAll();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tagService.create(newTag);
      setNewTag({ name: '', color: '#3B82F6' });
      fetchTags();
    } catch (error) {
      console.error('Error creating tag:', error);
      showModal({
        title: 'Error',
        message: 'Error al crear el tag',
        type: 'error'
      });
    }
  };

  const handleDeleteTag = async (id: number) => {
    showModal({
      title: 'Eliminar Tag',
      message: '¿Estás seguro de eliminar este tag?',
      type: 'confirm',
      onConfirm: async () => {
        try {
          await tagService.delete(id);
          fetchTags();
        } catch (error) {
          console.error('Error deleting tag:', error);
          showModal({
            title: 'Error',
            message: 'No se puede eliminar el tag porque está en uso',
            type: 'error'
          });
        }
      }
    });
  };

  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      const data = await backupService.getAll();
      setBackups(data);
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      await backupService.create();
      fetchBackups();
      showModal({
        title: 'Éxito',
        message: 'Backup creado exitosamente',
        type: 'success'
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      showModal({
        title: 'Error',
        message: 'Error al crear el backup',
        type: 'error'
      });
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    showModal({
      title: 'Restaurar Backup',
      message: 'ADVERTENCIA: Restaurar un backup eliminará todos los datos actuales y los reemplazará con los del backup. ¿Estás seguro?',
      type: 'warning',
      confirmText: 'Restaurar',
      onConfirm: async () => {
        setRestoringBackup(filename);
        try {
          await backupService.restore(filename);
          showModal({
            title: 'Éxito',
            message: 'Backup restaurado exitosamente. La aplicación se recargará.',
            type: 'success',
            onConfirm: () => window.location.reload()
          });
        } catch (error) {
          console.error('Error restoring backup:', error);
          showModal({
            title: 'Error',
            message: 'Error al restaurar el backup',
            type: 'error'
          });
        } finally {
          setRestoringBackup(null);
        }
      }
    });
  };

  const handleDeleteBackup = async (filename: string) => {
    showModal({
      title: 'Eliminar Backup',
      message: '¿Estás seguro de eliminar este backup?',
      type: 'confirm',
      onConfirm: async () => {
        try {
          await backupService.delete(filename);
          fetchBackups();
        } catch (error) {
          console.error('Error deleting backup:', error);
          showModal({
            title: 'Error',
            message: 'Error al eliminar el backup',
            type: 'error'
          });
        }
      }
    });
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: UserCircleIcon },
    { id: 'password', name: 'Contraseña', icon: KeyIcon },
    ...(user?.role === 'admin' ? [{ id: 'users', name: 'Usuarios', icon: UsersIcon }] : []),
    { id: 'tags', name: 'Tags', icon: TagIcon },
    { id: 'backups', name: 'Backups', icon: ArchiveBoxIcon },
    { id: 'app', name: 'Aplicación', icon: ComputerDesktopIcon },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <nav className="lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-600'
                  : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900 border-transparent'
              } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full`}
            >
              <tab.icon
                className={`${
                  activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
              />
              <span className="truncate">{tab.name}</span>
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Perfil de Usuario</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  {isEditing ? 'Cancelar' : 'Editar Perfil'}
                </button>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handleProfileUpdate}>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <UserCircleIcon className="h-full w-full text-gray-300" />
                        )}
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1.5 text-white hover:bg-indigo-700 shadow-sm"
                        >
                          <CameraIcon className="h-4 w-4" />
                        </button>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{user?.full_name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                        />
                      ) : (
                        <div className="mt-1 text-sm text-gray-900 dark:text-white">{user?.full_name}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                        />
                      ) : (
                        <div className="mt-1 text-sm text-gray-900 dark:text-white">{user?.email}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono (Movistar Chile)</label>
                      {isEditing ? (
                        <div>
                          <input
                            type="tel"
                            value={profileData.phone_number}
                            onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                            placeholder="Ej: +56912345678"
                          />
                          <p className="mt-1 text-xs text-gray-500">Opcional. Para recibir SMS de alertas críticas.</p>
                        </div>
                      ) : (
                        <div className="mt-1 text-sm text-gray-900 dark:text-white">{(user as any)?.phone_number || 'No configurado'}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
                      <div className="mt-1 text-sm text-gray-900 dark:text-white capitalize p-2 border border-transparent bg-gray-50 dark:bg-gray-800 rounded-md">
                        {user?.role?.replace('_', ' ')}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">El rol solo puede ser modificado por un administrador.</p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  )}
                </form>

                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <button
                    onClick={logout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Cambiar Contraseña</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Actualiza tu contraseña para mantener tu cuenta segura</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handleChangePassword} className="max-w-md">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contraseña Actual
                      </label>
                      <PasswordInput
                        id="current_password"
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        required
                        placeholder="Ingresa tu contraseña actual"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nueva Contraseña
                      </label>
                      <PasswordInput
                        id="new_password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        required
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        La contraseña debe tener al menos 8 caracteres
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirmar Nueva Contraseña
                      </label>
                      <PasswordInput
                        id="confirm_password"
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        required
                        placeholder="Confirma tu nueva contraseña"
                        autoComplete="new-password"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <KeyIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Actualizar Contraseña
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Gestión de Usuarios</h3>
                <button
                  onClick={() => handleOpenUserModal()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Nuevo Usuario
                </button>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {loadingUsers ? (
                  <div className="text-center py-4">Cargando usuarios...</div>
                ) : (
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Usuario</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rol</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha Registro</th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Acciones</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <UserCircleIcon className="h-10 w-10 text-gray-300" />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900">{u.full_name}</div>
                                  <div className="text-gray-500">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                              {u.role.replace('_', ' ')}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {u.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatDate(new Date(u.created_at), 'short')}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleOpenUserModal(u)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="Editar"
                                >
                                  <PencilSquareIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleToggleUserStatus(u)}
                                  className={`text-${u.is_active ? 'orange' : 'green'}-600 hover:text-${u.is_active ? 'orange' : 'green'}-900`}
                                  title={u.is_active ? 'Desactivar' : 'Activar'}
                                >
                                  {u.is_active ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Eliminar"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags Tab */}
          {activeTab === 'tags' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Gestión de Tags</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {/* Create Tag Form */}
                <form onSubmit={handleCreateTag} className="mb-8 flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Nombre del Tag</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      value={newTag.name}
                      onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Color</label>
                    <input
                      type="color"
                      className="mt-1 block w-16 h-9 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
                      value={newTag.color}
                      onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Crear Tag
                  </button>
                </form>

                {/* Tags List */}
                {loadingTags ? (
                  <div className="text-center py-4">Cargando tags...</div>
                ) : (
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nombre</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Color</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Uso</th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Acciones</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {tags.map((tag) => (
                          <tr key={tag.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>
                                {tag.name}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: tag.color }}></div>
                                {tag.color}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tag.usage_count}</td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                onClick={() => handleDeleteTag(tag.id)}
                                className="text-red-600 hover:text-red-900"
                                disabled={tag.usage_count > 0}
                                title={tag.usage_count > 0 ? "No se puede eliminar un tag en uso" : "Eliminar"}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Backups Tab */}
          {activeTab === 'backups' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Copias de Seguridad</h3>
                <button
                  onClick={handleCreateBackup}
                  disabled={creatingBackup}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {creatingBackup ? 'Creando...' : 'Crear Backup Manual'}
                </button>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ShieldCheckIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Los backups incluyen toda la base de datos (usuarios, servidores, incidentes, etc.).
                        Al restaurar, se reemplazarán todos los datos actuales.
                      </p>
                    </div>
                  </div>
                </div>

                {loadingBackups ? (
                  <div className="text-center py-4">Cargando backups...</div>
                ) : (
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Archivo</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tamaño</th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Acciones</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {backups.map((backup) => (
                          <tr key={backup.filename}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {backup.filename}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatDate(new Date(backup.createdAt), 'datetime')}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {(backup.size / 1024).toFixed(2)} KB
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                              <button
                                onClick={() => handleRestoreBackup(backup.filename)}
                                disabled={!!restoringBackup}
                                className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                                title="Restaurar"
                              >
                                <ArrowPathIcon className={`h-5 w-5 ${restoringBackup === backup.filename ? 'animate-spin' : ''}`} />
                              </button>
                              <button
                                onClick={() => handleDeleteBackup(backup.filename)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {backups.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-3 py-4 text-sm text-gray-500 text-center">
                              No hay backups disponibles
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* App Settings Tab */}
          {activeTab === 'app' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Preferencias de la Aplicación</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex-grow flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Tema Oscuro</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Habilitar modo oscuro para la interfaz</span>
                    </span>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className={`${
                        theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                      role="switch"
                      aria-checked={theme === 'dark'}
                    >
                      <span
                        className={`${
                          theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">Personalización del Menú</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Organiza y oculta elementos del menú lateral</p>
                      </div>
                      <button
                        onClick={resetMenu}
                        className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        Restaurar valores por defecto
                      </button>
                    </div>

                    <div className="space-y-2">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={menuItems.map(item => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {menuItems.map((item) => (
                            <SortableMenuItem
                              key={item.id}
                              item={item}
                              toggleVisibility={toggleVisibility}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      <Dialog open={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6 w-full">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </Dialog.Title>
            <form onSubmit={handleSaveUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    value={userFormData.full_name}
                    onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono (Chile - Movistar)</label>
                  <input
                    type="tel"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    value={userFormData.phone_number}
                    onChange={(e) => setUserFormData({ ...userFormData, phone_number: e.target.value })}
                    placeholder="Ej: +56912345678 o 912345678"
                  />
                  <p className="mt-1 text-xs text-gray-500">Opcional. Para recibir SMS de alertas críticas vía Movistar Chile.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {editingUser ? 'Contraseña (dejar en blanco para mantener)' : 'Contraseña'}
                  </label>
                  <div className="mt-1">
                    <PasswordInput
                      id="user_password"
                      name="user_password"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      required={!editingUser}
                      placeholder={editingUser ? 'Dejar en blanco para mantener' : 'Mínimo 8 caracteres'}
                      autoComplete="new-password"
                      className="p-2 border"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  >
                    <option value="admin">Administrador</option>
                    <option value="senior_dba">DBA Senior</option>
                    <option value="junior_dba">DBA Junior</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
