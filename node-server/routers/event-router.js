import express from "express"
const router = express.Router();


router.get('/');
router.get('/:id');
router.post('/create');
router.delete('/delete');


export default router;