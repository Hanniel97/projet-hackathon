import express from 'express';
import { auth } from "../middleware/auth.middleware.js"
import { login, register, getUser, updateUser, getAllDoctor, logout } from "../controllers/user.controller.js"

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', auth, getUser);
router.put('/profile', auth, updateUser);
router.get('/doctor/list', auth, getAllDoctor);
router.get('/logout', auth, logout);

export default router;