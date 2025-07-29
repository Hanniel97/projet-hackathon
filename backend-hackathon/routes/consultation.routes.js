import express from 'express';
import { auth, canAccessPatient } from "../middleware/auth.middleware.js"
import { getConsultations, getConsultationById, addConsultation, updateConsultation, 
    deleteConsultation, getPatientConsultations, getConsultationStats, getConsultationCount
} from '../controllers/consultation.controller.js';

const router = express.Router();

router.get('/consultations', auth, getConsultations);
router.get('/consultations/:id', auth, getConsultationById);
router.post('/consultations', auth, addConsultation);
router.put('/consultations/:id', auth, updateConsultation);
router.delete('/consultations/:id', auth, deleteConsultation);
router.get('/consultations/patient/:patientId', auth, canAccessPatient, getPatientConsultations);
router.get('/consultations/count', auth, getConsultationCount);
// router.get('/consultations/stats', auth, getConsultationStats);

export default router;