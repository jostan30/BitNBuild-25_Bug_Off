import express from "express"
const router = express.Router();
import {login ,register ,getMe } from "../controllers/auth-controller"

router.post('/login' ,login);
router.post('/register' ,register);
router.get('/getMe' ,getMe);


export default router;