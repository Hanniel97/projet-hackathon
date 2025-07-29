// import React from 'react';
// import { Users, FileText, Bell, BarChart3, Home, Settings } from 'lucide-react';
// import { useLocation, Link } from 'react-router-dom';
// import clsx from 'clsx';

// const navigation = [
//     { name: 'Dashboard', href: '/', icon: Home },
//     { name: 'Patients', href: '/patients', icon: Users },
//     { name: 'Consultations', href: '/consultations', icon: FileText },
//     { name: 'Alertes', href: '/alerts', icon: Bell },
//     { name: 'Rapports', href: '/reports', icon: BarChart3 },
//     { name: 'Paramètres', href: '/settings', icon: Settings },
// ];

// export const Sidebar: React.FC = () => {
//     const location = useLocation();

//     return (
//         <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
//             <nav className="space-y-2">
//                 {navigation.map((item) => {
//                     const isActive = location.pathname === item.href;
//                     return (
//                         <Link
//                             key={item.name}
//                             to={item.href}
//                             className={clsx(
//                                 'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
//                                 isActive
//                                     ? 'bg-blue-600 text-white'
//                                     : 'text-gray-300 hover:bg-gray-800 hover:text-white'
//                             )}
//                         >
//                             <item.icon className="h-5 w-5" />
//                             <span>{item.name}</span>
//                         </Link>
//                     );
//                 })}
//             </nav>
//         </div>
//     );
// };

import React from "react";
import { BarChart3, Users, UserPlus, LogOut, MapIcon, CalendarArrowUpIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const currentPath = location.pathname;
    const activeTab =
        currentPath === "/dashboard"
            ? "dashboard"
            : currentPath === "/patients"
                ? "patients"
                : currentPath === "/consultations"
                    ? "consultations"
                    : currentPath === "/alerts"
                        ? "alerts"
                        : currentPath === "/rapport"
                            ? "rapport"
                            : "";

    const menuItems = [
        {
            id: "dashboard" as const,
            label: "Tableau de bord",
            icon: BarChart3,
            description: "Vue d'ensemble",
            path: "/dashboard",
        },
        {
            id: "patients" as const,
            label: "Patients",
            icon: CalendarArrowUpIcon,
            description: "Liste des patients",
            path: "/patients",
        },
        {
            id: "consultations" as const,
            label: "Consultations",
            icon: Users,
            description: "Liste des consultations",
            path: "/consultations",
        },
        {
            id: "alerts" as const,
            label: "Alertes",
            icon: MapIcon,
            description: "Listes des alertes",
            path: "/alerts",
        },
        {
            id: "rapport" as const,
            label: "Rapport",
            icon: UserPlus,
            description: "Rapport patient",
            path: "rapport",
        },
    ];

    return (
        <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
            {/* <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Administration</h2>
                <p className="text-sm text-gray-600 mt-1">
                    {user ? `Bonjour Dr. ${user.firstName}` : "Bonjour Utilisateur"}
                </p>
                <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${user?.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                >
                    {user?.role === "admin" ? "Administrateur" : user?.role === "doctor"? "Docteur" : "Infirmier"}
                </span>
            </div> */}

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <Icon className="w-5 h-5" aria-hidden="true" />
                                    <div className="text-left">
                                        <div className="font-medium">{item.label}</div>
                                        <div
                                            className={`text-xs ${isActive ? "text-blue-100" : "text-gray-500"
                                                }`}
                                        >
                                            {item.description}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Déconnexion"
                >
                    <LogOut className="w-5 h-5" aria-hidden="true" />
                    <span className="font-medium">Déconnexion</span>
                </button>
            </div>
        </div>
    );
}

