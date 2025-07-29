import express from 'express';
import { auth } from "../middleware/auth.middleware.js"
import { getAlerts, getCriticalRecentAlerts, getDashboardAlert, getAlertById, markAlertReaded, resolveAlert, markManyAlertReaded, getAlertsByPatient, getAlertsGlobalStats } from '../controllers/alert.controller.js';

const router = express.Router();

router.get('/alerts', auth, getAlerts);
router.get('/alerts/critical', auth, getCriticalRecentAlerts);
router.get('/alerts/dashboard', auth, getDashboardAlert);
router.get('/alerts/:id', auth, getAlertById);
router.put('/alerts/:id/read', auth, markAlertReaded);
router.put('/alerts/:id/resolve', auth, resolveAlert);
router.put('/alerts/many/read', auth, markManyAlertReaded);
router.get('/alerts/patient/:patientId', auth, getAlertsByPatient);
router.get('/alerts/stats', auth, getAlertsGlobalStats);

export default router;