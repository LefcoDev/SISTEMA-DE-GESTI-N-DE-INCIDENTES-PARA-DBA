import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UsersIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import chatService from '../../services/chat.service';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  updated_at: string;
}

interface UsersListProps {
  onSelectUser: (userId: number) => void;
}

const UsersList: React.FC<UsersListProps> = ({ onSelectUser }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      if (mounted) {
        await loadUsers();
      }
    };
    
    load();
    
    return () => {
      mounted = false;
    };
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await chatService.getAvailableUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOnline = (updatedAt: string) => {
    const lastUpdate = new Date(updatedAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    return diffMinutes < 5; // Online si actualizó en los últimos 5 minutos
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b bg-white flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <UsersIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold">{t('chat.users')}</h3>
        </div>
        <input
          type="text"
          placeholder={t('chat.searchUsers')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            {searchTerm ? t('chat.noUsersFound') : t('chat.noUsers')}
          </div>
        ) : (
          <div className="divide-y">
            {filteredUsers.map((user) => {
              const online = isOnline(user.updated_at);
              
              return (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="relative -mt-2 -mr-2 flex justify-end">
                      {online ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-500 bg-white rounded-full" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 text-gray-400 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold truncate">{user.full_name}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          online
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {online ? t('chat.online') : t('chat.offline')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
