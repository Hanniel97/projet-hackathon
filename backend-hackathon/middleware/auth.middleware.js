import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Patient } from "../models/patient.model.js"

// Middleware d'authentification
export const auth = async (req, res, next) => {
    try {
        // Récupérer le token depuis l'header Authorization
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Accès refusé. Token manquant.'
            });
        }

        const token = authHeader.substring(7); // Enlever "Bearer "

        // console.log(token)

        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Vérifier que l'utilisateur existe toujours
        const user = await User.findById(decoded._id).select('-password');

        // console.log(user)
        if (!user || !user.isActive) {
            return res.status(401).json({
                message: 'Token invalide. Utilisateur non trouvé ou inactif.'
            });
        }

        // Ajouter les infos utilisateur à la requête
        req.user = {
            userId: user._id,
            email: user.email,
            role: user.role,
            fullName: user.fullName
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Token invalide'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expiré'
            });
        }

        console.error('Erreur middleware auth:', error);
        res.status(500).json({
            message: 'Erreur serveur lors de l\'authentification'
        });
    }
};

// Middleware pour vérifier les rôles
export const authorize = (...roles) => {
    return async (req, res, next) => {
        try {
            // S'assurer que l'utilisateur est authentifié
            if (!req.user) {
                return res.status(401).json({
                    message: 'Authentification requise'
                });
            }

            // Vérifier le rôle
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    message: 'Accès refusé. Privilèges insuffisants.'
                });
            }

            next();
        } catch (error) {
            console.error('Erreur middleware authorize:', error);
            res.status(500).json({
                message: 'Erreur serveur lors de la vérification des autorisations'
            });
        }
    };
};

// Middleware pour vérifier que l'utilisateur peut accéder aux données d'un patient
export const canAccessPatient = async (req, res, next) => {
    try {
        // const Patient = require('../models/Patient');
        const patientId = req.params.patientId || req.body.patient;

        if (!patientId) {
            return res.status(400).json({
                message: 'ID patient requis'
            });
        }

        // Les admins peuvent accéder à tous les patients
        if (req.user.role === 'admin') {
            return next();
        }

        // Vérifier que le patient est assigné au médecin connecté
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({
                message: 'Patient non trouvé'
            });
        }

        if (patient.assignedDoctor.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                message: 'Accès refusé. Ce patient ne vous est pas assigné.'
            });
        }

        next();
    } catch (error) {
        console.error('Erreur middleware canAccessPatient:', error);
        res.status(500).json({
            message: 'Erreur serveur lors de la vérification d\'accès au patient'
        });
    }
};