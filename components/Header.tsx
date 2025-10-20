import React, { useState, useEffect } from 'react';
import Avatar from './common/Avatar';
import { useAuth } from '../contexts/AuthContextSupabase';
import { useLocalization } from '../contexts/LocalizationContext';
import { Language, AppNotification } from '../types';
import NexusFlowIcon from './icons/NexusFlowIcon';
import NotificationCenter from './NotificationCenter';
import { notificationService, Notification } from '../services/notificationService';

interface HeaderProps {
  toggleSidebar: () => void;
  setView: (view: string) => void;
  notifications: AppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onClearAllNotifications: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, setView, notifications, onMarkNotificationAsRead, onClearAllNotifications }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLocalization();
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isLangOpen, setLangOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [supabaseNotifications, setSupabaseNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNavigate = (view: string) => {
    setView(view);
    setProfileOpen(false);
  }

  // Charger les notifications Supabase
  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const userNotifications = await notificationService.getByUser(user.id);
      setSupabaseNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
    }
  };

  // Charger les notifications au montage
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  // Combiner les notifications (ancien système + nouveau système)
  const allNotifications = [...notifications, ...supabaseNotifications.map(n => ({
    id: n.id,
    message: n.message,
    date: n.created_at,
    isRead: n.read,
    entityType: n.type
  }))];

  const totalUnreadCount = unreadCount + notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Hamburger and Logo */}
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="text-gray-500 lg:hidden mr-4 focus:outline-none">
                <i className="fas fa-bars fa-lg"></i>
            </button>
             <div className="flex-shrink-0 flex items-center space-x-2">
                <NexusFlowIcon className="h-8 w-auto" />
                <span className="font-bold text-lg text-gray-800 hidden sm:block">{t('senegel_workflow_platform')}</span>
            </div>
          </div>
          
          {/* Right side: Language and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotificationsOpen(!isNotificationsOpen)} className="text-gray-600 hover:text-emerald-600 relative">
                <i className="fas fa-bell fa-lg"></i>
                {totalUnreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                    {totalUnreadCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* Language Switcher */}
            <div className="relative">
              <button onClick={() => setLangOpen(!isLangOpen)} className="flex items-center text-gray-600 hover:text-emerald-600">
                <i className="fas fa-globe mr-1"></i>
                <span className="hidden sm:inline">{language.toUpperCase()}</span>
                <i className="fas fa-chevron-down text-xs ml-1"></i>
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg py-1">
                  <button onClick={() => { setLanguage(Language.EN); setLangOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('english')}</button>
                  <button onClick={() => { setLanguage(Language.FR); setLangOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('french')}</button>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center space-x-2">
                <img className="h-8 w-8 rounded-full" src={user?.avatar} alt={user?.name} />
                <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('settings'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('profile')}</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('settings'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('settings')}</a>
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('logout')}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Centre de notifications */}
      <NotificationCenter 
        isOpen={isNotificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </header>
  );
};

export default Header;