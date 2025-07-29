import express from 'express';
import { auth } from "../middleware/auth.middleware.js"
import { getAlerts, getCriticalRecentAlerts, getDashboardAlert, getAlertById, 
    markAlertReaded, resolveAlert, markManyAlertReaded, getAlertsByPatient, 
    getAlertsGlobalStats, getCriticalAndUnresolvedAlerts
} from '../controllers/alert.controller.js';

const router = express.Router();

router.get('/alerts', auth, getAlerts);
router.get('/alerts/critical', auth, getCriticalRecentAlerts);
router.get('/alerts/dashboard', auth, getDashboardAlert);
router.get('/alerts/:id', auth, getAlertById);
router.put('/alerts/:id/read', auth, markAlertReaded);
router.put('/alerts/:id/resolve', auth, resolveAlert);
router.put('/alerts/many/read', auth, markManyAlertReaded);
router.get('/alerts/patient/:patientId', auth, getAlertsByPatient);
router.get('/alerts/count', auth, getCriticalAndUnresolvedAlerts);
// router.get('/alerts/statistique', auth, getAlertsGlobalStats);

export default router;