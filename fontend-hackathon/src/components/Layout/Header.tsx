import React from 'react';
import { Bell, User, LogOut, Search } from 'lucide-react';
// import { useAuthStore } from '../../store/authStore';
// import { useAlertStore } from '../../store/alertStore';
import { useStore } from '@/store/useStore';
import logo from '../../assets/logo.png';

interface HeaderProps {
    onSearchToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchToggle }) => {
    const { user, alerts, logout } = useStore();
    // const { unreadCount } = useAlertStore();

    const unreadCount = alerts.length

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <img src={logo} alt="Logo" className="h-10" />
                    {/* <h1 className="text-2xl font-bold text-blue-600">AI4CKD</h1> */}
                    <span className="text-gray-500">|</span>
                    <h2 className="text-lg font-medium text-gray-700">Kidney health</h2>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={onSearchToggle}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Search className="h-5 w-5" />
                    </button>

                    <div className="relative">
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-gray-700">
                                    Dr. {user?.lastName} {user?.firstName}
                                </p>
                                <p className="text-gray-500">{user?.role}</p>
                            </div>
                        </div>

                        {/* <button
                            onClick={logout}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Déconnexion"
                        >
                            <LogOut className="h-5 w-5" />
                        </button> */}
                    </div>
                </div>
            </div>
        </header>
    );
};