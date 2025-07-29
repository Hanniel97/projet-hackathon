/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthState, RegisterData } from "@/types";
import { apiRequest } from "@/services/api";
import { useStore } from "@/store/useStore";

interface AuthContextType extends AuthState {
    login: (
        email: string,
        password: string
    ) => Promise<{ success: boolean; message?: string }>;
    register: (
        data: RegisterData
    ) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { setUser, setIsAuthenticated, setToken, setRefreshToken } = useStore();
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        loading: true,
        // token: ''
    });

    // Recharger user depuis localStorage au démarrage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user: User = JSON.parse(storedUser);
                setAuthState({
                    user,
                    isAuthenticated: true,
                    loading: false,
                    // token
                });
            } catch {
                localStorage.removeItem("user");
                setAuthState({ user: null, isAuthenticated: false, loading: false });
            }
        } else {
            setAuthState({ user: null, isAuthenticated: false, loading: false });
        }
    }, []);

    const login = async (
        email: string,
        password: string
    ): Promise<{ success: boolean; message?: string }> => {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
        try {
            const res = await apiRequest({
                method: "POST",
                endpoint: "/auth/login",
                data: { email, password },
            });

            if (!res.success) {
                return {
                    success: false,
                    message: res.message || "Identifiants incorrects",
                };
            }

            const user: User = res.data;
            setUser(user);
            setIsAuthenticated(true);
            setToken(res.access_token);
            setRefreshToken(res.refresh_token);
            localStorage.setItem("token", res.access_token);
            localStorage.setItem("refresh_token", res.refresh_token);

            localStorage.setItem("user", JSON.stringify(user));
            setAuthState({ user, isAuthenticated: true, loading: false });

            return { success: true };
        } catch (error: any) {
            setAuthState((prev) => ({ ...prev, isLoading: false }));
            return {
                success: false,
                message: error.message || "Erreur de connexion",
            };
        }
    };

    const register = async (
        data: RegisterData
    ): Promise<{ success: boolean; message?: string }> => {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
        try {
            const res = await apiRequest({
                method: "POST",
                endpoint: "/auth/register",
                data,
            });

            setAuthState((prev) => ({ ...prev, isLoading: false }));

            if (!res.success) {
                return {
                    success: false,
                    message: res.message || "Inscription échouée",
                };
            }

            return { success: true };
        } catch (error: any) {
            setAuthState((prev) => ({ ...prev, isLoading: false }));
            return { success: false, message: error.message || "Erreur serveur" };
        }
    };

    const logout = () => {
        localStorage.removeItem("user");
        setAuthState({ user: null, isAuthenticated: false, loading: false });
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider");
    return context;
};
