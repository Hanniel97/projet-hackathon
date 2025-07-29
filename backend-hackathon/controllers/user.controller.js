import { User } from "../models/user.model.js";
import Joi from "joi";
import jwt from "jsonwebtoken";

// Schémas de validation
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    role: Joi.string().valid('doctor', 'nurse', 'admin').default('doctor'),
    speciality: Joi.string().default('Néphrologie')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// Fonction pour générer le JWT
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'ai4ckd_secret_key_2024',
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
};

export const register = async (req, res) => {
    // console.log(req.body)
    try {
        // const { error, value } = registerSchema.validate(req.body);
        // if (error) {
        //     return res.status(400).json({
        //         message: 'Données invalides',
        //         details: error.details[0].message
        //     });
        // }

        const { email, password, firstName, lastName, role, speciality } = req.body;

        // console.log(value)

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'Un utilisateur avec cet email existe déjà'
            });
        }

        // Créer le nouvel utilisateur
        const user = new User({
            email,
            password,
            firstName,
            lastName,
            role,
            speciality
        });

        await user.save();

        // Générer le token
        const token = generateToken(user._id);

        // Réponse sans le password
        const userResponse = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            role: user.role,
            speciality: user.speciality
        };

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            token,
            data: userResponse
        });
    } catch (error) {
        console.error("Erreur register:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const login = async (req, res) => {
    try {
        // Validation des données
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: 'Données invalides',
                details: error.details[0].message
            });
        }

        const { email, password } = value;

        // Trouver l'utilisateur
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            return res.status(401).json({
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Mettre à jour la dernière connexion
        user.lastLogin = new Date();
        await user.save();

        // Générer le token
        // const token = generateToken(user._id);

        const token = user.getJWTToken();
        const refresh_token = user.getJWTRefreshToken();

        const options = {
            httpOnly: true,
            expires: process.env.JWT_EXPIRE,
        };

        // Réponse sans le password
        const userResponse = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            role: user.role,
            speciality: user.speciality,
            lastLogin: user.lastLogin
        };

        res.status(200).cookie("token", refresh_token, token, options).json({
            success: true,
            message: 'Connexion réussie',
            access_token: token,
            data: userResponse,
            refresh_token,
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                role: user.role,
                speciality: user.speciality,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const updateSchema = Joi.object({
            firstName: Joi.string().min(2),
            lastName: Joi.string().min(2),
            speciality: Joi.string(),
            currentPassword: Joi.string().when('newPassword', {
                is: Joi.exist(),
                then: Joi.required()
            }),
            newPassword: Joi.string().min(6)
        });

        const { error, value } = updateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                details: error.details[0].message
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Mise à jour des champs
        if (value.firstName) user.firstName = value.firstName;
        if (value.lastName) user.lastName = value.lastName;
        if (value.speciality) user.speciality = value.speciality;

        // Changement de mot de passe
        if (value.newPassword && value.currentPassword) {
            const isCurrentPasswordValid = await user.comparePassword(value.currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Mot de passe actuel incorrect'
                });
            }
            user.password = value.newPassword;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profil mis à jour avec succès',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                role: user.role,
                speciality: user.speciality
            }
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const getAllDoctor = async (req, res) => {
    try {
        const doctors = await User.find({ role: "doctor" });

        if(!doctors){
            return res.status(400).json({
            success: false,
            message: 'Aucun docteur trouvé'
        });
        }

        res.status(200).json({
            success: true,
            doctors,
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};

export const logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).json({ success: false, message: "Une erreur est survenue. Rééssayer!" });
    }
};