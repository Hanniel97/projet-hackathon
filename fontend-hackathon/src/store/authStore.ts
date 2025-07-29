// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import type { AuthState } from '../types';
// import { authAPI } from '../services/api';

// export const useAuthStore = create<AuthState>()(
//     persist(
//         (set) => ({
//             user: null,
//             token: null,
//             isAuthenticated: false,
//             doctors: [],
//             loading: false,

//             setUser: (user, token) => {
//                 localStorage.setItem('token', token);
//                 localStorage.setItem('user', JSON.stringify(user));
//                 set({ user, token, isAuthenticated: true });
//             },

//             fetchDoctor: async () => {
//                 set({ loading: true });
//                 try {
//                     const response = await authAPI.doctorList();
//                     console.log(response)
//                     const doctors = Array.isArray(response.data) ? response.data : response.data.doctors;
//                     set({ doctors });
//                 } catch (error) {
//                     set({ loading: false });
//                     throw error;
//                 }
//             },

//             login: async (email, password) => {
//                 try {
//                     const response = await authAPI.login(email, password);
//                     const { user, token } = response.data;

//                     localStorage.setItem('token', token);
//                     localStorage.setItem('user', JSON.stringify(user));
//                     set({ user, token, isAuthenticated: true });
//                 } catch (error: any) {
//                     throw new Error(error.response?.data?.message || 'Erreur de connexion');
//                 }
//             },

//             register: async (userData) => {
//                 try {
//                     const response = await authAPI.register(userData);
//                     const { user, token } = response.data;

//                     localStorage.setItem('token', token);
//                     localStorage.setItem('user', JSON.stringify(user));
//                     set({ user, token, isAuthenticated: true });
//                 } catch (error: any) {
//                     throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
//                 }
//             },

//             logout: () => {
//                 localStorage.removeItem('token');
//                 localStorage.removeItem('user');
//                 set({ user: null, token: null, isAuthenticated: false });
//             },
//         }),
//         {
//             name: 'auth-storage',
//             partialize: (state) => ({
//                 user: state.user,
//                 token: state.token,
//                 isAuthenticated: state.isAuthenticated,
//             }),
//         }
//     )
// );