import express from "express";
const router = express.Router();

import { sendMessage, getAllMessages } from '../controllers/message.js';
import { authrizeUser } from '../middlewares/auth.js';

router.post('/sendMessage', authrizeUser, sendMessage);
router.post('/getRelatedMessages/', authrizeUser, getAllMessages);

export default router;