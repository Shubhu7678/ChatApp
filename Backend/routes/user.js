import express from "express";
const router = express.Router();

import { signup, login, logout, fetchAllUsers } from '../controllers/user.js';
import { authrizeUser } from '../middlewares/auth.js';

router.post('/signup', signup);

router.post('/login', login);

router.post('/logout', logout);

router.get('/fetchAllUsers', authrizeUser, fetchAllUsers);


export default router;