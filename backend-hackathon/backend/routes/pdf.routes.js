import express from 'express';
import { auth } from "../middleware/auth.middleware.js"
import { generatePDF, previewPDF } from '../controllers/pdf.controller.js';

const router = express.Router();

router.get('/pdf/generate', auth, generatePDF);
router.get('/pdf/preview', auth, previewPDF);

export default router;