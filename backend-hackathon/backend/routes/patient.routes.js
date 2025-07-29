import express from 'express';
import { auth } from "../middleware/auth.middleware.js"
import { getPatients, getPatientById, addPatient, updatePatient, deletePatient, getPatientHistory, getGlobalStats } from '../controllers/patient.controller.js';

const router = express.Router();

router.get('/patients', auth, getPatients);
router.get('/patients/:id', auth, getPatientById);
router.post('/patients', auth, addPatient);
router.put('/patients/:id', auth, updatePatient);
router.delete('/patients/:id', auth, deletePatient);
router.get('/patients/:id/history', auth, getPatientHistory);
router.get('/patients/stats/overview', auth, getGlobalStats);

export default router;