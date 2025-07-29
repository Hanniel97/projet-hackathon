// import { create } from 'zustand';
// import type { ConsultationState } from '../types';
// import { consultationsAPI } from '../services/api';

// export const useConsultationStore = create<ConsultationState>((set) => ({
//     consultations: [],
//     loading: false,

//     fetchConsultations: async () => {
//         set({ loading: true });
//         try {
//             const response = await consultationsAPI.getAll();
//             set({ consultations: response.data, loading: false });
//         } catch (error) {
//             set({ loading: false });
//             throw error;
//         }
//     },

//     createConsultation: async (consultation) => {
//         try {
//             const response = await consultationsAPI.create(consultation);
//             const newConsultation = response.data;
//             set(state => ({ consultations: [...state.consultations, newConsultation] }));
//         } catch (error) {
//             set({ loading: false });
//             throw error;
//         }
//     },

//     updateConsultation: async (id, consultation) => {
//         try {
//             const response = await consultationsAPI.update(id, consultation);
//             const updatedConsultation = response.data;
//             set(state => ({
//                 consultations: state.consultations.map(c =>
//                     c._id === id ? updatedConsultation : c
//                 )
//             }));
//         } catch (error) {
//             set({ loading: false });
//             throw error;
//         }
//     },

//     deleteConsultation: async (id) => {
//         try {
//             await consultationsAPI.delete(id);
//             set(state => ({
//                 consultations: state.consultations.filter(c => c._id !== id)
//             }));
//         } catch (error) {
//             set({ loading: false });
//             throw error;
//         }
//     },
// }));