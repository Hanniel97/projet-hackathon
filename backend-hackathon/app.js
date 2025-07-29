import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from 'dotenv';

import { connectDatabase } from "./config/database.js"
import User from "./routes/user.routes.js";
import Alert from "./routes/alert.routes.js";
import Consultation from "./routes/consultation.routes.js";
import Patient from "./routes/patient.routes.js";
import Pdf from "./routes/pdf.routes.js";

config({
    path: "./config/.env",
});

const app = express();

// Middleware de sécurité
app.use(helmet());
app.use(cors({
    origin: "*",
    // origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    // credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limite chaque IP à 100 requêtes par windowMs
});
// app.use(limiter);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

connectDatabase();

app.use("/api", User);
app.use("/api", Alert);
app.use("/api", Consultation);
app.use("/api", Patient);
app.use("/api", Pdf);

// Route de santé
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'AI4CKD Backend'
    });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Route 404
app.use('/', (req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Serveur AI4CKD lancé sur le port ${PORT}`);
    // console.log(`📱 Environnement: ${process.env.NODE_ENV || 'development'}`);
});