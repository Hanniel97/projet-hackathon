// import { create } from 'zustand';
// import type { AlertState } from '../types';
// import { alertsAPI } from '../services/api';

// export const useAlertStore = create<AlertState>((set) => ({
//     alerts: [],
//     unreadCount: 0,
//     loading: false,

//     fetchAlerts: async () => {
//         set({ loading: true });
//         try {
//             const response = await alertsAPI.getAll();
//             const alerts = Array.isArray(response.data) ? response.data : response.data.alerts;
//             const unreadCount = Array.isArray(alerts) ? alerts.filter(alert => !alert.isRead).length : 0;
//             set({ alerts, unreadCount, loading: false });
//         } catch (error) {
//             set({ loading: false });
//             throw error;
//         }
//     },

//     markAsRead: async (id) => {
//         try {
//             await alertsAPI.markAsRead(id);
//             set(state => ({
//                 alerts: state.alerts.map(alert =>
//                     alert._id === id ? { ...alert, isRead: true } : alert
//                 ),
//                 unreadCount: Math.max(0, state.unreadCount - 1)
//             }));
//         } catch (error) {
//             set({ loading: false });
//             throw error;
//         }
//     },

//     deleteAlert: async (id) => {
//         try {
//             await alertsAPI.delete(id);
//             set(state => {
//                 const alertToDelete = state.alerts.find(a => a._id === id);
//                 const newUnreadCount = alertToDelete && !alertToDelete.isRead
//                     ? Math.max(0, state.unreadCount - 1)
//                     : state.unreadCount;

//                 return {
//                     alerts: state.alerts.filter(alert => alert._id !== id),
//                     unreadCount: newUnreadCount
//                 };
//             });
//         } catch (error) {
//             set({ loading: false });
//             throw error;
//         }
//     },
// }));