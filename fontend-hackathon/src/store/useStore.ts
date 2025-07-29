import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Patient, Consultation, Alert } from "@/types";

interface AppState {
    isLoading: boolean;
    refresh_token: string;
    isAuthenticated: boolean;
    user: User;
    token: string;
    patients: Patient[],
    consultations: Consultation[],
    alerts: Alert[],
    setIsLoading: (isLoading: boolean) => void;
    setUser: (user: AppState["user"]) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setToken: (token: string) => void;
    setRefreshToken: (refresh_token: string) => void;
    setPatient: (patients: Patient[]) => void;
    setConsultations: (consultations: Consultation[]) => void;
    setAlerts: (alerts: Alert[]) => void;
    logout: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            isLoading: false,
            user: {
                _id: "",
                email: "",
                firstName: "",
                lastName: "",
                role: "",
                isActive: false,
                lastLogin: undefined
            },
            token: "",
            isAuthenticated: false,
            refresh_token: "",
            patients: [],
            consultations: [],
            alerts: [],
            setIsLoading: (isLoading) => set({ isLoading }),
            setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            setRefreshToken: (token) => set({ token }),
            setPatient: (patients) => set({ patients }),
            setConsultations: (consultations) => set({ consultations }),
            setAlerts: (alerts) => set({ alerts }),
            logout: () => set({
                user: {
                    _id: "",
                    email: "",
                    firstName: "",
                    lastName: "",
                    role: "",
                    isActive: false,
                    lastLogin: undefined
                },
                token: "",
                patients: [],
                consultations: [],
                alerts: [],
            }),
        }),
        {
            name: "app-storage", // Clé dans le localStorage
        }
    )
);