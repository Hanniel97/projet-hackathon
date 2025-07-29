// import React, { useState } from 'react';
// import { Header } from './Header';
// import { Sidebar } from './Sidebar';
// import { SearchModal } from '../Patient/SearchModal';

// interface LayoutProps {
//     children: React.ReactNode;
// }

// export const Layout: React.FC<LayoutProps> = ({ children }) => {
//     const [showSearch, setShowSearch] = useState(false);

//     return (
//         <div className="min-h-screen bg-gray-50 flex">
//             <Sidebar />
//             <div className="flex-1 flex flex-col">
//                 <Header onSearchToggle={() => setShowSearch(true)} />
//                 <main className="flex-1 p-6">
//                     {children}
//                 </main>
//             </div>

//             {showSearch && (
//                 <SearchModal onClose={() => setShowSearch(false)} />
//             )}
//         </div>
//     );
// };

/* eslint-disable @typescript-eslint/no-unused-vars */
// import { Outlet, Navigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { Sidebar } from "./Sidebar";
// import { Header } from "./Header";

// export default function MainLayout() {
//     const { isAuthenticated, loading } = useAuth();

//     if (loading) return <p className="p-6">Chargement...</p>;

//     if (!isAuthenticated) {
//         return <Navigate to="/" replace />;
//     }

//     return (
//         <div className="flex h-screen overflow-hidden">
//             {/* Sidebar */}
//             <Sidebar />

//             <div className="flex-1 flex flex-col">
//                 <Header/>
//                 <main className="flex-1 overflow-y-auto p-4">
//                     <Outlet />
//                 </main>
//             </div>

//             {/* Main content */}
//             {/* <div className="flex-1 flex overflow-y-auto">


//             </div> */}
//         </div>
//     );
// }

import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export default function MainLayout() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <p className="p-6">Chargement...</p>;

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Header en haut */}
            <Header />

            {/* Zone bas de page : sidebar + contenu */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar alignée en bas */}
                <div className="flex flex-col justify-end">
                    <Sidebar />
                </div>

                {/* Contenu principal */}
                <main className="flex-1 overflow-y-auto p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

